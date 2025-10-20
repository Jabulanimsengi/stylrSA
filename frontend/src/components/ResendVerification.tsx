'use client';

import { useState, FormEvent } from 'react';
import styles from '../app/auth.module.css';
import { toast } from 'react-toastify';
import { apiFetch } from '@/lib/api';

interface ResendVerificationProps {
  onClose?: () => void;
}

export default function ResendVerification({ onClose }: ResendVerificationProps) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess(false);

    try {
      const res = await apiFetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const response = await res.json();

      toast.success(response.message || 'Verification email sent! Please check your inbox.');
      setSuccess(true);
      setEmail('');

      // Auto-close after success if onClose is provided
      if (onClose) {
        setTimeout(() => {
          onClose();
        }, 2000);
      }
    } catch (err: any) {
      console.error('Resend verification error:', err);
      
      let msg = 'Failed to resend verification email.';
      
      if (err?.message) {
        msg = err.message;
      } else if (typeof err === 'string') {
        msg = err;
      }
      
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.card}>
      <h1 className={styles.title}>Resend Verification Email</h1>
      <p style={{ marginBottom: '1.5rem', color: '#4D4952', textAlign: 'center' }}>
        Enter your email address and we&apos;ll send you a new verification link.
      </p>
      
      {!success ? (
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <label htmlFor="email" className={styles.label}>Email address</label>
            <input 
              id="email" 
              type="email" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={styles.input}
              placeholder="your.email@example.com"
            />
          </div>

          {error && <p className={styles.errorMessage}>{error}</p>}

          <div>
            <button type="submit" disabled={isLoading} className="btn btn-primary">
              {isLoading ? 'Sending...' : 'Resend Verification Email'}
            </button>
          </div>
        </form>
      ) : (
        <div style={{ 
          textAlign: 'center', 
          padding: '2rem', 
          background: '#cdecea', 
          borderRadius: '8px',
          marginBottom: '1rem'
        }}>
          <p style={{ color: '#25776c', fontWeight: 600, margin: 0 }}>
            ✅ Verification email sent successfully!
          </p>
          <p style={{ color: '#25776c', fontSize: '0.875rem', marginTop: '0.5rem' }}>
            Please check your inbox and spam folder.
          </p>
        </div>
      )}

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="btn btn-ghost"
          style={{ marginTop: '1rem' }}
        >
          Close
        </button>
      )}
    </div>
  );
}
