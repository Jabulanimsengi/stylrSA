// frontend/src/components/ConfirmationModal/ConfirmationModal.tsx
import styles from './ConfirmationModal.module.css';

interface ConfirmationModalProps {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
}

export default function ConfirmationModal({
  message,
  onConfirm,
  onCancel,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
}: ConfirmationModalProps) {
  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <p className={styles.message}>{message}</p>
        <div className={styles.buttonGroup}>
          <button className={`${styles.actionButton} ${styles.cancelButton}`} onClick={onCancel}>
            {cancelText}
          </button>
          <button className={`${styles.actionButton} ${styles.confirmButton}`} onClick={onConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}