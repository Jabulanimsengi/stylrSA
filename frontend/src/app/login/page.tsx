'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from '../auth.module.css';
import { jwtDecode } from 'jwt-decode'; // Import the decoder

interface DecodedToken {
  role: 'CLIENT' | 'SALON_OWNER' | 'ADMIN';
}

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

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
      const token = data.accessToken;
      localStorage.setItem('access_token', token);

      // --- THIS IS THE FIX ---
      // 1. Decode the token to find the user's role
      const decodedToken: DecodedToken = jwtDecode(token);
      const userRole = decodedToken.role;

      // 2. Redirect based on the role
      if (userRole === 'SALON_OWNER') {
        router.push('/dashboard');
      } else if (userRole === 'ADMIN') {
        router.push('/admin');
      } else {
        // Default for CLIENTs is to go to the salon listing
        router.push('/salons');
      }
      // --- End of Fix ---

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
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
          <Link href="/register" className={styles.footerLink}>
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}