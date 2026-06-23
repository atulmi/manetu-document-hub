import { useStore } from './store';

const BASE_URL = '/api';

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const { activeRole, securityEnabled } = useStore.getState();
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      'x-role': activeRole,
      'x-security-enabled': String(securityEnabled),
      ...init?.headers,
    },
  });

  if (!res.ok) {
    throw new Error(`API ${res.status}: ${res.statusText}`);
  }

  return res.json() as Promise<T>;
}
