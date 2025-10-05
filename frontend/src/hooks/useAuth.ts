// frontend/src/hooks/useAuth.ts
import { useState, useEffect } from 'react';
import { User } from '@/types';

export type AuthStatus = 'authenticated' | 'unauthenticated' | 'loading';

export interface AuthState {
  authStatus: AuthStatus;
  user: User | null;
  isLoading: boolean;
  setAuthStatus: (status: AuthStatus) => void;
  setUser: (user: User | null) => void;
}

export const useAuth = (): AuthState => {
  const [authStatus, setAuthStatus] = useState<AuthStatus>('loading');
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const res = await fetch('http://localhost:3000/api/auth/status', {
          credentials: 'include',
        });
        if (res.ok) {
          const data = await res.json();
          setAuthStatus('authenticated');
          setUser(data.user);
        } else {
          setAuthStatus('unauthenticated');
          setUser(null);
        }
      } catch (error) {
        setAuthStatus('unauthenticated');
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  return { authStatus, user, isLoading, setAuthStatus, setUser };
};