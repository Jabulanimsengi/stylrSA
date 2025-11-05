'use client';

import { FaCheckCircle } from 'react-icons/fa';
import styles from './VerificationBadge.module.css';

interface VerificationBadgeProps {
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
  overlay?: boolean; // For overlay on images
}

export default function VerificationBadge({ size = 'medium', showLabel = false, overlay = false }: VerificationBadgeProps) {
  return (
    <div className={`${styles.badge} ${styles[size]} ${overlay ? styles.overlay : ''}`} title="Verified Service Provider">
      <FaCheckCircle className={styles.icon} />
      {showLabel && <span className={styles.label}>Verified</span>}
    </div>
  );
}

