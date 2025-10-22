// frontend/src/components/ConfirmationModal/ConfirmationModal.tsx
import styles from './ConfirmationModal.module.css';

interface ConfirmationModalProps {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  details?: string[];
}

export default function ConfirmationModal({
  message,
  onConfirm,
  onCancel,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  details,
}: ConfirmationModalProps) {
  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <p className={styles.message}>{message}</p>
        {details && details.length > 0 && (
          <div className={styles.details}>
            <p className={styles.detailsLabel}>Marking as completed will:</p>
            <ul className={styles.detailsList}>
              {details.map((detail, index) => (
                <li key={index}>{detail}</li>
              ))}
            </ul>
          </div>
        )}
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