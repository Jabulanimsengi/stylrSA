'use client';

import { useAuthModal } from '@/context/AuthModalContext';
import Login from './Login';
import Register from './Register';
import styles from './AuthModal.module.css';

export default function AuthModal() {
  const { isOpen, view, closeModal } = useAuthModal();

  if (!isOpen) {
    return null;
  }

  return (
    <div className={styles.modalOverlay} onClick={closeModal}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={closeModal}>&times;</button>
        {view === 'login' ? <Login /> : <Register />}
      </div>
    </div>
  );
}