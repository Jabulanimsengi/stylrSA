'use client';

import { useState, useEffect, Dispatch, SetStateAction } from 'react';
import { jwtDecode } from 'jwt-decode';
import { usePathname } from 'next/navigation';

interface DecodedToken {
  sub: string;
  role: 'CLIENT' | 'SALON_OWNER' | 'ADMIN';
}

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

interface AuthState {
  authStatus: AuthStatus;
  userRole: string | null;
  userId: string | null;
  setAuthStatus: Dispatch<SetStateAction<AuthStatus>>;
}

export function useAuth(): AuthState {
  const [authStatus, setAuthStatus] = useState<AuthStatus>('loading');
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      try {
        const decoded: DecodedToken = jwtDecode(token);
        setUserId(decoded.sub);
        setUserRole(decoded.role);
        setAuthStatus('authenticated');
      } catch (e) {
        setAuthStatus('unauthenticated');
        localStorage.removeItem('access_token');
      }
    } else {
      setAuthStatus('unauthenticated');
    }
  }, [pathname]);

  return { authStatus, userRole, userId, setAuthStatus };
}