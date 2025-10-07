'use client';

import { useState, useEffect, FormEvent } from 'react';
import { Salon } from '@/types';
import styles from './EditSalonModal.module.css';
import { toast } from 'react-toastify';
import { FaTimes } from 'react-icons/fa';
import { uploadToCloudinary } from '@/utils/cloudinary';

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
  const [backgroundImage, setBackgroundImage] = useState<File | null>(null);
  const [heroImages, setHeroImages] = useState<File[]>([]);
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
    }
  }, [salon]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    setError('');
    
    try {
      let backgroundImageUrl = salon.backgroundImage;
      if (backgroundImage) {
        backgroundImageUrl = await uploadToCloudinary(backgroundImage);
      }

      const heroImageUrls = await Promise.all(
        heroImages.map(file => uploadToCloudinary(file))
      );
      
      const res = await fetch(`/api/salons/mine`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ 
            ...formData,
            backgroundImage: backgroundImageUrl,
            ...(heroImageUrls.length > 0 && { heroImages: heroImageUrls }),
        }),
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
              <textarea id="description" name="description" value={formData.description} onChange={handleChange} required className={styles.textarea} />
            </div>

            <div className={styles.grid}>
              <div>
                <label htmlFor="address" className={styles.label}>Street Address</label>
                <input type="text" id="address" name="address" value={formData.address} onChange={handleChange} required className={styles.input} />
              </div>
               <div>
                <label htmlFor="town" className={styles.label}>Town/Suburb</label>
                <input type="text" id="town" name="town" value={formData.town} onChange={handleChange} required className={styles.input} />
              </div>
              <div>
                <label htmlFor="city" className={styles.label}>City</label>
                <input type="text" id="city" name="city" value={formData.city} onChange={handleChange} required className={styles.input} />
              </div>
              <div>
                <label htmlFor="province" className={styles.label}>Province</label>
                <input type="text" id="province" name="province" value={formData.province} onChange={handleChange} required className={styles.input} />
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
                    <input type="file" className={styles.fileInput} onChange={(e) => setBackgroundImage(e.target.files ? e.target.files[0] : null)} />
                    {salon.backgroundImage && <img src={salon.backgroundImage} alt="background" className={styles.imagePreview}/>}
                </div>
                <div className={styles.imageUploadSection}>
                    <label className={styles.label}>Hero Images (up to 4)</label>
                    <input type="file" multiple className={styles.fileInput} onChange={(e) => setHeroImages(Array.from(e.target.files || []))} />
                    <div className={styles.heroPreview}>
                      {/* You can add a preview of newly selected hero images here if you wish */}
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