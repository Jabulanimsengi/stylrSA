'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useGeolocation } from '@/hooks/useGeolocation';
import LoadingSpinner from '@/components/LoadingSpinner';
import PageNav from '@/components/PageNav';
import styles from '../SalonsPage.module.css';

function NearMeContent() {
  const router = useRouter();
  const { coordinates, locationName, isLoading, requestLocation } = useGeolocation(false);
  const [hasRequested, setHasRequested] = useState(false);

  useEffect(() => {
    if (!hasRequested) {
      requestLocation();
      setHasRequested(true);
    }
  }, [hasRequested, requestLocation]);

  useEffect(() => {
    if (coordinates && locationName) {
      // Redirect to location-specific page with coordinates
      const province = locationName.province?.toLowerCase().replace(/\s+/g, '-');
      const city = locationName.city?.toLowerCase().replace(/\s+/g, '-');
      
      if (province) {
        // If we have city, use province page with query params for filtering
        router.push(`/salons/location/${province}?city=${city || ''}&lat=${coordinates.latitude}&lon=${coordinates.longitude}`);
      } else {
        // Fallback to general salons page with coordinates
        router.push(`/salons?lat=${coordinates.latitude}&lon=${coordinates.longitude}`);
      }
    }
  }, [coordinates, locationName, router]);

  return (
    <div className={styles.container}>
      <PageNav />
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1rem', textAlign: 'center' }}>
        {isLoading ? (
          <>
            <h1 className={styles.title}>Finding Salons Near You...</h1>
            <LoadingSpinner />
            <p style={{ marginTop: '1rem', color: '#666' }}>
              Please allow location access to find nearby salons
            </p>
          </>
        ) : (
          <>
            <h1 className={styles.title}>Location Access Required</h1>
            <p style={{ marginTop: '1rem', color: '#666', fontSize: '1.1rem' }}>
              We need your location to show you salons near you.
            </p>
            <button 
              onClick={requestLocation}
              style={{
                marginTop: '2rem',
                padding: '12px 24px',
                backgroundColor: 'var(--color-primary)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              Enable Location
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function NearMePage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <NearMeContent />
    </Suspense>
  );
}
