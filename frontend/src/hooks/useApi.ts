/**
 * Custom hook for API calls with loading and error states
 * 
 * Usage:
 * ```ts
 * const { data, loading, error, execute } = useApi(salonsApi.getFeatured);
 * 
 * // Auto-execute on mount
 * const { data, loading } = useApi(salonsApi.getFeatured, { autoExecute: true });
 * ```
 */

import { useState, useCallback, useEffect } from 'react';

interface UseApiOptions {
  autoExecute?: boolean;
  onSuccess?: (data: unknown) => void;
  onError?: (error: Error) => void;
}

interface UseApiReturn<T, Args extends unknown[]> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  execute: (...args: Args) => Promise<T | null>;
  reset: () => void;
}

export function useApi<T, Args extends unknown[] = []>(
  apiFunction: (...args: Args) => Promise<T>,
  options: UseApiOptions = {}
): UseApiReturn<T, Args> {
  const { autoExecute = false, onSuccess, onError } = options;
  
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(autoExecute);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(
    async (...args: Args): Promise<T | null> => {
      setLoading(true);
      setError(null);

      try {
        const result = await apiFunction(...args);
        setData(result);
        onSuccess?.(result);
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error');
        setError(error);
        onError?.(error);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [apiFunction, onSuccess, onError]
  );

  const reset = useCallback(() => {
    setData(null);
    setLoading(false);
    setError(null);
  }, []);

  useEffect(() => {
    if (autoExecute) {
      execute(...([] as unknown as Args));
    }
  }, [autoExecute, execute]);

  return { data, loading, error, execute, reset };
}

/**
 * Hook for paginated API calls
 */
interface UsePaginatedApiOptions<T> extends UseApiOptions {
  initialPage?: number;
  initialLimit?: number;
  onPageChange?: (page: number, data: T[]) => void;
}

interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface UsePaginatedApiReturn<T> {
  data: T[];
  loading: boolean;
  error: Error | null;
  page: number;
  totalPages: number;
  total: number;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  goToPage: (page: number) => Promise<void>;
  refresh: () => Promise<void>;
}

export function usePaginatedApi<T>(
  apiFunction: (params: { page: number; limit: number }) => Promise<PaginatedResult<T>>,
  options: UsePaginatedApiOptions<T> = {}
): UsePaginatedApiReturn<T> {
  const { initialPage = 1, initialLimit = 10, onPageChange } = options;

  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [page, setPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);

  const fetchPage = useCallback(
    async (pageNum: number, append = false) => {
      setLoading(true);
      setError(null);

      try {
        const result = await apiFunction({ page: pageNum, limit: initialLimit });
        
        if (append) {
          setData(prev => [...prev, ...result.data]);
        } else {
          setData(result.data);
        }
        
        setPage(result.page);
        setTotalPages(result.totalPages);
        setTotal(result.total);
        onPageChange?.(result.page, result.data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setLoading(false);
      }
    },
    [apiFunction, initialLimit, onPageChange]
  );

  const loadMore = useCallback(async () => {
    if (page < totalPages && !loading) {
      await fetchPage(page + 1, true);
    }
  }, [page, totalPages, loading, fetchPage]);

  const goToPage = useCallback(
    async (pageNum: number) => {
      if (pageNum >= 1 && pageNum <= totalPages) {
        await fetchPage(pageNum);
      }
    },
    [totalPages, fetchPage]
  );

  const refresh = useCallback(async () => {
    await fetchPage(1);
  }, [fetchPage]);

  return {
    data,
    loading,
    error,
    page,
    totalPages,
    total,
    hasMore: page < totalPages,
    loadMore,
    goToPage,
    refresh,
  };
}

export default useApi;
