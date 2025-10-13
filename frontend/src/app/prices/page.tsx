"use client";

import { useState } from 'react';
import Link from 'next/link';
import { APP_PLANS } from '@/constants/plans';
import PageNav from '@/components/PageNav';
import styles from './prices.module.css';

export default function PricingPage() {
  const [authOpen, setAuthOpen] = useState(false);
  return (
    <div className={styles.container}>
      <PageNav />
      <h1 className={styles.title}>Pricing</h1>
      <p className={styles.subtitle}>Choose a plan that fits your growth stage. Upgrade anytime.</p>
      <div className={styles.grid}>
        {APP_PLANS.map((p) => (
          <div key={p.code} className={styles.card}>
            <h3 className={styles.planName}>{p.name}</h3>
            <div className={styles.price}>{p.price}<span className={styles.perMonth}>/mo</span></div>
            <ul className={styles.features}>
              <li><strong>Max Listings:</strong> {p.maxListings}</li>
              <li><strong>Visibility Weight:</strong> {p.visibilityWeight}</li>
              {p.features.map((f) => (<li key={f}>{f}</li>))}
            </ul>
            <button className={styles.cta} onClick={() => setAuthOpen(true)}>Get Started</button>
          </div>
        ))}
      </div>

      {authOpen && (
        <div className={styles.modalOverlay} role="dialog" aria-modal="true" aria-labelledby="auth-modal-title" onClick={() => setAuthOpen(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 id="auth-modal-title" className={styles.modalTitle}>Get started</h2>
            <p className={styles.modalText}>Please sign in or create an account to continue.</p>
            <div className={styles.modalActions}>
              <Link href="/login" className={styles.modalButton}>Sign In</Link>
              <Link href="/register" className={styles.modalButtonPrimary}>Sign Up</Link>
            </div>
            <button className={styles.modalClose} onClick={() => setAuthOpen(false)} aria-label="Close">×</button>
          </div>
        </div>
      )}
    </div>
  );
}
