import { create } from 'zustand';
import type { Session } from '@supabase/supabase-js';
import { supabase, authEnabled } from './supabase-client';
import { useStore } from './store';

const LAST_USER_KEY = 'manetu-last-auth-user';

// Prompt history/task state is a local-first buffer shared by the whole
// browser (see store.ts's persist middleware) — nothing about it is
// scoped by user on its own. If a second person signs in on the same
// browser, their session swaps in, but any not-yet-synced local runs
// from the previous user would otherwise still be sitting there and get
// merged into their view (see usePromptHistory). Clearing on a detected
// user change closes that gap; the backend's own per-user scoping (see
// authGate/queryPromptRuns) handles everything already synced to ES.
function handleUserChange(userId: string | null): void {
  // Only acts on an actual sign-in (a resolved user id) — a sign-out
  // leaves the local buffer alone (it's inert behind AuthGate's login
  // screen anyway); the check that matters is against the *next* sign-in.
  if (!userId) return;
  try {
    const lastUserId = localStorage.getItem(LAST_USER_KEY);
    if (lastUserId !== null && lastUserId !== userId) {
      useStore.getState().clearAllHistory();
    }
    localStorage.setItem(LAST_USER_KEY, userId);
  } catch {
    // localStorage unavailable — nothing more we can do
  }
}

interface AuthState {
  session: Session | null;
  initializing: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (email: string, password: string) => Promise<boolean>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  initializing: authEnabled,
  error: null,
  signIn: async (email, password) => {
    if (!supabase) return false;
    set({ error: null });
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      set({ error: error.message });
      return false;
    }
    return true;
  },
  signUp: async (email, password) => {
    if (!supabase) return false;
    set({ error: null });
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      set({ error: error.message });
      return false;
    }
    return true;
  },
  signOut: async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
  },
}));

if (supabase) {
  supabase.auth.getSession().then(({ data }) => {
    useAuthStore.setState({ session: data.session, initializing: false });
    handleUserChange(data.session?.user.id ?? null);
  });
  supabase.auth.onAuthStateChange((_event, session) => {
    useAuthStore.setState({ session, initializing: false });
    handleUserChange(session?.user.id ?? null);
  });
}

/** Current access token, for attaching to API requests. Undefined when auth is off or logged out. */
export function getAccessToken(): string | undefined {
  return useAuthStore.getState().session?.access_token;
}
