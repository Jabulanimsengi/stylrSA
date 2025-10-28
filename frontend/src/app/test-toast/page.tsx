'use client';

import { toast } from 'react-toastify';

export default function TestToastPage() {
  const showSuccessToast = () => {
    toast.success('✅ Success! The X button is now at the TOP RIGHT corner. Click it to close.');
  };

  const showErrorToast = () => {
    toast.error('❌ Error message. The red-tinted X button should be visible at TOP RIGHT.');
  };

  const showInfoToast = () => {
    toast.info('ℹ️ Information toast. Look for the X button at the TOP RIGHT corner.');
  };

  const showWarningToast = () => {
    toast.warning('⚠️ Warning message. Click the X at TOP RIGHT to dismiss.');
  };

  const showMultipleToasts = () => {
    toast.success('First toast - X button at TOP RIGHT');
    setTimeout(() => {
      toast.error('Second toast - X button at TOP RIGHT');
    }, 500);
    setTimeout(() => {
      toast.info('Third toast - X button at TOP RIGHT');
    }, 1000);
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Toast Close Button Test - Top Right Position</h1>
      
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px' }}>
        <button 
          onClick={showSuccessToast}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            backgroundColor: '#22c55e',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
          }}
        >
          Show Success Toast
        </button>
        
        <button 
          onClick={showErrorToast}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            backgroundColor: '#ef4444',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
          }}
        >
          Show Error Toast
        </button>
        
        <button 
          onClick={showInfoToast}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
          }}
        >
          Show Info Toast
        </button>
        
        <button 
          onClick={showWarningToast}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            backgroundColor: '#f59e0b',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
          }}
        >
          Show Warning Toast
        </button>
        
        <button 
          onClick={showMultipleToasts}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            backgroundColor: '#8b5cf6',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
          }}
        >
          Show Multiple Toasts
        </button>
      </div>

      <div style={{ marginTop: '2rem', backgroundColor: '#f3f4f6', padding: '20px', borderRadius: '10px' }}>
        <h3>🔍 Debug Information:</h3>
        <ul>
          <li><strong>Close Button Position:</strong> TOP RIGHT corner (8px from top, 8px from right)</li>
          <li><strong>Debug Styling:</strong> Red border and red tint background for visibility</li>
          <li><strong>Console Logs:</strong> Open browser console (F12) to see click events</li>
          <li><strong>Expected Behavior:</strong> Click X button → See console log → Toast closes</li>
        </ul>
        
        <h3 style={{ marginTop: '20px' }}>📋 Test Checklist:</h3>
        <ol>
          <li>✓ Is the X button visible at the TOP RIGHT of each toast?</li>
          <li>✓ Does the X button have a red tint/border (debug styling)?</li>
          <li>✓ When you click X, does the console show "Toast close button clicked!"?</li>
          <li>✓ Does the toast close after clicking X?</li>
          <li>✓ Does hover effect work (button scales up)?</li>
          <li>✓ Does click effect work (button scales down)?</li>
        </ol>
        
        <h3 style={{ marginTop: '20px' }}>⚠️ If X button doesn't work:</h3>
        <ul>
          <li>Check console for error messages</li>
          <li>Verify the button is visible with red debug styling</li>
          <li>Try clicking different parts of the button</li>
          <li>Check if swipe-to-dismiss still works as fallback</li>
        </ul>
      </div>
    </div>
  );
}
