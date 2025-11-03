import { parseErrorResponse } from './errors';
import { addCsrfHeader } from './csrf';

export interface RetryOptions {
  maxRetries?: number;
  initialDelayMs?: number;
  maxDelayMs?: number;
  shouldRetry?: (error: any, attempt: number) => boolean;
}

const DEFAULT_RETRY_OPTIONS: Required<RetryOptions> = {
  maxRetries: 3,
  initialDelayMs: 1000,
  maxDelayMs: 5000,
  shouldRetry: (error: any, attempt: number) => {
    // Retry on network errors or 5xx server errors
    if (!error?.statusCode) return true; // Network error
    if (error.statusCode >= 500 && error.statusCode < 600) return true; // Server error
    if (error.statusCode === 429) return attempt < 2; // Rate limit, retry twice
    if (error.statusCode === 408) return true; // Request timeout
    if (error.statusCode === 503) return true; // Service unavailable
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
      
      // Add timeout to prevent hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
      
      const res = await fetch(input, { 
        credentials: 'include', 
        ...optionsWithCsrf,
        signal: controller.signal 
      });
      
      clearTimeout(timeoutId);
      
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
      // Check if it's an abort error
      if (error.name === 'AbortError') {
        console.log('[API] Request timeout');
        lastError = { message: 'Request timeout', statusCode: 408 };
      } else {
        lastError = error;
      }
      
      // Network error or fetch failure
      if (attempt < options.maxRetries && options.shouldRetry(lastError, attempt)) {
        const delay = Math.min(
          options.initialDelayMs * Math.pow(2, attempt),
          options.maxDelayMs
        );
        console.log(`[API] Network error (attempt ${attempt + 1}/${options.maxRetries + 1}), retrying in ${delay}ms...`);
        await sleep(delay);
        continue;
      }
      
      throw lastError;
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
