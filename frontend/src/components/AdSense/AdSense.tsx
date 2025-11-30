'use client';

import { useEffect, useRef } from 'react';
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
  const adRef = useRef<HTMLModElement>(null);
  const pathname = usePathname();
  const isAdLoaded = useRef(false);

  useEffect(() => {
    // Only load ad once per mount
    if (isAdLoaded.current) return;

    try {
      const adsbygoogle = window.adsbygoogle || [];
      adsbygoogle.push({});
      isAdLoaded.current = true;
    } catch (error) {
      console.error('AdSense error:', error);
    }
  }, [pathname]);

  // Reset on unmount so ad reloads on remount
  useEffect(() => {
    return () => {
      isAdLoaded.current = false;
    };
  }, []);

  return (
    <div className={`${styles.adContainer} ${className || ''}`} style={style}>
      <span className={styles.adLabel}>Advertisement</span>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-9036733333821648"
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive ? 'true' : 'false'}
      />
    </div>
  );
}
