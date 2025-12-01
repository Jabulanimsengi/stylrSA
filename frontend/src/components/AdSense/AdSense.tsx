'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import styles from './AdSense.module.css';

interface AdSenseProps {
  slot: string;
  format?: 'auto' | 'fluid' | 'rectangle' | 'horizontal' | 'vertical';
  responsive?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

export default function AdSense({
  slot,
  format = 'auto',
  responsive = true,
  className,
  style,
}: AdSenseProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const adRef = useRef<HTMLModElement>(null);
  const pathname = usePathname();
  const isAdLoaded = useRef(false);
  const [isVisible, setIsVisible] = useState(false);
  const [hasAdContent, setHasAdContent] = useState(false);

  // Check if container has valid width before loading ad
  useEffect(() => {
    if (!containerRef.current) return;

    const checkWidth = () => {
      const width = containerRef.current?.offsetWidth || 0;
      if (width > 0) {
        setIsVisible(true);
      }
    };

    // Check immediately and after a short delay (for layout shifts)
    checkWidth();
    const timer = setTimeout(checkWidth, 100);

    // Use ResizeObserver to detect when container gets width
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0) {
          setIsVisible(true);
        }
      }
    });

    observer.observe(containerRef.current);

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, []);

  // Check if ad actually loaded content
  useEffect(() => {
    if (!adRef.current || !isVisible) return;

    // Check after a delay if the ad has content
    const checkAdContent = () => {
      const adElement = adRef.current;
      if (adElement) {
        // Check if ad has actual content (height > 0 and has children)
        const hasContent = adElement.offsetHeight > 10 || adElement.children.length > 0;
        setHasAdContent(hasContent);
      }
    };

    // Check multiple times as ads load asynchronously
    const timers = [
      setTimeout(checkAdContent, 500),
      setTimeout(checkAdContent, 1500),
      setTimeout(checkAdContent, 3000),
    ];

    return () => timers.forEach(clearTimeout);
  }, [isVisible]);

  useEffect(() => {
    // Only load ad once per mount and when visible
    if (isAdLoaded.current || !isVisible) return;

    try {
      const adsbygoogle = window.adsbygoogle || [];
      adsbygoogle.push({});
      isAdLoaded.current = true;
    } catch (error) {
      // Silently handle AdSense errors - they're common and not critical
      if (process.env.NODE_ENV === 'development') {
        console.warn('AdSense warning:', error);
      }
    }
  }, [pathname, isVisible]);

  // Reset on unmount so ad reloads on remount
  useEffect(() => {
    return () => {
      isAdLoaded.current = false;
    };
  }, []);

  // Don't render anything if no ad content after timeout
  // But keep minimal space initially to prevent layout shift
  return (
    <div 
      ref={containerRef} 
      className={`${styles.adContainer} ${hasAdContent ? styles.hasContent : ''} ${className || ''}`} 
      style={style}
    >
      {(isVisible || !hasAdContent) && <span className={styles.adLabel}>Advertisement</span>}
      {isVisible && (
        <ins
          ref={adRef}
          className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-client="ca-pub-9036733333821648"
          data-ad-slot={slot}
          data-ad-format={format}
          data-full-width-responsive={responsive ? 'true' : 'false'}
        />
      )}
    </div>
  );
}
