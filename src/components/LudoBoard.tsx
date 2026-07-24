import React from 'react';
import {
  GameState,
  PlayerColor,
  Token,
  MoveOption,
  COLOR_HEX,
  COLOR_ORDER,
} from '../types/ludo';
import {
  getTokenCoordinate,
  SAFE_TRACK_INDICES,
  MAIN_TRACK_COORDS,
} from '../lib/ludoEngine';
import { Star } from 'lucide-react';
import { motion } from 'motion/react';

interface LudoBoardProps {
  gameState: GameState;
  validMoves: MoveOption[];
  onSelectToken: (tokenId: number) => void;
  myColor?: PlayerColor | null;
}

export const LudoBoard: React.FC<LudoBoardProps> = ({
  gameState,
  validMoves,
  onSelectToken,
  myColor,
}) => {
  const { currentTurn, tokens } = gameState;
  const isMyTurn = !myColor || currentTurn === myColor;

  // Gather all 16 tokens into array with coordinates
  const allTokensWithCoords: Array<{
    token: Token;
    color: PlayerColor;
    x: number;
    y: number;
    isMovable: boolean;
  }> = [];

  COLOR_ORDER.forEach((color) => {
    const playerTokens = tokens[color] || [];
    playerTokens.forEach((t) => {
      const coord = getTokenCoordinate(color, t.step, t.id);
      const isMovable =
        isMyTurn &&
        currentTurn === color &&
        validMoves.some((m) => m.tokenId === t.id && m.color === color);

      allTokensWithCoords.push({
        token: t,
        color,
        x: coord.x,
        y: coord.y,
        isMovable,
      });
    });
  });

  // Group tokens sharing same grid tile to apply slight offsets
  const tileGroups: Record<string, typeof allTokensWithCoords> = {};
  allTokensWithCoords.forEach((item) => {
    const key = `${item.x.toFixed(1)},${item.y.toFixed(1)}`;
    if (!tileGroups[key]) tileGroups[key] = [];
    tileGroups[key].push(item);
  });

  // Calculate pixel offsets for grouped tokens
  const getOffset = (index: number, total: number) => {
    if (total <= 1) return { dx: 0, dy: 0 };
    const radius = 18; // offset percentage
    const angle = (index / total) * 2 * Math.PI - Math.PI / 2;
    return {
      dx: Math.cos(angle) * radius,
      dy: Math.sin(angle) * radius,
    };
  };

  // Safe star positions (x, y)
  const safeCoords = SAFE_TRACK_INDICES.map((idx) => MAIN_TRACK_COORDS[idx]);

  return (
    <div className="w-full max-w-[620px] aspect-square mx-auto bg-white rounded-2xl shadow-xl border-4 border-slate-800 p-2 relative select-none">
      
      {/* 15x15 CSS Grid Container */}
      <div className="w-full h-full grid grid-cols-15 grid-rows-15 border border-slate-300 relative rounded-lg overflow-hidden bg-slate-50">

        {/* 1. TOP-LEFT RED YARD (6x6) */}
        <div className="col-span-6 row-span-6 bg-red-500 p-3 border-r-2 border-b-2 border-slate-800 flex items-center justify-center">
          <div className="w-full h-full bg-white rounded-xl border-2 border-slate-800 p-2 grid grid-cols-2 grid-rows-2 gap-2 shadow-inner">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-center bg-red-100 rounded-lg border border-red-200">
                <div className="w-8 h-8 rounded-full border-2 border-red-400 bg-red-200/50 shadow-inner" />
              </div>
            ))}
          </div>
        </div>

        {/* 2. TOP VERTICAL GREEN ARM (3x6) */}
        <div className="col-span-3 row-span-6 grid grid-cols-3 grid-rows-6 border-r-2 border-b-2 border-slate-800">
          {Array.from({ length: 18 }).map((_, idx) => {
            const col = idx % 3;
            const row = Math.floor(idx / 3);
            const x = 6 + col;
            const y = row;

            const isGreenStretch = col === 1 && row >= 1 && row <= 5;
            const isGreenStart = col === 2 && row === 1;
            const isSafeStar = x === 6 && y === 2;

            return (
              <div
                key={`top-${idx}`}
                className={`border border-slate-300 flex items-center justify-center relative ${
                  isGreenStretch || isGreenStart ? 'bg-emerald-500' : 'bg-white'
                }`}
              >
                {isSafeStar && <Star className="w-4 h-4 text-amber-500 fill-amber-400" />}
                {isGreenStart && <Star className="w-4 h-4 text-white fill-white" />}
              </div>
            );
          })}
        </div>

        {/* 3. TOP-RIGHT GREEN YARD (6x6) */}
        <div className="col-span-6 row-span-6 bg-emerald-500 p-3 border-b-2 border-slate-800 flex items-center justify-center">
          <div className="w-full h-full bg-white rounded-xl border-2 border-slate-800 p-2 grid grid-cols-2 grid-rows-2 gap-2 shadow-inner">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-center bg-emerald-100 rounded-lg border border-emerald-200">
                <div className="w-8 h-8 rounded-full border-2 border-emerald-400 bg-emerald-200/50 shadow-inner" />
              </div>
            ))}
          </div>
        </div>

        {/* 4. LEFT HORIZONTAL RED ARM (6x3) */}
        <div className="col-span-6 row-span-3 grid grid-cols-6 grid-rows-3 border-r-2 border-b-2 border-slate-800">
          {Array.from({ length: 18 }).map((_, idx) => {
            const col = idx % 6;
            const row = Math.floor(idx / 6);
            const x = col;
            const y = 6 + row;

            const isRedStretch = row === 1 && col >= 1 && col <= 5;
            const isRedStart = row === 0 && col === 1;
            const isSafeStar = x === 2 && y === 8;

            return (
              <div
                key={`left-${idx}`}
                className={`border border-slate-300 flex items-center justify-center relative ${
                  isRedStretch || isRedStart ? 'bg-red-500' : 'bg-white'
                }`}
              >
                {isSafeStar && <Star className="w-4 h-4 text-amber-500 fill-amber-400" />}
                {isRedStart && <Star className="w-4 h-4 text-white fill-white" />}
              </div>
            );
          })}
        </div>

        {/* 5. CENTER GOAL AREA (3x3) */}
        <div className="col-span-3 row-span-3 border-r-2 border-b-2 border-slate-800 relative bg-white overflow-hidden">
          {/* Triangles SVG */}
          <svg className="w-full h-full absolute inset-0" viewBox="0 0 100 100">
            {/* Red Left Triangle */}
            <polygon points="0,0 50,50 0,100" fill="#EF4444" />
            {/* Green Top Triangle */}
            <polygon points="0,0 50,50 100,0" fill="#22C55E" />
            {/* Yellow Right Triangle */}
            <polygon points="100,0 50,50 100,100" fill="#EAB308" />
            {/* Blue Bottom Triangle */}
            <polygon points="0,100 50,50 100,100" fill="#3B82F6" />
            {/* Center border lines */}
            <line x1="0" y1="0" x2="100" y2="100" stroke="#1E293B" strokeWidth="2" />
            <line x1="100" y1="0" x2="0" y2="100" stroke="#1E293B" strokeWidth="2" />
          </svg>
        </div>

        {/* 6. RIGHT HORIZONTAL YELLOW ARM (6x3) */}
        <div className="col-span-6 row-span-3 grid grid-cols-6 grid-rows-3 border-b-2 border-slate-800">
          {Array.from({ length: 18 }).map((_, idx) => {
            const col = idx % 6;
            const row = Math.floor(idx / 6);
            const x = 9 + col;
            const y = 6 + row;

            const isYellowStretch = row === 1 && col >= 0 && col <= 4;
            const isYellowStart = row === 2 && col === 4;
            const isSafeStar = x === 12 && y === 6;

            return (
              <div
                key={`right-${idx}`}
                className={`border border-slate-300 flex items-center justify-center relative ${
                  isYellowStretch || isYellowStart ? 'bg-amber-400' : 'bg-white'
                }`}
              >
                {isSafeStar && <Star className="w-4 h-4 text-amber-600 fill-amber-500" />}
                {isYellowStart && <Star className="w-4 h-4 text-white fill-white" />}
              </div>
            );
          })}
        </div>

        {/* 7. BOTTOM-LEFT BLUE YARD (6x6) */}
        <div className="col-span-6 row-span-6 bg-blue-500 p-3 border-r-2 border-slate-800 flex items-center justify-center">
          <div className="w-full h-full bg-white rounded-xl border-2 border-slate-800 p-2 grid grid-cols-2 grid-rows-2 gap-2 shadow-inner">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-center bg-blue-100 rounded-lg border border-blue-200">
                <div className="w-8 h-8 rounded-full border-2 border-blue-400 bg-blue-200/50 shadow-inner" />
              </div>
            ))}
          </div>
        </div>

        {/* 8. BOTTOM VERTICAL BLUE ARM (3x6) */}
        <div className="col-span-3 row-span-6 grid grid-cols-3 grid-rows-6 border-r-2 border-slate-800">
          {Array.from({ length: 18 }).map((_, idx) => {
            const col = idx % 3;
            const row = Math.floor(idx / 3);
            const x = 6 + col;
            const y = 9 + row;

            const isBlueStretch = col === 1 && row >= 0 && row <= 4;
            const isBlueStart = col === 0 && row === 4;
            const isSafeStar = x === 8 && y === 12;

            return (
              <div
                key={`bottom-${idx}`}
                className={`border border-slate-300 flex items-center justify-center relative ${
                  isBlueStretch || isBlueStart ? 'bg-blue-500' : 'bg-white'
                }`}
              >
                {isSafeStar && <Star className="w-4 h-4 text-amber-500 fill-amber-400" />}
                {isBlueStart && <Star className="w-4 h-4 text-white fill-white" />}
              </div>
            );
          })}
        </div>

        {/* 9. BOTTOM-RIGHT YELLOW YARD (6x6) */}
        <div className="col-span-6 row-span-6 bg-amber-400 p-3 flex items-center justify-center">
          <div className="w-full h-full bg-white rounded-xl border-2 border-slate-800 p-2 grid grid-cols-2 grid-rows-2 gap-2 shadow-inner">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-center bg-amber-100 rounded-lg border border-amber-200">
                <div className="w-8 h-8 rounded-full border-2 border-amber-400 bg-amber-200/50 shadow-inner" />
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* TOKENS OVERLAY LAYER */}
      <div className="absolute inset-2 pointer-events-none">
        {Object.entries(tileGroups).flatMap(([key, group]) => {
          return group.map((item, index) => {
            const { token, color, x, y, isMovable } = item;
            const offset = getOffset(index, group.length);

            // Convert 15x15 grid coordinates to percentages (0..100%)
            const leftPct = (x / 15) * 100 + 100 / 30; // center in cell
            const topPct = (y / 15) * 100 + 100 / 30;

            const colorBg =
              color === 'red'
                ? 'bg-red-500 border-red-700'
                : color === 'green'
                ? 'bg-emerald-500 border-emerald-700'
                : color === 'yellow'
                ? 'bg-amber-400 border-amber-600'
                : 'bg-blue-500 border-blue-700';

            return (
              <motion.div
                key={`${color}-${token.id}`}
                initial={false}
                animate={{
                  left: `calc(${leftPct}% + ${offset.dx}px)`,
                  top: `calc(${topPct}% + ${offset.dy}px)`,
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-auto cursor-pointer z-20"
                onClick={() => {
                  if (isMovable) {
                    onSelectToken(token.id);
                  }
                }}
              >
                <div
                  className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full border-2 ${colorBg} text-white flex items-center justify-center font-black text-[11px] shadow-md transition-transform hover:scale-110 ${
                    isMovable
                      ? 'ring-4 ring-amber-400 ring-offset-1 animate-bounce scale-110 z-30'
                      : ''
                  }`}
                >
                  <div className="w-2.5 h-2.5 rounded-full bg-white/80 shadow-xs" />
                </div>
              </motion.div>
            );
          });
        })}
      </div>
    </div>
  );
};
