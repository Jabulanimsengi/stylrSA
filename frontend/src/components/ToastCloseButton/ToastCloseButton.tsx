'use client';

import type { CloseButtonProps } from 'react-toastify';

export default function ToastCloseButton({ closeToast, ariaLabel }: CloseButtonProps) {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    closeToast(true);
  };

  return (
    <button
      type="button"
      className="Toastify__close-button Toastify__close-button--custom"
      onClick={handleClick}
      aria-label={ariaLabel ?? 'Close'}
      style={{
        background: 'rgba(0, 0, 0, 0.08)',
        border: 'none',
        borderRadius: '50%',
        width: '28px',
        height: '28px',
        minWidth: '28px',
        minHeight: '28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        padding: '4px',
        position: 'absolute',
        right: '8px',
        top: '50%',
        transform: 'translateY(-50%)',
        transition: 'all 0.2s ease',
        zIndex: 99999,
        pointerEvents: 'auto',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'rgba(0, 0, 0, 0.15)';
        e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'rgba(0, 0, 0, 0.08)';
        e.currentTarget.style.transform = 'translateY(-50%)';
      }}
      onMouseDown={(e) => {
        e.currentTarget.style.background = 'rgba(0, 0, 0, 0.2)';
        e.currentTarget.style.transform = 'translateY(-50%) scale(0.95)';
      }}
      onMouseUp={(e) => {
        e.currentTarget.style.background = 'rgba(0, 0, 0, 0.15)';
        e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
      }}
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
        style={{ pointerEvents: 'none' }}
      >
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    </button>
  );
}
