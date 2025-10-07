'use client';

import { useState, FormEvent } from 'react';
import styles from '../app/auth.module.css';
import { useAuthModal } from '@/context/AuthModalContext';
import { toast } from 'react-toastify';
import { User } from '@/types';

// Define the props that this component will accept
interface LoginProps {
  onLoginSuccess: (user: User) => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { switchToRegister } = useAuthModal();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Corrected to a relative URL to be handled by the Next.js proxy
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Login failed. Please check your credentials.');
      }
      
      toast.success('Login successful! Welcome back.');
      // On success, call the function passed down from the parent component
      onLoginSuccess(data.user);

    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
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
          <a href="#" onClick={(e) => { e.preventDefault(); switchToRegister(); }} className={styles.footerLink}>
            Sign up
          </a>
        </p>
      </div>
  );
}