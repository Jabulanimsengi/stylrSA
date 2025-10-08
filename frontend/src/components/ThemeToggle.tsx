'use client';

import { memo } from 'react';
import { FaMoon, FaSun } from 'react-icons/fa';
import styles from './ThemeToggle.module.css';
import { useTheme } from '@/context/ThemeContext';

function ThemeToggleComponent() {
  const { theme, toggleTheme, isReady } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      className={styles.toggle}
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      disabled={!isReady}
    >
      <span className={styles.iconWrapper} data-active={!isDark}>
        <FaSun />
      </span>
      <span className={styles.iconWrapper} data-active={isDark}>
        <FaMoon />
      </span>
    </button>
  );
}

export const ThemeToggle = memo(ThemeToggleComponent);
