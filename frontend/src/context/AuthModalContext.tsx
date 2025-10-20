'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import AuthModal from '@/components/AuthModal';

type AuthModalView = 'login' | 'register' | 'resend-verification';

interface AuthModalContextType {
  openModal: (view: AuthModalView) => void;
  closeModal: () => void;
  switchToLogin: () => void;
  switchToRegister: () => void;
  switchToResendVerification: () => void;
}

const AuthModalContext = createContext<AuthModalContextType | undefined>(undefined);

export const useAuthModal = () => {
  const context = useContext(AuthModalContext);
  if (!context) {
    throw new Error('useAuthModal must be used within an AuthModalProvider');
  }
  return context;
};

export const AuthModalProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<AuthModalView>('login');

  const openModal = (view: AuthModalView) => {
    setView(view);
    setIsOpen(true);
  };

  const closeModal = () => setIsOpen(false);
  const switchToLogin = () => setView('login');
  const switchToRegister = () => setView('register');
  const switchToResendVerification = () => setView('resend-verification');

  return (
    <AuthModalContext.Provider value={{ openModal, closeModal, switchToLogin, switchToRegister, switchToResendVerification }}>
      {children}
      {isOpen && <AuthModal view={view} onClose={closeModal} />}
    </AuthModalContext.Provider>
  );
};