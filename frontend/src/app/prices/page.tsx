"use client";

import { useState } from 'react';
import Link from 'next/link';
import { APP_PLANS, PLAN_FEATURES } from '@/constants/plans';
import PageNav from '@/components/PageNav';
import styles from './prices.module.css';

export default function PricingPage() {
  const [authOpen, setAuthOpen] = useState(false);
  
  const renderFeatureValue = (value: string | boolean) => {
    if (value === true) return <span className={styles.checkIcon}>✓</span>;
    if (value === false) return <span className={styles.crossIcon}>—</span>;
    return <span>{value}</span>;
  };

  return (
    <div className={styles.container}>
      <PageNav />
      
      <div className={styles.header}>
        <h1 className={styles.title}>Simple, Transparent Pricing</h1>
        <p className={styles.subtitle}>Choose a plan that fits your growth stage. Upgrade anytime.</p>
      </div>

      {/* Plan Cards */}
      <div className={styles.grid}>
        {APP_PLANS.map((plan) => (
          <div key={plan.code} className={`${styles.card} ${plan.popular ? styles.popularCard : ''}`}>
            {plan.popular && (
              <div className={styles.popularBadge}>
                <span className={styles.popularIcon}>⭐</span>
                Most Popular
              </div>
            )}
            <h3 className={styles.planName}>{plan.name}</h3>
            <div className={styles.price}>
              {plan.price.replace('/month', '')}
              <span className={styles.perMonth}>/month</span>
            </div>
            <p className={styles.description}>{plan.description}</p>
            <button 
              className={`${styles.cta} ${plan.popular ? styles.ctaPopular : ''}`} 
              onClick={() => setAuthOpen(true)}
            >
              Get Started
            </button>
          </div>
        ))}
      </div>

      {/* Feature Comparison Table */}
      <div className={styles.comparisonSection}>
        <h2 className={styles.comparisonTitle}>Compare Plans</h2>
        <div className={styles.tableWrapper}>
          <table className={styles.comparisonTable}>
            <thead>
              <tr>
                <th className={styles.featureHeader}>Features</th>
                {APP_PLANS.map((plan) => (
                  <th key={plan.code} className={`${styles.planHeader} ${plan.popular ? styles.popularHeader : ''}`}>
                    {plan.name}
                    {plan.popular && <span className={styles.popularTag}>Popular</span>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PLAN_FEATURES.map((feature, idx) => (
                <tr key={feature.name} className={idx % 2 === 0 ? styles.evenRow : ''}>
                  <td className={styles.featureName}>{feature.name}</td>
                  <td className={styles.featureValue}>{renderFeatureValue(feature.starter)}</td>
                  <td className={`${styles.featureValue} ${styles.popularColumn}`}>{renderFeatureValue(feature.pro)}</td>
                  <td className={styles.featureValue}>{renderFeatureValue(feature.elite)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* FAQ Section */}
      <div className={styles.faqSection}>
        <h2 className={styles.faqTitle}>Frequently Asked Questions</h2>
        <div className={styles.faqGrid}>
          <div className={styles.faqItem}>
            <h4>Can I upgrade or downgrade anytime?</h4>
            <p>Yes! You can change your plan at any time. Changes take effect on your next billing cycle.</p>
          </div>
          <div className={styles.faqItem}>
            <h4>What are guaranteed leads?</h4>
            <p>These are potential clients who view your profile and contact you through the platform each month.</p>
          </div>
          <div className={styles.faqItem}>
            <h4>Is there a contract?</h4>
            <p>No long-term contracts. All plans are month-to-month and you can cancel anytime.</p>
          </div>
          <div className={styles.faqItem}>
            <h4>How do I pay?</h4>
            <p>We accept EFT payments. You&apos;ll receive payment details after signing up.</p>
          </div>
        </div>
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
