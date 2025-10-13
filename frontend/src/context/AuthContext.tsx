'use client';

import React, { createContext, useState, useContext, ReactNode, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { User } from '@/types';

type AuthStatus = 'authenticated' | 'unauthenticated' | 'loading';

interface AuthContextType {
  authStatus: AuthStatus;
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
  setAuthStatus: React.Dispatch<React.SetStateAction<AuthStatus>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [authStatus, setAuthStatus] = useState<AuthStatus>('loading');
  const [user, setUser] = useState<User | null>(null);
  const { data: session, status: sessionStatus } = useSession();
  const attachedRef = useRef<string | null>(null);

  useEffect(() => {
    const verifyUser = async () => {
      try {
        // If NextAuth session exists, attach backend JWT cookie first (idempotent)
        const backendJwt = (session as any)?.backendJwt as string | undefined;
        if (sessionStatus === 'authenticated' && backendJwt && attachedRef.current !== backendJwt) {
          attachedRef.current = backendJwt;
          try {
            await fetch('/api/auth/attach', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({ token: backendJwt }),
            });
          } catch {}
        }

        // Primary: cookie-based status check
        let res = await fetch('/api/auth/status', { credentials: 'include' });

        // Fallback: if unauthorized but session has backend JWT, try Authorization header once
        if (!res.ok && sessionStatus === 'authenticated' && backendJwt) {
          res = await fetch('/api/auth/status', {
            credentials: 'include',
            headers: { Authorization: `Bearer ${backendJwt}` },
          });
        }

        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          setAuthStatus('authenticated');
          return;
        }

        setAuthStatus('unauthenticated');
        setUser(null);
      } catch {
        setAuthStatus('unauthenticated');
        setUser(null);
      }
    };

    // Wait until NextAuth finishes determining session to avoid race
    if (sessionStatus === 'loading') return;
    void verifyUser();
  }, [sessionStatus, session]);

  const login = (userData: User) => {
    setUser(userData);
    setAuthStatus('authenticated');
  };

  const logout = () => {
    setUser(null);
    setAuthStatus('unauthenticated');
  };

  return (
    <AuthContext.Provider value={{ authStatus, user, login, logout, setAuthStatus }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};