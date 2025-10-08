// frontend/srcs/components/GalleryUploadModal.tsx

'use client';

import { useState, FormEvent } from 'react';
import styles from './GalleryUploadModal.module.css'; // FIX: Use the new dedicated stylesheet
import { toast } from 'react-toastify';
import { GalleryImage } from '@/types';
import { uploadToCloudinary } from '@/utils/cloudinary';
import { FaTimes, FaUpload } from 'react-icons/fa';

interface GalleryUploadModalProps {
  salonId: string;
  onClose: () => void;
  onImageAdded: (image: GalleryImage) => void;
}

export default function GalleryUploadModal({ salonId, onClose, onImageAdded }: GalleryUploadModalProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [caption, setCaption] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const handleRemoveImage = (fileIndex: number) => {
    setFiles(files.filter((_, index) => index !== fileIndex));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (files.length === 0) {
      toast.error('Please select at least one image to upload.');
      return;
    }
    setIsLoading(true);
    setError('');

    try {
      // Upload all files simultaneously
      const uploadPromises = files.map(file => uploadToCloudinary(file));
      const imageUrls = await Promise.all(uploadPromises);

      // Create a gallery image entry for each uploaded file
      const creationPromises = imageUrls.map(url => fetch('/api/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          imageUrl: url,
          caption: caption || null,
          salonId: salonId,
        }),
      }));

      const results = await Promise.all(creationPromises);

      for (const res of results) {
        if (!res.ok) {
            const errData = await res.json();
            throw new Error(errData.message || 'One or more images failed to save.');
        }
        const newImage = await res.json();
        onImageAdded(newImage); // Notify the parent for each new image
      }

      toast.success(`${files.length} image(s) uploaded successfully!`);
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
            <h2 className={styles.title}>Upload to Gallery</h2>
            <button onClick={onClose} className={styles.closeButton}><FaTimes /></button>
        </div>
        
        <form onSubmit={handleSubmit} className={styles.form}>
          {error && <p className={styles.errorMessage}>{error}</p>}
          
          <div className={styles.formGroup}>
            <label className={styles.label}>Select Images</label>
            <label htmlFor="gallery-upload" className={styles.fileInputLabel}>
                <FaUpload style={{ marginRight: '8px' }} />
                Click or drag files to upload
            </label>
            <input
              id="gallery-upload"
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileChange}
              className={styles.fileInput}
            />
          </div>

          {files.length > 0 && (
            <div className={styles.imagePreviewContainer}>
              {files.map((file, index) => (
                <div key={index} className={styles.imageWrapper}>
                  <img src={URL.createObjectURL(file)} alt={`preview ${index}`} className={styles.imagePreview} />
                  <button type="button" onClick={() => handleRemoveImage(index)} className={styles.removeImageButton}>×</button>
                </div>
              ))}
            </div>
          )}

          <div className={styles.formGroup}>
            <label htmlFor="caption" className={styles.label}>Optional Caption</label>
            <textarea
              id="caption"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className={styles.textarea}
              placeholder="A brief description for all uploaded images..."
            />
          </div>

          <div className={styles.buttonContainer}>
            <button type="button" onClick={onClose} className={styles.cancelButton}>
              Cancel
            </button>
            <button type="submit" disabled={isLoading || files.length === 0} className={styles.saveButton}>
              {isLoading ? `Uploading ${files.length}...` : 'Upload'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}