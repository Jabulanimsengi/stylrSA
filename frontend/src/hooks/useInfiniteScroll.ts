import { useEffect, useRef, useCallback } from 'react';

interface UseInfiniteScrollOptions {
  /**
   * Callback function to load more items
   */
  onLoadMore: () => void | Promise<void>;
  
  /**
   * Whether more items are currently being loaded
   */
  isLoading: boolean;
  
  /**
   * Whether there are more items to load
   */
  hasMore: boolean;
  
  /**
   * Root margin for intersection observer (default: '100px')
   * Triggers loading before reaching the bottom
   */
  rootMargin?: string;
  
  /**
   * Threshold for intersection observer (default: 0.1)
   */
  threshold?: number;
  
  /**
   * Whether infinite scroll is enabled (default: true)
   */
  enabled?: boolean;
}

/**
 * Custom hook for implementing infinite scroll functionality
 * Uses Intersection Observer API for optimal performance
 * 
 * @example
 * const { sentinelRef } = useInfiniteScroll({
 *   onLoadMore: fetchMoreData,
 *   isLoading,
 *   hasMore: currentPage < totalPages,
 * });
 * 
 * return (
 *   <>
 *     {items.map(item => <Item key={item.id} {...item} />)}
 *     <div ref={sentinelRef} />
 *   </>
 * );
 */
export function useInfiniteScroll({
  onLoadMore,
  isLoading,
  hasMore,
  rootMargin = '100px',
  threshold = 0.1,
  enabled = true,
}: UseInfiniteScrollOptions) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const handleIntersection = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;

      // Load more when sentinel is visible and conditions are met
      if (entry.isIntersecting && !isLoading && hasMore && enabled) {
        onLoadMore();
      }
    },
    [onLoadMore, isLoading, hasMore, enabled]
  );

  useEffect(() => {
    // Cleanup previous observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    // Don't create observer if disabled or no sentinel
    if (!enabled || !sentinelRef.current) {
      return;
    }

    // Create new observer
    observerRef.current = new IntersectionObserver(handleIntersection, {
      root: null, // viewport
      rootMargin,
      threshold,
    });

    // Observe the sentinel element
    if (sentinelRef.current) {
      observerRef.current.observe(sentinelRef.current);
    }

    // Cleanup on unmount
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [handleIntersection, rootMargin, threshold, enabled]);

  return {
    /**
     * Ref to attach to the sentinel element (invisible div at the bottom)
     */
    sentinelRef,
  };
}

/**
 * Helper function to create paginated data fetcher
 */
export function createPaginatedFetcher<T>(
  fetchFn: (page: number, limit: number) => Promise<T[]>,
  limit: number = 20
) {
  let currentPage = 0;
  let allItems: T[] = [];
  let hasMore = true;

  const loadMore = async () => {
    if (!hasMore) return [];

    currentPage += 1;
    const newItems = await fetchFn(currentPage, limit);

    // If we got fewer items than the limit, we've reached the end
    if (newItems.length < limit) {
      hasMore = false;
    }

    allItems = [...allItems, ...newItems];
    return newItems;
  };

  const reset = () => {
    currentPage = 0;
    allItems = [];
    hasMore = true;
  };

  return {
    loadMore,
    reset,
    get hasMore() {
      return hasMore;
    },
    get currentPage() {
      return currentPage;
    },
    get items() {
      return allItems;
    },
  };
}
