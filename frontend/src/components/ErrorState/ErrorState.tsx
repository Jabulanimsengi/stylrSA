'use client';

import { ReactNode } from 'react';
import styles from './ErrorState.module.css';

interface ErrorStateProps {
  type?: '404' | '500' | 'generic';
  title: string;
  description?: string;
  actions?: ReactNode[];
}

export default function ErrorState({ 
  type = 'generic', 
  title, 
  description, 
  actions 
}: ErrorStateProps) {
  const getErrorCode = () => {
    if (type === '404') return '404';
    if (type === '500') return '500';
    return null;
  };

  const errorCode = getErrorCode();

  return (
    <div className={styles.errorState}>
      {errorCode && (
        <div className={styles.errorCode}>{errorCode}</div>
      )}
      <h2 className={styles.title}>{title}</h2>
      {description && (
        <p className={styles.description}>{description}</p>
      )}
      {actions && actions.length > 0 && (
        <div className={styles.actions}>
          {actions.map((action, index) => (
            <div key={index} className={styles.actionItem}>
              {action}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
