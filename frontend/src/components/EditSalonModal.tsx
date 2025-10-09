// frontend/srcs/components/EditSalonModal.tsx

'use client';

import { useState, useEffect, FormEvent } from 'react';
import Image from 'next/image';
import { Salon } from '@/types';
import styles from './EditSalonModal.module.css';
import { toast } from 'react-toastify';
import { FaTimes } from 'react-icons/fa';
import { uploadToCloudinary } from '@/utils/cloudinary';
import { SalonUpdateSchema } from '@/lib/validation/schemas';

interface EditSalonModalProps {
  salon: Salon;
  onClose: () => void;
  onSalonUpdate: (updatedSalon: Salon) => void;
}

export default function EditSalonModal({ salon, onClose, onSalonUpdate }: EditSalonModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    province: '',
    city: '',
    town: '',
    address: '',
    bookingType: 'ONSITE',
    mobileFee: 0,
    operatingHours: {},
    contactEmail: '',
    phoneNumber: '',
    whatsapp: '',
    website: '',
  });

  const [backgroundImageFile, setBackgroundImageFile] = useState<File | null>(null);
  const [heroImageFiles, setHeroImageFiles] = useState<File[]>([]);
  const [backgroundImagePreview, setBackgroundImagePreview] = useState<string | null>(null);
  const [heroImagesPreview, setHeroImagesPreview] = useState<string[]>([]);
  
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (salon) {
      setFormData({
        name: salon.name || '',
        description: salon.description || '',
        province: salon.province || '',
        city: salon.city || '',
        town: salon.town || '',
        address: salon.address || '',
        bookingType: salon.bookingType || 'ONSITE',
        mobileFee: salon.mobileFee || 0,
        operatingHours: salon.operatingHours || {},
        contactEmail: salon.contactEmail || '',
        phoneNumber: salon.phoneNumber || '',
        whatsapp: salon.whatsapp || '',
        website: salon.website || '',
      });
      setBackgroundImagePreview(salon.backgroundImage || null);
      setHeroImagesPreview(salon.heroImages || []);
    }
  }, [salon]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (!files) return;

    if (name === 'backgroundImage' && files[0]) {
      const file = files[0];
      setBackgroundImageFile(file);
      if (backgroundImagePreview && backgroundImagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(backgroundImagePreview);
      }
      setBackgroundImagePreview(URL.createObjectURL(file));
    } else if (name === 'heroImages') {
      const newFiles = Array.from(files);
      setHeroImageFiles(prevFiles => [...prevFiles, ...newFiles]);
      const newPreviews = newFiles.map(file => URL.createObjectURL(file));
      setHeroImagesPreview(prevPreviews => [...prevPreviews, ...newPreviews]);
    }
  };

  const handleDeleteImage = (imageUrlToDelete: string, imageType: 'background' | 'hero') => {
    if (imageType === 'background') {
      setBackgroundImageFile(null);
      setBackgroundImagePreview(null);
    } else {
      const updatedPreviews = heroImagesPreview.filter(img => img !== imageUrlToDelete);
      setHeroImagesPreview(updatedPreviews);

      if (imageUrlToDelete.startsWith('blob:')) {
        const indexToRemove = heroImagesPreview.findIndex(p => p === imageUrlToDelete);
        const existingImagesCount = heroImagesPreview.filter(p => !p.startsWith('blob:')).length;
        const fileIndexToRemove = indexToRemove - existingImagesCount;

        if (fileIndexToRemove >= 0 && fileIndexToRemove < heroImageFiles.length) {
            setHeroImageFiles(prevFiles => prevFiles.filter((_, i) => i !== fileIndexToRemove));
        }
      }
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    setError('');

    try {
      let finalBackgroundImageUrl = backgroundImagePreview;
      if (backgroundImageFile && backgroundImagePreview?.startsWith('blob:')) {
        // Upload and extract the secure_url
        const uploaded = await uploadToCloudinary(backgroundImageFile);
        finalBackgroundImageUrl = uploaded.secure_url;
      }

      const existingHeroImageUrls = heroImagesPreview.filter(p => !p.startsWith('blob:'));
      
      // Corrected hero images upload
      const newHeroImageUrls = (
        await Promise.all(heroImageFiles.map(file => uploadToCloudinary(file)))
      ).map(r => r.secure_url);
      
      const finalHeroImageUrls = [...existingHeroImageUrls, ...newHeroImageUrls];

      // Validate payload (partial allowed)
      const payload = {
        ...formData,
        backgroundImage: finalBackgroundImageUrl,
        heroImages: finalHeroImageUrls,
      };
      const parsed = SalonUpdateSchema.partial().safeParse(payload);
      if (!parsed.success) {
        throw new Error(parsed.error.issues?.[0]?.message || 'Invalid form data');
      }

      const res = await fetch(`/api/salons/mine?ownerId=${salon.ownerId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(parsed.data),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Failed to update salon');
      }

      const updatedSalon = await res.json();
      toast.success('Salon profile updated!');
      onSalonUpdate(updatedSalon);
      onClose();

    } catch (error: any) {
      setError(error.message);
      toast.error(error.message || 'Could not update salon profile.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2 className={styles.title}>Edit Salon Profile</h2>
        <button onClick={onClose} className={styles.closeButton}><FaTimes /></button>
        
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formScrollableContent}>
            {error && <p className={styles.errorMessage}>{error}</p>}
            
            <div className={styles.fullWidth}>
              <label htmlFor="name" className={styles.label}>Salon Name</label>
              <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required className={styles.input} />
            </div>
            <div className={styles.fullWidth}>
              <label htmlFor="description" className={styles.label}>Description</label>
              <textarea id="description" name="description" value={formData.description} onChange={handleChange} className={styles.textarea} />
            </div>
            <div className={styles.grid}>
              <div>
                <label htmlFor="address" className={styles.label}>Street Address</label>
                <input type="text" id="address" name="address" value={formData.address} onChange={handleChange} className={styles.input} />
              </div>
              <div>
                <label htmlFor="town" className={styles.label}>Town/Suburb</label>
                <input type="text" id="town" name="town" value={formData.town} onChange={handleChange} className={styles.input} />
              </div>
              <div>
                <label htmlFor="city" className={styles.label}>City</label>
                <input type="text" id="city" name="city" value={formData.city} onChange={handleChange} className={styles.input} />
              </div>
              <div>
                <label htmlFor="province" className={styles.label}>Province</label>
                <input type="text" id="province" name="province" value={formData.province} onChange={handleChange} className={styles.input} />
              </div>
            </div>
            <h3 className={styles.subheading}>Contact Information</h3>
            <div className={styles.grid}>
                <div>
                    <label htmlFor="phoneNumber" className={styles.label}>Phone Number</label>
                    <input type="tel" id="phoneNumber" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} className={styles.input} />
                </div>
                <div>
                    <label htmlFor="contactEmail" className={styles.label}>Contact Email</label>
                    <input type="email" id="contactEmail" name="contactEmail" value={formData.contactEmail} onChange={handleChange} className={styles.input} />
                </div>
                <div>
                    <label htmlFor="website" className={styles.label}>Website</label>
                    <input type="text" id="website" name="website" value={formData.website} onChange={handleChange} placeholder="https://example.com" className={styles.input} />
                </div>
                <div>
                    <label htmlFor="whatsapp" className={styles.label}>WhatsApp Number</label>
                    <input type="tel" id="whatsapp" name="whatsapp" value={formData.whatsapp} onChange={handleChange} className={styles.input} />
                </div>
            </div>
            
            <h3 className={styles.subheading}>Images</h3>
            <div className={styles.grid}>
              <div className={styles.imageUploadSection}>
                <label className={styles.label}>Background Image</label>
                <input type="file" name="backgroundImage" className={styles.fileInput} onChange={handleFileChange} accept="image/*" />
                <div className={styles.imagePreviewContainer}>
                  {backgroundImagePreview && (
                    <div className={styles.imageWrapper}>
                      <Image
                        src={backgroundImagePreview}
                        alt="Background Preview"
                        className={styles.imagePreview}
                        width={200}
                        height={160}
                      />
                      <button type="button" className={styles.deleteButton} onClick={() => handleDeleteImage(backgroundImagePreview, 'background')}>×</button>
                    </div>
                  )}
                </div>
              </div>
              <div className={styles.imageUploadSection}>
                <label className={styles.label}>Hero Images</label>
                <input type="file" name="heroImages" multiple className={styles.fileInput} onChange={handleFileChange} accept="image/*" />
                <div className={styles.imagePreviewContainer}>
                  {heroImagesPreview.map((src, index) => (
                    <div key={src} className={styles.imageWrapper}>
                      <Image
                        src={src}
                        alt={`Hero Preview ${index + 1}`}
                        className={styles.imagePreview}
                        width={200}
                        height={160}
                      />
                      <button type="button" className={styles.deleteButton} onClick={() => handleDeleteImage(src, 'hero')}>×</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className={styles.buttonContainer}>
            <button type="button" onClick={onClose} className={styles.cancelButton}>
              Cancel
            </button>
            <button type="submit" className={styles.saveButton} disabled={isUploading}>
              {isUploading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}