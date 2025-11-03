// Analytics tracking for geolocation usage
'use client';

import { useEffect } from 'react';
import { useGeolocation } from '@/hooks/useGeolocation';

interface GeolocationAnalyticsProps {
  trackingId?: string;
}

export default function GeolocationAnalytics({ trackingId }: GeolocationAnalyticsProps) {
  const { coordinates, error, locationName } = useGeolocation(false);

  useEffect(() => {
    if (coordinates && typeof window !== 'undefined' && (window as any).gtag) {
      // Track successful geolocation
      (window as any).gtag('event', 'geolocation_success', {
        event_category: 'geolocation',
        event_label: 'coordinates_obtained',
        custom_parameter_1: coordinates.latitude.toFixed(4),
        custom_parameter_2: coordinates.longitude.toFixed(4),
        page_location: window.location.pathname
      });

      // Track location name if available
      if (locationName?.city) {
        (window as any).gtag('event', 'location_identified', {
          event_category: 'geolocation',
          event_label: 'reverse_geocoding_success',
          custom_parameter_1: locationName.city,
          custom_parameter_2: locationName.province || 'unknown',
          page_location: window.location.pathname
        });
      }
    }
  }, [coordinates, locationName]);

  useEffect(() => {
    if (error && typeof window !== 'undefined' && (window as any).gtag) {
      // Track geolocation errors
      (window as any).gtag('event', 'geolocation_error', {
        event_category: 'geolocation',
        event_label: 'location_request_failed',
        custom_parameter_1: error,
        page_location: window.location.pathname
      });
    }
  }, [error]);

  // This component doesn't render anything
  return null;
}