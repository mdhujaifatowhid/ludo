/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Navbar } from './components/Navbar';
import { Lobby } from './components/Lobby';
import { RoomWaitingLobby } from './components/RoomWaitingLobby';
import { LudoBoard } from './components/LudoBoard';
import { DiceComponent } from './components/DiceComponent';
import { GameLogsAndChat } from './components/GameLogsAndChat';
import { VictoryModal } from './components/VictoryModal';
import { SupabaseSetupModal } from './components/SupabaseSetupModal';
import { RoomData, GameState, Player, PlayerColor, MoveOption, GameLog } from './types/ludo';
import { createRoom, joinRoom, fetchRoom, updateRoomState, startGameInLobby, subscribeToRoom } from './lib/realtime';
import { rollDiceForTurn, applyTokenMove, getValidMoves } from './lib/ludoEngine';

export default function App() {
  // Player identity
  const [playerId] = useState(() => {
    let id = localStorage.getItem('ludo_player_id');
    if (!id) {
      id = `user_${Math.random().toString(36).substring(2, 9)}`;
      localStorage.setItem('ludo_player_id', id);
    }
    return id;
  });

  // App & Room State
  const [room, setRoom] = useState<RoomData | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);

  // Audio Synth Context Ref
  const audioCtxRef = useRef<AudioContext | null>(null);

  const getAudioContext = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  };

  const playSynthSound = useCallback((type: 'roll' | 'move' | 'capture' | 'win') => {
    if (!soundEnabled) return;
    try {
      const ctx = getAudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;

      if (type === 'roll') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.exponentialRampToValueAtTime(600, now + 0.15);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.15);
      } else if (type === 'move') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.12);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
        osc.start(now);
        osc.stop(now + 0.12);
      } else if (type === 'capture') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.linearRampToValueAtTime(150, now + 0.25);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
      } else if (type === 'win') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.setValueAtTime(659.25, now + 0.1); // E5
        osc.frequency.setValueAtTime(783.99, now + 0.2); // G5
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
        osc.start(now);
        osc.stop(now + 0.5);
      }
    } catch (err) {
      // Audio playback fallback
    }
  }, [soundEnabled]);

  // Handle URL code parameter (e.g. ?code=X7K92M)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const codeFromUrl = urlParams.get('code');
    if (codeFromUrl && !room) {
      const savedNickname = localStorage.getItem('ludo_nickname') || 'Player';
      joinRoom(codeFromUrl, savedNickname, playerId).then((res) => {
        if (res.room) setRoom(res.room);
      });
    }
  }, [playerId, room]);

  // Subscribe to Realtime Updates when in a room
  useEffect(() => {
    if (!room?.code) return;

    const unsubscribe = subscribeToRoom(room.code, (updatedRoom) => {
      setRoom(updatedRoom);
    });

    return () => {
      unsubscribe();
    };
  }, [room?.code]);

  // Handle Create Room
  const handleCreateRoom = async (nickname: string, maxPlayers: number) => {
    setIsSubmitting(true);
    setErrorMessage('');
    try {
      const createdRoom = await createRoom(nickname, playerId, maxPlayers);
      setRoom(createdRoom);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to create room.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Join Room
  const handleJoinRoom = async (nickname: string, roomCode: string) => {
    setIsSubmitting(true);
    setErrorMessage('');
    try {
      const res = await joinRoom(roomCode, nickname, playerId);
      if (res.error) {
        setErrorMessage(res.error);
      } else if (res.room) {
        setRoom(res.room);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to join room.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Start Game
  const handleStartGame = async () => {
    if (!room) return;
    const updated = await startGameInLobby(room.code);
    if (updated) setRoom(updated);
  };

  // Handle Leave Room
  const handleLeaveRoom = () => {
    setRoom(null);
    setErrorMessage('');
    // Remove query string from URL
    window.history.replaceState({}, document.title, window.location.pathname);
  };

  // Current Player & Turn Data
  const gameState = room?.game_state;
  const myPlayer = gameState?.players.find((p) => p.id === playerId);
  const myColor = myPlayer?.color || null;
  const turnPlayer = gameState?.players.find((p) => p.color === gameState.currentTurn);
  const isMyTurn = myColor && gameState?.currentTurn === myColor;

  // Calculate valid moves
  const validMoves: MoveOption[] = gameState ? getValidMoves(gameState) : [];

  // Handle Dice Roll
  const handleRollDice = async () => {
    if (!room || !gameState || gameState.dice.isRolling || gameState.dice.value !== null) return;

    playSynthSound('roll');

    // Simulate dice roll animation state
    const rollingState: GameState = {
      ...gameState,
      dice: {
        ...gameState.dice,
        isRolling: true,
      },
    };
    await updateRoomState(room.code, rollingState);

    setTimeout(async () => {
      const { newState, validMoves: moves } = rollDiceForTurn(gameState);
      await updateRoomState(room.code, newState);

      // Auto-move if exactly 1 move exists for convenience
      if (moves.length === 1 && newState.currentTurn === myColor) {
        setTimeout(() => {
          handleSelectToken(moves[0].tokenId);
        }, 350);
      }
    }, 400);
  };

  // Handle Token Selection / Movement
  const handleSelectToken = async (tokenId: number) => {
    if (!room || !gameState) return;

    const moveOpt = validMoves.find((m) => m.tokenId === tokenId);
    if (!moveOpt) return;

    if (moveOpt.isCapture) playSynthSound('capture');
    else if (moveOpt.isFinish) playSynthSound('win');
    else playSynthSound('move');

    const updatedState = applyTokenMove(gameState, tokenId);
    await updateRoomState(room.code, updatedState);
  };

  // Handle Chat / Emoji Message
  const handleSendChatMessage = async (text: string) => {
    if (!room || !gameState) return;

    const newLog: GameLog = {
      id: `chat-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: `${myPlayer?.nickname || 'Player'}: ${text}`,
      type: 'chat',
      color: myColor || undefined,
      sender: myPlayer?.nickname,
    };

    const updatedState: GameState = {
      ...gameState,
      logs: [...gameState.logs, newLog],
    };

    await updateRoomState(room.code, updatedState);
  };

  // AI Bot Auto-Play Loop
  useEffect(() => {
    if (!room || !gameState || gameState.status !== 'playing') return;

    const activePlayer = gameState.players.find((p) => p.color === gameState.currentTurn);
    if (activePlayer?.isBot && !gameState.dice.isRolling) {
      const botTimer = setTimeout(async () => {
        // 1. Bot Rolls Dice if not rolled
        if (gameState.dice.value === null) {
          const { newState, validMoves: botMoves } = rollDiceForTurn(gameState);
          playSynthSound('roll');
          await updateRoomState(room.code, newState);

          // 2. Bot selects best move if available
          if (botMoves.length > 0) {
            setTimeout(async () => {
              // Prioritize captures and home goals
              const captureMove = botMoves.find((m) => m.isCapture);
              const goalMove = botMoves.find((m) => m.isFinish);
              const chosen = captureMove || goalMove || botMoves[Math.floor(Math.random() * botMoves.length)];

              if (chosen) {
                const movedState = applyTokenMove(newState, chosen.tokenId);
                playSynthSound('move');
                await updateRoomState(room.code, movedState);
              }
            }, 600);
          }
        }
      }, 1000);

      return () => clearTimeout(botTimer);
    }
  }, [gameState, room?.code, playSynthSound]);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans">
      
      {/* Navbar */}
      <Navbar
        roomCode={room?.code}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(!soundEnabled)}
        onOpenSetupModal={() => setIsSetupModalOpen(true)}
        onLeaveRoom={room ? handleLeaveRoom : undefined}
      />

      {/* Main View Router */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-6">
        
        {/* 1. LOBBY VIEW (Not in a room yet) */}
        {!room && (
          <Lobby
            onCreateRoom={handleCreateRoom}
            onJoinRoom={handleJoinRoom}
            isSubmitting={isSubmitting}
            errorMessage={errorMessage}
          />
        )}

        {/* 2. WAITING LOBBY (In room, status = 'waiting') */}
        {room && room.status === 'waiting' && (
          <RoomWaitingLobby
            room={room}
            currentPlayerId={playerId}
            onStartGame={handleStartGame}
            onLeaveRoom={handleLeaveRoom}
          />
        )}

        {/* 3. ACTIVE GAMEPLAY VIEW (In room, status = 'playing' or 'finished') */}
        {room && (room.status === 'playing' || room.status === 'finished') && gameState && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left/Main Column: Ludo Board */}
            <div className="lg:col-span-7 flex flex-col items-center">
              <LudoBoard
                gameState={gameState}
                validMoves={validMoves}
                onSelectToken={handleSelectToken}
                myColor={myColor}
              />
            </div>

            {/* Right Column: Dice Controls & Activity Chat */}
            <div className="lg:col-span-5 space-y-6 w-full">
              {/* Dice Roll Card */}
              <DiceComponent
                currentTurn={gameState.currentTurn}
                turnPlayerName={turnPlayer?.nickname || gameState.currentTurn}
                diceValue={gameState.dice.value}
                isRolling={gameState.dice.isRolling}
                canRoll={Boolean(isMyTurn && gameState.dice.value === null)}
                onRoll={handleRollDice}
                validMovesCount={validMoves.length}
              />

              {/* Game Activity & Chat Panel */}
              <GameLogsAndChat
                logs={gameState.logs}
                onSendChatMessage={handleSendChatMessage}
                currentPlayerName={myPlayer?.nickname || 'Player'}
              />
            </div>
          </div>
        )}

        {/* Victory Celebration Modal */}
        {room && room.status === 'finished' && gameState && (
          <VictoryModal
            winnerOrder={gameState.winnerOrder}
            players={gameState.players}
            onPlayAgain={handleStartGame}
            onReturnToLobby={handleLeaveRoom}
          />
        )}

        {/* Supabase & Deployment Setup Modal */}
        <SupabaseSetupModal
          isOpen={isSetupModalOpen}
          onClose={() => setIsSetupModalOpen(false)}
        />
      </main>
    </div>
  );
}
