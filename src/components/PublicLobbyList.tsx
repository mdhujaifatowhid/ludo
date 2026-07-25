'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { RoomRow } from '@/types/game';

interface RoomWithCount extends RoomRow {
  player_count: number;
}

export default function PublicLobbyList({ onJoin }: { onJoin: (code: string) => void }) {
  const [rooms, setRooms] = useState<RoomWithCount[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    const { data } = await supabase
      .from('rooms')
      .select('*, room_players(count)')
      .eq('is_public', true)
      .eq('status', 'waiting')
      .order('created_at', { ascending: false })
      .limit(20);

    const shaped = (data ?? []).map((r: any) => ({
      ...r,
      player_count: r.room_players?.[0]?.count ?? 0,
    }));
    setRooms(shaped);
    setLoading(false);
  }

  useEffect(() => {
    load();
    const channel = supabase
      .channel('public-lobbies')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rooms' }, load)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'room_players' }, load)
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (loading) return <p className="text-cream/50 text-sm">Loading lobbies…</p>;
  if (rooms.length === 0) return <p className="text-cream/50 text-sm">No open public tables right now — create one!</p>;

  return (
    <ul className="space-y-2">
      {rooms.map((r) => (
        <li
          key={r.id}
          className="flex items-center justify-between bg-wood/30 rounded-lg px-4 py-3 border border-cream/10"
        >
          <div>
            <p className="font-display font-bold tracking-widest">{r.code}</p>
            <p className="text-xs text-cream/50">
              {r.player_count} / {r.max_players} players
            </p>
          </div>
          <button
            onClick={() => onJoin(r.code)}
            disabled={r.player_count >= r.max_players}
            className="px-4 py-2 rounded-lg bg-piece-green/80 hover:bg-piece-green text-sm font-semibold disabled:opacity-40"
          >
            {r.player_count >= r.max_players ? 'Full' : 'Join'}
          </button>
        </li>
      ))}
    </ul>
  );
}
