'use client';

import { useState, FormEvent } from 'react';
import { signIn } from 'next-auth/react';
import styles from '../app/auth.module.css';
import { useAuthModal } from '@/context/AuthModalContext';
import { toast } from 'react-toastify';
import { User } from '@/types';
import { apiJson, apiFetch } from '@/lib/api';
import { toFriendlyMessage } from '@/lib/errors';
import { FaGoogle } from 'react-icons/fa';
import VerifyEmailCode from './VerifyEmailCode';

// Define the props that this component will accept
interface LoginProps {
  onLoginSuccess: (user: User) => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [isResendingCode, setIsResendingCode] = useState(false);
  const { switchToRegister, switchToResendVerification } = useAuthModal();

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

    } catch (err: unknown) {
      const msg = toFriendlyMessage(err, 'Login failed. Please check your credentials.');
      
      // Check if error is about email verification
      if (msg.toLowerCase().includes('verify your email')) {
        setNeedsVerification(true);
        toast.info('Please verify your email address first.');
        // Automatically send verification code
        handleResendCode();
      } else {
        setError(msg);
        toast.error(msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setIsResendingCode(true);
    try {
      await apiFetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      toast.success('Verification code sent! Please check your email.');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to send verification code.');
    } finally {
      setIsResendingCode(false);
    }
  };

  const handleVerified = async () => {
    // After verification, attempt login again
    toast.success('Email verified! Logging you in...');
    setNeedsVerification(false);
    
    try {
      const data = await apiJson<{ user: User }>('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      
      toast.success('Login successful! Welcome.');
      onLoginSuccess(data.user);
    } catch (err: unknown) {
      const msg = toFriendlyMessage(err, 'Login failed after verification. Please try again.');
      setError(msg);
      toast.error(msg);
    }
  };

  const handleCancelVerification = () => {
    setNeedsVerification(false);
  };

  if (needsVerification) {
    return <VerifyEmailCode email={email} onVerified={handleVerified} onCancel={handleCancelVerification} />;
  }

  return (
      <div>
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
            <div className={styles.passwordField}>
              <input
                id="password"
                type={isPasswordVisible ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`${styles.input} ${styles.inputWithToggle}`}
              />
              <button
                type="button"
                onClick={() => setIsPasswordVisible((prev) => !prev)}
                className={styles.toggleButton}
                aria-label={isPasswordVisible ? 'Hide password' : 'Show password'}
                aria-pressed={isPasswordVisible}
              >
                {isPasswordVisible ? 'Hide' : 'Show'}
              </button>
            </div>
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
          <div className={styles.oauthDivider}>or</div>
          <button
            type="button"
            className={styles.oauthButton}
            onClick={() => signIn('google', { callbackUrl: '/salons' })}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/><path d="M1 1h22v22H1z" fill="none"/></svg>
            <span>Continue with Google</span>
          </button>
        </div>
        <p className={styles.footerText}>
          <a href="#" onClick={(e) => { e.preventDefault(); switchToResendVerification(); }} className={styles.footerLink}>
            Forgot password or didn't receive verification email?
          </a>
        </p>
      </div>
  );
}