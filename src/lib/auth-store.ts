import { create } from 'zustand';
import type { Session } from '@supabase/supabase-js';
import { supabase, authEnabled } from './supabase-client';

interface AuthState {
  session: Session | null;
  initializing: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  initializing: authEnabled,
  error: null,
  signIn: async (email, password) => {
    if (!supabase) return;
    set({ error: null });
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) set({ error: error.message });
  },
  signUp: async (email, password) => {
    if (!supabase) return;
    set({ error: null });
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) set({ error: error.message });
  },
  signOut: async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
  },
}));

if (supabase) {
  supabase.auth.getSession().then(({ data }) => {
    useAuthStore.setState({ session: data.session, initializing: false });
  });
  supabase.auth.onAuthStateChange((_event, session) => {
    useAuthStore.setState({ session, initializing: false });
  });
}

/** Current access token, for attaching to API requests. Undefined when auth is off or logged out. */
export function getAccessToken(): string | undefined {
  return useAuthStore.getState().session?.access_token;
}
