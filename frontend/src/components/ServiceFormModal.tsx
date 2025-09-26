'use client';

import { useState, FormEvent, useEffect } from 'react';
import { Service } from '@/types';
import styles from './ServiceFormModal.module.css';

interface ServiceFormModalProps {
  salonId: string;
  initialData?: Service | null;
  onClose: () => void;
  onSave: (service: Service) => void;
}

export default function ServiceFormModal({ salonId, initialData, onClose, onSave }: ServiceFormModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const isEditMode = !!initialData;

  useEffect(() => {
    if (isEditMode && initialData) {
      setTitle(initialData.title);
      setDescription(initialData.description);
      setPrice(String(initialData.price));
      setExistingImages(initialData.images);
    }
  }, [isEditMode, initialData]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      if ((e.target.files.length + existingImages.length) > 3) {
        alert('You can upload a maximum of 3 images.');
        return;
      }
      setFiles(Array.from(e.target.files));
    }
  };

  const handleRemoveExistingImage = (imageUrlToRemove: string) => {
    setExistingImages(existingImages.filter(url => url !== imageUrlToRemove));
  };

  const uploadImages = async (): Promise<string[]> => {
    const token = localStorage.getItem('access_token');
    const uploadedUrls: string[] = [];

    const sigRes = await fetch('http://localhost:3000/api/cloudinary/signature', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!sigRes.ok) {
      throw new Error('Could not get upload permission.');
    }

    const { signature, timestamp } = await sigRes.json();
    const url = `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`;

    for (const file of files) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY as string);
      formData.append('timestamp', String(timestamp));
      formData.append('signature', signature);

      const uploadRes = await fetch(url, { method: 'POST', body: formData });
      if (!uploadRes.ok) {
        throw new Error('Image upload failed.');
      }
      
      const uploadData = await uploadRes.json();
      uploadedUrls.push(uploadData.secure_url);
    }
    return uploadedUrls;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('access_token');
    if (!token) {
      setError('Authentication error.');
      return;
    }
    setIsLoading(true);
    setError('');

    try {
      let imageUrls = existingImages;
      if (files.length > 0) {
        const newUrls = await uploadImages();
        imageUrls = [...existingImages, ...newUrls];
      }

      const apiEndpoint = isEditMode
        ? `http://localhost:3000/api/services/${initialData?.id}`
        : `http://localhost:3000/api/salons/${salonId}/services`;
      
      const method = isEditMode ? 'PATCH' : 'POST';

      const res = await fetch(apiEndpoint, {
        method: method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          title, description, price: parseFloat(price), images: imageUrls,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || `Failed to ${isEditMode ? 'update' : 'add'} service.`);
      }

      const savedService = await res.json();
      onSave(savedService);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2 className={styles.title}>{isEditMode ? 'Edit Service' : 'Add a New Service'}</h2>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div>
            <label className={styles.label}>Service Title</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required className={styles.input} />
          </div>
          <div>
            <label className={styles.label}>Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} required className={styles.textarea} />
          </div>
          <div>
            <label className={styles.label}>Price (R)</label>
            <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} required className={styles.input} />
          </div>
          <div>
            <label className={styles.label}>Upload Images (up to 3 total)</label>
            <input type="file" multiple accept="image/*" onChange={handleFileChange} className={styles.fileInput} />
          </div>
          <div className={styles.imagePreviewContainer}>
            {existingImages.map(url => (
              <div key={url} className={styles.imageWrapper}>
                <img src={url} alt="Existing" className={styles.imagePreview} />
                <button type="button" onClick={() => handleRemoveExistingImage(url)} className={styles.removeImageButton}>
                  &times;
                </button>
              </div>
            ))}
            {files.length > 0 && Array.from(files).map(file => <img key={file.name} src={URL.createObjectURL(file)} alt="Preview" className={styles.imagePreview} />)}
          </div>

          {error && <p className={styles.errorMessage}>{error}</p>}
          <div className={styles.buttonContainer}>
            <button type="button" onClick={onClose} className={styles.cancelButton}>Cancel</button>
            <button type="submit" disabled={isLoading} className={styles.saveButton}>
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}