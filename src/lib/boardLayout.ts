import { Color } from '@/types/game';

// Where each color's tokens exit onto the shared 52-square track,
// expressed as an absolute index 0-51.
export const START_OFFSET: Record<Color, number> = {
  red: 0,
  green: 13,
  yellow: 26,
  blue: 39,
};

// The order colors are seated in when a room fills up (matches join_room RPC).
export const COLOR_ORDER: Color[] = ['red', 'green', 'yellow', 'blue'];

// Absolute track squares that are "safe" — a token there can never be captured.
// These are the four start squares plus the four star squares.
export const SAFE_SQUARES = [0, 8, 13, 21, 26, 34, 39, 47];

export function absolutePos(color: Color, relativePos: number): number | null {
  // Only positions 0-50 live on the shared track; home column/finished have no
  // shared absolute square.
  if (relativePos < 0 || relativePos > 50) return null;
  return (START_OFFSET[color] + relativePos) % 52;
}

// 15x15 grid coordinates for every track / home-column / base cell, used to
// place tokens on the SVG board. Index matches relativePos for the "home
// column" section (51-56); the main track (0-50) is derived from a fixed
// clockwise path definition below.
export const TRACK_CELLS: [number, number][] = [
  // Red arm (start at [6,1] going down to the crossing, then right along row 6)
  [6, 1], [6, 2], [6, 3], [6, 4], [6, 5],
  [5, 6], [4, 6], [3, 6], [2, 6], [1, 6], [0, 6],
  [0, 7],
  [0, 8], [1, 8], [2, 8], [3, 8], [4, 8], [5, 8],
  [6, 9], [6, 10], [6, 11], [6, 12], [6, 13], [6, 14],
  [7, 14],
  [8, 14], [8, 13], [8, 12], [8, 11], [8, 10], [8, 9],
  [9, 8], [10, 8], [11, 8], [12, 8], [13, 8], [14, 8],
  [14, 7],
  [14, 6], [13, 6], [12, 6], [11, 6], [10, 6], [9, 6],
  [8, 5], [8, 4], [8, 3], [8, 2], [8, 1], [8, 0],
  [7, 0],
  [6, 0],
];

// Home column cells per color, indices 0-5 correspond to relativePos 51-56.
export const HOME_COLUMN_CELLS: Record<Color, [number, number][]> = {
  red: [[7, 1], [7, 2], [7, 3], [7, 4], [7, 5], [7, 6]],
  green: [[1, 7], [2, 7], [3, 7], [4, 7], [5, 7], [6, 7]],
  yellow: [[7, 13], [7, 12], [7, 11], [7, 10], [7, 9], [7, 8]],
  blue: [[13, 7], [12, 7], [11, 7], [10, 7], [9, 7], [8, 7]],
};

// Base "parking" cells (4 per color) for tokens with relativePos === -1.
export const BASE_CELLS: Record<Color, [number, number][]> = {
  red: [[1.5, 1.5], [1.5, 3], [3, 1.5], [3, 3]],
  green: [[1.5, 11], [1.5, 12.5], [3, 11], [3, 12.5]],
  yellow: [[11, 11], [11, 12.5], [12.5, 11], [12.5, 12.5]],
  blue: [[11, 1.5], [11, 3], [12.5, 1.5], [12.5, 3]],
};

export const COLOR_HEX: Record<Color, string> = {
  red: '#E63946',
  green: '#2A9D8F',
  yellow: '#E9C46A',
  blue: '#457B9D',
};
