'use client';

import { useAuth } from '@/hooks/useAuth';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

export default function DebugAuthPage() {
  const { authStatus, user } = useAuth();
  const { data: session, status: sessionStatus } = useSession();
  const [backendStatus, setBackendStatus] = useState<any>(null);

  useEffect(() => {
    const checkBackend = async () => {
      try {
        const res = await fetch('/api/auth/status', { credentials: 'include' });
        const data = await res.json();
        setBackendStatus(data);
      } catch (error) {
        setBackendStatus({ error: String(error) });
      }
    };
    checkBackend();
  }, []);

  return (
    <div style={{ padding: '40px', fontFamily: 'monospace' }}>
      <h1>Auth Debug Page</h1>
      
      <div style={{ marginTop: '20px', padding: '20px', background: '#f5f5f5', borderRadius: '8px' }}>
        <h2>Frontend Auth Context</h2>
        <pre>{JSON.stringify({ authStatus, user }, null, 2)}</pre>
      </div>

      <div style={{ marginTop: '20px', padding: '20px', background: '#f5f5f5', borderRadius: '8px' }}>
        <h2>NextAuth Session</h2>
        <pre>{JSON.stringify({ sessionStatus, session }, null, 2)}</pre>
      </div>

      <div style={{ marginTop: '20px', padding: '20px', background: '#f5f5f5', borderRadius: '8px' }}>
        <h2>Backend /api/auth/status</h2>
        <pre>{JSON.stringify(backendStatus, null, 2)}</pre>
      </div>

      <div style={{ marginTop: '20px', padding: '20px', background: '#ffe5e5', borderRadius: '8px' }}>
        <h2>Admin Access Check</h2>
        <p>✅ Logged in: {authStatus === 'authenticated' ? 'YES' : 'NO'}</p>
        <p>✅ Is Admin: {user?.role === 'ADMIN' ? 'YES' : 'NO'}</p>
        <p>Current Role: <strong>{user?.role || 'NOT SET'}</strong></p>
        <p style={{ marginTop: '16px', color: user?.role === 'ADMIN' ? 'green' : 'red' }}>
          {user?.role === 'ADMIN' 
            ? '✅ You have admin access' 
            : '❌ You DO NOT have admin access. Your role is: ' + (user?.role || 'NOT SET')}
        </p>
      </div>
    </div>
  );
}

