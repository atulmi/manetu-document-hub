import { useStore } from './store';

const BASE_URL = '/api';

const ERROR_MESSAGES: Record<number, string> = {
  400: 'Invalid request — check the selected role.',
  401: 'Not authorized.',
  403: 'Access denied for the current role.',
  404: 'Backend server is not running. Start it with: npm run server:dev',
  500: 'Server error — check the backend logs.',
  502: 'Backend server is unreachable.',
  503: 'Policy engine is unavailable. Make sure OPA is running (docker compose up).',
};

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const { activeRole, securityEnabled } = useStore.getState();

  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        'x-role': activeRole,
        'x-security-enabled': String(securityEnabled),
        ...init?.headers,
      },
    });
  } catch {
    throw new Error('Cannot reach the backend server. Start it with: npm run server:dev');
  }

  const contentType = res.headers.get('content-type') ?? '';

  if (!res.ok) {
    if (contentType.includes('application/json')) {
      const body = await res.json().catch(() => null) as { error?: string } | null;
      if (body?.error) throw new Error(body.error);
    }
    throw new Error(ERROR_MESSAGES[res.status] ?? `Request failed (${res.status}).`);
  }

  if (!contentType.includes('application/json')) {
    throw new Error('Backend server is not running. Start it with: npm run server:dev');
  }

  return res.json() as Promise<T>;
}
