'use client';

import { Color } from '@/types/game';
import { COLOR_HEX } from '@/lib/boardLayout';

interface Props {
  color: Color;
  username: string;
  isHost: boolean;
  isReady: boolean;
  isOnline: boolean;
  isYou: boolean;
}

export default function PlayerCard({ color, username, isHost, isReady, isOnline, isYou }: Props) {
  return (
    <div
      className="flex items-center justify-between rounded-xl px-4 py-3 border-2"
      style={{ borderColor: COLOR_HEX[color], backgroundColor: `${COLOR_HEX[color]}1A` }}
    >
      <div className="flex items-center gap-3">
        <span
          className="w-4 h-4 rounded-full inline-block"
          style={{ backgroundColor: COLOR_HEX[color], boxShadow: isOnline ? `0 0 0 3px ${COLOR_HEX[color]}33` : 'none' }}
        />
        <div>
          <p className="font-display font-bold">
            {username} {isYou && <span className="text-cream/50 text-xs font-body">(you)</span>}
          </p>
          <p className="text-xs text-cream/50 capitalize">
            {color} {isHost && '· host'}
          </p>
        </div>
      </div>
      <span
        className={`text-xs px-2 py-1 rounded-full font-semibold ${
          isReady ? 'bg-piece-green/30 text-piece-green' : 'bg-cream/10 text-cream/50'
        }`}
      >
        {isReady ? 'Ready' : 'Waiting'}
      </span>
    </div>
  );
}
