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
      const res = await apiFetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, email, password, role }),
      });

      const response = await res.json();

      // Handle successful response
      if (response.message) {
        toast.success(response.message);
      } else {
        toast.success('Registration successful! You can now log in.');
      }

      // Call success handler to switch to login
      onRegisterSuccess();

    } catch (err: any) {
      console.error('Registration error:', err);
      
      // Extract the error message - backend sends structured error responses
      let msg = 'Registration failed. Please try again.';
      
      // Check for message in error object (from parseErrorResponse)
      if (err?.message) {
        msg = err.message;
      } else if (err?.userMessage) {
        msg = err.userMessage;
      } else if (typeof err === 'string') {
        msg = err;
      }
      
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    // Store selected role in cookie before OAuth redirect
    // This will be read by NextAuth callback after Google authentication
    if (typeof document !== 'undefined') {
      // Set cookie that expires in 10 minutes (enough time for OAuth flow)
      // Make sure to use uppercase to match backend validation
      const roleValue = role.toUpperCase();
      document.cookie = `oauth_signup_role=${roleValue}; path=/; max-age=600; SameSite=Lax`;
      
      console.log('[Register] Setting OAuth role cookie:', roleValue);
      console.log('[Register] Current role state:', role);
    }
    
    const callbackUrl = role === 'SALON_OWNER' ? '/create-salon' : '/salons';
    // Redirect to Google OAuth
    void signIn('google', { callbackUrl });
  };



  return (
    <div>
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
      <div className={styles.oauthSection}>
        <div className={styles.oauthDivider}>or</div>
        <p style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.5rem', textAlign: 'center' }}>
          Selected role: <strong>{role === 'CLIENT' ? 'Client' : role === 'SALON_OWNER' ? 'Service Provider' : 'Product Seller'}</strong>
        </p>
                  <button
                  type="button"
                  className={styles.oauthButton}
                  onClick={handleGoogleSignIn}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/><path d="M1 1h22v22H1z" fill="none"/></svg>
                  <span>Continue with Google</span>
                </button>      </div>
    </div>
  );
}