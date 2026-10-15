import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import ws from 'ws';

// Auth is entirely optional. If these env vars aren't set (the default for
// a fresh clone running against your own Anthropic key), the app runs in
// today's open mode: no login, no quota, RoleSwitcher only. Auth only turns
// on when you point the app at a Supabase project, which is meant for a
// hosted deployment where a shared Claude API key needs abuse protection.
const url = process.env['SUPABASE_URL'];
const serviceRoleKey = process.env['SUPABASE_SERVICE_ROLE_KEY'];

export const authEnabled = Boolean(url && serviceRoleKey);

let client: SupabaseClient | null = null;
if (authEnabled) {
  client = createClient(url!, serviceRoleKey!, {
    auth: { autoRefreshToken: false, persistSession: false },
    // The backend only does REST calls (auth.getUser, table reads/writes) and
    // never subscribes to realtime channels, but supabase-js always
    // constructs a RealtimeClient — on Node 20 that throws without an
    // explicit WebSocket implementation, hence `ws` here.
    realtime: { transport: ws as never },
  });
}

/** Service-role client that bypasses RLS. Only defined when auth is enabled. */
export function supabaseAdmin(): SupabaseClient {
  if (!client) {
    throw new Error('Supabase is not configured (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY missing)');
  }
  return client;
}
