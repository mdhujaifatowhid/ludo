'use client';

import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { ChatMessageRow } from '@/types/game';
import { sounds } from '@/lib/sounds';

export function useChat(roomId: string | null, myPlayerId: string | null) {
  const [messages, setMessages] = useState<ChatMessageRow[]>([]);

  useEffect(() => {
    if (!roomId) return;

    supabase
      .from('chat_messages')
      .select('*')
      .eq('room_id', roomId)
      .order('created_at', { ascending: true })
      .limit(200)
      .then(({ data }) => setMessages((data ?? []) as ChatMessageRow[]));

    const channel = supabase
      .channel(`chat-${roomId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `room_id=eq.${roomId}` },
        (payload) => {
          const msg = payload.new as ChatMessageRow;
          setMessages((prev) => [...prev, msg]);
          if (msg.player_id !== myPlayerId) sounds.play('message');
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId, myPlayerId]);

  const send = useCallback(
    async (username: string, message: string) => {
      if (!roomId || !myPlayerId || !message.trim()) return;
      await supabase.from('chat_messages').insert({
        room_id: roomId,
        player_id: myPlayerId,
        username,
        message: message.trim().slice(0, 500),
      });
    },
    [roomId, myPlayerId]
  );

  return { messages, send };
}
