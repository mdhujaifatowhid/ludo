'use client';

import { useEffect, useState } from 'react';

const PIPS: Record<number, [number, number][]> = {
  1: [[1, 1]],
  2: [[0, 0], [2, 2]],
  3: [[0, 0], [1, 1], [2, 2]],
  4: [[0, 0], [0, 2], [2, 0], [2, 2]],
  5: [[0, 0], [0, 2], [1, 1], [2, 0], [2, 2]],
  6: [[0, 0], [0, 2], [1, 0], [1, 2], [2, 0], [2, 2]],
};

interface Props {
  value: number | null;
  canRoll: boolean;
  onRoll: () => void;
  rolling?: boolean;
}

export default function Dice({ value, canRoll, onRoll, rolling }: Props) {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (value !== null) {
      setAnimate(true);
      const t = setTimeout(() => setAnimate(false), 600);
      return () => clearTimeout(t);
    }
  }, [value]);

  const shown = value ?? 1;

  return (
    <button
      onClick={onRoll}
      disabled={!canRoll}
      className={`relative w-20 h-20 rounded-2xl bg-cream shadow-table grid grid-cols-3 grid-rows-3 gap-1 p-3
        ${canRoll ? 'cursor-pointer hover:scale-105' : 'opacity-50 cursor-not-allowed'}
        ${animate ? 'animate-tumble' : ''} transition-transform`}
      title={canRoll ? 'Roll the dice' : 'Wait for your turn'}
    >
      {Array.from({ length: 9 }).map((_, i) => {
        const row = Math.floor(i / 3);
        const col = i % 3;
        const active = value !== null && PIPS[shown].some(([r, c]) => r === row && c === col);
        return (
          <span
            key={i}
            className={`rounded-full ${active ? 'bg-wood' : 'bg-transparent'}`}
          />
        );
      })}
      {!value && (
        <span className="absolute inset-0 flex items-center justify-center font-display font-bold text-wood text-sm">
          Roll
        </span>
      )}
    </button>
  );
}
