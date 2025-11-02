import { parseErrorResponse } from './errors';
import { addCsrfHeader } from './csrf';

export interface RetryOptions {
  maxRetries?: number;
  initialDelayMs?: number;
  maxDelayMs?: number;
  shouldRetry?: (error: any, attempt: number) => boolean;
}

const DEFAULT_RETRY_OPTIONS: Required<RetryOptions> = {
  maxRetries: 2,
  initialDelayMs: 1000,
  maxDelayMs: 4000,
  shouldRetry: (error: any, attempt: number) => {
    // Retry on network errors or 5xx server errors
    if (!error?.statusCode) return true; // Network error
    if (error.statusCode >= 500 && error.statusCode < 600) return true; // Server error
    if (error.statusCode === 429) return attempt < 1; // Rate limit, retry once
    return false; // Don't retry client errors (4xx)
  }
};

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchWithRetry(
  input: RequestInfo | URL,
  init?: RequestInit,
  retryOptions: RetryOptions = {}
): Promise<Response> {
  const options = { ...DEFAULT_RETRY_OPTIONS, ...retryOptions };
  let lastError: any;
  
  for (let attempt = 0; attempt <= options.maxRetries; attempt++) {
    try {
      const optionsWithCsrf = await addCsrfHeader(init);
      const res = await fetch(input, { credentials: 'include', ...optionsWithCsrf });
      
      if (!res.ok) {
        const error = await parseErrorResponse(res);
        
        // Check if we should retry
        if (attempt < options.maxRetries && options.shouldRetry(error, attempt)) {
          lastError = error;
          const delay = Math.min(
            options.initialDelayMs * Math.pow(2, attempt),
            options.maxDelayMs
          );
          console.log(`[API] Request failed (attempt ${attempt + 1}/${options.maxRetries + 1}), retrying in ${delay}ms...`);
          await sleep(delay);
          continue;
        }
        
        throw error;
      }
      
      // Success
      if (attempt > 0) {
        console.log(`[API] Request succeeded after ${attempt + 1} attempt(s)`);
      }
      return res;
      
    } catch (error: any) {
      // Network error or fetch failure
      if (attempt < options.maxRetries && options.shouldRetry(error, attempt)) {
        lastError = error;
        const delay = Math.min(
          options.initialDelayMs * Math.pow(2, attempt),
          options.maxDelayMs
        );
        console.log(`[API] Network error (attempt ${attempt + 1}/${options.maxRetries + 1}), retrying in ${delay}ms...`);
        await sleep(delay);
        continue;
      }
      
      throw error;
    }
  }
  
  throw lastError;
}

export async function apiFetch(
  input: RequestInfo | URL,
  init?: RequestInit,
  retryOptions?: RetryOptions
): Promise<Response> {
  return fetchWithRetry(input, init, retryOptions);
}

export async function apiJson<T = any>(
  input: RequestInfo | URL,
  init?: RequestInit,
  retryOptions?: RetryOptions
): Promise<T> {
  const res = await apiFetch(input, init, retryOptions);
  return res.json();
}
