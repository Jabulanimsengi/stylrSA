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
    const checkAuthStatus = async () => {
      try {
        const res = await fetch('http://localhost:3000/api/auth/status', {
          credentials: 'include', // Important: send cookies with the request
        });

        if (res.ok) {
          const user = await res.json();
          setUserId(user.id);
          setUserRole(user.role);
          setAuthStatus('authenticated');
        } else {
          setAuthStatus('unauthenticated');
        }
      } catch (error) {
        setAuthStatus('unauthenticated');
      }
    };

    checkAuthStatus();
  }, [pathname]);

  return { authStatus, userRole, userId, setAuthStatus };
}