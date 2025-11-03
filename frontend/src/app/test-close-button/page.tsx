'use client';

import { toast } from 'react-toastify';
import { useState } from 'react';

export default function TestCloseButtonPage() {
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (msg: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${msg}`]);
    console.log(msg);
  };

  const testSimpleToast = () => {
    addLog('Creating simple toast...');
    
    const id = toast.success('Click the X button to close this toast', {
      toastId: 'test-simple',
      autoClose: false,
      onOpen: () => addLog('✅ Toast opened'),
      onClose: () => addLog('✅ Toast closed (onClose callback fired)'),
    });
    
    addLog(`Toast ID: ${id}`);
    
    // Check the close button after toast appears
    setTimeout(() => {
      const closeBtn = document.querySelector('.Toastify__close-button');
      if (closeBtn) {
        addLog('✅ Close button found in DOM');
        
        // Check if onClick is attached
        const hasClickHandler = closeBtn.onclick !== null;
        addLog(`Close button onclick: ${hasClickHandler ? 'Attached' : 'Not attached'}`);
        
        // Log the button element
        console.log('Close button element:', closeBtn);
        console.log('Close button props:', {
          className: closeBtn.className,
          ariaLabel: closeBtn.getAttribute('aria-label'),
          type: closeBtn.getAttribute('type'),
        });
      } else {
        addLog('❌ Close button NOT found');
      }
    }, 200);
  };

  const testManualDismiss = () => {
    addLog('Creating toast with manual dismiss test...');
    
    const id = toast.info('Testing manual dismiss', {
      toastId: 'test-manual',
      autoClose: false,
    });
    
    addLog(`Created toast with ID: ${id}`);
    
    // Try to dismiss it programmatically after 3 seconds
    setTimeout(() => {
      addLog('Attempting to dismiss toast programmatically...');
      toast.dismiss(id);
      addLog('toast.dismiss() called');
      
      // Check if it's still in DOM
      setTimeout(() => {
        const toastElement = document.querySelector(`[data-toast-id="${id}"]`);
        if (toastElement) {
          addLog('❌ Toast still in DOM after dismiss!');
        } else {
          addLog('✅ Toast removed from DOM');
        }
      }, 500);
    }, 3000);
  };

  const testCloseToastProp = () => {
    addLog('Testing closeToast prop directly...');
    
    toast.error('Testing closeToast callback', {
      toastId: 'test-callback',
      autoClose: false,
      onOpen: (props) => {
        addLog('Toast opened, inspecting closeToast prop...');
        console.log('Toast props:', props);
        
        // Try to access the close button and its props
        setTimeout(() => {
          const btn = document.querySelector('.Toastify__close-button') as any;
          if (btn) {
            addLog('Checking close button click behavior...');
            
            // Add a test click listener to see what happens
            const testHandler = (e: MouseEvent) => {
              addLog('🔍 Close button clicked! Event details:');
              addLog(`  - Target: ${e.target}`);
              addLog(`  - CurrentTarget: ${e.currentTarget}`);
              addLog(`  - Event type: ${e.type}`);
              addLog(`  - Event bubbles: ${e.bubbles}`);
              addLog(`  - DefaultPrevented: ${e.defaultPrevented}`);
            };
            
            btn.addEventListener('click', testHandler, true);
            addLog('Added test click listener to close button');
          }
        }, 200);
      },
    });
  };

  const testCloseButtonComponent = () => {
    addLog('Checking ToastCloseButton component...');
    
    toast.warning('Inspect this toast in React DevTools', {
      toastId: 'test-component',
      autoClose: false,
    });
    
    setTimeout(() => {
      const closeBtn = document.querySelector('.Toastify__close-button');
      if (closeBtn) {
        // Get all event listeners (if possible)
        addLog('Close button found, check React DevTools for component props');
        
        // Try to trigger click programmatically
        addLog('Attempting programmatic click on close button...');
        (closeBtn as HTMLElement).click();
        
        setTimeout(() => {
          const toastStillThere = document.querySelector('[data-toast-id="test-component"]');
          if (toastStillThere) {
            addLog('❌ Programmatic click did NOT close toast');
          } else {
            addLog('✅ Programmatic click closed toast');
          }
        }, 500);
      }
    }, 200);
  };

  const checkReactToastifyVersion = () => {
    addLog('Checking react-toastify setup...');
    
    // Check if ToastContainer exists
    const container = document.querySelector('.Toastify__toast-container');
    if (container) {
      addLog('✅ ToastContainer found');
      const config = window.getComputedStyle(container);
      addLog(`Container position: ${container.getAttribute('class')}`);
    } else {
      addLog('❌ ToastContainer NOT found');
    }
    
    // Create a test toast and examine its structure
    toast.info('Examining toast structure...', {
      toastId: 'structure-test',
      autoClose: 2000,
    });
    
    setTimeout(() => {
      const toastElement = document.querySelector('.Toastify__toast');
      if (toastElement) {
        addLog('Toast structure:');
        addLog(`  - Children count: ${toastElement.children.length}`);
        Array.from(toastElement.children).forEach((child, i) => {
          addLog(`  - Child ${i}: ${child.className}`);
        });
      }
    }, 100);
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}>
        🔬 Close Button Deep Diagnosis
      </h1>

      <div style={{ 
        background: '#fef2f2', 
        padding: '1rem', 
        borderRadius: '8px',
        marginBottom: '2rem',
        border: '2px solid #fecaca'
      }}>
        <strong>Issue:</strong> Close button triggers onClose callback multiple times but doesn't close the toast.
        <br />
        <strong>Goal:</strong> Find out why the close button isn't dismissing the toast.
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>
            Diagnostic Tests
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <button
              onClick={testSimpleToast}
              style={{
                padding: '1rem',
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              1. Simple Toast Test
            </button>

            <button
              onClick={testManualDismiss}
              style={{
                padding: '1rem',
                background: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              2. Manual Dismiss Test (3s)
            </button>

            <button
              onClick={testCloseToastProp}
              style={{
                padding: '1rem',
                background: '#f59e0b',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              3. CloseToast Prop Test
            </button>

            <button
              onClick={testCloseButtonComponent}
              style={{
                padding: '1rem',
                background: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              4. Component Click Test
            </button>

            <button
              onClick={checkReactToastifyVersion}
              style={{
                padding: '1rem',
                background: '#8b5cf6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              5. Check Setup
            </button>

            <button
              onClick={() => {
                toast.dismiss();
                addLog('Called toast.dismiss() for all toasts');
              }}
              style={{
                padding: '1rem',
                background: '#64748b',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              Dismiss All Toasts
            </button>
          </div>
        </div>

        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>
            Diagnostic Log
          </h2>
          
          <div style={{
            background: '#1f2937',
            color: '#f3f4f6',
            padding: '1rem',
            borderRadius: '8px',
            fontFamily: 'monospace',
            fontSize: '0.875rem',
            maxHeight: '600px',
            overflowY: 'auto',
            minHeight: '400px'
          }}>
            {logs.length === 0 ? (
              <div style={{ color: '#9ca3af' }}>
                Run a diagnostic test...
              </div>
            ) : (
              logs.map((log, index) => (
                <div key={index} style={{ marginBottom: '0.25rem' }}>
                  {log}
                </div>
              ))
            )}
          </div>

          <button
            onClick={() => setLogs([])}
            style={{
              marginTop: '0.5rem',
              padding: '0.5rem 1rem',
              background: '#374151',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Clear Log
          </button>
        </div>
      </div>

      <div style={{ 
        marginTop: '2rem',
        padding: '1rem',
        background: '#eff6ff',
        borderRadius: '8px'
      }}>
        <strong>💡 Instructions:</strong>
        <ol style={{ marginLeft: '1.5rem', marginTop: '0.5rem' }}>
          <li>Run "1. Simple Toast Test"</li>
          <li>Click the X button on the toast</li>
          <li>Check the log to see what happens</li>
          <li>Open DevTools Console for more details</li>
          <li>Check if toast actually disappears</li>
        </ol>
      </div>
    </div>
  );
}

