'use client';

import styles from './SkipToContent.module.css';

export default function SkipToContent() {
  const handleSkip = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const mainContent = document.querySelector('main');
    if (mainContent) {
      mainContent.setAttribute('tabindex', '-1');
      mainContent.focus();
    }
  };

  return (
    <a 
      href="#main-content" 
      className={styles.skipLink}
      onClick={handleSkip}
    >
      Skip to main content
    </a>
  );
}
