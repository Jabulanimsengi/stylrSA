import { parseErrorResponse } from './errors';
import { addCsrfHeader } from './csrf';

export async function apiFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  // Add CSRF token for state-changing methods
  const optionsWithCsrf = await addCsrfHeader(init);
  
  const res = await fetch(input, { credentials: 'include', ...optionsWithCsrf });
  if (!res.ok) {
    throw await parseErrorResponse(res);
  }
  return res;
}

export async function apiJson<T = any>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const res = await apiFetch(input, init);
  return res.json();
}
