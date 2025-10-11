"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from './CookieBanner.module.css';

const STORAGE_KEY = 'cookieConsent';

export default function CookieBanner() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const hasConsent = window.localStorage.getItem(STORAGE_KEY);
    if (!hasConsent) {
      setIsOpen(true);
    }
  }, []);

  const acceptCookies = () => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, 'accepted');
    }
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className={styles.banner} role="region" aria-label="Cookie consent">
      <div className={styles.content}>
        <p>
          We use cookies to enhance your browsing experience and analyze traffic. By clicking
          Accept, you agree to our use of cookies. See our{' '}
          <Link href="/privacy" className={styles.link}>
            privacy policy
          </Link>{' '}
          for details.
        </p>
      </div>
      <div className={styles.actions}>
        <button type="button" className={styles.acceptButton} onClick={acceptCookies}>
          Accept
        </button>
      </div>
    </div>
  );
}
