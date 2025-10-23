'use client';

import { ReactNode } from 'react';
import styles from './EmptyState.module.css';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  illustration?: ReactNode;
}

export default function EmptyState({ 
  icon, 
  title, 
  description, 
  action, 
  illustration 
}: EmptyStateProps) {
  return (
    <div className={styles.emptyState}>
      {illustration && (
        <div className={styles.illustration}>
          {illustration}
        </div>
      )}
      {icon && !illustration && (
        <div className={styles.icon}>
          {icon}
        </div>
      )}
      <h3 className={styles.title}>{title}</h3>
      {description && (
        <p className={styles.description}>{description}</p>
      )}
      {action && (
        <div className={styles.action}>
          {action}
        </div>
      )}
    </div>
  );
}
