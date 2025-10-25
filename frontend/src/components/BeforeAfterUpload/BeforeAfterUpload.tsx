'use client';

import { useState, useRef } from 'react';
import styles from './BeforeAfterUpload.module.css';
import { toast } from 'react-toastify';
import Image from 'next/image';

interface BeforeAfterUploadProps {
  salonId: string;
  services: Array<{ id: string; title: string }>;
  onUploadComplete: () => void;
}

export default function BeforeAfterUpload({ salonId, services, onUploadComplete }: BeforeAfterUploadProps) {
  const [beforeImage, setBeforeImage] = useState<File | null>(null);
  const [afterImage, setAfterImage] = useState<File | null>(null);
  const [beforePreview, setBeforePreview] = useState<string | null>(null);
  const [afterPreview, setAfterPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [serviceId, setServiceId] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const beforeInputRef = useRef<HTMLInputElement>(null);
  const afterInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (file: File, type: 'before' | 'after') => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      toast.error('Image size must be less than 10MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      if (type === 'before') {
        setBeforeImage(file);
        setBeforePreview(reader.result as string);
      } else {
        setAfterImage(file);
        setAfterPreview(reader.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!beforeImage || !afterImage) {
      toast.error('Please select both before and after images');
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('images', beforeImage);
      formData.append('images', afterImage);
      formData.append('salonId', salonId);
      if (serviceId) formData.append('serviceId', serviceId);
      if (caption) formData.append('caption', caption);

      const res = await fetch('/api/before-after/upload', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Upload failed');
      }

      const data = await res.json();
      toast.success(data.message || 'Before/After photos uploaded successfully! Awaiting admin approval.');
      
      // Reset form
      setBeforeImage(null);
      setAfterImage(null);
      setBeforePreview(null);
      setAfterPreview(null);
      setCaption('');
      setServiceId('');
      
      onUploadComplete();
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Failed to upload photos');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>Upload Before & After Photos</h3>
        <p className={styles.subtitle}>
          Showcase your amazing transformations. Photos require admin approval before appearing publicly.
        </p>
      </div>

      <div className={styles.uploadGrid}>
        {/* Before Image */}
        <div className={styles.uploadBox}>
          <h4 className={styles.boxTitle}>Before</h4>
          {beforePreview ? (
            <div className={styles.preview}>
              <Image src={beforePreview} alt="Before preview" fill className={styles.previewImage} />
              <button
                onClick={() => {
                  setBeforeImage(null);
                  setBeforePreview(null);
                }}
                className={styles.removeButton}
                type="button"
              >
                ×
              </button>
            </div>
          ) : (
            <button
              onClick={() => beforeInputRef.current?.click()}
              className={styles.uploadButton}
              type="button"
            >
              <span className={styles.uploadIcon}>📷</span>
              <span>Select Before Image</span>
            </button>
          )}
          <input
            ref={beforeInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => e.target.files?.[0] && handleImageSelect(e.target.files[0], 'before')}
            className={styles.fileInput}
          />
        </div>

        {/* After Image */}
        <div className={styles.uploadBox}>
          <h4 className={styles.boxTitle}>After</h4>
          {afterPreview ? (
            <div className={styles.preview}>
              <Image src={afterPreview} alt="After preview" fill className={styles.previewImage} />
              <button
                onClick={() => {
                  setAfterImage(null);
                  setAfterPreview(null);
                }}
                className={styles.removeButton}
                type="button"
              >
                ×
              </button>
            </div>
          ) : (
            <button
              onClick={() => afterInputRef.current?.click()}
              className={styles.uploadButton}
              type="button"
            >
              <span className={styles.uploadIcon}>✨</span>
              <span>Select After Image</span>
            </button>
          )}
          <input
            ref={afterInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => e.target.files?.[0] && handleImageSelect(e.target.files[0], 'after')}
            className={styles.fileInput}
          />
        </div>
      </div>

      <div className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="service" className={styles.label}>
            Link to Service (Optional)
          </label>
          <select
            id="service"
            value={serviceId}
            onChange={(e) => setServiceId(e.target.value)}
            className={styles.select}
          >
            <option value="">No service selected</option>
            {services.map((service) => (
              <option key={service.id} value={service.id}>
                {service.title}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="caption" className={styles.label}>
            Caption (Optional)
          </label>
          <textarea
            id="caption"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Describe the transformation..."
            className={styles.textarea}
            rows={3}
            maxLength={200}
          />
          <span className={styles.charCount}>{caption.length}/200</span>
        </div>

        <button
          onClick={handleUpload}
          disabled={!beforeImage || !afterImage || isUploading}
          className={styles.submitButton}
        >
          {isUploading ? 'Uploading...' : 'Upload Photos'}
        </button>
      </div>
    </div>
  );
}
