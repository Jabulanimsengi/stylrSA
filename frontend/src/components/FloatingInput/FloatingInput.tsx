'use client';

import { InputHTMLAttributes, useState } from 'react';
import styles from './FloatingInput.module.css';

interface FloatingInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export default function FloatingInput({ 
  label, 
  error, 
  id, 
  ...props 
}: FloatingInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(!!props.value || !!props.defaultValue);

  const inputId = id || `floating-input-${label.replace(/\s+/g, '-').toLowerCase()}`;
  const isFloating = isFocused || hasValue;

  return (
    <div className={styles.floatingInputGroup}>
      <input
        id={inputId}
        className={`${styles.input} ${error ? styles.error : ''} ${isFloating ? styles.floating : ''}`}
        onFocus={() => setIsFocused(true)}
        onBlur={(e) => {
          setIsFocused(false);
          setHasValue(!!e.target.value);
        }}
        onChange={(e) => {
          setHasValue(!!e.target.value);
          props.onChange?.(e);
        }}
        placeholder=" "
        {...props}
      />
      <label 
        htmlFor={inputId} 
        className={`${styles.label} ${isFloating ? styles.labelFloating : ''}`}
      >
        {label}
      </label>
      {error && <span className={styles.errorText}>{error}</span>}
    </div>
  );
}
