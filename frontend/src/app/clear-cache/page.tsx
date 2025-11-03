'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ClearCachePage() {
  const router = useRouter();
  const [status, setStatus] = useState<string[]>([]);
  const [isClearing, setIsClearing] = useState(false);

  const addStatus = (message: string, type: 'info' | 'success' | 'error' = 'info') => {
    const icons = { info: 'ℹ️', success: '✅', error: '❌' };
    setStatus((prev) => [...prev, `${icons[type]} ${message}`]);
  };

  const clearEverything = async () => {
    setIsClearing(true);
    setStatus([]);
    
    addStatus('Starting complete cache clear...', 'info');

    // 1. Unregister all service workers
    if ('serviceWorker' in navigator) {
      try {
        const registrations = await navigator.serviceWorker.getRegistrations();
        addStatus(`Found ${registrations.length} service worker(s)`, 'info');
        
        for (const registration of registrations) {
          await registration.unregister();
          addStatus(`Unregistered: ${registration.scope}`, 'success');
        }
      } catch (error) {
        addStatus(`Error with service workers: ${error}`, 'error');
      }
    } else {
      addStatus('Service Workers not supported in this browser', 'info');
    }

    // 2. Clear all caches
    if ('caches' in window) {
      try {
        const cacheNames = await caches.keys();
        addStatus(`Found ${cacheNames.length} cache(s)`, 'info');
        
        for (const name of cacheNames) {
          await caches.delete(name);
          addStatus(`Deleted cache: ${name}`, 'success');
        }
      } catch (error) {
        addStatus(`Error clearing caches: ${error}`, 'error');
      }
    } else {
      addStatus('Cache API not supported in this browser', 'info');
    }

    // 3. Clear localStorage
    try {
      const localStorageSize = localStorage.length;
      addStatus(`Found ${localStorageSize} localStorage item(s)`, 'info');
      
      localStorage.clear();
      addStatus('Cleared localStorage', 'success');
    } catch (error) {
      addStatus(`Error clearing localStorage: ${error}`, 'error');
    }

    // 4. Clear sessionStorage
    try {
      const sessionStorageSize = sessionStorage.length;
      addStatus(`Found ${sessionStorageSize} sessionStorage item(s)`, 'info');
      
      sessionStorage.clear();
      addStatus('Cleared sessionStorage', 'success');
    } catch (error) {
      addStatus(`Error clearing sessionStorage: ${error}`, 'error');
    }

    // 5. Clear IndexedDB (if any)
    if ('indexedDB' in window) {
      try {
        const databases = await window.indexedDB.databases();
        addStatus(`Found ${databases.length} IndexedDB database(s)`, 'info');
        
        for (const db of databases) {
          if (db.name) {
            window.indexedDB.deleteDatabase(db.name);
            addStatus(`Deleted IndexedDB: ${db.name}`, 'success');
          }
        }
      } catch (error) {
        addStatus(`Error with IndexedDB: ${error}`, 'error');
      }
    }

    addStatus('Cache clearing complete!', 'success');
    addStatus('Reloading page in 3 seconds...', 'info');
    
    setIsClearing(false);
    
    setTimeout(() => {
      window.location.reload();
    }, 3000);
  };

  const hardRefresh = () => {
    addStatus('Performing hard refresh...', 'info');
    window.location.reload();
  };

  return (
    <div style={{ 
      padding: '2rem', 
      maxWidth: '800px', 
      margin: '0 auto',
      minHeight: '100vh'
    }}>
      <h1 style={{ 
        fontSize: '2rem', 
        fontWeight: 'bold', 
        marginBottom: '1rem',
        color: '#1f2937'
      }}>
        🗑️ Complete Cache Clearer
      </h1>

      <div style={{ 
        background: '#fef2f2', 
        border: '2px solid #fecaca',
        padding: '1.5rem', 
        borderRadius: '8px',
        marginBottom: '2rem'
      }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#991b1b' }}>
          ⚠️ Warning
        </h2>
        <p style={{ marginBottom: '1rem', color: '#7f1d1d' }}>
          This will clear ALL cached data including:
        </p>
        <ul style={{ marginLeft: '1.5rem', marginBottom: '1rem', color: '#7f1d1d' }}>
          <li>Service Workers</li>
          <li>Cache Storage</li>
          <li>Local Storage</li>
          <li>Session Storage</li>
          <li>IndexedDB</li>
        </ul>
        <p style={{ color: '#7f1d1d' }}>
          You may need to log in again after this operation.
        </p>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <button
          onClick={clearEverything}
          disabled={isClearing}
          style={{
            flex: 1,
            padding: '1rem 2rem',
            fontSize: '1rem',
            fontWeight: 'bold',
            background: isClearing ? '#9ca3af' : '#dc2626',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: isClearing ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s'
          }}
        >
          {isClearing ? '🔄 Clearing...' : '🗑️ Clear All Caches'}
        </button>

        <button
          onClick={hardRefresh}
          style={{
            flex: 1,
            padding: '1rem 2rem',
            fontSize: '1rem',
            fontWeight: 'bold',
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          🔄 Hard Refresh
        </button>
      </div>

      <div style={{ 
        background: '#f3f4f6', 
        padding: '1.5rem', 
        borderRadius: '8px',
        marginBottom: '2rem'
      }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>
          Manual Methods
        </h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ padding: '0.75rem', background: 'white', borderRadius: '4px' }}>
            <strong>Chrome/Edge:</strong>
            <ul style={{ marginLeft: '1.5rem', marginTop: '0.5rem' }}>
              <li>Press <code style={{ background: '#e5e7eb', padding: '0.125rem 0.375rem', borderRadius: '4px' }}>Ctrl + Shift + Delete</code></li>
              <li>Or <code style={{ background: '#e5e7eb', padding: '0.125rem 0.375rem', borderRadius: '4px' }}>F12</code> → Application → Clear storage</li>
              <li>Hard refresh: <code style={{ background: '#e5e7eb', padding: '0.125rem 0.375rem', borderRadius: '4px' }}>Ctrl + Shift + R</code></li>
            </ul>
          </div>
          
          <div style={{ padding: '0.75rem', background: 'white', borderRadius: '4px' }}>
            <strong>Firefox:</strong>
            <ul style={{ marginLeft: '1.5rem', marginTop: '0.5rem' }}>
              <li>Press <code style={{ background: '#e5e7eb', padding: '0.125rem 0.375rem', borderRadius: '4px' }}>Ctrl + Shift + Delete</code></li>
              <li>Or <code style={{ background: '#e5e7eb', padding: '0.125rem 0.375rem', borderRadius: '4px' }}>F12</code> → Storage → Clear data</li>
              <li>Hard refresh: <code style={{ background: '#e5e7eb', padding: '0.125rem 0.375rem', borderRadius: '4px' }}>Ctrl + Shift + R</code></li>
            </ul>
          </div>
          
          <div style={{ padding: '0.75rem', background: 'white', borderRadius: '4px' }}>
            <strong>Incognito/Private Mode:</strong>
            <ul style={{ marginLeft: '1.5rem', marginTop: '0.5rem' }}>
              <li>Chrome/Edge: <code style={{ background: '#e5e7eb', padding: '0.125rem 0.375rem', borderRadius: '4px' }}>Ctrl + Shift + N</code></li>
              <li>Firefox: <code style={{ background: '#e5e7eb', padding: '0.125rem 0.375rem', borderRadius: '4px' }}>Ctrl + Shift + P</code></li>
            </ul>
          </div>
        </div>
      </div>

      {status.length > 0 && (
        <div style={{ 
          background: '#1f2937', 
          color: '#f3f4f6',
          padding: '1.5rem', 
          borderRadius: '8px',
          fontFamily: 'monospace',
          fontSize: '0.875rem'
        }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>
            Status Log
          </h2>
          
          <div style={{ 
            maxHeight: '400px', 
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem'
          }}>
            {status.map((msg, index) => (
              <div key={index}>{msg}</div>
            ))}
          </div>
        </div>
      )}

      <div style={{ 
        marginTop: '2rem',
        padding: '1rem',
        background: '#eff6ff',
        borderRadius: '8px',
        border: '2px solid #3b82f6'
      }}>
        <strong>💡 After Clearing Cache:</strong>
        <ul style={{ marginLeft: '1.5rem', marginTop: '0.5rem' }}>
          <li>The page will automatically reload</li>
          <li>You may need to log in again</li>
          <li>All your preferences will be reset</li>
          <li>Test the toast notifications at <a href="/test-toast-fix" style={{ color: '#3b82f6', textDecoration: 'underline' }}>/test-toast-fix</a></li>
        </ul>
      </div>

      <div style={{ marginTop: '2rem', textAlign: 'center' }}>
        <button
          onClick={() => router.push('/test-toast-fix')}
          style={{
            padding: '0.75rem 1.5rem',
            fontSize: '1rem',
            background: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          → Go to Toast Test Page
        </button>
      </div>
    </div>
  );
}

