// frontend/srcs/components/ServiceFormModal.tsx

'use client';

import { useState, useEffect, FormEvent } from 'react';
import { Service } from '@/types';
import styles from './ServiceFormModal.module.css';
import { uploadToCloudinary } from '@/utils/cloudinary';
import { toast } from 'react-toastify';
import { FaTimes } from 'react-icons/fa';

interface ServiceFormModalProps {
  salonId: string;
  service?: Service | null;
  onClose: () => void;
  onServiceSaved: (service: Service) => void;
}

export default function ServiceFormModal({ salonId, service, onClose, onServiceSaved }: ServiceFormModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    duration: '',
    category: '',
  });
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const isEditMode = !!service;

  useEffect(() => {
    if (isEditMode && service) {
      setFormData({
        title: service.title || '',
        description: service.description || '',
        price: service.price?.toString() || '',
        duration: service.duration?.toString() || '',
        category: service.category || '',
      });
      setImagePreviews(service.images || []);
    }
  }, [service, isEditMode]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setImages(prev => [...prev, ...newFiles]);
      const newPreviews = newFiles.map(file => URL.createObjectURL(file));
      setImagePreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const handleRemoveImage = (imageUrlToRemove: string) => {
    const updatedPreviews = imagePreviews.filter(img => img !== imageUrlToRemove);
    setImagePreviews(updatedPreviews);

    if (imageUrlToRemove.startsWith('blob:')) {
      const indexToRemove = imagePreviews.findIndex(p => p === imageUrlToRemove);
      const existingImagesCount = imagePreviews.filter(p => !p.startsWith('blob:')).length;
      const fileIndexToRemove = indexToRemove - existingImagesCount;

      if (fileIndexToRemove >= 0 && fileIndexToRemove < images.length) {
        setImages(prev => prev.filter((_, i) => i !== fileIndexToRemove));
      }
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    const token = localStorage.getItem('access_token');

    try {
        const existingImageUrls = imagePreviews.filter(p => !p.startsWith('blob:'));
        
        // Correctly call the async upload function
       const uploadedImageUrls = await Promise.all(
    images.map(file => uploadToCloudinary(file)));

        const allImageUrls = [...existingImageUrls, ...uploadedImageUrls];

      const url = isEditMode ? `${apiUrl}/services/${service?.id}` : `${apiUrl}/services`;
      const method = isEditMode ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
             'Content-Type': 'application/json',
             Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          duration: parseInt(formData.duration, 10),
          images: allImageUrls,
          salonId: salonId,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || `Failed to ${isEditMode ? 'update' : 'create'} service`);
      }

      const savedService = await res.json();
      toast.success(`Service ${isEditMode ? 'updated' : 'created'} successfully!`);
      onServiceSaved(savedService);
      onClose();

    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2 className={styles.title}>{isEditMode ? 'Edit Service' : 'Add a New Service'}</h2>
        <button onClick={onClose} className={styles.closeButton}><FaTimes /></button>
        
        <form onSubmit={handleSubmit} className={styles.form}>
          {error && <p className={styles.errorMessage}>{error}</p>}
          
          <div className={styles.formGroup}>
            <label htmlFor="title" className={styles.label}>Service Title</label>
            <input type="text" id="title" name="title" value={formData.title} onChange={handleChange} required className={styles.input} />
          </div>

          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label htmlFor="price" className={styles.label}>Price (R)</label>
              <input type="number" id="price" name="price" value={formData.price} onChange={handleChange} required className={styles.input} min="0" step="any" />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="duration" className={styles.label}>Duration (minutes)</label>
              <input type="number" id="duration" name="duration" value={formData.duration} onChange={handleChange} required className={styles.input} min="0" step="1" />
            </div>
          </div>
          
          <div className={`${styles.formGroup} ${styles.fullWidth}`}>
            <label htmlFor="category" className={styles.label}>Category</label>
            <input type="text" id="category" name="category" value={formData.category} onChange={handleChange} required className={styles.input} />
          </div>

          <div className={`${styles.formGroup} ${styles.fullWidth}`}>
            <label htmlFor="description" className={styles.label}>Description</label>
            <textarea id="description" name="description" value={formData.description} onChange={handleChange} required className={styles.textarea} />
          </div>

          <div className={`${styles.formGroup} ${styles.fullWidth}`}>
            <label htmlFor="images" className={styles.label}>Service Images</label>
            <input type="file" id="images" name="images" multiple onChange={handleImageChange} className={styles.input} accept="image/*" />
            <div className={styles.imagePreviewContainer}>
              {imagePreviews.map((src) => (
                <div key={src} className={styles.imageWrapper}>
                  <img src={src} alt="Service preview" className={styles.imagePreview} />
                  <button type="button" onClick={() => handleRemoveImage(src)} className={styles.deleteButton}>×</button>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.buttonContainer}>
            <button type="button" onClick={onClose} className={styles.cancelButton}>
              Cancel
            </button>
            <button type="submit" className={styles.saveButton} disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Service'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}