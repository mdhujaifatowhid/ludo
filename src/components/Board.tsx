'use client';

import { Color, GameState } from '@/types/game';
import {
  BASE_CELLS,
  COLOR_HEX,
  HOME_COLUMN_CELLS,
  SAFE_SQUARES,
  START_OFFSET,
  TRACK_CELLS,
} from '@/lib/boardLayout';
import Token from './Token';

interface Props {
  state: GameState;
  movableTokenIds: number[];
  activeColor: Color | null;
  onTokenClick: (tokenId: number) => void;
}

const BASE_QUADRANTS: Record<Color, { x: number; y: number }> = {
  red: { x: 0, y: 0 },
  green: { x: 9, y: 0 },
  yellow: { x: 9, y: 9 },
  blue: { x: 0, y: 9 },
};

export default function Board({ state, movableTokenIds, activeColor, onTokenClick }: Props) {
  function tokenCoords(color: Color, relativePos: number, baseSlot: number): [number, number] {
    if (relativePos === -1) {
      const [row, col] = BASE_CELLS[color][baseSlot];
      return [col, row];
    }
    if (relativePos >= 51 && relativePos <= 56) {
      const [row, col] = HOME_COLUMN_CELLS[color][relativePos - 51];
      return [col + 0.5, row + 0.5];
    }
    if (relativePos === 57) {
      // finished — stack near center
      return [7.5, 7.5];
    }
    const abs = (START_OFFSET[color] + relativePos) % 52;
    const [row, col] = TRACK_CELLS[abs];
    return [col + 0.5, row + 0.5];
  }

  // Group tokens sharing a cell so we can nudge them apart slightly.
  const cellGroups = new Map<string, typeof state.tokens>();
  for (const t of state.tokens) {
    const key = `${t.color}-${t.relativePos}`;
    const arr = cellGroups.get(key) ?? [];
    arr.push(t);
    cellGroups.set(key, arr);
  }

  return (
    <svg viewBox="0 0 15 15" className="w-full h-full select-none">
      <rect x={0} y={0} width={15} height={15} rx={0.6} fill="#F1EAD9" />

      {/* Base quadrants */}
      {(Object.keys(BASE_QUADRANTS) as Color[]).map((color) => {
        const { x, y } = BASE_QUADRANTS[color];
        return (
          <g key={color}>
            <rect x={x} y={y} width={6} height={6} rx={0.5} fill={`${COLOR_HEX[color]}33`} />
            <rect x={x + 0.9} y={y + 0.9} width={4.2} height={4.2} rx={0.4} fill="#F1EAD9" />
          </g>
        );
      })}

      {/* Track cells */}
      {TRACK_CELLS.map(([row, col], i) => (
        <rect
          key={`track-${i}`}
          x={col}
          y={row}
          width={1}
          height={1}
          fill={SAFE_SQUARES.includes(i) ? '#FFF7E0' : '#FFFFFF'}
          stroke="#D8CFB8"
          strokeWidth={0.02}
        />
      ))}
      {SAFE_SQUARES.map((i) => {
        const [row, col] = TRACK_CELLS[i];
        return (
          <text
            key={`star-${i}`}
            x={col + 0.5}
            y={row + 0.72}
            fontSize={0.5}
            textAnchor="middle"
            fill="#C9A227"
          >
            ★
          </text>
        );
      })}

      {/* Home column cells */}
      {(Object.keys(HOME_COLUMN_CELLS) as Color[]).map((color) =>
        HOME_COLUMN_CELLS[color].map(([row, col], i) => (
          <rect
            key={`${color}-home-${i}`}
            x={col}
            y={row}
            width={1}
            height={1}
            fill={COLOR_HEX[color]}
            opacity={0.55}
            stroke="#D8CFB8"
            strokeWidth={0.02}
          />
        ))
      )}

      {/* Center home triangles */}
      <polygon points="6,6 9,6 7.5,7.5" fill={COLOR_HEX.red} />
      <polygon points="9,6 9,9 7.5,7.5" fill={COLOR_HEX.green} />
      <polygon points="9,9 6,9 7.5,7.5" fill={COLOR_HEX.yellow} />
      <polygon points="6,9 6,6 7.5,7.5" fill={COLOR_HEX.blue} />

      {/* Tokens */}
      {Array.from(cellGroups.entries()).map(([key, group]) =>
        group.map((t, i) => {
          const [cx, cy] = tokenCoords(t.color, t.relativePos, t.id);
          const jitter = group.length > 1 ? (i - (group.length - 1) / 2) * 0.22 : 0;
          const isMovable = activeColor === t.color && movableTokenIds.includes(t.id);
          return (
            <Token
              key={`${t.color}-${t.id}`}
              cx={cx + (t.relativePos === -1 ? 0 : jitter)}
              cy={cy}
              color={COLOR_HEX[t.color]}
              highlighted={isMovable}
              onClick={isMovable ? () => onTokenClick(t.id) : undefined}
            />
          );
        })
      )}
    </svg>
  );
}
