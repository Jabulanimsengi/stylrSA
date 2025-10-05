'use client';

import Login from './Login';
import Register from './Register';
import styles from './AuthModal.module.css';

interface AuthModalProps {
  view: 'login' | 'register';
  onClose: () => void;
}

export default function AuthModal({ view, onClose }: AuthModalProps) {
  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose}>&times;</button>
        {view === 'login' ? <Login /> : <Register />}
      </div>
    </div>
  );
}