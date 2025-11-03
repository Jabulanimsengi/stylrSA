import React from 'react';
import styles from './Badge.module.css';

export type BadgeVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'info' | 'featured' | 'new' | 'topRated';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  icon?: React.ReactNode;
  pulse?: boolean;
}

export default function Badge({ variant = 'primary', children, icon, pulse = false }: BadgeProps) {
  return (
    <span className={`${styles.badge} ${styles[variant]} ${pulse ? styles.pulse : ''}`}>
      {icon && <span className={styles.icon}>{icon}</span>}
      {children}
    </span>
  );
}
