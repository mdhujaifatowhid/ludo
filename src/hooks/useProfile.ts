'use client';

import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export interface Profile {
  id: string;
  username: string;
  avatar_color: string;
  wins: number;
  games_played: number;
}

const AVATAR_COLORS = ['#E63946', '#2A9D8F', '#E9C46A', '#457B9D', '#9B5DE5', '#F15BB5'];

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      let { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        const stored = typeof window !== 'undefined' ? window.localStorage.getItem('ludo-username') : null;
        const { data, error } = await supabase.auth.signInAnonymously({
          options: {
            data: {
              username: stored || `Player${Math.floor(1000 + Math.random() * 9000)}`,
              avatar_color: AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)],
            },
          },
        });
        if (error) {
          setLoading(false);
          return;
        }
        session = data.session;
      }

      if (!session) {
        setLoading(false);
        return;
      }

      const { data: profileRow } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      setProfile(profileRow as Profile);
      setLoading(false);
    })();
  }, []);

  const updateUsername = useCallback(async (username: string) => {
    if (!profile) return;
    await supabase.from('profiles').update({ username }).eq('id', profile.id);
    setProfile({ ...profile, username });
    if (typeof window !== 'undefined') window.localStorage.setItem('ludo-username', username);
  }, [profile]);

  return { profile, loading, updateUsername };
}
