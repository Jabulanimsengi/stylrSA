// frontend/srcs/components/GalleryUploadModal.tsx

'use client';

import { useState, FormEvent, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
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

interface FileItem {
  file: File;
  preview: string;
}

export default function GalleryUploadModal({ salonId, onClose, onImageAdded }: GalleryUploadModalProps) {
  const [files, setFiles] = useState<FileItem[]>([]);
  const filesRef = useRef<FileItem[]>([]);
  const [caption, setCaption] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map((file) => ({
        file,
        preview: URL.createObjectURL(file),
      }));
      setFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const handleRemoveImage = (fileIndex: number) => {
    setFiles((prev) => {
      const next = [...prev];
      const [removed] = next.splice(fileIndex, 1);
      if (removed) {
        URL.revokeObjectURL(removed.preview);
      }
      return next;
    });
  };

  const cleanupPreviews = useCallback(() => {
    filesRef.current.forEach((item) => URL.revokeObjectURL(item.preview));
    filesRef.current = [];
    setFiles([]);
  }, []);

  const handleClose = useCallback(() => {
    cleanupPreviews();
    onClose();
  }, [cleanupPreviews, onClose]);

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
      const uploadPromises = files.map(({ file }) => uploadToCloudinary(file));
      const uploaded = await Promise.all(uploadPromises);
      const imageUrls = uploaded.map(u => u.secure_url);

      // Create a gallery image entry for each uploaded file
      const creationPromises = imageUrls.map(url => fetch(`/api/gallery/salon/${salonId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          imageUrl: url,
          caption: caption || null,
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
      cleanupPreviews();
      onClose();

    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    filesRef.current = files;
  }, [files]);

  useEffect(() => {
    return () => {
      filesRef.current.forEach((item) => URL.revokeObjectURL(item.preview));
    };
  }, []);

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.header}>
            <h2 className={styles.title}>Upload to Gallery</h2>
            <button onClick={handleClose} className={styles.closeButton}><FaTimes /></button>
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
              {files.map((entry, index) => (
                <div key={index} className={styles.imageWrapper}>
                  <Image
                    src={entry.preview}
                    alt={`preview ${index + 1}`}
                    className={styles.imagePreview}
                    width={160}
                    height={120}
                    unoptimized
                  />
                  <button type="button" onClick={() => handleRemoveImage(index)} className={styles.removeImageButton}>
                    ×
                  </button>
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
            <button type="button" onClick={handleClose} className={styles.cancelButton}>
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