'use client';

import styles from './LoadingSpinner.module.css';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: 'primary' | 'secondary' | 'white';
  fullscreen?: boolean;
  text?: string;
}

export default function LoadingSpinner({ 
  size = 'medium', 
  color = 'primary',
  fullscreen = false,
  text
}: LoadingSpinnerProps) {
  const spinnerContent = (
    <>
      <div className={`${styles.spinner} ${styles[size]} ${styles[color]}`}>
        <div className={styles.bounce1}></div>
        <div className={styles.bounce2}></div>
        <div className={styles.bounce3}></div>
      </div>
      {text && <p className={styles.loadingText}>{text}</p>}
    </>
  );

  if (fullscreen) {
    return (
      <div className={styles.fullscreen}>
        {spinnerContent}
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {spinnerContent}
    </div>
  );
}
