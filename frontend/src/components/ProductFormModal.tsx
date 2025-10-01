'use client';

import { useState, FormEvent, useEffect } from 'react';
import { Product } from '@/types';
import styles from './ServiceFormModal.module.css'; // Reusing styles for consistency
import { toast } from 'react-toastify';

interface ProductFormModalProps {
  onClose: () => void;
  onSave: () => void;
  product?: Product | null;
}

export default function ProductFormModal({ onClose, onSave, product }: ProductFormModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const isEditMode = !!product;

  useEffect(() => {
    if (isEditMode && product) {
      setName(product.name);
      setDescription(product.description);
      setPrice(String(product.price));
      setExistingImages(product.images);
    }
  }, [isEditMode, product]);

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

  const uploadImages = async (): Promise<string[]> => {
    const token = localStorage.getItem('access_token');
    if (!token) throw new Error('Authentication error');
    
    const uploadedUrls: string[] = [];
    const sigRes = await fetch('http://localhost:3000/api/cloudinary/signature', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!sigRes.ok) throw new Error('Could not get upload permission.');
    const { signature, timestamp } = await sigRes.json();
    const url = `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`;

    for (const file of files) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY as string);
      formData.append('timestamp', String(timestamp));
      formData.append('signature', signature);
      const uploadRes = await fetch(url, { method: 'POST', body: formData });
      if (!uploadRes.ok) throw new Error('Image upload failed.');
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

      if (imageUrls.length === 0) {
        throw new Error('Please upload at least one image.');
      }

      const apiEndpoint = isEditMode ? `http://localhost:3000/api/products/${product?.id}` : 'http://localhost:3000/api/products';
      const method = isEditMode ? 'PATCH' : 'POST';
      const body = JSON.stringify({
        name,
        description,
        price: parseFloat(price),
        images: imageUrls,
      });

      const res = await fetch(apiEndpoint, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body,
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || `Failed to ${isEditMode ? 'update' : 'add'} product.`);
      }

      toast.success(`Product ${isEditMode ? 'update submitted' : 'created and submitted'} for approval.`);
      onSave();
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
        <h2 className={styles.title}>{isEditMode ? 'Edit Product' : 'Add a New Product'}</h2>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div>
            <label className={styles.label}>Product Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className={styles.input} />
          </div>
          <div>
            <label className={styles.label}>Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} required className={styles.textarea} />
          </div>
          <div>
            <label className={styles.label}>Price (R)</label>
            <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} required className={styles.input} min="0" step="0.01" />
          </div>
          <div>
            <label className={styles.label}>Upload Images (up to 5 total)</label>
            <div className={styles.fileInputGroup}>
              <label htmlFor="file-upload" className={styles.fileInputLabel}>
                Choose Files
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
            <button type="button" onClick={onClose} className="btn btn-secondary">Cancel</button>
            <button type="submit" disabled={isLoading} className="btn btn-primary">
              {isLoading ? 'Saving...' : 'Save Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}