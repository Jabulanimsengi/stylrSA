'use client';

import { toast } from 'react-toastify';
import { useEffect } from 'react';

export default function TestToastDebug() {
  useEffect(() => {
    console.log('=== TOAST DEBUG PAGE LOADED ===');
    
    // Check for ToastContainer in DOM
    setTimeout(() => {
      const container = document.querySelector('.Toastify__toast-container');
      console.log('ToastContainer found:', !!container);
      if (container) {
        const styles = window.getComputedStyle(container);
        console.log('Container pointer-events:', styles.pointerEvents);
        console.log('Container position:', styles.position);
        console.log('Container z-index:', styles.zIndex);
      }
    }, 1000);
  }, []);

  const testSuccessToast = () => {
    console.log('=== TRIGGERING SUCCESS TOAST ===');
    const id = toast.success('✅ Success! Click the X button or anywhere on this toast to close it.', {
      onOpen: () => console.log('Toast opened'),
      onClose: () => console.log('Toast closed'),
    });
    console.log('Toast ID:', id);

    // After toast appears, check its DOM structure
    setTimeout(() => {
      const toasts = document.querySelectorAll('.Toastify__toast');
      console.log('Number of toasts:', toasts.length);
      
      toasts.forEach((toast, index) => {
        console.log(`\n=== Toast ${index + 1} Analysis ===`);
        const toastStyles = window.getComputedStyle(toast);
        console.log('Toast pointer-events:', toastStyles.pointerEvents);
        console.log('Toast position:', toastStyles.position);
        
        const body = toast.querySelector('.Toastify__toast-body');
        if (body) {
          const bodyStyles = window.getComputedStyle(body);
          console.log('Body pointer-events:', bodyStyles.pointerEvents);
          console.log('Body max-width:', bodyStyles.maxWidth);
          console.log('Body padding:', bodyStyles.padding);
        }
        
        const closeButton = toast.querySelector('.Toastify__close-button');
        console.log('Close button found:', !!closeButton);
        if (closeButton) {
          const btnStyles = window.getComputedStyle(closeButton as Element);
          console.log('Button pointer-events:', btnStyles.pointerEvents);
          console.log('Button position:', btnStyles.position);
          console.log('Button z-index:', btnStyles.zIndex);
          console.log('Button cursor:', btnStyles.cursor);
          console.log('Button display:', btnStyles.display);
          console.log('Button visibility:', btnStyles.visibility);
        }
      });
    }, 500);
  };

  const testErrorToast = () => {
    console.log('=== TRIGGERING ERROR TOAST ===');
    toast.error('❌ Error! Test if close button works on error toasts too.');
  };

  const testInfoToast = () => {
    console.log('=== TRIGGERING INFO TOAST ===');
    toast.info('ℹ️ Info toast. Should appear at bottom-center with close button.');
  };

  const testWarningToast = () => {
    console.log('=== TRIGGERING WARNING TOAST ===');
    toast.warning('⚠️ Warning! All toasts should have the same position and style.');
  };

  const testMultiple = () => {
    console.log('=== TRIGGERING MULTIPLE TOASTS ===');
    toast.success('First toast');
    setTimeout(() => toast.error('Second toast'), 200);
    setTimeout(() => toast.info('Third toast'), 400);
    setTimeout(() => toast.warning('Fourth toast (should be hidden due to limit=3)'), 600);
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Toast Notification Debug Page</h1>
      <p style={{ color: '#666', marginBottom: '2rem' }}>
        Open browser console (F12) to see detailed debug information about toast behavior
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <button
          onClick={testSuccessToast}
          style={{
            padding: '1rem 2rem',
            fontSize: '16px',
            background: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
          }}
        >
          Test Success Toast
        </button>

        <button
          onClick={testErrorToast}
          style={{
            padding: '1rem 2rem',
            fontSize: '16px',
            background: '#ef4444',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
          }}
        >
          Test Error Toast
        </button>

        <button
          onClick={testInfoToast}
          style={{
            padding: '1rem 2rem',
            fontSize: '16px',
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
          }}
        >
          Test Info Toast
        </button>

        <button
          onClick={testWarningToast}
          style={{
            padding: '1rem 2rem',
            fontSize: '16px',
            background: '#f59e0b',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
          }}
        >
          Test Warning Toast
        </button>

        <button
          onClick={testMultiple}
          style={{
            padding: '1rem 2rem',
            fontSize: '16px',
            background: '#8b4513',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
          }}
        >
          Test Multiple Toasts (Limit Check)
        </button>
      </div>

      <div style={{ marginTop: '3rem', padding: '1rem', background: '#f3f4f6', borderRadius: '8px' }}>
        <h2>Expected Behavior:</h2>
        <ul>
          <li>✅ All toasts should appear at <strong>bottom-right corner</strong></li>
          <li>✅ Maximum 3 toasts visible at once</li>
          <li>✅ Close button (X) should be visible and clickable</li>
          <li>✅ Clicking anywhere on toast should close it</li>
          <li>✅ Dragging/swiping should dismiss toast</li>
          <li>✅ Auto-close after 5 seconds</li>
          <li>✅ Calm colors: Success=soft teal, Error=soft pink, Info=soft blue, Warning=soft yellow</li>
        </ul>

        <h2 style={{ marginTop: '1.5rem' }}>Console Debug Info:</h2>
        <ul>
          <li>Container pointer-events should be <code>auto</code></li>
          <li>Toast body pointer-events should be <code>none</code></li>
          <li>Close button pointer-events should be <code>auto</code></li>
          <li>Close button should have <code>cursor: pointer</code></li>
        </ul>
      </div>

      <div style={{ marginTop: '2rem', padding: '1rem', background: '#fee', borderRadius: '8px' }}>
        <h2>If Close Button Not Working:</h2>
        <ol>
          <li>Check console for pointer-events values</li>
          <li>Verify close button has <code>pointer-events: auto</code></li>
          <li>Verify toast body has <code>pointer-events: none</code></li>
          <li>Check if button is visible (not display:none)</li>
          <li>Check z-index layering</li>
        </ol>
      </div>
    </div>
  );
}
