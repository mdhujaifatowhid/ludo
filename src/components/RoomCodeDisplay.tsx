'use client';

import { useState } from 'react';

export default function RoomCodeDisplay({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard may be unavailable — ignore */
    }
  }

  return (
    <button
      onClick={copy}
      className="group flex items-center gap-3 bg-wood/40 border border-cream/20 rounded-xl px-5 py-3 hover:border-piece-yellow transition"
      title="Copy room code"
    >
      <span className="font-display text-3xl font-extrabold tracking-[0.35em] text-piece-yellow">{code}</span>
      <span className="text-xs text-cream/50 group-hover:text-cream/80">{copied ? 'Copied!' : 'Tap to copy'}</span>
    </button>
  );
}
