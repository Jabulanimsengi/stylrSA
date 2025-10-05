// frontend/src/components/EditSalonModal.tsx
import { useState, useEffect, FormEvent } from 'react';
import { Salon } from '@/types';
import styles from './EditSalonModal.module.css';
import { toast } from 'react-toastify';
import { FaTimes, FaUpload } from 'react-icons/fa';
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

  useEffect(() => {
    if (salon) {
      setFormData({
        name: salon.name || '',
        description: salon.description || '',
        province: salon.province || '',
        city: salon.city || '',
        town: salon.town || '',
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
    try {
      let backgroundImageUrl = salon.backgroundImage;
      if (backgroundImage) {
        backgroundImageUrl = await uploadToCloudinary(backgroundImage);
      }

      const heroImageUrls = await Promise.all(
        heroImages.map(file => uploadToCloudinary(file))
      );
      
      const token = localStorage.getItem('access_token');
      const res = await fetch(`http://localhost:3000/api/salons/mine`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ 
            ...formData,
            backgroundImage: backgroundImageUrl,
            heroImages: heroImageUrls
        }),
      });

      if (!res.ok) throw new Error('Failed to update salon');
      const updatedSalon = await res.json();
      toast.success('Salon profile updated!');
      onSalonUpdate(updatedSalon);
      onClose();
    } catch (error) {
      console.error(error);
      toast.error('Could not update salon profile.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <button onClick={onClose} className={styles.closeButton}><FaTimes /></button>
        <h2>Edit Salon Profile</h2>
        <form onSubmit={handleSubmit} className={styles.form}>
          {/* ... Form fields from the original component ... */}
           <div className={styles.imageUploadSection}>
            <label>Background Image</label>
            <input type="file" onChange={(e) => setBackgroundImage(e.target.files ? e.target.files[0] : null)} />
            {salon.backgroundImage && <img src={salon.backgroundImage} alt="background" style={{width: '100px', marginTop: '10px'}}/>}
          </div>
          <div className={styles.imageUploadSection}>
            <label>Hero Images (up to 4)</label>
            <input type="file" multiple onChange={(e) => setHeroImages(Array.from(e.target.files || []))} />
            <div className={styles.heroPreview}>
                {/* Add preview of hero images */}
            </div>
          </div>
          <button type="submit" className="btn btn-primary" disabled={isUploading}>
            {isUploading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}