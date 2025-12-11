'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './AuthModal.redesign.module.css';
import Login from './Login';
import Register from './Register';
import ResendVerification from './ResendVerification';
import VerifyEmailCode from './VerifyEmailCode';
import { useAuthModal } from '@/context/AuthModalContext';
import { useAuth } from '@/hooks/useAuth';
import { FaTimes } from 'react-icons/fa';
import { User } from '@/types';
import Image from 'next/image';

// This component is rendered by AuthModalProvider and receives props
interface AuthModalProps {
  view: 'login' | 'register' | 'resend-verification' | 'verify-email';
  onClose: () => void;
}

export default function AuthModal({ view: initialView, onClose }: AuthModalProps) {
  const { login } = useAuth(); // Get the login function from our global context
  const { switchToLogin, switchToRegister, switchToResendVerification, switchToVerifyEmail, pendingVerificationEmail } = useAuthModal();
  const [view, setView] = useState(initialView);
  const router = useRouter();

  useEffect(() => {
    setView(initialView);
  }, [initialView]);

  const handleLoginSuccess = (user: User) => {
    login(user); // Update the global state with the logged-in user
    onClose(); // Close the modal

    // Intelligent redirection logic
    if (user.role === 'SALON_OWNER' && !user.salonId) {
      router.push('/create-salon');
    } else if (user.role === 'SALON_OWNER') {
      router.push('/dashboard');
    } else if (user.role === 'PRODUCT_SELLER') {
      router.push('/product-dashboard');
    } else if (user.role === 'ADMIN') {
      router.push('/admin');
    } else {
      // For CLIENT role, the modal will just close and the navbar will update.
      // You can optionally redirect them to the home page or another page.
      // router.push('/'); 
    }
  };

  const handleRegisterSuccess = (email: string) => {
    // After registration, switch to email verification view
    switchToVerifyEmail(email);
  };

  const handleVerificationSuccess = () => {
    // After verification, switch to login
    switchToLogin();
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className={styles.closeButton}><FaTimes /></button>
        {view !== 'resend-verification' && view !== 'verify-email' && (
          <div className={styles.tabs}>
            <button
              className={`${styles.tab} ${view === 'login' ? styles.active : ''}`}
              onClick={switchToLogin}
            >
              Login
            </button>
            <button
              className={`${styles.tab} ${view === 'register' ? styles.active : ''}`}
              onClick={switchToRegister}
            >
              Register
            </button>
          </div>
        )}
        <div className={styles.formArea}>
          {view === 'login' && <Login onLoginSuccess={handleLoginSuccess} />}
          {view === 'register' && <Register onRegisterSuccess={handleRegisterSuccess} />}
          {view === 'resend-verification' && <ResendVerification onClose={onClose} />}
          {view === 'verify-email' && pendingVerificationEmail && (
            <VerifyEmailCode
              email={pendingVerificationEmail}
              onVerified={handleVerificationSuccess}
              onCancel={switchToLogin}
            />
          )}
        </div>
      </div>
    </div>
  );
}
