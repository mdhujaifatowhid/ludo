'use client';

import { useState } from 'react';
import { sounds } from '@/lib/sounds';

export default function SoundToggle() {
  const [muted, setMuted] = useState(() => sounds.isMuted());

  return (
    <button
      onClick={() => setMuted(sounds.toggleMute())}
      className="text-xs px-3 py-1.5 rounded-full border border-cream/20 text-cream/60 hover:text-cream"
      title={muted ? 'Unmute sound effects' : 'Mute sound effects'}
    >
      {muted ? '🔇 Muted' : '🔊 Sound on'}
    </button>
  );
}
