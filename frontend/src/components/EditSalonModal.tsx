'use client';

import React, { useState, FormEvent } from 'react'; // Added React import
import { Salon } from '@/types';
import styles from './EditSalonModal.module.css';
import { toast } from 'react-toastify';

interface EditSalonModalProps {
  salon: Salon;
  onClose: () => void;
  onSave: (updatedSalon: Salon) => void;
}

const WEEKDAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

export default function EditSalonModal({ salon, onClose, onSave }: EditSalonModalProps) {
  const [formData, setFormData] = useState({
    name: salon.name || '',
    province: salon.province || '',
    city: salon.city || '',
    town: salon.town || '',
    bookingType: salon.bookingType || 'ONSITE',
    mobileFee: salon.mobileFee || 0,
    operatingHours: salon.operatingHours || {},
  });
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const handleHoursChange = (day: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      operatingHours: {
        ...prev.operatingHours,
        [day]: value,
      }
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!file) return null;

    const token = localStorage.getItem('access_token');
    const sigRes = await fetch('http://localhost:3000/api/cloudinary/signature', { headers: { Authorization: `Bearer ${token}` } });
    if (!sigRes.ok) throw new Error('Could not get upload permission.');
    
    const { signature, timestamp } = await sigRes.json();
    const url = `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`;
    
    const uploadFormData = new FormData();
    uploadFormData.append('file', file);
    uploadFormData.append('api_key', process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY as string);
    uploadFormData.append('timestamp', String(timestamp));
    uploadFormData.append('signature', signature);

    const uploadRes = await fetch(url, { method: 'POST', body: uploadFormData });
    if (!uploadRes.ok) throw new Error('Image upload failed.');
    
    const uploadData = await uploadRes.json();
    return uploadData.secure_url;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    const token = localStorage.getItem('access_token');

    try {
      let finalData: any = { ...formData };
      
      if (file) {
        const imageUrl = await uploadImage();
        finalData.backgroundImage = imageUrl;
      }
      
      finalData.operatingDays = Object.keys(finalData.operatingHours).filter(
        day => finalData.operatingHours[day] && finalData.operatingHours[day].toLowerCase() !== 'closed'
      );

      const res = await fetch('http://localhost:3000/api/salons/mine', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(finalData),
      });

      if (!res.ok) throw new Error('Failed to update profile.');
      
      const updatedSalon = await res.json();
      toast.success('Profile updated successfully!');
      onSave(updatedSalon);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2 className={styles.title}>Edit Salon Profile</h2>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.grid}>
            <div className={styles.fullWidth}>
              <label className={styles.label}>Salon Name</label>
              <input name="name" value={formData.name} onChange={handleChange} className={styles.input} />
            </div>
            <div>
              <label className={styles.label}>Province</label>
              <input name="province" value={formData.province} onChange={handleChange} className={styles.input} />
            </div>
            <div>
              <label className={styles.label}>City</label>
              <input name="city" value={formData.city} onChange={handleChange} className={styles.input} />
            </div>
            <div>
              <label className={styles.label}>Service Type</label>
              <select name="bookingType" value={formData.bookingType} onChange={handleChange} className={styles.select}>
                <option value="ONSITE">On-Site Only</option>
                <option value="MOBILE">Mobile Only</option>
                <option value="BOTH">Both On-Site & Mobile</option>
              </select>
            </div>
            <div>
              <label className={styles.label}>Mobile Fee (R)</label>
              <input name="mobileFee" type="number" value={formData.mobileFee} onChange={handleChange} className={styles.input} 
                disabled={formData.bookingType === 'ONSITE'}
              />
            </div>
            <div className={styles.fullWidth}>
              <label className={styles.label}>Background Image (for listing cards)</label>
              <input type="file" accept="image/*" onChange={handleFileChange} />
              {(file || salon.backgroundImage) && (
                <img src={file ? URL.createObjectURL(file) : salon.backgroundImage!} alt="Profile preview" 
                  style={{ width: '200px', height: '100px', objectFit: 'cover', marginTop: '1rem', borderRadius: '0.5rem' }} />
              )}
            </div>
          </div>

          <h3 className={styles.subheading}>Operating Hours</h3>
          <div className={styles.hoursGrid}>
            {WEEKDAYS.map(day => (
              <React.Fragment key={day}>
                <label className={styles.label}>{day.charAt(0).toUpperCase() + day.slice(1)}</label>
                <input
                  type="text"
                  placeholder="e.g., 9am - 5pm or Closed"
                  value={formData.operatingHours[day] || ''}
                  onChange={(e) => handleHoursChange(day, e.target.value)}
                  className={styles.input}
                />
              </React.Fragment>
            ))}
          </div>

          {error && <p className={styles.errorMessage}>{error}</p>}
          <div className={styles.buttonContainer}>
            <button type="button" onClick={onClose} className={styles.cancelButton}>Cancel</button>
            <button type="submit" disabled={isLoading} className={styles.saveButton}>
              {isLoading ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}