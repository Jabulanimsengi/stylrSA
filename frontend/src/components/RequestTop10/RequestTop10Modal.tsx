'use client';

import { useState, useRef, useEffect } from 'react';
import styles from './RequestTop10.module.css';

const SERVICE_CATEGORIES = [
  { id: 'hair-salon', name: 'Hair Salon', icon: '💇' },
  { id: 'makeup', name: 'Makeup', icon: '💄' },
  { id: 'nails', name: 'Nails', icon: '💅' },
  { id: 'spa', name: 'Spa', icon: '🧖' },
  { id: 'barber', name: 'Barber', icon: '✂️' },
  { id: 'massage', name: 'Massage', icon: '💆' },
  { id: 'beauty', name: 'Beauty Services', icon: '✨' },
];

interface LocationSuggestion {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  address?: {
    suburb?: string;
    city?: string;
    town?: string;
    state?: string;
    country?: string;
  };
}

interface RequestTop10ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function RequestTop10Modal({ isOpen, onClose }: RequestTop10ModalProps) {
  const [step, setStep] = useState<'category' | 'form'>('category');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form fields
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [serviceNeeded, setServiceNeeded] = useState('');
  const [styleOrLook, setStyleOrLook] = useState('');
  const [budget, setBudget] = useState('');
  const [serviceType, setServiceType] = useState<'onsite' | 'inhouse'>('inhouse');
  const [location, setLocation] = useState('');
  const [locationCoords, setLocationCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredTime, setPreferredTime] = useState('');
  
