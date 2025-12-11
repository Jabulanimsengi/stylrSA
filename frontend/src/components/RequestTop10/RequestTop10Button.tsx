'use client';

import { useState } from 'react';
import { FaBolt } from 'react-icons/fa';
import RequestTop10Modal from './RequestTop10Modal';
import styles from './RequestTop10.module.css';

interface RequestTop10ButtonProps {
  variant?: 'floating' | 'desktop';
}

export default function RequestTop10Button({ variant = 'floating' }: RequestTop10ButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (variant === 'desktop') {
    return (
      <>
        <button className={styles.desktopButton} onClick={() => setIsOpen(true)}>
          <FaBolt className={styles.desktopIcon} />
          <span>Urgent Request</span>
        </button>
        <RequestTop10Modal isOpen={isOpen} onClose={() => setIsOpen(false)} />
      </>
    );
  }

  return (
    <>
      <button
        className={styles.floatingButton}
        onClick={() => setIsOpen(true)}
        aria-label="Submit Urgent Request"
        title="Submit Urgent Request"
      >
        <FaBolt className={styles.floatingIcon} />
        <span className={styles.floatingLabel}>Urgent</span>
      </button>
      <RequestTop10Modal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}

