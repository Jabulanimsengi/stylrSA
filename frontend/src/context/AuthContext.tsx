'use client';

import React, { createContext, useState, useContext, ReactNode, useEffect, useRef, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { User } from '@/types';

type AuthStatus = 'authenticated' | 'unauthenticated' | 'loading';

interface AuthContextType {
  authStatus: AuthStatus;
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
  setAuthStatus: React.Dispatch<React.SetStateAction<AuthStatus>>;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [authStatus, setAuthStatus] = useState<AuthStatus>('loading');
  const [user, setUser] = useState<User | null>(null);
  const { data: session, status: sessionStatus } = useSession();
  const attachedRef = useRef<string | null>(null);
  const verifyingRef = useRef<boolean>(false);
  const justLoggedInRef = useRef<boolean>(false); // Track if user just logged in to prevent immediate re-verification

  const verifyUser = useCallback(async () => {
    if (verifyingRef.current) return;
    verifyingRef.current = true;

    try {
      // If NextAuth session exists, attach backend JWT cookie first (idempotent)
      const backendJwt = (session as any)?.backendJwt as string | undefined;
      if (sessionStatus === 'authenticated' && backendJwt && attachedRef.current !== backendJwt) {
        attachedRef.current = backendJwt;
        try {
          await fetch('/api/auth/attach', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              'Pragma': 'no-cache'
            },
            credentials: 'include',
            body: JSON.stringify({ token: backendJwt }),
          });
        } catch {}
      }

      // Skip verification if user just logged in - trust the login response
      if (justLoggedInRef.current) {
        justLoggedInRef.current = false;
        verifyingRef.current = false;
        return;
      }

      // Primary: cookie-based status check with cache-busting
      let res = await fetch('/api/auth/status', { 
        credentials: 'include',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      });

      // Fallback: if unauthorized but session has backend JWT, try Authorization header once
      if (!res.ok && sessionStatus === 'authenticated' && backendJwt) {
        res = await fetch('/api/auth/status', {
          credentials: 'include',
          headers: { 
            Authorization: `Bearer ${backendJwt}`,
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache'
          },
        });
      }

      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setAuthStatus('authenticated');
      } else {
        setAuthStatus('unauthenticated');
        setUser(null);
      }
    } catch (error) {
      console.error('[AuthContext] verifyUser error:', error);
      setAuthStatus('unauthenticated');
      setUser(null);
    } finally {
      verifyingRef.current = false;
    }
  }, [sessionStatus, session]);

  useEffect(() => {
    // Wait until NextAuth finishes determining session to avoid race
    if (sessionStatus === 'loading') return;
    void verifyUser();
  }, [sessionStatus, session, verifyUser]);

  const login = useCallback((userData: User) => {
    // Set user and auth status immediately
    // The backend already validated credentials and set the cookie
    setUser(userData);
    setAuthStatus('authenticated');
    // Mark that we just logged in so verifyUser doesn't run immediately
    justLoggedInRef.current = true;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setAuthStatus('unauthenticated');
    attachedRef.current = null;
    justLoggedInRef.current = false;
    
    // Clear user-specific data from storage
    try {
      if (typeof window !== 'undefined') {
        // Clear all sessionStorage (user-specific)
        sessionStorage.clear();
        
        // Selectively clear localStorage - keep theme and cookie consent
        const keysToKeep = ['theme', 'cookieConsent', 'pwa-install-dismissed'];
        const keepData: Record<string, string> = {};
        
        // Save data we want to keep
        keysToKeep.forEach(key => {
          const value = localStorage.getItem(key);
          if (value) keepData[key] = value;
        });
        
        // Clear everything
        localStorage.clear();
        
        // Restore saved data
        Object.entries(keepData).forEach(([key, value]) => {
          localStorage.setItem(key, value);
        });
      }
    } catch (error) {
      console.error('Failed to clear storage on logout:', error);
    }
  }, []);

  const refreshAuth = useCallback(async () => {
    await verifyUser();
  }, [verifyUser]);

  return (
    <AuthContext.Provider value={{ authStatus, user, login, logout, setAuthStatus, refreshAuth }}>
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