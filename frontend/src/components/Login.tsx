'use client';

import { useState, FormEvent } from 'react';
import { signIn } from 'next-auth/react';
import styles from '../app/auth.module.css';
import { useAuthModal } from '@/context/AuthModalContext';
import { toast } from 'react-toastify';
import { User } from '@/types';
import { apiJson } from '@/lib/api';
import { toFriendlyMessage } from '@/lib/errors';
import { FaGoogle } from 'react-icons/fa';

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
      const data = await apiJson<{ user: User }>('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      
      toast.success('Login successful! Welcome back.');
      // On success, call the function passed down from the parent component
      onLoginSuccess(data.user);

    } catch (err: any) {
      const msg = toFriendlyMessage(err, 'Login failed. Please check your credentials.');
      setError(msg);
      toast.error(msg);
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
        <div className={styles.oauthSection}>
          <div className={styles.oauthDivider}>or continue with</div>
          <button
            type="button"
            className={styles.oauthButton}
            onClick={() => signIn('google', { callbackUrl: '/salons' })}
          >
            <FaGoogle aria-hidden />
            Continue with Google
          </button>
        </div>
        <p className={styles.footerText}>
          Don't have an account?{' '}
          <a href="#" onClick={(e) => { e.preventDefault(); switchToRegister(); }} className={styles.footerLink}>
            Sign up
          </a>
        </p>
      </div>
  );
}