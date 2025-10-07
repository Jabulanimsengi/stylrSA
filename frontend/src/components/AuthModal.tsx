'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './AuthModal.module.css';
import Login from './Login';
import Register from './Register';
import { useAuthModal } from '@/context/AuthModalContext';
import { useAuth } from '@/hooks/useAuth';
import { FaTimes } from 'react-icons/fa';
import { User } from '@/types';

// This component is rendered by AuthModalProvider and receives props
interface AuthModalProps {
  view: 'login' | 'register';
  onClose: () => void;
}

export default function AuthModal({ view: initialView, onClose }: AuthModalProps) {
  const { setAuthStatus } = useAuth();
  // Get the functions to switch views from the context
  const { switchToLogin, switchToRegister } = useAuthModal();
  const [view, setView] = useState(initialView);
  const router = useRouter();

  // Ensure the view state is synced with the prop from the context
  useEffect(() => {
    setView(initialView);
  }, [initialView]);

  const handleLoginSuccess = (user: User) => {
    setAuthStatus('authenticated');
    onClose(); // Close the modal using the function passed via props
    
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
      router.push('/');
    }
  };

  const handleRegisterSuccess = () => {
    // Use the context function to switch to the login view
    switchToLogin();
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <button onClick={onClose} className={styles.closeButton}><FaTimes /></button>
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${view === 'login' ? styles.active : ''}`}
            onClick={switchToLogin} // Use context function
          >
            Login
          </button>
          <button
            className={`${styles.tab} ${view === 'register' ? styles.active : ''}`}
            onClick={switchToRegister} // Use context function
          >
            Register
          </button>
        </div>
        {view === 'login' ? (
          <Login onLoginSuccess={handleLoginSuccess} />
        ) : (
          <Register onRegisterSuccess={handleRegisterSuccess} />
        )}
      </div>
    </div>
  );
}