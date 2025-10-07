'use client';

import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
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

  useEffect(() => {
    const verifyUser = async () => {
      try {
        const res = await fetch('/api/auth/status', {
          credentials: 'include',
        });

        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          setAuthStatus('authenticated');
        } else {
          setAuthStatus('unauthenticated');
          setUser(null);
        }
      } catch (error) {
        setAuthStatus('unauthenticated');
        setUser(null);
      }
    };
    verifyUser();
  }, []);

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