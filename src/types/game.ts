export type Color = 'red' | 'green' | 'yellow' | 'blue';

export interface SeatedPlayer {
  color: Color;
  playerId: string;
  username: string;
}

// relativePos:
//  -1        -> sitting in base (not yet on the board)
//  0-50      -> on the shared 52-square track, relative to this color's start
//  51-56     -> in this color's private 6-square home column
//  57        -> finished (reached home)
export interface Token {
  color: Color;
  id: number; // 0-3, four tokens per player
  relativePos: number;
}

export interface GameState {
  players: SeatedPlayer[];
  tokens: Token[];
  diceValue: number | null;
  currentColorIndex: number;
  consecutiveSixes: number;
  lastRollBy: Color | null;
  winners: Color[];
  log: string[]; // short human-readable event log, newest last
}

export interface RoomRow {
  id: string;
  code: string;
  host_id: string;
  is_public: boolean;
  max_players: 2 | 3 | 4;
  status: 'waiting' | 'playing' | 'finished';
  created_at: string;
}

export interface RoomPlayerRow {
  id: string;
  room_id: string;
  player_id: string;
  color: Color;
  seat_order: number;
  is_ready: boolean;
  joined_at: string;
}

export interface ChatMessageRow {
  id: string;
  room_id: string;
  player_id: string | null;
  username: string;
  message: string;
  created_at: string;
}
