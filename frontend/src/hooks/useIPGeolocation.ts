// IP-based Geolocation Fallback Hook
// Uses free IP geolocation API when browser geolocation fails

import { useState, useCallback } from 'react';

export interface IPGeolocationResult {
  latitude: number;
  longitude: number;
  city?: string;
  region?: string;
  country?: string;
  source: 'ip';
}

interface IPGeolocationState {
  result: IPGeolocationResult | null;
  isLoading: boolean;
  error: string | null;
}

// South African city coordinates fallback
const SA_CITY_COORDS: Record<string, { lat: number; lon: number }> = {
  'johannesburg': { lat: -26.2041, lon: 28.0473 },
  'cape town': { lat: -33.9249, lon: 18.4241 },
  'durban': { lat: -29.8587, lon: 31.0218 },
  'pretoria': { lat: -25.7479, lon: 28.2293 },
  'port elizabeth': { lat: -33.9608, lon: 25.6022 },
  'bloemfontein': { lat: -29.0852, lon: 26.1596 },
  'east london': { lat: -33.0153, lon: 27.9116 },
  'polokwane': { lat: -23.9045, lon: 29.4689 },
  'nelspruit': { lat: -25.4753, lon: 30.9694 },
  'kimberley': { lat: -28.7282, lon: 24.7499 },
  'sandton': { lat: -26.1076, lon: 28.0567 },
  'soweto': { lat: -26.2485, lon: 27.8540 },
  'centurion': { lat: -25.8603, lon: 28.1894 },
  'midrand': { lat: -25.9891, lon: 28.1270 },
  'randburg': { lat: -26.0936, lon: 28.0064 },
};

// Default to Johannesburg (most populous city)
const DEFAULT_COORDS = SA_CITY_COORDS['johannesburg'];

export function useIPGeolocation() {
  const [state, setState] = useState<IPGeolocationState>({
    result: null,
    isLoading: false,
    error: null,
  });

  const fetchIPLocation = useCallback(async (): Promise<IPGeolocationResult | null> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Try ip-api.com (free, no API key required, 45 requests/minute)
      const response = await fetch('http://ip-api.com/json/?fields=status,city,regionName,country,lat,lon', {
        signal: AbortSignal.timeout(5000),
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.status === 'success' && data.lat && data.lon) {
          const result: IPGeolocationResult = {
            latitude: data.lat,
            longitude: data.lon,
            city: data.city,
            region: data.regionName,
            country: data.country,
            source: 'ip',
          };
          
          setState({ result, isLoading: false, error: null });
          return result;
        }
      }

      // Fallback: Try ipapi.co (free tier)
      const fallbackResponse = await fetch('https://ipapi.co/json/', {
        signal: AbortSignal.timeout(5000),
      });

      if (fallbackResponse.ok) {
        const data = await fallbackResponse.json();
        
        if (data.latitude && data.longitude) {
          const result: IPGeolocationResult = {
            latitude: data.latitude,
            longitude: data.longitude,
            city: data.city,
            region: data.region,
            country: data.country_name,
            source: 'ip',
          };
          
          setState({ result, isLoading: false, error: null });
          return result;
        }
      }

      // Final fallback: Use default South African coordinates
      const defaultResult: IPGeolocationResult = {
        latitude: DEFAULT_COORDS.lat,
        longitude: DEFAULT_COORDS.lon,
        city: 'Johannesburg',
        region: 'Gauteng',
        country: 'South Africa',
        source: 'ip',
      };

      setState({ result: defaultResult, isLoading: false, error: 'Using default location' });
      return defaultResult;

    } catch (error: any) {
      // Use default coordinates on error
      const defaultResult: IPGeolocationResult = {
        latitude: DEFAULT_COORDS.lat,
        longitude: DEFAULT_COORDS.lon,
        city: 'Johannesburg',
        region: 'Gauteng',
        country: 'South Africa',
        source: 'ip',
      };

      setState({ 
        result: defaultResult, 
        isLoading: false, 
        error: error?.message || 'IP geolocation failed, using default' 
      });
      return defaultResult;
    }
  }, []);

  // Get coordinates for a specific South African city
  const getCityCoords = useCallback((cityName: string): { lat: number; lon: number } | null => {
    const normalized = cityName.toLowerCase().trim();
    return SA_CITY_COORDS[normalized] || null;
  }, []);

  return {
    ...state,
    fetchIPLocation,
    getCityCoords,
    defaultCoords: DEFAULT_COORDS,
  };
}
