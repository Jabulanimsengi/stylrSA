"use client";

import { APP_PLANS } from '@/constants/plans';
import styles from './prices.module.css';

export default function PricingPage() {
  return (
    <div className={styles.container}>
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
            <button className={styles.cta}>Get Started</button>
          </div>
        ))}
      </div>
    </div>
  );
}
