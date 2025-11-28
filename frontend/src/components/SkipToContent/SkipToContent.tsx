'use client';

import styles from './SkipToContent.module.css';

interface SkipToContentProps {
  targetId?: string;
  label?: string;
}

/**
 * Skip to Content Link
 * 
 * Accessibility component that allows keyboard users to skip navigation
 * and jump directly to main content.
 * 
 * Usage:
 * ```tsx
 * // In layout.tsx
 * <SkipToContent targetId="main-content" />
 * <Navbar />
 * <main id="main-content">...</main>
 * ```
 */
export default function SkipToContent({
  targetId = 'main-content',
  label = 'Skip to main content',
}: SkipToContentProps) {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const target = document.getElementById(targetId);
    if (target) {
      target.focus();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <a
      href={`#${targetId}`}
      className={styles.skipLink}
      onClick={handleClick}
    >
      {label}
    </a>
  );
}
