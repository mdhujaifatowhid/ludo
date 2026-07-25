'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { useProfile } from '@/hooks/useProfile';
import { useRoom } from '@/hooks/useRoom';
import { useGameState } from '@/hooks/useGameState';
import { useChat } from '@/hooks/useChat';
import { usePresence } from '@/hooks/usePresence';
import { supabase } from '@/lib/supabaseClient';
import { COLOR_HEX } from '@/lib/boardLayout';
import { getMovableTokens } from '@/lib/gameEngine';
import { SeatedPlayer } from '@/types/game';
import RoomCodeDisplay from '@/components/RoomCodeDisplay';
import PlayerCard from '@/components/PlayerCard';
import ChatBox from '@/components/ChatBox';
import SoundToggle from '@/components/SoundToggle';
import Board from '@/components/Board';
import Dice from '@/components/Dice';

export default function RoomPage() {
  const params = useParams<{ code: string }>();
  const code = (params.code ?? '').toUpperCase();

  const { profile, loading: profileLoading } = useProfile();
  const { room, players, loading: roomLoading, error, refresh } = useRoom(code);
  const { messages, send } = useChat(room?.id ?? null, profile?.id ?? null);
  const onlineIds = usePresence(room?.id ?? null, profile?.id ?? null, profile?.username ?? null);
  const { state, startGame, isMyTurn, doRoll, doMove, passTurn } = useGameState(room?.id ?? null, profile?.id ?? null);

  const [profilesById, setProfilesById] = useState<Record<string, { username: string }>>({});

  useEffect(() => {
    if (players.length === 0) return;
    supabase
      .from('profiles')
      .select('id, username')
      .in('id', players.map((p) => p.player_id))
      .then(({ data }) => {
        const map: Record<string, { username: string }> = {};
        (data ?? []).forEach((p: any) => (map[p.id] = { username: p.username }));
        setProfilesById(map);
      });
  }, [players]);

  const me = players.find((p) => p.player_id === profile?.id);
  const isHost = room?.host_id === profile?.id;

  async function toggleReady() {
    if (!me) return;
    await supabase.from('room_players').update({ is_ready: !me.is_ready }).eq('id', me.id);
  }

  async function handleStart() {
    if (!room) return;
    const seated: SeatedPlayer[] = players
      .slice()
      .sort((a, b) => a.seat_order - b.seat_order)
      .map((p) => ({
        color: p.color,
        playerId: p.player_id,
        username: profilesById[p.player_id]?.username ?? 'Player',
      }));
    await startGame(seated);
  }

  const myColor = players.find((p) => p.player_id === profile?.id)?.color ?? null;
  const movable = useMemo(() => {
    if (!state || !state.diceValue || !myColor) return [];
    if (state.players[state.currentColorIndex]?.color !== myColor) return [];
    return getMovableTokens(state, myColor, state.diceValue);
  }, [state, myColor]);

  useEffect(() => {
    if (!state || !state.diceValue) return;
    if (!isMyTurn()) return;
    if (movable.length > 0) return;
    const t = setTimeout(() => passTurn(), 1200);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state?.diceValue, movable.length]);

  if (profileLoading || roomLoading) {
    return (
      <main className="flex items-center justify-center min-h-screen">
        <p className="text-cream/60 font-display text-lg">Finding the table…</p>
      </main>
    );
  }

  if (error || !room) {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen gap-3">
        <p className="text-piece-red font-display text-xl">{error ?? 'Room not found.'}</p>
        <a href="/" className="text-cream/60 underline">
          Back home
        </a>
      </main>
    );
  }

  const allReady = players.length >= 2 && players.every((p) => p.is_ready);
  const activeColor = state ? state.players[state.currentColorIndex]?.color : null;
  const activePlayerName = state
    ? profilesById[state.players[state.currentColorIndex]?.playerId]?.username ?? activeColor
    : null;
  const winnerNames = state?.winners.map(
    (c) => profilesById[state.players.find((p) => p.color === c)?.playerId ?? '']?.username ?? c
  );

  return (
    <main className="max-w-6xl mx-auto px-4 py-6 space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <RoomCodeDisplay code={room.code} />
        <div className="flex items-center gap-3">
          <SoundToggle />
          <span className="text-xs text-cream/50">{room.is_public ? 'Public table' : 'Private table'}</span>
        </div>
      </div>

      {room.status === 'waiting' && (
        <section className="grid md:grid-cols-3 gap-5">
          <div className="md:col-span-2 space-y-3">
            <h2 className="font-display text-xl font-bold">Waiting room ({players.length}/{room.max_players})</h2>
            {players.map((p) => (
              <PlayerCard
                key={p.id}
                color={p.color}
                username={profilesById[p.player_id]?.username ?? '…'}
                isHost={p.player_id === room.host_id}
                isReady={p.is_ready}
                isOnline={onlineIds.has(p.player_id)}
                isYou={p.player_id === profile?.id}
              />
            ))}

            <div className="flex gap-3 pt-2">
              <button
                onClick={toggleReady}
                className={`px-5 py-2.5 rounded-xl font-display font-bold ${
                  me?.is_ready ? 'bg-cream/10 text-cream/70' : 'bg-piece-green text-wood'
                }`}
              >
                {me?.is_ready ? "I'm not ready" : "I'm ready"}
              </button>
              {isHost && (
                <button
                  onClick={handleStart}
                  disabled={!allReady}
                  className="px-5 py-2.5 rounded-xl font-display font-bold bg-piece-yellow text-wood disabled:opacity-40"
                >
                  Start game
                </button>
              )}
            </div>
            {isHost && !allReady && (
              <p className="text-xs text-cream/40">Waiting for everyone to mark themselves ready (2-4 players).</p>
            )}
          </div>
          <div className="h-96 md:h-auto">
            <ChatBox messages={messages} onSend={(t) => send(profile?.username ?? 'Player', t)} myPlayerId={profile?.id ?? null} />
          </div>
        </section>
      )}

      {room.status === 'playing' && state && (
        <section className="grid md:grid-cols-3 gap-5">
          <div className="md:col-span-2 space-y-4">
            <div className="felt-surface stitch-border p-4 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-cream/50">Current turn</p>
                <p className="font-display text-xl font-bold" style={{ color: activeColor ? COLOR_HEX[activeColor] : undefined }}>
                  {activePlayerName} {isMyTurn() && <span className="text-piece-yellow text-sm">(your turn)</span>}
                </p>
              </div>
              <Dice
                value={state.diceValue}
                canRoll={isMyTurn() && state.diceValue === null}
                onRoll={doRoll}
              />
            </div>

            <div className="felt-surface stitch-border p-4 aspect-square max-w-xl mx-auto">
              <Board state={state} movableTokenIds={movable} activeColor={activeColor} onTokenClick={doMove} />
            </div>

            {isMyTurn() && state.diceValue !== null && movable.length === 0 && (
              <p className="text-center text-cream/50 text-sm">No legal moves — turn passes automatically.</p>
            )}
          </div>

          <div className="space-y-3">
            {players.map((p) => (
              <PlayerCard
                key={p.id}
                color={p.color}
                username={profilesById[p.player_id]?.username ?? '…'}
                isHost={p.player_id === room.host_id}
                isReady
                isOnline={onlineIds.has(p.player_id)}
                isYou={p.player_id === profile?.id}
              />
            ))}
            <div className="h-72">
              <ChatBox messages={messages} onSend={(t) => send(profile?.username ?? 'Player', t)} myPlayerId={profile?.id ?? null} />
            </div>
          </div>
        </section>
      )}

      {state && state.winners.length > 0 && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="felt-surface stitch-border p-8 text-center space-y-3 animate-pop max-w-sm">
            <p className="text-cream/60 uppercase text-xs tracking-widest">Game update</p>
            <p className="font-display text-2xl font-extrabold text-piece-yellow">
              {winnerNames?.join(', ')} {state.winners.length === 1 ? 'wins!' : 'have finished!'}
            </p>
            <a href="/" className="inline-block mt-2 px-5 py-2 rounded-xl bg-piece-blue font-display font-bold">
              Back to lobby
            </a>
          </div>
        </div>
      )}
    </main>
  );
}
