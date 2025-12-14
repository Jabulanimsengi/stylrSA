import { useEffect, useRef, useCallback } from 'react';

/**
 * Hook to track salon card impressions when they become visible in viewport
 * Uses IntersectionObserver to detect when salon card enters viewport
 * Tracks only once per salon to avoid excessive API calls
 * 
 * @param salonId - The salon ID to track impressions for
 * @param enabled - Whether impression tracking is enabled
 * @param onTracked - Optional callback fired when impression is successfully tracked
 */
export function useSalonImpression(
  salonId: string | undefined,
  enabled: boolean = true,
  onTracked?: () => void
) {
  const hasTrackedRef = useRef(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const elementRef = useCallback((node: HTMLElement | null) => {
    if (!enabled || !salonId || hasTrackedRef.current || !node) return;

    const trackImpression = async () => {
      if (hasTrackedRef.current) return;

      try {
        hasTrackedRef.current = true;
        const response = await fetch(`/api/salons/${salonId}/impression`, {
          method: 'POST',
          credentials: 'include',
        });

        if (response.ok) {
          // Call the callback if provided
          onTracked?.();
        } else if (response.status === 404) {
          // Endpoint not found - backend route not configured, fail silently
          // Don't reset flag for 404s - endpoint likely doesn't exist
        } else if (response.status >= 500) {
          // Server errors (502, 503, etc.) - fail silently, don't retry
          // These are often temporary gateway issues or backend restarts
          // Don't reset flag to avoid retrying on every scroll
        } else {
          // Other client errors (4xx except 404) - reset flag so it can retry
          hasTrackedRef.current = false;
        }
      } catch {
        // Network errors - fail silently
        // Impression tracking should not disrupt UX
        hasTrackedRef.current = false;
      }
    };

    // Clean up previous observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    // Create new observer with lower threshold for better tracking
    observerRef.current = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !hasTrackedRef.current) {
          trackImpression();
          // Stop observing after first impression
          if (observerRef.current && node) {
            observerRef.current.unobserve(node);
          }
        }
      },
      {
        threshold: 0.3, // Track when 30% of card is visible (lowered from 0.5 for better tracking)
        rootMargin: '0px',
      }
    );

    observerRef.current.observe(node);

    // Cleanup function
    return () => {
      if (observerRef.current && node) {
        observerRef.current.unobserve(node);
      }
    };
  }, [salonId, enabled, onTracked]);

  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  // Return callback ref to attach to the element
  return elementRef;
}
