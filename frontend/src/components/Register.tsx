'use client';

import { useState, FormEvent } from 'react';
import { signIn } from 'next-auth/react';
import styles from '../app/auth.module.css';
import { useAuthModal } from '@/context/AuthModalContext';
import { toast } from 'react-toastify';
import { apiFetch } from '@/lib/api';
import { toFriendlyMessage } from '@/lib/errors';
import { FaGoogle } from 'react-icons/fa';

// Define the props that this component will accept
interface RegisterProps {
  onRegisterSuccess: () => void;
}

export default function Register({ onRegisterSuccess }: RegisterProps) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('CLIENT');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { switchToLogin } = useAuthModal();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await apiFetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, email, password, role }),
      });

      toast.success('Registration successful! Please sign in.');
      // On success, call the function passed down from the parent
      onRegisterSuccess();

    } catch (err: any) {
      const msg = toFriendlyMessage(err, 'Registration failed.');
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.card}>
      <h1 className={styles.title}>Create an Account</h1>
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.inputGroupRow}>
          <div className={styles.inputGroup}>
            <label htmlFor="firstName" className={styles.label}>First Name</label>
            <input id="firstName" type="text" required value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className={styles.input} />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="lastName" className={styles.label}>Last Name</label>
            <input id="lastName" type="text" required value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className={styles.input} />
          </div>
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="email" className={styles.label}>Email address</label>
          <input id="email" type="email" required value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={styles.input} />
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="password" className={styles.label}>Password</label>
          <input id="password" type="password" required value={password} minLength={8}
            onChange={(e) => setPassword(e.target.value)}
            className={styles.input} />
        </div>

        <div className={styles.roleSelector}>
          <div className={styles.roleOption}>
            <input type="radio" id="roleClient" name="role" value="CLIENT" checked={role === 'CLIENT'} onChange={(e) => setRole(e.target.value)} />
            <label htmlFor="roleClient">I'm a Client</label>
          </div>
          <div className={styles.roleOption}>
            <input type="radio" id="roleOwner" name="role" value="SALON_OWNER" checked={role === 'SALON_OWNER'} onChange={(e) => setRole(e.target.value)} />
            <label htmlFor="roleOwner">I'm a Service Provider</label>
          </div>
          <div className={styles.roleOption}>
            <input type="radio" id="roleSeller" name="role" value="PRODUCT_SELLER" checked={role === 'PRODUCT_SELLER'} onChange={(e) => setRole(e.target.value)} />
            <label htmlFor="roleSeller">I'm a Product Seller</label>
          </div>
        </div>

        {error && <p className={styles.errorMessage}>{error}</p>}

        <div>
          <button type="submit" disabled={isLoading} className="btn btn-primary">
            {isLoading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </div>
      </form>
      <p className={styles.footerText}>
        Already have an account?{' '}
        <a href="#" onClick={(e) => { e.preventDefault(); switchToLogin(); }} className={styles.footerLink}>
          Sign in
        </a>
      </p>
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
    </div>
  );
}