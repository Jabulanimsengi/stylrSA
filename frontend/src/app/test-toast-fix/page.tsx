'use client';

import { toast } from 'react-toastify';
import { useEffect, useState } from 'react';

export default function TestToastFixPage() {
  const [debugInfo, setDebugInfo] = useState({
    serviceWorkerActive: false,
    cacheExists: false,
    toasterClientFound: false,
    globalClickHandlers: 0,
    toastContainerFound: false,
  });

  const [testResults, setTestResults] = useState<string[]>([]);

  useEffect(() => {
    // Check for service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        setDebugInfo((prev) => ({
          ...prev,
          serviceWorkerActive: registrations.length > 0,
        }));
        
        if (registrations.length > 0) {
          console.warn('⚠️ SERVICE WORKER DETECTED! This may serve cached files.');
          console.log('To unregister: Run in console: navigator.serviceWorker.getRegistrations().then(r => r.forEach(reg => reg.unregister()))');
        }
      });
    }

    // Check for cache
    if ('caches' in window) {
      caches.keys().then((keys) => {
        setDebugInfo((prev) => ({ ...prev, cacheExists: keys.length > 0 }));
        if (keys.length > 0) {
          console.warn('⚠️ CACHE DETECTED:', keys);
          console.log('To clear: Run in console: caches.keys().then(keys => Promise.all(keys.map(key => caches.delete(key))))');
        }
      });
    }

    // Check for ToastContainer
    setTimeout(() => {
      const container = document.querySelector('.Toastify__toast-container');
      setDebugInfo((prev) => ({
        ...prev,
        toastContainerFound: !!container,
      }));

      if (!container) {
        console.error('❌ ToastContainer NOT FOUND! Check if ToasterClient is loaded.');
      } else {
        console.log('✅ ToastContainer found');
      }
    }, 1000);

    // Check for global click handlers (simplified detection)
    const tempDiv = document.createElement('div');
    tempDiv.className = 'Toastify__toast';
    document.body.appendChild(tempDiv);
    
    let captureHandlerDetected = false;
    const testHandler = () => {
      captureHandlerDetected = true;
    };
    
    tempDiv.addEventListener('click', testHandler, true);
    tempDiv.click();
    tempDiv.removeEventListener('click', testHandler, true);
    document.body.removeChild(tempDiv);

    if (captureHandlerDetected) {
      console.log('ℹ️ Capture phase handlers detected (this is normal)');
    }
  }, []);

  const logResult = (message: string, success: boolean) => {
    const timestamp = new Date().toLocaleTimeString();
    const icon = success ? '✅' : '❌';
    const result = `[${timestamp}] ${icon} ${message}`;
    console.log(result);
    setTestResults((prev) => [...prev, result]);
  };

  const testCloseButton = () => {
    console.log('\n=== TEST 1: Close Button Click ===');
    logResult('Triggering toast...', true);
    
    const toastId = toast.success('Test Toast: Click the X button to close', {
      autoClose: false, // Don't auto-close so we can test manual close
      onOpen: () => {
        console.log('Toast opened, ID:', toastId);
        logResult('Toast opened successfully', true);
        
        // Inspect the close button after toast appears
        setTimeout(() => {
          const closeButton = document.querySelector('.Toastify__close-button');
          if (closeButton) {
            console.log('✅ Close button found in DOM');
            const styles = window.getComputedStyle(closeButton);
            console.log('Close button styles:', {
              pointerEvents: styles.pointerEvents,
              position: styles.position,
              zIndex: styles.zIndex,
              cursor: styles.cursor,
              display: styles.display,
              visibility: styles.visibility,
            });
            
            if (styles.pointerEvents === 'auto') {
              logResult('Close button has pointer-events: auto', true);
            } else {
              logResult(`Close button pointer-events: ${styles.pointerEvents}`, false);
            }
          } else {
            console.error('❌ Close button NOT found in DOM');
            logResult('Close button NOT found', false);
          }
        }, 100);
      },
      onClose: () => {
        console.log('Toast closed');
        logResult('Toast closed successfully (close button worked!)', true);
      },
    });
  };

  const testCloseOnClick = () => {
    console.log('\n=== TEST 2: Click Anywhere on Toast ===');
    logResult('Triggering toast with closeOnClick...', true);
    
    toast.info('Click anywhere on this toast to close it', {
      autoClose: false,
      onOpen: () => logResult('Toast opened', true),
      onClose: () => logResult('Toast closed via closeOnClick', true),
    });
  };

  const testAutoClose = () => {
    console.log('\n=== TEST 3: Auto-Close ===');
    logResult('Triggering toast with 3s auto-close...', true);
    
    toast.warning('This toast will auto-close in 3 seconds', {
      autoClose: 3000,
      onOpen: () => logResult('Toast opened', true),
      onClose: () => logResult('Toast auto-closed after 3s', true),
    });
  };

  const testMultipleToasts = () => {
    console.log('\n=== TEST 4: Multiple Toasts (Limit 3) ===');
    logResult('Creating 4 toasts (limit is 3)...', true);
    
    toast.success('Toast 1');
    setTimeout(() => toast.error('Toast 2'), 100);
    setTimeout(() => toast.info('Toast 3'), 200);
    setTimeout(() => {
      toast.warning('Toast 4 (should replace oldest)');
      logResult('Created 4 toasts, only 3 should be visible', true);
    }, 300);
  };

  const testEventPropagation = () => {
    console.log('\n=== TEST 5: Event Propagation ===');
    logResult('Testing if close button prevents event bubbling...', true);
    
    let clickedOutside = false;
    
    const handleOutsideClick = () => {
      clickedOutside = true;
      logResult('Click event bubbled up (BAD - means stopPropagation not working)', false);
    };
    
    document.addEventListener('click', handleOutsideClick, { once: true });
    
    toast.error('Click the X button - checking event propagation', {
      autoClose: false,
      onOpen: () => {
        setTimeout(() => {
          const closeButton = document.querySelector('.Toastify__close-button') as HTMLElement;
          if (closeButton) {
            // Programmatically click the close button
            closeButton.click();
            
            setTimeout(() => {
              if (!clickedOutside) {
                logResult('Close button click did NOT bubble (GOOD)', true);
              }
              document.removeEventListener('click', handleOutsideClick);
            }, 100);
          }
        }, 100);
      },
      onClose: () => logResult('Toast closed via close button', true),
    });
  };

  const checkForOldCode = () => {
    console.log('\n=== Checking for Old Code Issues ===');
    
    // Try to access the ToasterClient component source (won't work but we can check the DOM)
    const hasGlobalHandler = document.querySelectorAll('.Toastify__toast').length > 0;
    
    if (hasGlobalHandler) {
      console.log('ℹ️ Cannot directly check source code, but we can test behavior');
    }
    
    // Check if clicking toast body dismisses (would indicate old global handler)
    toast.info('Click the toast BODY (not X button) - should close', {
      autoClose: false,
      onClose: () => {
        logResult('Toast body click worked (closeOnClick working)', true);
      },
    });
  };

  const clearAllCaches = async () => {
    console.log('\n=== Clearing All Caches ===');
    
    try {
      // Unregister service workers
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const registration of registrations) {
          await registration.unregister();
          logResult(`Unregistered service worker: ${registration.scope}`, true);
        }
      }
      
      // Clear all caches
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        for (const name of cacheNames) {
          await caches.delete(name);
          logResult(`Deleted cache: ${name}`, true);
        }
      }
      
      logResult('All caches cleared! Reload the page now.', true);
      
    } catch (error) {
      logResult(`Error clearing caches: ${error}`, false);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}>
        🔍 Toast Notification Debug & Test Page
      </h1>
      
      <div style={{ 
        background: '#f3f4f6', 
        padding: '1rem', 
        borderRadius: '8px',
        marginBottom: '2rem',
        border: '2px solid #e5e7eb'
      }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
          System Status
        </h2>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          <li style={{ padding: '0.25rem 0' }}>
            {debugInfo.serviceWorkerActive ? '⚠️' : '✅'} Service Worker: {debugInfo.serviceWorkerActive ? 'ACTIVE (Clear it!)' : 'Inactive'}
          </li>
          <li style={{ padding: '0.25rem 0' }}>
            {debugInfo.cacheExists ? '⚠️' : '✅'} Cache: {debugInfo.cacheExists ? 'EXISTS (Clear it!)' : 'Clear'}
          </li>
          <li style={{ padding: '0.25rem 0' }}>
            {debugInfo.toastContainerFound ? '✅' : '❌'} ToastContainer: {debugInfo.toastContainerFound ? 'Found' : 'NOT FOUND'}
          </li>
        </ul>
        
        {(debugInfo.serviceWorkerActive || debugInfo.cacheExists) && (
          <div style={{ marginTop: '1rem', padding: '1rem', background: '#fef2f2', borderRadius: '4px' }}>
            <strong style={{ color: '#dc2626' }}>⚠️ WARNING:</strong> Old cached files detected!
            <br />
            <button
              onClick={clearAllCaches}
              style={{
                marginTop: '0.5rem',
                padding: '0.5rem 1rem',
                background: '#dc2626',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              🗑️ Clear All Caches Now
            </button>
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
            Manual Tests
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <button
              onClick={testCloseButton}
              style={{
                padding: '1rem',
                background: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '1rem'
              }}
            >
              TEST 1: Close Button Click
            </button>

            <button
              onClick={testCloseOnClick}
              style={{
                padding: '1rem',
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '1rem'
              }}
            >
              TEST 2: Click Anywhere to Close
            </button>

            <button
              onClick={testAutoClose}
              style={{
                padding: '1rem',
                background: '#f59e0b',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '1rem'
              }}
            >
              TEST 3: Auto-Close (3s)
            </button>

            <button
              onClick={testMultipleToasts}
              style={{
                padding: '1rem',
                background: '#8b5cf6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '1rem'
              }}
            >
              TEST 4: Multiple Toasts
            </button>

            <button
              onClick={testEventPropagation}
              style={{
                padding: '1rem',
                background: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '1rem'
              }}
            >
              TEST 5: Event Propagation
            </button>

            <button
              onClick={checkForOldCode}
              style={{
                padding: '1rem',
                background: '#64748b',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '1rem'
              }}
            >
              CHECK: Old Code Detection
            </button>
          </div>
        </div>

        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
            Test Results Log
          </h2>
          
          <div style={{
            background: '#1f2937',
            color: '#f3f4f6',
            padding: '1rem',
            borderRadius: '8px',
            fontFamily: 'monospace',
            fontSize: '0.875rem',
            maxHeight: '500px',
            overflowY: 'auto',
            minHeight: '300px'
          }}>
            {testResults.length === 0 ? (
              <div style={{ color: '#9ca3af' }}>
                No tests run yet. Click a test button to start.
              </div>
            ) : (
              testResults.map((result, index) => (
                <div key={index} style={{ marginBottom: '0.5rem' }}>
                  {result}
                </div>
              ))
            )}
          </div>
          
          <button
            onClick={() => setTestResults([])}
            style={{
              marginTop: '0.5rem',
              padding: '0.5rem 1rem',
              background: '#374151',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.875rem'
            }}
          >
            Clear Log
          </button>
        </div>
      </div>

      <div style={{ 
        background: '#eff6ff', 
        padding: '1.5rem', 
        borderRadius: '8px',
        border: '2px solid #3b82f6'
      }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>
          📋 Expected Results
        </h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <h3 style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>✅ SHOULD WORK:</h3>
            <ul style={{ paddingLeft: '1.5rem', lineHeight: '1.75' }}>
              <li>Clicking X button closes the toast immediately</li>
              <li>Clicking anywhere on toast body closes it</li>
              <li>Toast auto-closes after timeout</li>
              <li>Maximum 3 toasts visible at once</li>
              <li>Close button has pointer-events: auto</li>
              <li>No console errors when clicking buttons</li>
            </ul>
          </div>
          
          <div>
            <h3 style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>❌ SHOULD NOT HAPPEN:</h3>
            <ul style={{ paddingLeft: '1.5rem', lineHeight: '1.75' }}>
              <li>X button does nothing when clicked</li>
              <li>Multiple toasts close when clicking one X</li>
              <li>Console errors about event handlers</li>
              <li>Toast flickers when clicking close</li>
              <li>Close button not visible or clickable</li>
              <li>Event propagation to parent elements</li>
            </ul>
          </div>
        </div>
      </div>

      <div style={{ marginTop: '2rem', padding: '1rem', background: '#fefce8', borderRadius: '8px' }}>
        <strong>💡 Tip:</strong> Open browser DevTools (F12) → Console tab to see detailed debug logs
      </div>
    </div>
  );
}

