import { supabase, isSupabaseConfigured } from './supabase';
import { RoomData, GameState, Player, PlayerColor } from '../types/ludo';
import { createInitialGameState } from './ludoEngine';

/** Generate 6-character unique room code (no ambiguous chars like 0/O, 1/I) */
export function generateRoomCode(): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Local storage key prefix for local tab sync fallback
const LOCAL_STORAGE_PREFIX = 'ludo_room_state_';

/** Helper to save room data to local storage */
export function saveRoomToLocalStorage(roomCode: string, roomData: RoomData) {
  try {
    localStorage.setItem(`${LOCAL_STORAGE_PREFIX}${roomCode}`, JSON.stringify(roomData));
    // Broadcast via BroadcastChannel
    if ('BroadcastChannel' in window) {
      const bc = new BroadcastChannel(`ludo_bc_${roomCode}`);
      bc.postMessage({ type: 'ROOM_UPDATE', roomData });
      bc.close();
    }
  } catch (err) {
    console.warn('LocalStorage save failed:', err);
  }
}

/** Helper to get room data from local storage */
export function getRoomFromLocalStorage(roomCode: string): RoomData | null {
  try {
    const raw = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}${roomCode}`);
    if (raw) return JSON.parse(raw);
  } catch (err) {
    console.warn('LocalStorage load failed:', err);
  }
  return null;
}

/** Create a new Room */
export async function createRoom(
  hostNickname: string,
  hostPlayerId: string,
  maxPlayers: number
): Promise<RoomData> {
  const code = generateRoomCode();
  const hostPlayer: Player = {
    id: hostPlayerId,
    nickname: hostNickname || 'Host',
    color: 'red',
    isHost: true,
    isConnected: true,
  };

  const initialGameState: GameState = {
    status: 'waiting',
    maxPlayers,
    currentTurn: 'red',
    players: [hostPlayer],
    tokens: {
      red: [0, 1, 2, 3].map((id) => ({ id, color: 'red', step: -1 })),
      green: [0, 1, 2, 3].map((id) => ({ id, color: 'green', step: -1 })),
      yellow: [0, 1, 2, 3].map((id) => ({ id, color: 'yellow', step: -1 })),
      blue: [0, 1, 2, 3].map((id) => ({ id, color: 'blue', step: -1 })),
    },
    dice: {
      value: null,
      isRolling: false,
      rolledByColor: null,
      hasMovedThisTurn: false,
      consecutiveSixes: 0,
    },
    winnerOrder: [],
    logs: [
      {
        id: `log-${Date.now()}-created`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: `Room created by ${hostPlayer.nickname}. Code: ${code}`,
        type: 'system',
      },
    ],
    lastActionAt: Date.now(),
  };

  const roomData: RoomData = {
    code,
    status: 'waiting',
    max_players: maxPlayers,
    current_turn_color: 'red',
    host_id: hostPlayerId,
    game_state: initialGameState,
  };

  // 1. Try Supabase insert if configured
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('rooms')
        .insert({
          code,
          status: 'waiting',
          max_players: maxPlayers,
          current_turn_color: 'red',
          host_id: hostPlayerId,
          game_state: initialGameState,
        })
        .select('*')
        .single();

      if (error) {
        console.error('Supabase room insert error:', error);
      } else if (data) {
        saveRoomToLocalStorage(code, data);
        return data as RoomData;
      }
    } catch (e) {
      console.warn('Supabase create room fallback to local:', e);
    }
  }

  // 2. Local Sync fallback
  saveRoomToLocalStorage(code, roomData);
  return roomData;
}

/** Get room data by room code */
export async function fetchRoom(roomCode: string): Promise<RoomData | null> {
  const cleanCode = roomCode.trim().toUpperCase();

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .eq('code', cleanCode)
        .single();

      if (!error && data) {
        saveRoomToLocalStorage(cleanCode, data);
        return data as RoomData;
      }
    } catch (e) {
      console.warn('Supabase fetch room failed:', e);
    }
  }

  return getRoomFromLocalStorage(cleanCode);
}

/** Join existing room */
export async function joinRoom(
  roomCode: string,
  playerNickname: string,
  playerId: string
): Promise<{ room: RoomData | null; error?: string }> {
  const code = roomCode.trim().toUpperCase();
  const room = await fetchRoom(code);

  if (!room) {
    return { room: null, error: 'Room not found. Please check the code.' };
  }

  const gameState = room.game_state;
  const existingPlayer = gameState.players.find((p) => p.id === playerId);

  if (existingPlayer) {
    // Re-joining player
    existingPlayer.isConnected = true;
    existingPlayer.nickname = playerNickname || existingPlayer.nickname;
    await updateRoomState(code, gameState, room.status);
    return { room: { ...room, game_state: gameState } };
  }

  if (gameState.players.length >= room.max_players) {
    return { room: null, error: 'Room is already full.' };
  }

  if (room.status !== 'waiting') {
    return { room: null, error: 'Game in this room has already started.' };
  }

  // Assign color
  const activeColors: PlayerColor[] =
    room.max_players === 2
      ? ['red', 'yellow']
      : room.max_players === 3
      ? ['red', 'green', 'yellow']
      : ['red', 'green', 'yellow', 'blue'];

  const takenColors = gameState.players.map((p) => p.color);
  const availableColor = activeColors.find((c) => !takenColors.includes(c));

  if (!availableColor) {
    return { room: null, error: 'No available color spots remaining in this room.' };
  }

  const newPlayer: Player = {
    id: playerId,
    nickname: playerNickname || `Player ${gameState.players.length + 1}`,
    color: availableColor,
    isHost: false,
    isConnected: true,
  };

  gameState.players.push(newPlayer);
  gameState.logs.push({
    id: `log-${Date.now()}-join`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    text: `${newPlayer.nickname} joined as ${availableColor.toUpperCase()}.`,
    type: 'system',
    color: availableColor,
  });

  const updatedRoom: RoomData = {
    ...room,
    game_state: gameState,
  };

  await updateRoomState(code, gameState, room.status);
  return { room: updatedRoom };
}

/** Update room state (and broadcast) */
export async function updateRoomState(
  roomCode: string,
  newGameState: GameState,
  newStatus?: 'waiting' | 'playing' | 'finished'
): Promise<void> {
  const code = roomCode.trim().toUpperCase();
  const status = newStatus || newGameState.status;

  const roomUpdate: Partial<RoomData> = {
    code,
    status,
    current_turn_color: newGameState.currentTurn,
    winner_color: newGameState.winnerOrder[0] || null,
    game_state: newGameState,
  };

  // 1. Update Supabase
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase
        .from('rooms')
        .update({
          status,
          current_turn_color: newGameState.currentTurn,
          winner_color: newGameState.winnerOrder[0] || null,
          game_state: newGameState,
          updated_at: new Date().toISOString(),
        })
        .eq('code', code);
    } catch (e) {
      console.warn('Supabase update room failed:', e);
    }
  }

  // 2. Update Local Storage & Broadcast Channel
  const currentLocal = getRoomFromLocalStorage(code) || {
    code,
    status,
    max_players: newGameState.maxPlayers,
    current_turn_color: newGameState.currentTurn,
    host_id: newGameState.players[0]?.id || '',
    game_state: newGameState,
  };

  const updatedLocalRoom: RoomData = {
    ...currentLocal,
    status,
    current_turn_color: newGameState.currentTurn,
    winner_color: newGameState.winnerOrder[0] || null,
    game_state: newGameState,
  };

  saveRoomToLocalStorage(code, updatedLocalRoom);
}

/** Start Game in Lobby */
export async function startGameInLobby(roomCode: string): Promise<RoomData | null> {
  const room = await fetchRoom(roomCode);
  if (!room) return null;

  let gameState = room.game_state;
  // Fill empty slots with Bots if starting with fewer than maxPlayers
  const currentPlayers = gameState.players;
  if (currentPlayers.length < room.max_players) {
    gameState = createInitialGameState(room.max_players, currentPlayers);
  }

  gameState.status = 'playing';
  gameState.logs.push({
    id: `log-${Date.now()}-start`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    text: `🎮 Game Started! ${gameState.players[0].nickname} (${gameState.players[0].color.toUpperCase()})'s turn to roll!`,
    type: 'system',
  });

  await updateRoomState(roomCode, gameState, 'playing');
  return { ...room, status: 'playing', game_state: gameState };
}

