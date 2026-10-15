import type { Request, Response, NextFunction } from 'express';
import { authEnabled, supabaseAdmin } from '../lib/supabase-admin.ts';

declare module 'express-serve-static-core' {
  interface Request {
    userId?: string;
  }
}

/**
 * No-op when Supabase isn't configured, so a local clone with just an
 * ANTHROPIC_API_KEY keeps working exactly as it does today. Only enforces
 * login when SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are set, which is the
 * case on a hosted deployment where the Claude API key needs protecting.
 */
export async function authGate(req: Request, res: Response, next: NextFunction): Promise<void> {
  if (!authEnabled) {
    next();
    return;
  }

  const header = req.headers['authorization'];
  const token = typeof header === 'string' ? header.replace(/^Bearer\s+/i, '') : undefined;
  if (!token) {
    res.status(401).json({ error: 'Sign in required to use the agent.' });
    return;
  }

  const { data, error } = await supabaseAdmin().auth.getUser(token);
  if (error || !data.user) {
    res.status(401).json({ error: 'Your session has expired. Please sign in again.' });
    return;
  }

  req.userId = data.user.id;
  next();
}
