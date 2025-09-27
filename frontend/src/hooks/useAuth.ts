// frontend/src/hooks/useAuth.ts
'use client';

import { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { usePathname } from 'next/navigation';

interface DecodedToken {
  sub: string;
  role: 'CLIENT' | 'SALON_OWNER' | 'ADMIN';
}

export function useAuth() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const pathname = usePathname(); // Reruns effect on navigation

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      try {
        const decoded: DecodedToken = jwtDecode(token);
        setIsLoggedIn(true);
        setUserRole(decoded.role);
        setUserId(decoded.sub);
      } catch (e) {
        // Handle invalid token
        setIsLoggedIn(false);
        setUserRole(null);
        setUserId(null);
        localStorage.removeItem('access_token');
      }
    } else {
      setIsLoggedIn(false);
      setUserRole(null);
      setUserId(null);
    }
  }, [pathname]); // Dependency on pathname ensures this check reruns on route changes

  return { isLoggedIn, userRole, userId };
}