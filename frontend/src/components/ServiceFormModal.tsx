// frontend/src/components/ServiceFormModal.tsx
import { useState, FormEvent } from 'react';
import { Service } from '@/types';
import styles from './ServiceFormModal.module.css';
import { toast } from 'react-toastify';
import { FaTimes } from 'react-icons/fa';

interface ServiceFormModalProps {
  salonId: string;
  onClose: () => void;
  onServiceAdded: (newService: Service) => void;
}

export default function ServiceFormModal({ salonId, onClose, onServiceAdded }: ServiceFormModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    duration: 30,
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
        ...prev,
        [name]: type === 'number' ? parseFloat(value) : value
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const token = localStorage.getItem('access_token');
    if (!token) {
        toast.error("You must be logged in to add a service.");
        setIsLoading(false);
        return;
    }

    try {
      const res = await fetch('http://localhost:3000/api/services', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...formData, salonId }),
      });

      if (!res.ok) {
        throw new Error('Failed to add service.');
      }
      const newService = await res.json();
      toast.success('Service added successfully! It will be reviewed by an admin.');
      onServiceAdded(newService);
      onClose();
    } catch (error) {
      console.error(error);
      toast.error('Could not add service.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <button onClick={onClose} className={styles.closeButton}><FaTimes /></button>
        <h2>Add a New Service</h2>
        <form onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
                <label htmlFor="name">Service Name</label>
                <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required />
            </div>
            <div className={styles.formGroup}>
                <label htmlFor="description">Description</label>
                <textarea id="description" name="description" value={formData.description} onChange={handleChange} required />
            </div>
            <div className={styles.formGroup}>
                <label htmlFor="price">Price (R)</label>
                <input type="number" id="price" name="price" value={formData.price} onChange={handleChange} required />
            </div>
            <div className={styles.formGroup}>
                <label htmlFor="duration">Duration (minutes)</label>
                <input type="number" id="duration" name="duration" value={formData.duration} onChange={handleChange} required />
            </div>
          <button type="submit" disabled={isLoading} className="btn btn-primary">
            {isLoading ? 'Adding...' : 'Add Service'}
          </button>
        </form>
      </div>
    </div>
  );
}