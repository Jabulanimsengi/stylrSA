'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import styles from './CreateSalon.module.css';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useAuth } from '@/hooks/useAuth';
import PageNav from '@/components/PageNav';
import { APP_PLANS, PLAN_BY_CODE, PlanCode } from '@/constants/plans';
import { toFriendlyMessage } from '@/lib/errors';
import { logger } from '@/lib/logger';

export default function CreateSalonPage() {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [province, setProvince] = useState('');
  const [town, setTown] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [description, setDescription] = useState('');
  const [bookingType, setBookingType] = useState<'ONSITE'|'MOBILE'|'BOTH'>('ONSITE');
  const [mobileFee, setMobileFee] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<PlanCode>('STARTER');
  const [hasSentProof, setHasSentProof] = useState(false);
  const [paymentReference, setPaymentReference] = useState('');
  const days = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
  const [hours, setHours] = useState<Record<string,{open:string,close:string}>>(
    Object.fromEntries(days.map(d => [d, { open: '09:00', close: '17:00' }])) as Record<string,{open:string,close:string}>
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { authStatus } = useAuth();
  const router = useRouter();

  const selectedPlanDetails = PLAN_BY_CODE[selectedPlan];
  const BANK_DETAILS = {
    bank: 'Capitec Bank',
    accountNumber: '1618097723',
    accountHolder: 'J Msengi',
    whatsapp: '0787770524',
  };
 

  useEffect(() => {
    if (authStatus === 'unauthenticated') {
      router.push('/login');
    }
  }, [authStatus, router]);

  const SA_PROVINCES = [
    'Eastern Cape',
    'Free State',
    'Gauteng',
    'KwaZulu-Natal',
    'Limpopo',
    'Mpumalanga',
    'North West',
    'Northern Cape',
    'Western Cape',
  ];

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Client-side guardrails to match backend constraints
      if (town.length > 100) throw new Error('Town must be 100 characters or fewer.');
      if (city.length > 100) throw new Error('City must be 100 characters or fewer.');
      if (province.length === 0) throw new Error('Please select a province.');
      if (name.length > 100) throw new Error('Name must be 100 characters or fewer.');
      if (description.length > 500) throw new Error('Description must be 500 characters or fewer.');
      if (address.length > 255) throw new Error('Address must be 255 characters or fewer.');

      const isValidUrl = (value: string) => { try { new URL(value); return true; } catch { return false; } };

      const payload: any = {
        name,
        address,
        city,
        town,
        province,
        phone,
        email,
        description,
        offersMobile: bookingType !== 'ONSITE',
      };
      if (website && website.trim().length > 0 && isValidUrl(website.trim())) {
        payload.website = website.trim();
      }
      if (bookingType !== 'ONSITE' && mobileFee !== '') {
        const feeNum = Number(mobileFee);
        if (!Number.isNaN(feeNum) && feeNum >= 0) payload.mobileFee = feeNum;
      }
      // Send operatingHours as a record Day -> "HH:MM - HH:MM" to match details view
      const hoursArray = days.map((d) => ({
        day: d,
        open: hours[d].open,
        close: hours[d].close,
      }));
      payload.operatingHours = hoursArray;
      payload.operatingDays = hoursArray.map((entry) => entry.day);
      payload.planCode = selectedPlan;
      payload.hasSentProof = hasSentProof;
      const effectiveReference = paymentReference.trim().length > 0 ? paymentReference.trim() : name.trim();
      if (effectiveReference.length > 0) {
        payload.paymentReference = effectiveReference;
      }

      const response = await fetch(`/api/salons`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        // Try to parse the error response as JSON, but have a fallback.
        const errorData = await response.json().catch(() => ({ message: 'Failed to create salon due to a server error.' }));
        throw new Error(errorData.message || 'Failed to create salon');
      }

      toast.success('Salon created successfully! It will be reviewed by an admin.');
      router.push('/dashboard');
    } catch (error: any) {
      logger.error('Failed to create salon:', error);
      toast.error(toFriendlyMessage(error, 'Failed to create salon. Please try again.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authStatus === 'loading') {
    return <LoadingSpinner />;
  }

  return (
    <div className={styles.container}>
      <PageNav />
      <h1 className={styles.title}>Create Your Salon</h1>

      <div className={styles.card}>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.planSection}>
            <div>
              <h2 className={styles.sectionTitle}>Select your package</h2>
              <p className={styles.sectionHint}>
                Choose the plan that matches your growth goals. These packages apply to both salon owners and product sellers.
              </p>
            </div>
            <div className={styles.planGrid}>
              {APP_PLANS.map((plan) => {
                const isSelected = plan.code === selectedPlan;
                return (
                  <button
                    type="button"
                    key={plan.code}
                    onClick={() => setSelectedPlan(plan.code)}
                    className={`${styles.planCard} ${isSelected ? styles.planCardSelected : ''}`}
                    aria-pressed={isSelected}
                  >
                    <div className={styles.planCardHeader}>
                      <span className={styles.planName}>{plan.name}</span>
                      <span className={styles.planPrice}>{plan.price}<span className={styles.planPerMonth}>/mo</span></span>
                    </div>
                    <div className={styles.planDetails}>
                      <span>Max listings: <strong>{plan.maxListings}</strong></span>
                      <span>Visibility weight: <strong>{plan.visibilityWeight}</strong></span>
                    </div>
                    <ul className={styles.planFeatures}>
                      {plan.features.map((feature) => (
                        <li key={feature}>{feature}</li>
                      ))}
                    </ul>
                  </button>
                );
              })}
            </div>
            <div className={styles.paymentNotice}>
              <p>
                Send the package amount of <strong>{selectedPlanDetails.price}</strong> to <strong>{BANK_DETAILS.bank}</strong>, account <strong>{BANK_DETAILS.accountNumber}</strong> (Account holder: <strong>{BANK_DETAILS.accountHolder}</strong>). Use <strong>{(paymentReference.trim() || name || 'your salon name')}</strong> as the payment reference and WhatsApp the proof to <strong>{BANK_DETAILS.whatsapp}</strong> immediately after payment.
              </p>
            </div>
            <div className={styles.planControls}>
              <div className={styles.inputGroup}>
                <label htmlFor="paymentReference">Payment reference</label>
                <input
                  id="paymentReference"
                  type="text"
                  value={paymentReference}
                  onChange={(e) => setPaymentReference(e.target.value)}
                  placeholder={name || 'Salon name'}
                  className={styles.input}
                />
              </div>
              <label className={styles.proofCheckbox}>
                <input
                  type="checkbox"
                  checked={hasSentProof}
                  onChange={(e) => setHasSentProof(e.target.checked)}
                />
                <span>I have sent the proof of payment via WhatsApp</span>
              </label>
            </div>
          </div>
          <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
            <label htmlFor="name">Salon Name</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className={styles.input}
            />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="address">Address</label>
            <input
              id="address"
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
              className={styles.input}
            />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="town">Town/Suburb</label>
            <input
              id="town"
              type="text"
              value={town}
              onChange={(e) => setTown(e.target.value)}
              required
              className={styles.input}
            />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="city">City</label>
            <input
              id="city"
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              required
              className={styles.input}
            />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="province">Province</label>
            <select
              id="province"
              value={province}
              onChange={(e) => setProvince(e.target.value)}
              required
              className={styles.input}
            >
              <option value="" disabled>Select a province</option>
              {SA_PROVINCES.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="postalCode">Postal Code</label>
            <input
              id="postalCode"
              type="text"
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
              required
              className={styles.input}
            />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="phone">Phone Number</label>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              className={styles.input}
            />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="email">Contact Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={styles.input}
            />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="website">Website (Optional)</label>
            <input
              id="website"
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              className={styles.input}
            />
          </div>
          <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className={styles.textarea}
            ></textarea>
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="bookingType">Service Type</label>
            <select id="bookingType" value={bookingType} onChange={(e) => setBookingType(e.target.value as any)} className={styles.input}>
              <option value="ONSITE">On site</option>
              <option value="MOBILE">Off site (mobile)</option>
              <option value="BOTH">Both on site and off site</option>
            </select>
          </div>
          {bookingType !== 'ONSITE' && (
            <div className={styles.inputGroup}>
              <label htmlFor="mobileFee">Mobile Fee (R)</label>
              <input id="mobileFee" type="number" min="0" step="0.01" value={mobileFee} onChange={(e) => setMobileFee(e.target.value)} className={styles.input} />
            </div>
          )}
          <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
            <label>Operating Hours</label>
            <div style={{display:'grid',gap:'0.5rem'}}>
              <div style={{display:'flex',gap:'0.5rem',alignItems:'center'}}>
                <span style={{minWidth:100,fontWeight:600}}>Apply to all</span>
                <input type="time" value={hours['Monday'].open} onChange={(e)=>{
                  const v=e.target.value; setHours(prev=>{ const next={...prev}; days.forEach(d=>next[d]={...next[d],open:v}); return next;});
                }} className={styles.input} style={{maxWidth:160}} />
                <span>to</span>
                <input type="time" value={hours['Monday'].close} onChange={(e)=>{
                  const v=e.target.value; setHours(prev=>{ const next={...prev}; days.forEach(d=>next[d]={...next[d],close:v}); return next;});
                }} className={styles.input} style={{maxWidth:160}} />
              </div>
              {days.map(d=> (
                <div key={d} style={{display:'flex',gap:'0.5rem',alignItems:'center'}}>
                  <span style={{minWidth:100}}>{d}</span>
                  <input type="time" value={hours[d].open} onChange={(e)=> setHours(prev=> ({...prev,[d]:{...prev[d],open:e.target.value}}))} className={styles.input} style={{maxWidth:160}} />
                  <span>to</span>
                  <input type="time" value={hours[d].close} onChange={(e)=> setHours(prev=> ({...prev,[d]:{...prev[d],close:e.target.value}}))} className={styles.input} style={{maxWidth:160}} />
                </div>
              ))}
            </div>
          </div>
          <div className={styles.buttonContainer}>
            <button type="submit" disabled={isSubmitting} className="btn btn-primary">
              {isSubmitting ? 'Creating...' : 'Create Salon'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}