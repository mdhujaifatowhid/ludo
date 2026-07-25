import { Color, GameState, SeatedPlayer, Token } from '@/types/game';
import { absolutePos, SAFE_SQUARES } from './boardLayout';

const TOKENS_PER_PLAYER = 4;
const HOME_ENTRY = 51; // relativePos at which a token turns into its home column
const FINISHED = 57;

export function createInitialState(players: SeatedPlayer[]): GameState {
  const tokens: Token[] = [];
  for (const p of players) {
    for (let id = 0; id < TOKENS_PER_PLAYER; id++) {
      tokens.push({ color: p.color, id, relativePos: -1 });
    }
  }
  return {
    players,
    tokens,
    diceValue: null,
    currentColorIndex: 0,
    consecutiveSixes: 0,
    lastRollBy: null,
    winners: [],
    log: [`Game started with ${players.length} players.`],
  };
}

export function currentColor(state: GameState): Color {
  return state.players[state.currentColorIndex].color;
}

export function rollDice(): number {
  return 1 + Math.floor(Math.random() * 6);
}

/** Token ids (0-3) belonging to `color` that can legally move given `dice`. */
export function getMovableTokens(state: GameState, color: Color, dice: number): number[] {
  const movable: number[] = [];
  for (const t of state.tokens) {
    if (t.color !== color) continue;
    if (t.relativePos === -1) {
      if (dice === 6) movable.push(t.id); // need a 6 to leave base
      continue;
    }
    if (t.relativePos === FINISHED) continue; // already home
    const next = t.relativePos + dice;
    if (next <= 56) movable.push(t.id); // can't overshoot past the final home cell
  }
  return movable;
}

interface MoveResult {
  state: GameState;
  captured: boolean;
  reachedHome: boolean;
  wonGame: boolean;
}

/** Applies a chosen token move, resolving captures, home entry, and turn order. */
export function applyMove(state: GameState, color: Color, tokenId: number, dice: number): MoveResult {
  const tokens = state.tokens.map((t) => ({ ...t }));
  const mover = tokens.find((t) => t.color === color && t.id === tokenId)!;

  let captured = false;
  let reachedHome = false;

  if (mover.relativePos === -1) {
    mover.relativePos = 0; // step onto the start square
  } else {
    mover.relativePos = mover.relativePos + dice;
  }

  if (mover.relativePos === 56) {
    mover.relativePos = FINISHED;
    reachedHome = true;
  } else if (mover.relativePos <= 50) {
    const abs = absolutePos(color, mover.relativePos);
    if (abs !== null && !SAFE_SQUARES.includes(abs)) {
      for (const other of tokens) {
        if (other.color === color) continue;
        if (other.relativePos < 0 || other.relativePos > 50) continue;
        if (absolutePos(other.color, other.relativePos) === abs) {
          other.relativePos = -1; // sent back to base
          captured = true;
        }
      }
    }
  }

  const log = [...state.log];
  log.push(
    reachedHome
      ? `${color} token ${tokenId + 1} reached home!`
      : `${color} moved token ${tokenId + 1} (rolled ${dice}).`
  );
  if (captured) log.push(`${color} captured an opponent's token!`);

  // Has this color's whole squad finished?
  const winners = [...state.winners];
  const squadDone = tokens
    .filter((t) => t.color === color)
    .every((t) => t.relativePos === FINISHED);
  if (squadDone && !winners.includes(color)) {
    winners.push(color);
    log.push(`${color} finished all tokens and wins!`);
  }

  const getsExtraTurn = dice === 6 || captured || reachedHome;
  const consecutiveSixes = dice === 6 ? state.consecutiveSixes + 1 : 0;

  // Three 6's in a row forfeits the extra turn (classic rule, prevents stalling).
  const forfeitExtra = consecutiveSixes >= 3;

  const nextColorIndex = getsExtraTurn && !forfeitExtra
    ? state.currentColorIndex
    : nextActiveIndex(state, winners);

  const newState: GameState = {
    ...state,
    tokens,
    diceValue: null,
    currentColorIndex: nextColorIndex,
    consecutiveSixes: forfeitExtra ? 0 : consecutiveSixes,
    lastRollBy: color,
    winners,
    log: log.slice(-30), // keep the log bounded
  };

  return { state: newState, captured, reachedHome, wonGame: winners.includes(color) };
}

/** Advances to the next player who hasn't already finished all their tokens. */
export function nextActiveIndex(state: GameState, winners: Color[]): number {
  const n = state.players.length;
  for (let step = 1; step <= n; step++) {
    const idx = (state.currentColorIndex + step) % n;
    if (!winners.includes(state.players[idx].color)) return idx;
  }
  return state.currentColorIndex;
}

/** True once every player but (at most) one has finished. */
export function isGameOver(state: GameState): boolean {
  return state.winners.length >= state.players.length - 1 && state.players.length > 1;
}
