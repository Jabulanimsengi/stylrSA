'use client';

import { useState, useEffect } from 'react';
import { FaBolt, FaTimes, FaChevronLeft } from 'react-icons/fa';
import RequestTop10Modal from './RequestTop10Modal';
import styles from './RequestTop10.module.css';

interface RequestTop10ButtonProps {
  variant?: 'floating' | 'desktop';
}

const STORAGE_KEY = 'urgent-button-minimized';

export default function RequestTop10Button({ variant = 'floating' }: RequestTop10ButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  // Load minimized state from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'true') {
      setIsMinimized(true);
    }
  }, []);

  // Save minimized state to localStorage
  const handleMinimize = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMinimized(true);
    localStorage.setItem(STORAGE_KEY, 'true');
  };

  const handleExpand = () => {
    setIsMinimized(false);
    localStorage.setItem(STORAGE_KEY, 'false');
  };

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

  // Minimized state - small icon button
  if (isMinimized) {
    return (
      <>
        <button
          className={styles.floatingButtonMinimized}
          onClick={handleExpand}
          aria-label="Show Urgent Request button"
          title="Urgent Request"
        >
          <FaChevronLeft className={styles.expandIcon} />
        </button>
        <RequestTop10Modal isOpen={isOpen} onClose={() => setIsOpen(false)} />
      </>
    );
  }

  return (
    <>
      <div className={styles.floatingWrapper}>
        <button
          className={styles.floatingButton}
          onClick={() => setIsOpen(true)}
          aria-label="Submit Urgent Request"
          title="Submit Urgent Request"
        >
          <FaBolt className={styles.floatingIcon} />
          <span className={styles.floatingLabel}>Urgent</span>
        </button>
        <button
          className={styles.minimizeBtn}
          onClick={handleMinimize}
          aria-label="Minimize button"
          title="Minimize"
        >
          <FaTimes />
        </button>
      </div>
      <RequestTop10Modal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}

