// frontend/srcs/components/ProductFormModal.tsx

'use client';

import { useState, FormEvent, useEffect } from 'react';
import { Product } from '@/types';
import styles from './ProductFormModal.module.css';
import { toast } from 'react-toastify';
import { uploadToCloudinary } from '@/utils/cloudinary';
import { FaTimes, FaUpload } from 'react-icons/fa';

interface ProductFormModalProps {
  onClose: () => void;
  onProductAdded: (product: Product) => void; // FIX: Renamed prop
  initialData?: Product | null; // FIX: Renamed prop
  salonId: string; // FIX: Added salonId
}

export default function ProductFormModal({ onClose, onProductAdded, initialData, salonId }: ProductFormModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stockQuantity, setStockQuantity] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const isEditMode = !!initialData;

  useEffect(() => {
    if (isEditMode && initialData) {
      setName(initialData.name);
      setDescription(initialData.description);
      setPrice(String(initialData.price));
      setStockQuantity(String(initialData.stockQuantity));
      setExistingImages(initialData.images);
    }
  }, [isEditMode, initialData]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      if (newFiles.length + existingImages.length + files.length > 5) {
        toast.error('You can upload a maximum of 5 images in total.');
        return;
      }
      setFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const handleRemoveExistingImage = (imageUrlToRemove: string) => {
    setExistingImages(existingImages.filter((url) => url !== imageUrlToRemove));
  };

  const handleRemoveNewFile = (fileIndex: number) => {
    setFiles(files.filter((_, index) => index !== fileIndex));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      let imageUrls = existingImages;
      if (files.length > 0) {
        const uploaded = await Promise.all(files.map(file => uploadToCloudinary(file)));
        const uploadedUrls = uploaded.map(u => u.secure_url);
        imageUrls = [...existingImages, ...uploadedUrls];
      }

      if (imageUrls.length === 0) {
        throw new Error('Please upload at least one image.');
      }
      
      const apiEndpoint = isEditMode ? `/api/products/${initialData?.id}` : '/api/products';
      const method = isEditMode ? 'PATCH' : 'POST';
      const body = JSON.stringify({
        name,
        description,
        price: parseFloat(price),
        stockQuantity: parseInt(stockQuantity),
        images: imageUrls,
        salonId, // FIX: Include salonId in the request body
      });

      const res = await fetch(apiEndpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body,
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || `Failed to ${isEditMode ? 'update' : 'add'} product.`);
      }

      const savedProduct = await res.json();
      toast.success(`Product ${isEditMode ? 'update submitted' : 'created and submitted'} for approval.`);
      onProductAdded(savedProduct); // FIX: Use correct prop name
      onClose();

    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.header}>
            <h2 className={styles.title}>{isEditMode ? 'Edit Product' : 'Add a New Product'}</h2>
            <button onClick={onClose} className={styles.closeButton}><FaTimes /></button>
        </div>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Product Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className={styles.input} />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} required className={styles.textarea} />
          </div>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
                <label className={styles.label}>Price (R)</label>
                <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} required className={styles.input} min="0" step="0.01" />
            </div>
            <div className={styles.formGroup}>
                <label className={styles.label}>Stock Quantity</label>
                <input type="number" value={stockQuantity} onChange={(e) => setStockQuantity(e.target.value)} required className={styles.input} min="0" step="1" />
            </div>
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Upload Images (up to 5 total)</label>
            <div className={styles.fileInputGroup}>
              <label htmlFor="file-upload" className={styles.fileInputLabel}>
                <FaUpload /> Choose Files
              </label>
              <input 
                id="file-upload" 
                type="file" 
                multiple 
                accept="image/*" 
                onChange={handleFileChange} 
                className={styles.fileInput} 
              />
              {files.length > 0 && <span className={styles.fileName}>{files.length} new file(s) selected</span>}
            </div>
          </div>
          
          <div className={styles.imagePreviewContainer}>
            {existingImages.map(url => (
              <div key={url} className={styles.imageWrapper}>
                <img src={url} alt="Existing" className={styles.imagePreview} />
                <button type="button" onClick={() => handleRemoveExistingImage(url)} className={styles.removeImageButton}>&times;</button>
              </div>
            ))}
            {files.map((file, index) => (
              <div key={index} className={styles.imageWrapper}>
                <img src={URL.createObjectURL(file)} alt="Preview" className={styles.imagePreview} />
                <button type="button" onClick={() => handleRemoveNewFile(index)} className={styles.removeImageButton}>&times;</button>
              </div>
            ))}
          </div>

          {error && <p className={styles.errorMessage}>{error}</p>}
          <div className={styles.buttonContainer}>
            <button type="button" onClick={onClose} className="btn btn-ghost">Cancel</button>
            <button type="submit" disabled={isLoading} className="btn btn-primary">
              {isLoading ? 'Saving...' : 'Save Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}