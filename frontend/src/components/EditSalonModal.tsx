'use client';

import React, { useState, FormEvent, useEffect } from 'react';
import { Salon } from '@/types';
import styles from './EditSalonModal.module.css';
import { toast } from 'react-toastify';

interface EditSalonModalProps {
  salon: Salon;
  onClose: () => void;
  onSave: (updatedSalon: Salon) => void;
}

const WEEKDAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

const TimePicker = ({ value, onChange }: { value: string, onChange: (value: string) => void }) => {
  const hours = Array.from({ length: 15 }, (_, i) => i + 7); // 7am to 9pm
  const minutes = ['00', '30'];

  return (
    <select
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      className={styles.input}
    >
      <option value="">Closed</option>
      {hours.map(h => 
        minutes.map(m => {
          const time = `${String(h).padStart(2, '0')}:${m}`;
          const displayHour = h > 12 ? h - 12 : h;
          const ampm = h >= 12 ? 'PM' : 'AM';
          return <option key={time} value={time}>{`${displayHour}:${m} ${ampm}`}</option>;
        })
      )}
    </select>
  );
};

export default function EditSalonModal({ salon, onClose, onSave }: EditSalonModalProps) {
  const [formData, setFormData] = useState({
    name: salon.name || '',
    province: salon.province || '',
    city: salon.city || '',
    town: salon.town || '',
    bookingType: salon.bookingType || 'ONSITE',
    mobileFee: salon.mobileFee || '',
    operatingHours: salon.operatingHours || {},
    contactEmail: salon.contactEmail || '',
    phoneNumber: salon.phoneNumber || '',
    whatsapp: salon.whatsapp || '',
    website: salon.website || '',
  });
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const isNewSalon = !salon.id;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  
  const handleHoursChange = (day: string, field: 'open' | 'close', value: string) => {
    setFormData(prev => {
        const currentHours = prev.operatingHours[day] === 'Closed' ? '' : prev.operatingHours[day] || '';
        let [open, close] = currentHours.split(' - ');

        if (field === 'open') {
            open = value;
        } else {
            close = value;
        }

        if (!value) {
            return {
                ...prev,
                operatingHours: {
                    ...prev.operatingHours,
                    [day]: 'Closed',
                }
            };
        }

        const newHours = `${open || ''} - ${close || ''}`;

        return {
            ...prev,
            operatingHours: {
                ...prev.operatingHours,
                [day]: newHours,
            }
        };
    });
  };

  const handleApplyToAll = () => {
    const mondayHours = formData.operatingHours['monday'];
    if (!mondayHours || mondayHours === 'Closed') {
      toast.info("Please set Monday's hours first.");
      return;
    }
    const newOperatingHours = { ...formData.operatingHours };
    WEEKDAYS.forEach(day => {
      newOperatingHours[day] = mondayHours;
    });
    setFormData(prev => ({ ...prev, operatingHours: newOperatingHours }));
    toast.success("Monday's hours applied to all days!");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!file) return null;

    if (!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || !process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY) {
      throw new Error("Cloudinary environment variables are not configured.");
    }
    
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
      let finalData: any = { 
        ...formData,
        mobileFee: parseFloat(String(formData.mobileFee)) || null,
        // FIX: Convert empty string to null for website to pass validation
        website: formData.website === '' ? null : formData.website,
      };
      
      if (file) {
        const imageUrl = await uploadImage();
        finalData.backgroundImage = imageUrl;
      }
      
      finalData.operatingDays = Object.keys(finalData.operatingHours).filter(
        day => finalData.operatingHours[day] && finalData.operatingHours[day].toLowerCase().trim() !== 'closed'
      );
      
      const apiEndpoint = isNewSalon ? 'http://localhost:3000/api/salons' : 'http://localhost:3000/api/salons/mine';
      const method = isNewSalon ? 'POST' : 'PATCH';

      const res = await fetch(apiEndpoint, {
        method: method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(finalData),
      });

      if (!res.ok) {
        const errData = await res.json();
        // Provide a more specific error for validation issues
        if (Array.isArray(errData.message)) {
          throw new Error(errData.message.join(', '));
        }
        throw new Error(errData.message || `Failed to ${isNewSalon ? 'create' : 'update'} profile.`);
      }
      
      const savedSalon = await res.json();
      toast.success(`Profile ${isNewSalon ? 'created and submitted for approval!' : 'update submitted for re-approval!'}`);
      onSave(savedSalon);

    } catch (err: any) {
      setError(err.message);
      toast.error(err.message || `Failed to ${isNewSalon ? 'create' : 'update'} profile.`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2 className={styles.title}>{isNewSalon ? 'Create Your Salon Profile' : 'Edit Salon Profile'}</h2>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formScrollableContent}>
            <div className={styles.grid}>
              <div className={styles.fullWidth}>
                <label className={styles.label}>Salon Name</label>
                <input name="name" value={formData.name} onChange={handleChange} className={styles.input} required />
              </div>
              <div>
                <label className={styles.label}>Province</label>
                <input name="province" value={formData.province} onChange={handleChange} className={styles.input} required />
              </div>
              <div>
                <label className={styles.label}>City</label>
                <input name="city" value={formData.city} onChange={handleChange} className={styles.input} required />
              </div>
              <div>
                <label className={styles.label}>Town/Suburb</label>
                <input name="town" value={formData.town} onChange={handleChange} className={styles.input} required />
              </div>
               <div>
                <label className={styles.label}>Contact Email</label>
                <input name="contactEmail" type="email" value={formData.contactEmail} onChange={handleChange} className={styles.input} />
              </div>
               <div>
                <label className={styles.label}>Phone Number</label>
                <input name="phoneNumber" type="tel" value={formData.phoneNumber} onChange={handleChange} className={styles.input} />
              </div>
              <div>
                <label className={styles.label}>WhatsApp Number</label>
                <input name="whatsapp" type="tel" value={formData.whatsapp} onChange={handleChange} className={styles.input} />
              </div>
              <div>
                <label className={styles.label}>Website URL</label>
                <input name="website" type="url" placeholder="https://example.com" value={formData.website} onChange={handleChange} className={styles.input} />
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

            <div className={styles.subheadingContainer}>
                <h3 className={styles.subheading}>Operating Hours</h3>
                <button type="button" onClick={handleApplyToAll} className={styles.applyAllButton}>
                  Apply to All Days
                </button>
            </div>
            <div className={styles.hoursGrid}>
              {WEEKDAYS.map(day => {
                  const [open, close] = (formData.operatingHours[day] === 'Closed' ? ['',''] : (formData.operatingHours[day] || ' - ').split(' - '));
                  return (
                    <React.Fragment key={day}>
                      <label className={styles.label}>{day.charAt(0).toUpperCase() + day.slice(1)}</label>
                      <div className={styles.timeRange}>
                        <TimePicker value={open} onChange={value => handleHoursChange(day, 'open', value)} />
                        <span>-</span>
                        <TimePicker value={close} onChange={value => handleHoursChange(day, 'close', value)} />
                      </div>
                    </React.Fragment>
                  );
              })}
            </div>
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