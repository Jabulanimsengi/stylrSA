'use client';

import { useEffect, useState } from 'react';

interface ToastDebuggerProps {
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  minimized?: boolean;
}

export default function ToastDebugger({ 
  position = 'bottom-left',
  minimized = true 
}: ToastDebuggerProps) {
  const [isMinimized, setIsMinimized] = useState(minimized);
  const [debugData, setDebugData] = useState({
    toastContainerExists: false,
    closeButtonExists: false,
    closeButtonStyles: {} as Record<string, string>,
    toastBodyStyles: {} as Record<string, string>,
    activeToasts: 0,
    globalHandlers: 0,
    lastUpdate: new Date().toLocaleTimeString(),
  });

  const refreshDebugData = () => {
    const container = document.querySelector('.Toastify__toast-container');
    const closeButton = document.querySelector('.Toastify__close-button');
    const toastBody = document.querySelector('.Toastify__toast-body');
    const toasts = document.querySelectorAll('.Toastify__toast');

    let closeButtonStyles = {};
    let toastBodyStyles = {};

    if (closeButton) {
      const styles = window.getComputedStyle(closeButton);
      closeButtonStyles = {
        pointerEvents: styles.pointerEvents,
        position: styles.position,
        zIndex: styles.zIndex,
        cursor: styles.cursor,
        display: styles.display,
        visibility: styles.visibility,
        opacity: styles.opacity,
      };
    }

    if (toastBody) {
      const styles = window.getComputedStyle(toastBody);
      toastBodyStyles = {
        pointerEvents: styles.pointerEvents,
        maxWidth: styles.maxWidth,
      };
    }

    setDebugData({
      toastContainerExists: !!container,
      closeButtonExists: !!closeButton,
      closeButtonStyles,
      toastBodyStyles,
      activeToasts: toasts.length,
      globalHandlers: 0, // Can't easily detect this
      lastUpdate: new Date().toLocaleTimeString(),
    });
  };

  useEffect(() => {
    refreshDebugData();
    
    // Auto-refresh every 2 seconds
    const interval = setInterval(refreshDebugData, 2000);
    
    return () => clearInterval(interval);
  }, []);

  const positionStyles = {
    'top-left': { top: '80px', left: '10px' },
    'top-right': { top: '80px', right: '10px' },
    'bottom-left': { bottom: '10px', left: '10px' },
    'bottom-right': { bottom: '10px', right: '10px' },
  };

  const getStatusIcon = (condition: boolean) => condition ? '✅' : '❌';

  if (isMinimized) {
    return (
      <div
        style={{
          position: 'fixed',
          ...positionStyles[position],
          zIndex: 9999,
          background: debugData.closeButtonExists && debugData.toastContainerExists ? '#10b981' : '#ef4444',
          color: 'white',
          padding: '0.5rem 1rem',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '0.875rem',
          fontWeight: 'bold',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        }}
        onClick={() => setIsMinimized(false)}
      >
        🔍 Toast Debug {debugData.activeToasts > 0 && `(${debugData.activeToasts})`}
      </div>
    );
  }

  return (
    <div
      style={{
        position: 'fixed',
        ...positionStyles[position],
        zIndex: 9999,
        background: 'white',
        border: '2px solid #e5e7eb',
        borderRadius: '8px',
        padding: '1rem',
        fontSize: '0.75rem',
        fontFamily: 'monospace',
        maxWidth: '350px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
      }}
    >
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '0.75rem',
        borderBottom: '2px solid #e5e7eb',
        paddingBottom: '0.5rem'
      }}>
        <strong style={{ fontSize: '0.875rem' }}>🔍 Toast Debugger</strong>
        <div>
          <button
            onClick={refreshDebugData}
            style={{
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              padding: '0.25rem 0.5rem',
              cursor: 'pointer',
              marginRight: '0.5rem',
              fontSize: '0.75rem'
            }}
          >
            Refresh
          </button>
          <button
            onClick={() => setIsMinimized(true)}
            style={{
              background: '#64748b',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              padding: '0.25rem 0.5rem',
              cursor: 'pointer',
              fontSize: '0.75rem'
            }}
          >
            Minimize
          </button>
        </div>
      </div>

      <div style={{ marginBottom: '0.5rem', fontSize: '0.7rem', color: '#6b7280' }}>
        Last update: {debugData.lastUpdate}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <div>
          <strong>Status:</strong>
          <ul style={{ marginLeft: '1rem', marginTop: '0.25rem' }}>
            <li>{getStatusIcon(debugData.toastContainerExists)} ToastContainer</li>
            <li>{getStatusIcon(debugData.closeButtonExists)} Close Button</li>
            <li>📊 Active Toasts: {debugData.activeToasts}</li>
          </ul>
        </div>

        {debugData.closeButtonExists && (
          <div>
            <strong>Close Button:</strong>
            <ul style={{ marginLeft: '1rem', marginTop: '0.25rem' }}>
              <li style={{ color: debugData.closeButtonStyles.pointerEvents === 'auto' ? '#10b981' : '#ef4444' }}>
                pointer-events: {debugData.closeButtonStyles.pointerEvents}
              </li>
              <li>cursor: {debugData.closeButtonStyles.cursor}</li>
              <li>display: {debugData.closeButtonStyles.display}</li>
              <li>visibility: {debugData.closeButtonStyles.visibility}</li>
              <li>z-index: {debugData.closeButtonStyles.zIndex}</li>
            </ul>
          </div>
        )}

        {debugData.toastBodyStyles.pointerEvents && (
          <div>
            <strong>Toast Body:</strong>
            <ul style={{ marginLeft: '1rem', marginTop: '0.25rem' }}>
              <li style={{ color: debugData.toastBodyStyles.pointerEvents === 'auto' ? '#10b981' : '#ef4444' }}>
                pointer-events: {debugData.toastBodyStyles.pointerEvents}
              </li>
            </ul>
          </div>
        )}

        <div style={{ 
          marginTop: '0.5rem', 
          padding: '0.5rem', 
          background: debugData.closeButtonStyles.pointerEvents === 'auto' ? '#d1fae5' : '#fee2e2',
          borderRadius: '4px',
          fontSize: '0.7rem'
        }}>
          {debugData.closeButtonStyles.pointerEvents === 'auto' ? (
            <span style={{ color: '#065f46' }}>✅ Close button should work!</span>
          ) : (
            <span style={{ color: '#991b1b' }}>⚠️ Close button may not work!</span>
          )}
        </div>
      </div>
    </div>
  );
}
