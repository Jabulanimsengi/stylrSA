/**
 * API Client with retry logic and error handling
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

interface RequestConfig extends RequestInit {
  retries?: number;
  retryDelay?: number;
}

interface ApiError extends Error {
  status?: number;
  data?: unknown;
}

/**
 * Sleep utility for retry delays
 */
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Create an API error with additional context
 */
const createApiError = (message: string, status?: number, data?: unknown): ApiError => {
  const error = new Error(message) as ApiError;
  error.status = status;
  error.data = data;
  return error;
};

/**
 * Main API client with automatic retry logic
 */
export async function apiClient<T>(
  endpoint: string,
  config: RequestConfig = {}
): Promise<T> {
  const { retries = 3, retryDelay = 1000, ...fetchConfig } = config;
  
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
  
  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
  };

  // Add auth token if available
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken');
    if (token) {
      (defaultHeaders as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }
  }

  const finalConfig: RequestInit = {
    ...fetchConfig,
    headers: {
      ...defaultHeaders,
      ...fetchConfig.headers,
    },
  };

  let lastError: ApiError | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, finalConfig);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw createApiError(
          errorData.message || `HTTP ${response.status}`,
          response.status,
          errorData
        );
      }

      // Handle empty responses
      const text = await response.text();
      if (!text) return {} as T;
      
      return JSON.parse(text) as T;
    } catch (error) {
      lastError = error as ApiError;
      
      // Don't retry on client errors (4xx)
      if (lastError.status && lastError.status >= 400 && lastError.status < 500) {
        throw lastError;
      }

      // Retry on network errors or server errors
      if (attempt < retries) {
        await sleep(retryDelay * (attempt + 1)); // Exponential backoff
        continue;
      }
    }
  }

  throw lastError || createApiError('Unknown error occurred');
}

/**
 * Convenience methods
 */
export const api = {
  get: <T>(endpoint: string, config?: RequestConfig) =>
    apiClient<T>(endpoint, { ...config, method: 'GET' }),

  post: <T>(endpoint: string, data?: unknown, config?: RequestConfig) =>
    apiClient<T>(endpoint, {
      ...config,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    }),

  put: <T>(endpoint: string, data?: unknown, config?: RequestConfig) =>
    apiClient<T>(endpoint, {
      ...config,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    }),

  patch: <T>(endpoint: string, data?: unknown, config?: RequestConfig) =>
    apiClient<T>(endpoint, {
      ...config,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    }),

  delete: <T>(endpoint: string, config?: RequestConfig) =>
    apiClient<T>(endpoint, { ...config, method: 'DELETE' }),
};
