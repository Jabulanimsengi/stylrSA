'use client';

import { useState, FormEvent } from 'react';
import styles from './ServiceFormModal.module.css'; // Reusing styles for consistency
import { toast } from 'react-toastify';
import { GalleryImage } from '@/types';

interface GalleryUploadModalProps {
  salonId: string;
  onClose: () => void;
  onUpload: (image: GalleryImage) => void;
}

export default function GalleryUploadModal({ salonId, onClose, onUpload }: GalleryUploadModalProps) {
  const [caption, setCaption] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const uploadImage = async (): Promise<string> => {
    if (!file) throw new Error('No file selected.');
    
    const token = localStorage.getItem('access_token');
    const sigRes = await fetch('http://localhost:3000/api/cloudinary/signature', { headers: { Authorization: `Bearer ${token}` } });
    if (!sigRes.ok) throw new Error('Could not get upload permission.');
    
    const { signature, timestamp } = await sigRes.json();
    const url = `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`;
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('api_key', process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY as string);
    formData.append('timestamp', String(timestamp));
    formData.append('signature', signature);
    
    const uploadRes = await fetch(url, { method: 'POST', body: formData });
    if (!uploadRes.ok) throw new Error('Image upload failed.');
    
    const uploadData = await uploadRes.json();
    return uploadData.secure_url;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please select an image to upload.');
      return;
    }

    const token = localStorage.getItem('access_token');
    if (!token) {
      setError('Authentication error.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const imageUrl = await uploadImage();
      const res = await fetch(`http://localhost:3000/api/gallery/salon/${salonId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ imageUrl, caption }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Failed to add image to gallery.');
      }

      const newImage = await res.json();
      toast.success('Image added to your gallery!');
      onUpload(newImage);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2 className={styles.title}>Add to Gallery</h2>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div>
            <label className={styles.label}>Image</label>
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleFileChange} 
              required 
            />
            {file && (
              <img src={URL.createObjectURL(file)} alt="Preview" className={styles.imagePreview} style={{marginTop: '1rem'}} />
            )}
          </div>
          <div>
            <label className={styles.label}>Caption (Optional)</label>
            <input type="text" value={caption} onChange={(e) => setCaption(e.target.value)} className={styles.input} />
          </div>
          
          {error && <p className={styles.errorMessage}>{error}</p>}
          <div className={styles.buttonContainer}>
            <button type="button" onClick={onClose} className={styles.cancelButton}>Cancel</button>
            <button type="submit" disabled={isLoading} className={styles.saveButton}>
              {isLoading ? 'Uploading...' : 'Add Image'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}