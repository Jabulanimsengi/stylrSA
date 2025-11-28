/**
 * useIntersectionObserver Hook
 * 
 * Reusable hook for intersection observer functionality.
 * Perfect for infinite scroll, lazy loading, and animations.
 * 
 * Usage:
 * ```ts
 * // Infinite scroll
 * const { ref, isIntersecting } = useIntersectionObserver({
 *   threshold: 0.1,
 *   rootMargin: '100px',
 * });
 * 
 * useEffect(() => {
 *   if (isIntersecting && hasMore) {
 *     loadMore();
 *   }
 * }, [isIntersecting]);
 * 
 * return <div ref={ref}>Load more trigger</div>;
 * ```
 */

import { useEffect, useRef, useState, useCallback } from 'react';

interface UseIntersectionObserverOptions {
  threshold?: number | number[];
  root?: Element | null;
  rootMargin?: string;
  freezeOnceVisible?: boolean;
  onChange?: (isIntersecting: boolean, entry: IntersectionObserverEntry) => void;
}

interface UseIntersectionObserverReturn<T extends Element> {
  ref: React.RefCallback<T>;
  isIntersecting: boolean;
  entry: IntersectionObserverEntry | null;
}

export function useIntersectionObserver<T extends Element = HTMLDivElement>(
  options: UseIntersectionObserverOptions = {}
): UseIntersectionObserverReturn<T> {
  const {
    threshold = 0,
    root = null,
    rootMargin = '0px',
    freezeOnceVisible = false,
    onChange,
  } = options;

  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);
  const frozen = useRef(false);
  const elementRef = useRef<T | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const ref = useCallback((node: T | null) => {
    // Cleanup previous observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    if (frozen.current) return;

    elementRef.current = node;

    if (!node) return;

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        const isElementIntersecting = entry.isIntersecting;

        setEntry(entry);
        setIsIntersecting(isElementIntersecting);
        onChange?.(isElementIntersecting, entry);

        if (freezeOnceVisible && isElementIntersecting) {
          frozen.current = true;
          observerRef.current?.disconnect();
        }
      },
      { threshold, root, rootMargin }
    );

    observerRef.current.observe(node);
  }, [threshold, root, rootMargin, freezeOnceVisible, onChange]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      observerRef.current?.disconnect();
    };
  }, []);

  return { ref, isIntersecting, entry };
}

/**
 * useInfiniteScroll Hook
 * 
 * Simplified hook specifically for infinite scroll patterns.
 * 
 * Usage:
 * ```ts
 * const { ref, isLoading } = useInfiniteScroll({
 *   hasMore,
 *   onLoadMore: () => fetchNextPage(),
 * });
 * 
 * return (
 *   <>
 *     {items.map(item => <Item key={item.id} {...item} />)}
 *     <div ref={ref} />
 *     {isLoading && <Spinner />}
 *   </>
 * );
 * ```
 */

interface UseInfiniteScrollOptions {
  hasMore: boolean;
  onLoadMore: () => Promise<void> | void;
  rootMargin?: string;
  threshold?: number;
}

interface UseInfiniteScrollReturn<T extends Element> {
  ref: React.RefCallback<T>;
  isLoading: boolean;
}

export function useInfiniteScroll<T extends Element = HTMLDivElement>(
  options: UseInfiniteScrollOptions
): UseInfiniteScrollReturn<T> {
  const { hasMore, onLoadMore, rootMargin = '400px', threshold = 0.1 } = options;
  const [isLoading, setIsLoading] = useState(false);
  const loadingRef = useRef(false);

  const handleIntersect = useCallback(
    async (isIntersecting: boolean) => {
      if (isIntersecting && hasMore && !loadingRef.current) {
        loadingRef.current = true;
        setIsLoading(true);

        try {
          await onLoadMore();
        } finally {
          loadingRef.current = false;
          setIsLoading(false);
        }
      }
    },
    [hasMore, onLoadMore]
  );

  const { ref } = useIntersectionObserver<T>({
    rootMargin,
    threshold,
    onChange: handleIntersect,
  });

  return { ref, isLoading };
}

export default useIntersectionObserver;
