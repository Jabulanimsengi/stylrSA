'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import styles from '../app/auth.module.css';
import { jwtDecode } from 'jwt-decode';
import { useAuthModal } from '@/context/AuthModalContext';
import Link from 'next/link';

interface DecodedToken {
  role: 'CLIENT' | 'SALON_OWNER' | 'ADMIN';
}

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { closeModal, switchToRegister } = useAuthModal();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        throw new Error('Login failed. Please check your credentials.');
      }

      const data = await res.json();
      const token = data.access_token;
      localStorage.setItem('access_token', token);
      
      const decodedToken: DecodedToken = jwtDecode(token);
      const userRole = decodedToken.role;

      closeModal();
      
      if (userRole === 'SALON_OWNER') {
        router.push('/dashboard');
      } else if (userRole === 'ADMIN') {
        router.push('/admin');
      } else {
        router.push('/salons');
      }

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
      <div className={styles.card}>
        <h1 className={styles.title}>Sign In</h1>
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <label htmlFor="email" className={styles.label}>
              Email address
            </label>
            <input
              id="email" type="email" required value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={styles.input}
            />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="password" className={styles.label}>
              Password
            </label>
            <input
              id="password" type="password" required value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.input}
            />
          </div>
          <div className={styles.footerText} style={{textAlign: 'right', marginTop: 0}}>
            <Link href="/forgot-password" className={styles.footerLink}>
              Forgot Password?
            </Link>
          </div>
          {error && <p className={styles.errorMessage}>{error}</p>}
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </div>
        </form>
        <p className={styles.footerText}>
          Don't have an account?{' '}
          <a href="#" onClick={switchToRegister} className={styles.footerLink}>
            Sign up
          </a>
        </p>
      </div>
  );
}