/** Subscribe to room state updates via Supabase Realtime + Broadcast Channel fallback */
export function subscribeToRoom(
  roomCode: string,
  onUpdate: (roomData: RoomData) => void
): () => void {
  const code = roomCode.trim().toUpperCase();

  // 1. Supabase Realtime channel
  let supabaseChannel: any = null;

  if (isSupabaseConfigured && supabase) {
    supabaseChannel = supabase
      .channel(`ludo-room-${code}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'rooms',
          filter: `code=eq.${code}`,
        },
        (payload) => {
          if (payload.new) {
            const updated = payload.new as RoomData;
            saveRoomToLocalStorage(code, updated);
            onUpdate(updated);
          }
        }
      )
      .subscribe();
  }

  // 2. BroadcastChannel fallback for tab-to-tab real-time sync
  let bc: BroadcastChannel | null = null;
  if ('BroadcastChannel' in window) {
    bc = new BroadcastChannel(`ludo_bc_${code}`);
    bc.onmessage = (event) => {
      if (event.data?.type === 'ROOM_UPDATE' && event.data?.roomData) {
        onUpdate(event.data.roomData);
      }
    };
  }

  // 3. Polling / LocalStorage listener fallback for cross-tab or reconnect
  const storageListener = (e: StorageEvent) => {
    if (e.key === `${LOCAL_STORAGE_PREFIX}${code}` && e.newValue) {
      try {
        const parsed = JSON.parse(e.newValue);
        onUpdate(parsed);
      } catch (err) {
        // ignore
      }
    }
  };

  window.addEventListener('storage', storageListener);

  // Return unsubscribe cleanup function
  return () => {
    if (supabaseChannel && supabase) {
      supabase.removeChannel(supabaseChannel);
    }
    if (bc) {
      bc.close();
    }
    window.removeEventListener('storage', storageListener);
  };
}
