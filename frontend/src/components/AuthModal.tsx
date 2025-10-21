'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './AuthModal.redesign.module.css';
import Login from './Login';
import Register from './Register';
import ResendVerification from './ResendVerification';
import { useAuthModal } from '@/context/AuthModalContext';
import { useAuth } from '@/hooks/useAuth';
import { FaTimes } from 'react-icons/fa';
import { User } from '@/types';
import Image from 'next/image';

// This component is rendered by AuthModalProvider and receives props
interface AuthModalProps {
  view: 'login' | 'register' | 'resend-verification';
  onClose: () => void;
}

export default function AuthModal({ view: initialView, onClose }: AuthModalProps) {
  const { login } = useAuth(); // Get the login function from our global context
  const { switchToLogin, switchToRegister, switchToResendVerification } = useAuthModal();
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

  const handleRegisterSuccess = () => {
    switchToLogin();
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.leftPanel}>

          <h2 className={styles.leftPanelTitle}>Welcome to Stylr SA</h2>
          <p className={styles.leftPanelSubtitle}>
            The future of beauty and wellness bookings in South Africa.
          </p>
        </div>
        <div className={styles.rightPanel}>
          <button onClick={onClose} className={styles.closeButton}><FaTimes /></button>
          {view !== 'resend-verification' && (
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
          {view === 'login' && <Login onLoginSuccess={handleLoginSuccess} />}
          {view === 'register' && <Register onRegisterSuccess={handleRegisterSuccess} />}
          {view === 'resend-verification' && <ResendVerification onClose={onClose} />}
        </div>
      </div>
    </div>
  );
}