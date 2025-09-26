'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import styles from './Navbar.module.css'; // Import the CSS module

interface DecodedToken {
  role: 'CLIENT' | 'SALON_OWNER' | 'ADMIN';
}

export default function Navbar() {
  const [userRole, setUserRole] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      try {
        const decodedToken: DecodedToken = jwtDecode(token);
        setUserRole(decodedToken.role);
      } catch (error) {
        localStorage.removeItem('access_token');
        setUserRole(null);
      }
    } else {
      setUserRole(null);
    }
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    setUserRole(null);
    router.push('/');
    router.refresh();
  };

  return (
    <nav className={styles.nav}>
      <Link href="/" className={styles.logo}>
        SalonDirect
      </Link>
      <div className={styles.linksContainer}>
        <Link href="/salons" className={styles.link}>Salons</Link>
        
        {userRole === 'SALON_OWNER' && (
          <Link href="/dashboard" className={styles.link}>Dashboard</Link>
        )}
        {userRole === 'ADMIN' && (
          <Link href="/admin" className={styles.link}>Admin</Link>
        )}

        {userRole ? (
          <button onClick={handleLogout} className={styles.logoutButton}>Logout</button>
        ) : (
          <>
            <Link href="/login" className={styles.link}>Login</Link>
            <Link href="/register" className={styles.link}>Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}