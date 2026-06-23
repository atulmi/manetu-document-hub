import type { Request, Response, NextFunction } from 'express';
import type { UserRole } from '../types.ts';

const VALID_ROLES: ReadonlySet<string> = new Set<UserRole>([
  'developer',
  'data-analyst',
  'viewer',
  'auditor',
  'admin',
]);

declare global {
  namespace Express {
    interface Request {
      role?: UserRole;
    }
  }
}

export function roleExtract(req: Request, res: Response, next: NextFunction): void {
  const role = req.headers['x-role'];

  if (typeof role !== 'string' || !VALID_ROLES.has(role)) {
    res.status(400).json({ error: `Invalid or missing x-role header. Expected one of: ${[...VALID_ROLES].join(', ')}` });
    return;
  }

  req.role = role as UserRole;
  next();
}
