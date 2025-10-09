import { parseErrorResponse } from './errors';

export async function apiFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const res = await fetch(input, { credentials: 'include', ...init });
  if (!res.ok) {
    throw await parseErrorResponse(res);
  }
  return res;
}

export async function apiJson<T = any>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const res = await apiFetch(input, init);
  return res.json();
}
