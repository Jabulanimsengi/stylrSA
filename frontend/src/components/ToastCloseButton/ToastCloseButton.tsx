'use client';

import type { CloseButtonProps } from 'react-toastify';

export default function ToastCloseButton({ closeToast, ariaLabel }: CloseButtonProps) {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Find the toast element
    const toastElement = (e.currentTarget as HTMLElement).closest('.Toastify__toast');
    
    if (toastElement) {
      // First try the official callback (it triggers onClose events properly)
      if (closeToast) {
        closeToast(e);
      }
      
      // Workaround for react-toastify v11 bug: Force remove from DOM
      // The closeToast callback doesn't actually remove the toast, so we do it manually
      setTimeout(() => {
        if (toastElement && toastElement.parentNode) {
          // Add closing animation class
          toastElement.classList.add('Toastify__toast--closing');
          
          // Remove after animation completes
          setTimeout(() => {
            if (toastElement.parentNode) {
              toastElement.parentNode.removeChild(toastElement);
            }
          }, 300);
        }
      }, 50);
    }
  };

  return (
    <button
      type="button"
      className="Toastify__close-button Toastify__close-button--custom"
      onClick={handleClick}
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
