'use client';

import type { CloseButtonProps } from 'react-toastify';

export default function ToastCloseButton({ closeToast, ariaLabel }: CloseButtonProps) {
  return (
    <button
      type="button"
      className="Toastify__close-button Toastify__close-button--custom"
      onClick={closeToast}
      aria-label={ariaLabel ?? 'Close'}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    </button>
  );
}
