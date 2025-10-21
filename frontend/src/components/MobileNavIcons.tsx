'use client';

import { useRouter, usePathname } from 'next/navigation';
import styles from './MobileNavIcons.module.css';
import { useMediaQuery } from '@/hooks/useMediaQuery';

export default function MobileNavIcons() {
  const router = useRouter();
  const pathname = usePathname();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isHomePage = pathname === '/';

  if (!isMobile || isHomePage) {
    return null;
  }

  const handleHome = () => {
    router.push('/');
  };

  return (
    <div className={styles.container}>
      <button 
        onClick={handleHome} 
        className={styles.iconButton}
        aria-label="Go to home"
      >
        <svg 
          width="24" 
          height="24" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
      </button>
    </div>
  );
}
