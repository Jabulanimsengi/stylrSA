// frontend/srcs/components/EditSalonModal.tsx

'use client';

import { useState, useEffect, FormEvent } from 'react';
import Image from 'next/image';
import { Salon } from '@/types';
import styles from './EditSalonModal.module.css';
import { toast } from 'react-toastify';
import { showError, toFriendlyMessage } from '@/lib/errors';
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
    latitude: '' as any,
    longitude: '' as any,
  });

  const [backgroundImageFile, setBackgroundImageFile] = useState<File | null>(null);
  const [heroImageFiles, setHeroImageFiles] = useState<File[]>([]);
  const [backgroundImagePreview, setBackgroundImagePreview] = useState<string | null>(null);
  const [heroImagesPreview, setHeroImagesPreview] = useState<string[]>([]);
  
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [addrQuery, setAddrQuery] = useState('');
  const [addrSuggestions, setAddrSuggestions] = useState<any[]>([]);
  const [showAddrSuggestions, setShowAddrSuggestions] = useState(false);

  const days = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
  const [hours, setHours] = useState<Record<string, { open: string; close: string; isOpen: boolean }>>(
    Object.fromEntries(days.map(d => [d, { open: '09:00', close: '17:00', isOpen: true }])) as Record<string, { open: string; close: string; isOpen: boolean }>
  );

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
        latitude: (salon.latitude as any) ?? '' as any,
        longitude: (salon.longitude as any) ?? '' as any,
      });
      setBackgroundImagePreview(salon.backgroundImage || null);
      setHeroImagesPreview(salon.heroImages || []);

      const rawHours = salon.operatingHours as unknown;
      let hoursRecord: Record<string, string> | null = null;
      if (Array.isArray(rawHours)) {
        const derived: Record<string, string> = {};
        rawHours.forEach((entry: { day?: string; open?: string; close?: string }) => {
          if (!entry?.day) return;
          const open = entry.open ?? '';
          const close = entry.close ?? '';
          if (!open && !close) return;
          derived[entry.day] = `${open} - ${close}`.trim();
        });
        hoursRecord = Object.keys(derived).length > 0 ? derived : null;
      } else if (rawHours && typeof rawHours === 'object') {
        hoursRecord = rawHours as Record<string, string>;
      }

      const nextHours: Record<string, { open: string; close: string; isOpen: boolean }> = {} as any;
      days.forEach((d) => {
        const val = hoursRecord?.[d];
        if (val && typeof val === 'string') {
          const match = val.match(/(\d{1,2}:\d{2}).*(\d{1,2}:\d{2})/);
          const open = match?.[1] || '09:00';
          const close = match?.[2] || '17:00';
          nextHours[d] = { open, close, isOpen: true };
        } else {
          nextHours[d] = { open: '09:00', close: '17:00', isOpen: false };
        }
      });
      setHours(nextHours);
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

      const isValidUrl = (value: string) => {
        try { new URL(value); return true; } catch { return false; }
      };

      const cleanedWhatsapp = (formData.whatsapp || '').replace(/\D+/g, '');
      const websiteValue = formData.website?.trim();

      // Validate payload (partial allowed)
      const payload = {
        ...formData,
        whatsapp: cleanedWhatsapp || undefined,
        website: websiteValue && isValidUrl(websiteValue) ? websiteValue : undefined,
        backgroundImage: finalBackgroundImageUrl,
        heroImages: finalHeroImageUrls,
        latitude: (formData as any).latitude !== '' ? Number((formData as any).latitude) : undefined,
        longitude: (formData as any).longitude !== '' ? Number((formData as any).longitude) : undefined,
      } as any;
      // Compose operatingHours as array entries compatible with backend DTO
      const hoursArray = days.map((d) => ({
        day: d,
        open: hours[d].isOpen ? hours[d].open : null,
        close: hours[d].isOpen ? hours[d].close : null,
      }));
      payload.operatingHours = hoursArray;
      payload.operatingDays = hoursArray.filter(h => h.open && h.close).map((entry) => entry.day);

      // Normalize mobileFee number
      if (payload.bookingType !== 'ONSITE') {
        const feeNum = Number(payload.mobileFee);
        payload.mobileFee = Number.isFinite(feeNum) && feeNum >= 0 ? feeNum : 0;
        payload.offersMobile = true;
      } else {
        payload.offersMobile = false;
      }
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
        let errData: any = null;
        try { errData = await res.json(); } catch {}
        throw errData || new Error('Failed to update salon');
      }

      const updatedSalon = await res.json();
      toast.success('Salon profile updated!');
      onSalonUpdate(updatedSalon);
      onClose();

    } catch (error: any) {
      const msg = toFriendlyMessage(error, 'Could not update salon profile.');
      setError(msg);
      toast.error(msg);
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
            <h3 className={styles.subheading}>Location</h3>
            <div className={styles.grid}>
              <div className={styles.fullWidth}>
                <label htmlFor="addrQuery" className={styles.label}>Find on Map</label>
                <input
                  id="addrQuery"
                  type="text"
                  value={addrQuery}
                  onChange={(e) => {
                    const v = e.target.value;
                    setAddrQuery(v);
                    if (v.trim().length > 2) {
                      const q = encodeURIComponent(v);
                      fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${q}&addressdetails=1&limit=5`)
                        .then((r) => (r.ok ? r.json() : []))
                        .then((data) => { setAddrSuggestions(data); setShowAddrSuggestions(true); })
                        .catch(() => {});
                    } else {
                      setAddrSuggestions([]);
                      setShowAddrSuggestions(false);
                    }
                  }}
                  placeholder="Type an address, suburb, or landmark"
                  className={styles.input}
                />
                {showAddrSuggestions && addrSuggestions.length > 0 && (
                  <ul style={{ position: 'absolute', zIndex: 10, background: 'var(--color-surface-elevated)', border: '1px solid var(--color-border)', borderRadius: 6, marginTop: 4, width: 'min(520px, 95vw)', listStyle: 'none', padding: 0 }}
                      onMouseLeave={() => setShowAddrSuggestions(false)}>
                    {addrSuggestions.map((s: any) => (
                      <li key={s.place_id} style={{ padding: '8px 10px', cursor: 'pointer' }}
                          onClick={() => {
                            setFormData((prev: any) => ({ ...prev, address: s.display_name, latitude: s.lat, longitude: s.lon }));
                            setAddrQuery(s.display_name);
                            setShowAddrSuggestions(false);
                          }}>
                        {s.display_name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div>
                <label className={styles.label}>Latitude</label>
                <input type="number" step="any" value={(formData as any).latitude} onChange={(e) => setFormData((p: any) => ({ ...p, latitude: e.target.value }))} className={styles.input} />
              </div>
              <div>
                <label className={styles.label}>Longitude</label>
                <input type="number" step="any" value={(formData as any).longitude} onChange={(e) => setFormData((p: any) => ({ ...p, longitude: e.target.value }))} className={styles.input} />
              </div>
              {(formData as any).latitude && (formData as any).longitude && (
                <div className={styles.fullWidth}>
                  <div style={{ border: '1px solid var(--color-border)', borderRadius: 8, overflow: 'hidden' }}>
                    <iframe
                      width="100%"
                      height="220"
                      style={{ border: 0 }}
                      loading="lazy"
                      src={`https://www.openstreetmap.org/export/embed.html?bbox=${Number((formData as any).longitude)-0.01},${Number((formData as any).latitude)-0.01},${Number((formData as any).longitude)+0.01},${Number((formData as any).latitude)+0.01}&layer=mapnik&marker=${(formData as any).latitude},${(formData as any).longitude}`}
                    />
                  </div>
                </div>
              )}
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
          <h3 className={styles.subheading}>Service Type</h3>
          <div className={styles.grid}>
            <div>
              <label htmlFor="bookingType" className={styles.label}>Service Type</label>
              <select id="bookingType" name="bookingType" value={formData.bookingType} onChange={handleChange} className={styles.input}>
                <option value="ONSITE">On site</option>
                <option value="MOBILE">Off site (mobile)</option>
                <option value="BOTH">Both on site and off site</option>
              </select>
            </div>
            {(formData.bookingType === 'MOBILE' || formData.bookingType === 'BOTH') && (
              <div>
                <label htmlFor="mobileFee" className={styles.label}>Mobile Fee (R)</label>
                <input type="number" id="mobileFee" name="mobileFee" min={0} step="0.01" value={formData.mobileFee} onChange={handleChange} className={styles.input} />
              </div>
            )}
          </div>

          <h3 className={styles.subheading}>Operating Hours</h3>
          <div className={styles.grid}>
            <div className={styles.fullWidth}>
              <div style={{display:'flex',gap:'0.5rem',alignItems:'center',marginBottom:8}}>
                <span style={{minWidth:120,fontWeight:600}}>Apply to all</span>
                <input type="time" value={hours['Monday'].open} onChange={(e)=>{
                  const v=e.target.value; setHours(prev=>{ const next={...prev}; days.forEach(d=>next[d]={...next[d],open:v}); return next;});
                }} className={styles.input} style={{maxWidth:160}} />
                <span>to</span>
                <input type="time" value={hours['Monday'].close} onChange={(e)=>{
                  const v=e.target.value; setHours(prev=>{ const next={...prev}; days.forEach(d=>next[d]={...next[d],close:v}); return next;});
                }} className={styles.input} style={{maxWidth:160}} />
                <input type="checkbox" checked={Object.values(hours).every(h => h.isOpen)} onChange={(e) => {
                  const isOpen = e.target.checked;
                  setHours(prev => {
                    const next = {...prev};
                    days.forEach(d => next[d] = {...next[d], isOpen});
                    return next;
                  });
                }} />
              </div>
              <div style={{display:'grid',gap:8}}>
                {days.map((d)=> (
                  <div key={d} style={{display:'flex',gap:'0.5rem',alignItems:'center'}}>
                    <input type="checkbox" checked={hours[d].isOpen} onChange={(e) => setHours(prev => ({...prev, [d]: {...prev[d], isOpen: e.target.checked}}))} />
                    <span style={{minWidth:120}}>{d}</span>
                    <input type="time" value={hours[d].open} disabled={!hours[d].isOpen} onChange={(e)=> setHours(prev=> ({...prev,[d]:{...prev[d],open:e.target.value}}))} className={styles.input} style={{maxWidth:160}} />
                    <span>to</span>
                    <input type="time" value={hours[d].close} disabled={!hours[d].isOpen} onChange={(e)=> setHours(prev=> ({...prev,[d]:{...prev[d],close:e.target.value}}))} className={styles.input} style={{maxWidth:160}} />
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