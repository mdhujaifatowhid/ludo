'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useProfile } from '@/hooks/useProfile';
import { supabase } from '@/lib/supabaseClient';
import PublicLobbyList from '@/components/PublicLobbyList';

export default function HomePage() {
  const { profile, loading, updateUsername } = useProfile();
  const [nameDraft, setNameDraft] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [maxPlayers, setMaxPlayers] = useState<2 | 3 | 4>(4);
  const [isPublic, setIsPublic] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleCreate() {
    setBusy(true);
    setError(null);
    const { data, error: rpcError } = await supabase.rpc('create_room', {
      p_is_public: isPublic,
      p_max_players: maxPlayers,
    });
    setBusy(false);
    if (rpcError || !data) {
      setError(rpcError?.message ?? 'Could not create room.');
      return;
    }
    router.push(`/room/${data.code}`);
  }

  async function handleJoin(code: string) {
    if (!code.trim()) return;
    setBusy(true);
    setError(null);
    const { error: rpcError } = await supabase.rpc('join_room', { p_code: code.trim() });
    setBusy(false);
    if (rpcError) {
      setError(rpcError.message ?? 'Could not join room.');
      return;
    }
    router.push(`/room/${code.trim().toUpperCase()}`);
  }

  if (loading) {
    return (
      <main className="flex items-center justify-center min-h-screen">
        <p className="text-cream/60 font-display text-lg">Setting up the table…</p>
      </main>
    );
  }

  return (
    <main className="max-w-3xl mx-auto px-5 py-10 space-y-8">
      <header className="text-center space-y-2">
        <h1 className="font-display text-5xl font-extrabold tracking-tight">
          Ludo <span className="text-piece-yellow">Realtime</span>
        </h1>
        <p className="text-cream/60">Roll the dice, race your tokens home, chat while you wait your turn.</p>
      </header>

      <section className="felt-surface stitch-border p-5 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-cream/50">Playing as</p>
          <p className="font-display text-xl font-semibold" style={{ color: profile?.avatar_color }}>
            {profile?.username}
          </p>
        </div>
        <div className="flex gap-2">
          <input
            className="bg-wood/40 border border-cream/20 rounded-lg px-3 py-2 text-sm w-40"
            placeholder="New nickname"
            value={nameDraft}
            onChange={(e) => setNameDraft(e.target.value)}
            maxLength={20}
          />
          <button
            className="px-3 py-2 rounded-lg bg-piece-blue/80 hover:bg-piece-blue text-sm font-semibold"
            onClick={() => nameDraft.trim() && updateUsername(nameDraft.trim())}
          >
            Save
          </button>
        </div>
      </section>

      <section className="grid md:grid-cols-2 gap-6">
        <div className="felt-surface stitch-border p-6 space-y-4">
          <h2 className="font-display text-2xl font-bold">Create a table</h2>
          <div className="flex gap-2">
            {[2, 3, 4].map((n) => (
              <button
                key={n}
                onClick={() => setMaxPlayers(n as 2 | 3 | 4)}
                className={`flex-1 py-2 rounded-lg border font-semibold ${
                  maxPlayers === n ? 'bg-piece-yellow text-wood border-piece-yellow' : 'border-cream/20 text-cream/70'
                }`}
              >
                {n} players
              </button>
            ))}
          </div>
          <label className="flex items-center gap-2 text-sm text-cream/70">
            <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} />
            List in public lobby browser
          </label>
          <button
            disabled={busy}
            onClick={handleCreate}
            className="w-full py-3 rounded-xl bg-piece-red hover:brightness-110 font-display font-bold text-lg disabled:opacity-50"
          >
            Create room
          </button>
        </div>

        <div className="felt-surface stitch-border p-6 space-y-4">
          <h2 className="font-display text-2xl font-bold">Join with a code</h2>
          <input
            className="w-full bg-wood/40 border border-cream/20 rounded-lg px-4 py-3 text-center text-2xl tracking-[0.3em] font-display uppercase"
            placeholder="ABC123"
            maxLength={6}
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
          />
          <button
            disabled={busy}
            onClick={() => handleJoin(joinCode)}
            className="w-full py-3 rounded-xl bg-piece-blue hover:brightness-110 font-display font-bold text-lg disabled:opacity-50"
          >
            Join table
          </button>
        </div>
      </section>

      {error && <p className="text-piece-red text-center">{error}</p>}

      <section className="felt-surface stitch-border p-6">
        <h2 className="font-display text-2xl font-bold mb-4">Public lobbies</h2>
        <PublicLobbyList onJoin={handleJoin} />
      </section>
    </main>
  );
}
