'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useGeolocation } from '@/hooks/useGeolocation';
import LoadingSpinner from '@/components/LoadingSpinner';
import PageNav from '@/components/PageNav';
import { generateNearYouH1, generateNearYouContent, CATEGORY_INFO } from '@/lib/nearYouContent';
import styles from '../../../salons/SalonsPage.module.css';

function ServiceCategoryNearYouContent() {
  const router = useRouter();
  const params = useParams();
  const categorySlug = params.category as string;
  const { coordinates, locationName, isLoading, requestLocation } = useGeolocation(false);
  const [hasRequested, setHasRequested] = useState(false);

  const category = categorySlug ? CATEGORY_INFO[categorySlug] : null;
  const h1 = generateNearYouH1(categorySlug, null, null);
  const content = generateNearYouContent(categorySlug, null, null);

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
      
      if (province && city) {
        router.push(`/services/${categorySlug}/near-you/${province}/${city}?lat=${coordinates.latitude}&lon=${coordinates.longitude}`);
      } else if (province) {
        router.push(`/services/${categorySlug}/near-you/${province}?lat=${coordinates.latitude}&lon=${coordinates.longitude}`);
      }
    }
  }, [coordinates, locationName, router, categorySlug]);

  return (
    <div className={styles.container}>
      <PageNav />
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
        <h1 className={styles.title}>{h1}</h1>
        <p style={{ fontSize: '1.1rem', marginBottom: '2rem', color: '#666', lineHeight: '1.6' }}>
          {content}
        </p>
      </div>
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1rem', textAlign: 'center' }}>
        {isLoading ? (
          <>
            <LoadingSpinner />
            <p style={{ marginTop: '1rem', color: '#666' }}>
              Please allow location access to find {category?.serviceName || 'services'} near you
            </p>
          </>
        ) : (
          <>
            <p style={{ marginTop: '1rem', color: '#666', fontSize: '1.1rem' }}>
              We need your location to show you {category?.serviceName || 'services'} near you.
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

export default function ServiceCategoryNearYouPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <ServiceCategoryNearYouContent />
    </Suspense>
  );
}

