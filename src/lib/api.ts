import { useStore } from './store';

const BASE_URL = '/api';

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const role = useStore.getState().activeRole;
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      'x-role': role,
      ...init?.headers,
    },
  });

  if (!res.ok) {
    throw new Error(`API ${res.status}: ${res.statusText}`);
  }

  return res.json() as Promise<T>;
}
