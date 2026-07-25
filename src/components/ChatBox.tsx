'use client';

import { useEffect, useRef, useState } from 'react';
import { ChatMessageRow } from '@/types/game';

interface Props {
  messages: ChatMessageRow[];
  onSend: (text: string) => void;
  myPlayerId: string | null;
}

export default function ChatBox({ messages, onSend, myPlayerId }: Props) {
  const [draft, setDraft] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.trim()) return;
    onSend(draft);
    setDraft('');
  }

  return (
    <div className="felt-surface stitch-border flex flex-col h-80 md:h-full">
      <p className="px-4 py-2 text-xs uppercase tracking-wide text-cream/50 border-b border-cream/10">Table chat</p>
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2">
        {messages.length === 0 && <p className="text-cream/40 text-sm italic">No messages yet — say hi!</p>}
        {messages.map((m) => (
          <div key={m.id} className={m.player_id === myPlayerId ? 'text-right' : ''}>
            <span className="text-xs text-cream/50 mr-1">{m.username}</span>
            <span
              className={`inline-block px-3 py-1.5 rounded-2xl text-sm ${
                m.player_id === myPlayerId ? 'bg-piece-blue/60' : 'bg-wood/50'
              }`}
            >
              {m.message}
            </span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={submit} className="flex gap-2 p-3 border-t border-cream/10">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          maxLength={500}
          placeholder="Type a message…"
          className="flex-1 bg-wood/40 border border-cream/20 rounded-lg px-3 py-2 text-sm"
        />
        <button type="submit" className="px-4 py-2 rounded-lg bg-piece-yellow text-wood font-semibold text-sm">
          Send
        </button>
      </form>
    </div>
  );
}
