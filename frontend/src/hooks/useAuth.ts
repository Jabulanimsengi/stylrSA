import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@/types';

type AuthStatus = 'authenticated' | 'unauthenticated' | 'loading';

export const useAuth = () => {
  const [authStatus, setAuthStatus] = useState<AuthStatus>('loading');
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const verifyUser = async () => {
      try {
        const res = await fetch('http://localhost:3000/api/auth/status', {
          credentials: 'include',
        });

        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          setAuthStatus('authenticated');
        } else {
          console.warn(
            'Authentication check failed. User is unauthenticated. This might cause a UI flicker if not handled correctly in the component.'
          );
          setAuthStatus('unauthenticated');
          setUser(null);
        }
      } catch (error) {
        console.error('An error occurred during authentication verification:', error);
        setAuthStatus('unauthenticated');
        setUser(null);
      }
    };

    verifyUser();
  }, []);

  return { authStatus, user, setAuthStatus };
};