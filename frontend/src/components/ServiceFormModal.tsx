'use client';

import React, { useState, useEffect, FormEvent } from 'react';
import styles from './ServiceFormModal.module.css';
import { Service } from '@/types';
import { toast } from 'react-toastify';
import { FaTimes } from 'react-icons/fa';

interface ServiceFormModalProps {
  salonId: string;
  onClose: () => void;
  onServiceAdded: (service: Service) => void; // Can be used for both add and update
  initialData?: Service | null; 
}

export default function ServiceFormModal({ salonId, onClose, onServiceAdded, initialData }: ServiceFormModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: 0,
    duration: 30,
  });
  const [isLoading, setIsLoading] = useState(false);

  const isEditing = !!initialData;

  useEffect(() => {
    if (isEditing && initialData) {
      setFormData({
        title: initialData.title,
        description: initialData.description,
        price: initialData.price,
        duration: initialData.duration,
      });
    }
  }, [isEditing, initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
        ...prev,
        [name]: type === 'number' ? parseFloat(value) || 0 : value
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const serviceData = { ...formData, salonId };

    try {
      const url = isEditing ? `/api/services/${initialData?.id}` : '/api/services';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Use cookies for authentication
        body: JSON.stringify(serviceData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || `Failed to ${isEditing ? 'update' : 'create'} service.`);
      }
      
      toast.success(`Service ${isEditing ? 'updated' : 'added'} successfully!`);
      onServiceAdded(data);
      onClose();

    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Could not save service.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <button onClick={onClose} className={styles.closeButton}><FaTimes /></button>
        <h2>{isEditing ? 'Edit Service' : 'Add a New Service'}</h2>
        <form onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
                <label htmlFor="title">Service Name</label>
                <input type="text" id="title" name="title" value={formData.title} onChange={handleChange} required />
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
            {isLoading ? 'Saving...' : (isEditing ? 'Update Service' : 'Add Service')}
          </button>
        </form>
      </div>
    </div>
  );
}