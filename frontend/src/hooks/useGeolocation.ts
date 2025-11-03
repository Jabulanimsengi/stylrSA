import { useState, useEffect } from 'react';
import { useReverseGeolocation, type ReverseGeolocationResult } from './useReverseGeolocation';

export interface GeolocationCoordinates {
  latitude: number;
  longitude: number;
}

interface GeolocationState {
  coordinates: GeolocationCoordinates | null;
  locationName: ReverseGeolocationResult | null;
  error: string | null;
  isLoading: boolean;
  isReverseGeocoding: boolean;
}

const STORAGE_KEY = 'user_location';
const LOCATION_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

interface StoredLocation {
  coordinates: GeolocationCoordinates;
  locationName?: ReverseGeolocationResult;
  timestamp: number;
}

export function useGeolocation(autoRequest: boolean = false) {
  const { reverseGeocode } = useReverseGeolocation();
  const [state, setState] = useState<GeolocationState>({
    coordinates: null,
    locationName: null,
    error: null,
    isLoading: false,
    isReverseGeocoding: false,
  });

  const requestLocation = () => {
    // Skip on server-side rendering
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setState({
        coordinates: null,
        error: 'Geolocation is not supported by your browser',
        isLoading: false,
      });
      return;
    }

    setState(prev => ({ ...prev, isLoading: true }));

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const coordinates = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };

        // Set coordinates first, then do reverse geocoding
        setState(prev => ({ 
          ...prev, 
          coordinates,
          isLoading: false,
          isReverseGeocoding: true 
        }));

        // Perform reverse geocoding asynchronously
        let locationName: ReverseGeolocationResult | null = null;
        try {
          locationName = await reverseGeocode(coordinates.latitude, coordinates.longitude);
        } catch (reverseError) {
          console.warn('Reverse geocoding failed:', reverseError);
          // Continue without location name - not critical
        }

        // Store in localStorage with timestamp
        try {
          const storedData: StoredLocation = {
            coordinates,
            locationName,
            timestamp: Date.now(),
          };
          localStorage.setItem(STORAGE_KEY, JSON.stringify(storedData));
        } catch (e) {
          // localStorage not available, continue without caching
        }

        setState({
          coordinates,
          locationName,
          error: null,
          isLoading: false,
          isReverseGeocoding: false,
        });
      },
      (error) => {
        let errorMessage = 'Unable to retrieve your location';
        if (error.code === error.PERMISSION_DENIED) {
          errorMessage = 'Location access denied';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          errorMessage = 'Location information unavailable';
        } else if (error.code === error.TIMEOUT) {
          errorMessage = 'Location request timed out';
        }

        setState({
          coordinates: null,
          locationName: null,
          error: errorMessage,
          isLoading: false,
          isReverseGeocoding: false,
        });
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: LOCATION_EXPIRY,
      }
    );
  };

  useEffect(() => {
    // Skip on server-side rendering
    if (typeof window === 'undefined') {
      return;
    }

    // Try to load from localStorage first
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data: StoredLocation = JSON.parse(stored);
        const age = Date.now() - data.timestamp;

        // Use cached location if less than 24 hours old
        if (age < LOCATION_EXPIRY) {
          setState({
            coordinates: data.coordinates,
            locationName: data.locationName || null,
            error: null,
            isLoading: false,
            isReverseGeocoding: false,
          });
          return;
        }
      }
    } catch (e) {
      // Invalid stored data, continue to request
    }

    // Auto-request if enabled and no valid cached location
    if (autoRequest) {
      requestLocation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoRequest]);

  const clearLocation = () => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (e) {
        // localStorage not available
      }
    }
    setState({
      coordinates: null,
      locationName: null,
      error: null,
      isLoading: false,
      isReverseGeocoding: false,
    });
  };

  return {
    ...state,
    requestLocation,
    clearLocation,
  };
}
