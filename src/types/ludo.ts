export type PlayerColor = 'red' | 'green' | 'yellow' | 'blue';

export interface Player {
  id: string;
  nickname: string;
  color: PlayerColor;
  isHost: boolean;
  isBot?: boolean;
  isConnected: boolean;
  hasFinished?: boolean;
  finishRank?: number; // 1, 2, 3, 4
}

export interface Token {
  id: number; // 0, 1, 2, 3
  color: PlayerColor;
  // Step progress:
  // -1 = In Home Base
  // 0..51 = Main Track (relative step count from player start = 0..50)
  // 51..55 = Home Stretch path (5 steps)
  // 56 = Goal / Finished
  step: number; 
}

export interface DiceState {
  value: number | null;
  isRolling: boolean;
  rolledByColor: PlayerColor | null;
  hasMovedThisTurn: boolean;
  consecutiveSixes: number;
}

export interface MoveOption {
  tokenId: number;
  color: PlayerColor;
  fromStep: number;
  toStep: number;
  isCapture?: boolean;
  isFinish?: boolean;
}

export interface GameLog {
  id: string;
  timestamp: string;
  text: string;
  type: 'system' | 'roll' | 'move' | 'capture' | 'chat' | 'win';
  color?: PlayerColor;
  sender?: string;
}

export interface GameState {
  status: 'waiting' | 'playing' | 'finished';
  maxPlayers: number;
  currentTurn: PlayerColor;
  players: Player[];
  tokens: Record<PlayerColor, Token[]>;
  dice: DiceState;
  winnerOrder: PlayerColor[];
  logs: GameLog[];
  lastActionAt: number;
}

export interface RoomData {
  id?: string;
  code: string;
  created_at?: string;
  status: 'waiting' | 'playing' | 'finished';
  max_players: number;
  current_turn_color: PlayerColor;
  host_id: string;
  winner_color?: PlayerColor | null;
  game_state: GameState;
}

export const COLOR_HEX: Record<PlayerColor, string> = {
  red: '#EF4444',
  green: '#22C55E',
  yellow: '#EAB308',
  blue: '#3B82F6',
};

export const COLOR_NAMES: Record<PlayerColor, string> = {
  red: 'Red',
  green: 'Green',
  yellow: 'Yellow',
  blue: 'Blue',
};

export const COLOR_ORDER: PlayerColor[] = ['red', 'green', 'yellow', 'blue'];
