'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { GameState, SeatedPlayer } from '@/types/game';
import { applyMove, createInitialState, currentColor, nextActiveIndex, rollDice } from '@/lib/gameEngine';
import { sounds } from '@/lib/sounds';

export function useGameState(roomId: string | null, myPlayerId: string | null) {
  const [state, setState] = useState<GameState | null>(null);
  const [loading, setLoading] = useState(true);
  const prevLogLength = useRef(0);

  const load = useCallback(async () => {
    if (!roomId) return;
    const { data } = await supabase
      .from('game_states')
      .select('state')
      .eq('room_id', roomId)
      .single();
    if (data) {
      const s = data.state as GameState;
      setState(s);
      prevLogLength.current = s.log.length;
    }
    setLoading(false);
  }, [roomId]);

  useEffect(() => {
    load();
  }, [load]);

  // Subscribe to live updates, and play sound effects for events we missed
  // locally (i.e. moves made by other players).
  useEffect(() => {
    if (!roomId) return;
    const channel = supabase
      .channel(`game-${roomId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'game_states', filter: `room_id=eq.${roomId}` },
        (payload) => {
          const s = payload.new.state as GameState;
          const newEvents = s.log.slice(prevLogLength.current);
          for (const line of newEvents) {
            if (line.includes('captured')) sounds.play('capture');
            else if (line.includes('reached home')) sounds.play('home');
            else if (line.includes('wins')) sounds.play('win');
            else sounds.play('move');
          }
          prevLogLength.current = s.log.length;
          setState(s);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId]);

  const startGame = useCallback(
    async (players: SeatedPlayer[]) => {
      if (!roomId) return;
      const initial = createInitialState(players);
      await supabase.from('game_states').insert({
        room_id: roomId,
        state: initial,
        current_turn: players[0].playerId,
        turn_number: 0,
      });
      await supabase.from('rooms').update({ status: 'playing' }).eq('id', roomId);
    },
    [roomId]
  );

  const isMyTurn = useCallback(() => {
    if (!state || !myPlayerId) return false;
    return state.players[state.currentColorIndex]?.playerId === myPlayerId;
  }, [state, myPlayerId]);

  const doRoll = useCallback(() => {
    if (!state) return null;
    const dice = rollDice();
    sounds.play('dice');
    setState({ ...state, diceValue: dice });
    return dice;
  }, [state]);

  const doMove = useCallback(
    async (tokenId: number) => {
      if (!state || !roomId || !state.diceValue) return;
      const color = currentColor(state);
      const { state: newState } = applyMove(state, color, tokenId, state.diceValue);
      const nextPlayer = newState.players[newState.currentColorIndex];

      const { error } = await supabase.rpc('advance_turn', {
        p_room_id: roomId,
        p_new_state: newState,
        p_next_turn: nextPlayer.playerId,
      });

      if (!error) {
        prevLogLength.current = newState.log.length;
        setState(newState);
      }
    },
    [state, roomId]
  );

  const passTurn = useCallback(async () => {
    if (!state || !roomId) return;
    const nextIdx = nextActiveIndex(state, state.winners);
    const nextPlayer = state.players[nextIdx];
    const newState = {
      ...state,
      diceValue: null,
      currentColorIndex: nextIdx,
      consecutiveSixes: 0,
      log: [...state.log, `${currentColor(state)} had no legal moves — turn passed.`].slice(-30),
    };
    const { error } = await supabase.rpc('advance_turn', {
      p_room_id: roomId,
      p_new_state: newState,
      p_next_turn: nextPlayer.playerId,
    });
    if (!error) {
      prevLogLength.current = newState.log.length;
      setState(newState);
    }
  }, [state, roomId]);

  return { state, loading, startGame, isMyTurn, doRoll, doMove, passTurn };
}
