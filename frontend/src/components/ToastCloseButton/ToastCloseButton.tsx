'use client';

import type { CloseButtonProps } from 'react-toastify';

export default function ToastCloseButton({ closeToast, ariaLabel }: CloseButtonProps) {
  console.log('=== ToastCloseButton Rendered ===');
  console.log('closeToast type:', typeof closeToast);
  console.log('closeToast value:', closeToast);
  console.log('ariaLabel:', ariaLabel);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    console.log('=== BUTTON CLICKED ===');
    console.log('Event:', e);
    console.log('Event target:', e.target);
    console.log('Current target:', e.currentTarget);
    
    e.preventDefault();
    e.stopPropagation();
    
    console.log('After preventDefault and stopPropagation');
    console.log('closeToast type inside handler:', typeof closeToast);
    console.log('closeToast value inside handler:', closeToast);
    
    if (typeof closeToast === 'function') {
      console.log('closeToast is a function, calling it now...');
      try {
        closeToast();
        console.log('closeToast() called successfully (no args)');
      } catch (error) {
        console.error('Error calling closeToast():', error);
        console.log('Trying to call with event as argument...');
        try {
          closeToast(e);
          console.log('closeToast(e) called successfully');
        } catch (error2) {
          console.error('Error calling closeToast(e):', error2);
        }
      }
    } else {
      console.error('closeToast is NOT a function! Type:', typeof closeToast);
    }
    
    console.log('=== BUTTON CLICK HANDLER COMPLETE ===');
  };

  return (
    <button
      type="button"
      className="Toastify__close-button Toastify__close-button--custom"
      onClick={handleClick}
      onMouseDown={(e) => console.log('Mouse down on button', e)}
      onMouseUp={(e) => console.log('Mouse up on button', e)}
      aria-label={ariaLabel ?? 'Close'}
      style={{
        position: 'absolute',
        right: '8px',
        top: '8px',
        zIndex: 999999,
        pointerEvents: 'auto',
        cursor: 'pointer',
        background: 'rgba(255, 0, 0, 0.3)',
        border: '2px solid red',
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