  // Location autocomplete
  const [locationSuggestions, setLocationSuggestions] = useState<LocationSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const locationInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setStep('category');
      setSelectedCategory(null);
      setSubmitSuccess(false);
      setError(null);
      resetForm();
    }
  }, [isOpen]);

  const resetForm = () => {
    setFullName('');
    setPhone('');
    setWhatsapp('');
    setEmail('');
    setServiceNeeded('');
    setStyleOrLook('');
    setBudget('');
    setServiceType('inhouse');
    setLocation('');
    setLocationCoords(null);
    setPreferredDate('');
    setPreferredTime('');
  };

  // Location autocomplete using OpenStreetMap Nominatim (free)
  const handleLocationChange = async (value: string) => {
    setLocation(value);
    setLocationCoords(null);
    
    if (value.length < 3) {
      setLocationSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      const q = encodeURIComponent(value);
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${q}, South Africa&format=json&limit=5&addressdetails=1`,
        { headers: { 'User-Agent': 'StylRSA' } }
      );
      if (response.ok) {
        const data = await response.json();
        setLocationSuggestions(data || []);
        setShowSuggestions(true);
      }
    } catch {
      // Silently fail - user can still type manually
    }
  };

  const handleSelectLocation = (suggestion: LocationSuggestion) => {
    // Build a clean display name
    const addr = suggestion.address;
    const parts = [
      addr?.suburb || addr?.city || addr?.town,
      addr?.state,
    ].filter(Boolean);
    const displayName = parts.length > 0 ? parts.join(', ') : suggestion.display_name.split(',').slice(0, 2).join(',');
    
    setLocation(displayName);
    setShowSuggestions(false);
    
    // Set coordinates directly from Nominatim response
    if (suggestion.lat && suggestion.lon) {
      setLocationCoords({
        lat: parseFloat(suggestion.lat),
        lng: parseFloat(suggestion.lon),
      });
    }
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(e.target as Node) &&
        locationInputRef.current &&
        !locationInputRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setStep('form');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const categoryName = SERVICE_CATEGORIES.find(c => c.id === selectedCategory)?.name || selectedCategory;

    const requestData = {
      fullName,
      phone,
      whatsapp: whatsapp || undefined,
      email: email || undefined,
      category: categoryName,
      serviceNeeded,
      styleOrLook: styleOrLook || undefined,
      budget,
      serviceType,
      location,
      locationCoords,
      preferredDate,
      preferredTime: preferredTime || undefined,
    };

    try {
      const response = await fetch('/api/top10-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        throw new Error('Failed to submit request');
      }

      setSubmitSuccess(true);
    } catch {
      setError('Failed to submit your request. Please try again or contact us directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const getCategoryName = () => SERVICE_CATEGORIES.find(c => c.id === selectedCategory)?.name || '';

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose} aria-label="Close">
          ×
        </button>

        {submitSuccess ? (
          <div className={styles.successMessage}>
            <div className={styles.successIcon}>✅</div>
            <h2>Request Submitted!</h2>
            <p>
              You will be contacted by the Top 10 {getCategoryName()} providers near you.
              Our admin team will match you within minutes.
            </p>
            <div className={styles.contactInfo}>
              <p>Need faster assistance?</p>
              <p>📱 WhatsApp: <a href="https://wa.me/27738021196">073 802 1196</a></p>
              <p>📧 Email: <a href="mailto:info@stylrsa.co.za">info@stylrsa.co.za</a></p>
            </div>
            <button className={styles.primaryButton} onClick={onClose}>
              Done
            </button>
          </div>
        ) : step === 'category' ? (
          <>
            <div className={styles.header}>
              <h2>Request Top 10 Providers</h2>
              <p className={styles.tagline}>
                Get Matched With the Top 10 Best Service Providers in Your Area
              </p>
            </div>
            <div className={styles.categoryGrid}>
              {SERVICE_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  className={styles.categoryCard}
                  onClick={() => handleCategorySelect(cat.id)}
                >
                  <span className={styles.categoryIcon}>{cat.icon}</span>
                  <span className={styles.categoryName}>{cat.name}</span>
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <div className={styles.header}>
              <button className={styles.backButton} onClick={() => setStep('category')}>
                ← Back
              </button>
              <h2>Request Top 10 {getCategoryName()}</h2>
              <p className={styles.tagline}>
                Fill in your details and we&apos;ll match you with the best providers
              </p>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
              {error && <div className={styles.errorMessage}>{error}</div>}

              <div className={styles.section}>
                <h3>Contact Details</h3>
                <div className={styles.fieldGroup}>
                  <div className={styles.field}>
                    <label htmlFor="fullName">Full Name *</label>
                    <input
                      id="fullName"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Name Surname"
                      required
                    />
                  </div>
                  <div className={styles.field}>
                    <label htmlFor="phone">Phone Number *</label>
                    <input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="081 234 5678"
                      required
                    />
                  </div>
                </div>
                <div className={styles.fieldGroup}>
                  <div className={styles.field}>
                    <label htmlFor="whatsapp">WhatsApp (recommended)</label>
                    <input
                      id="whatsapp"
                      type="tel"
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      placeholder="081 234 5678"
                    />
                  </div>
                  <div className={styles.field}>
                    <label htmlFor="email">Email (optional)</label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                    />
                  </div>
                </div>
              </div>

              <div className={styles.section}>
                <h3>Service Details</h3>
                <div className={styles.field}>
                  <label htmlFor="serviceNeeded">What service do you need? *</label>
                  <input
                    id="serviceNeeded"
                    type="text"
                    value={serviceNeeded}
                    onChange={(e) => setServiceNeeded(e.target.value)}
                    placeholder="e.g., Braids, Gel nails, Full makeup..."
                    required
                  />
                </div>
                <div className={styles.field}>
                  <label htmlFor="styleOrLook">Style or look (optional)</label>
                  <input
                    id="styleOrLook"
                    type="text"
                    value={styleOrLook}
                    onChange={(e) => setStyleOrLook(e.target.value)}
                    placeholder="Describe the style you want..."
                  />
                </div>
                <div className={styles.fieldGroup}>
                  <div className={styles.field}>
                    <label htmlFor="budget">Budget (R) *</label>
                    <input
                      id="budget"
                      type="text"
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      placeholder="e.g., 500 or 300-600"
                      required
                    />
                  </div>
                  <div className={styles.field}>
                    <label>Service Type *</label>
                    <div className={styles.radioGroup}>
                      <label className={styles.radioLabel}>
                        <input
                          type="radio"
                          name="serviceType"
                          value="inhouse"
                          checked={serviceType === 'inhouse'}
                          onChange={() => setServiceType('inhouse')}
                        />
                        <span>Visit Salon</span>
                      </label>
                      <label className={styles.radioLabel}>
                        <input
                          type="radio"
                          name="serviceType"
                          value="onsite"
                          checked={serviceType === 'onsite'}
                          onChange={() => setServiceType('onsite')}
                        />
                        <span>Mobile (come to me)</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.section}>
                <h3>Location & Time</h3>
                <div className={styles.field}>
                  <label htmlFor="location">Your Location *</label>
                  <div className={styles.locationWrapper}>
                    <input
                      ref={locationInputRef}
                      id="location"
                      type="text"
                      value={location}
                      onChange={(e) => handleLocationChange(e.target.value)}
                      onFocus={() => locationSuggestions.length > 0 && setShowSuggestions(true)}
                      placeholder="Start typing your area..."
                      required
                      autoComplete="off"
                    />
                    {showSuggestions && locationSuggestions.length > 0 && (
                      <div ref={suggestionsRef} className={styles.suggestions}>
                        {locationSuggestions.map((s) => {
                          const addr = s.address;
                          const mainText = addr?.suburb || addr?.city || addr?.town || s.display_name.split(',')[0];
                          const secondaryText = [addr?.state, addr?.country].filter(Boolean).join(', ') || s.display_name.split(',').slice(1, 3).join(',');
                          return (
                            <button
                              key={s.place_id}
                              type="button"
                              className={styles.suggestionItem}
                              onClick={() => handleSelectLocation(s)}
                            >
                              <span className={styles.suggestionMain}>
                                {mainText}
                              </span>
                              <span className={styles.suggestionSecondary}>
                                {secondaryText}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
                <div className={styles.fieldGroup}>
                  <div className={styles.field}>
                    <label htmlFor="preferredDate">Preferred Date *</label>
                    <input
                      id="preferredDate"
                      type="date"
                      value={preferredDate}
                      onChange={(e) => setPreferredDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>
                  <div className={styles.field}>
                    <label htmlFor="preferredTime">Preferred Time (optional)</label>
                    <input
                      id="preferredTime"
                      type="time"
                      value={preferredTime}
                      onChange={(e) => setPreferredTime(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className={styles.contactInfo}>
                <p>📱 WhatsApp: <a href="https://wa.me/27738021196">073 802 1196</a></p>
                <p>📧 Email: <a href="mailto:info@stylrsa.co.za">info@stylrsa.co.za</a></p>
              </div>

              <button
                type="submit"
                className={styles.submitButton}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Request My Top 10 Providers'}
              </button>

              <p className={styles.disclaimer}>
                You will be contacted by the Top 10 providers near you. Our admin team will match you within minutes.
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
