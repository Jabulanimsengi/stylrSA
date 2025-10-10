"use client";

import styles from './prices.module.css';

const PLANS = [
  { code: 'STARTER', name: 'Starter', price: 'R49', maxListings: 2, weight: 1, features: ['Up to 2 listings', 'Basic visibility', 'Email support'] },
  { code: 'ESSENTIAL', name: 'Essential', price: 'R99', maxListings: 6, weight: 2, features: ['Up to 6 listings', 'Higher placement', 'Basic analytics'] },
  { code: 'GROWTH', name: 'Growth', price: 'R199', maxListings: 11, weight: 3, features: ['Up to 11 listings', 'Priority placement', 'Analytics + highlights'] },
  { code: 'PRO', name: 'Pro', price: 'R299', maxListings: 26, weight: 4, features: ['Up to 26 listings', 'Top placement', 'Priority support', 'Featured eligibility'] },
  { code: 'ELITE', name: 'Elite', price: 'R499', maxListings: 'Unlimited', weight: 5, features: ['Unlimited listings', 'Premium placement', 'Dedicated support', 'Early access promos'] },
];

export default function PricingPage() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Pricing</h1>
      <p className={styles.subtitle}>Choose a plan that fits your growth stage. Upgrade anytime.</p>
      <div className={styles.grid}>
        {PLANS.map((p) => (
          <div key={p.code} className={styles.card}>
            <h3 className={styles.planName}>{p.name}</h3>
            <div className={styles.price}>{p.price}<span className={styles.perMonth}>/mo</span></div>
            <ul className={styles.features}>
              <li><strong>Max Listings:</strong> {p.maxListings}</li>
              <li><strong>Visibility Weight:</strong> {p.weight}</li>
              {p.features.map((f) => (<li key={f}>{f}</li>))}
            </ul>
            <button className={styles.cta}>Get Started</button>
          </div>
        ))}
      </div>
    </div>
  );
}
