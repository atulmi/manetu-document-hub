import { supabaseAdmin } from './supabase-admin.ts';

const DAILY_QUOTA = Number(process.env['AGENT_DAILY_QUOTA'] ?? 20);

/** Counts this user's agent runs in the last 24h. Only call when auth is enabled. */
export async function isOverQuota(userId: string): Promise<boolean> {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { count, error } = await supabaseAdmin()
    .from('usage_log')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', since);

  if (error) {
    console.warn('[supabase] quota check failed, allowing request:', error.message);
    return false;
  }
  return (count ?? 0) >= DAILY_QUOTA;
}

/** Fire-and-forget usage log insert. Only call when auth is enabled. */
export function logUsage(userId: string): void {
  supabaseAdmin()
    .from('usage_log')
    .insert({ user_id: userId })
    .then(({ error }) => {
      if (error) console.warn('[supabase] failed to log usage:', error.message);
    });
}
