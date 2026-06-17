import { apiBaseUrl } from '@/lib/api';
import type { ApiResponse } from './types';

export async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${apiBaseUrl}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) }
  });
  const json = (await res.json().catch(() => null)) as ApiResponse<T> | null;
  if (!res.ok) throw new Error(messageForStatus(res.status, json));
  return json?.data as T;
}

export function authRequest<T>(path: string, token: string, init?: RequestInit) {
  return request<T>(path, {
    ...init,
    headers: { Authorization: `Bearer ${token}`, ...(init?.headers ?? {}) }
  });
}

export async function authUpload<T>(path: string, token: string, body: FormData): Promise<T> {
  const res = await fetch(`${apiBaseUrl}${path}`, {
    method: 'POST',
    body,
    headers: { Authorization: `Bearer ${token}` }
  });
  const json = (await res.json().catch(() => null)) as ApiResponse<T> | null;
  if (!res.ok) throw new Error(messageForStatus(res.status, json));
  return json?.data as T;
}

export function handleError(
  err: unknown,
  setError: (value: string) => void,
  onUnauthorized: () => void
) {
  const message = err instanceof Error ? err.message : 'Có lỗi xảy ra';
  if (message.includes('401')) onUnauthorized();
  setError(message);
}

function messageForStatus(status: number, json: ApiResponse<unknown> | null) {
  const data = json?.data as { message?: string } | undefined;
  return data?.message ?? `API error ${status}`;
}
