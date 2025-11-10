import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Decimal } from '@prisma/client/runtime/library';

interface SeoLocation {
  id: string;
  name: string;
  slug: string;
  type: string;
  province: string;
  provinceSlug: string;
  parentLocationId: string | null;
  latitude: Decimal | null;
  longitude: Decimal | null;
  population: number | null;
  serviceCount: number;
  salonCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export enum LocationType {
  PROVINCE = 'PROVINCE',
  CITY = 'CITY',
  TOWN = 'TOWN',
  SUBURB = 'SUBURB',
  TOWNSHIP = 'TOWNSHIP',
}

interface LocationWithDistance extends SeoLocation {
  distance?: number;
}

@Injectable()
export class LocationService {
  private readonly logger = new Logger(LocationService.name);
  private locationCache: Map<string, SeoLocation> = new Map();
  private provincesCache: SeoLocation[] | null = null;
  private cacheTimestamp: number = 0;
  private readonly CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

  constructor(private prisma: PrismaService) {}

  /**
   * Get all provinces
   */
  async getAllProvinces(): Promise<SeoLocation[]> {
    const now = Date.now();
    
    // Return cached data if still valid
    if (this.provincesCache && (now - this.cacheTimestamp) < this.CACHE_TTL) {
      this.logger.debug('Returning cached provinces');
      return this.provincesCache;
    }

    this.logger.log('Fetching all provinces from database');
    const provinces = await this.prisma.seoLocation.findMany({
      where: {
        type: LocationType.PROVINCE,
      },
      orderBy: {
        name: 'asc',
      },
    });

    // Update cache
    this.provincesCache = provinces;
    this.cacheTimestamp = now;

    this.logger.log(`Loaded ${provinces.length} provinces into cache`);
    return provinces;
  }

  /**
   * Get cities by province slug
   */
  async getCitiesByProvince(provinceSlug: string): Promise<SeoLocation[]> {
    this.logger.debug(`Fetching cities for province: ${provinceSlug}`);
    
    const cities = await this.prisma.seoLocation.findMany({
      where: {
        provinceSlug: provinceSlug,
        type: {
          in: [LocationType.CITY, LocationType.TOWN],
        },
      },
      orderBy: [
        { population: 'desc' },
        { name: 'asc' },
      ],
    });

    this.logger.debug(`Found ${cities.length} cities in province ${provinceSlug}`);
    return cities;
  }

  /**
   * Get suburbs by city slug
   */
  async getSuburbsByCity(citySlug: string): Promise<SeoLocation[]> {
    this.logger.debug(`Fetching suburbs for city: ${citySlug}`);
    
    // First find the city
    const city = await this.prisma.seoLocation.findFirst({
      where: {
        slug: citySlug,
        type: {
          in: [LocationType.CITY, LocationType.TOWN],
        },
      },
    });

    if (!city) {
      this.logger.warn(`City not found: ${citySlug}`);
      return [];
    }

    // Get suburbs that have this city as parent
    const suburbs = await this.prisma.seoLocation.findMany({
      where: {
        parentLocationId: city.id,
        type: {
          in: [LocationType.SUBURB, LocationType.TOWNSHIP],
        },
      },
      orderBy: [
        { population: 'desc' },
        { name: 'asc' },
      ],
    });

    this.logger.debug(`Found ${suburbs.length} suburbs in city ${citySlug}`);
    return suburbs;
  }

  /**
   * Find location by slug and optional type
   */
  async getLocationBySlug(
    slug: string,
    type?: LocationType | string,
  ): Promise<SeoLocation | null> {
    const cacheKey = type ? `${slug}:${type}` : slug;
    
    // Check cache first
    if (this.locationCache.has(cacheKey)) {
      this.logger.debug(`Cache hit for location: ${cacheKey}`);
      return this.locationCache.get(cacheKey)!;
    }

    this.logger.debug(`Cache miss for location: ${cacheKey}, fetching from database`);
    
    const where: any = { slug };
    if (type) {
      where.type = type;
    }

    const location = await this.prisma.seoLocation.findFirst({
      where,
    });

    if (location) {
      // Add to cache
      this.locationCache.set(cacheKey, location);
    }

    return location;
  }

  /**
   * Get location hierarchy (province > city > suburb)
   */
  async getLocationHierarchy(locationId: string): Promise<SeoLocation[]> {
    this.logger.debug(`Fetching location hierarchy for: ${locationId}`);
    
    const hierarchy: SeoLocation[] = [];
    let currentLocation = await this.prisma.seoLocation.findUnique({
      where: { id: locationId },
    });

    if (!currentLocation) {
      return hierarchy;
    }

    // Add current location
    hierarchy.unshift(currentLocation);

    // Traverse up the hierarchy
    while (currentLocation.parentLocationId) {
      const parent = await this.prisma.seoLocation.findUnique({
        where: { id: currentLocation.parentLocationId },
      });

      if (!parent) break;

      hierarchy.unshift(parent);
      currentLocation = parent;
    }

    this.logger.debug(`Found ${hierarchy.length} levels in hierarchy`);
    return hierarchy;
  }

  /**
   * Get nearby locations with distance calculation
   * Uses Haversine formula for distance calculation
   */
  async getNearbyLocations(
    locationId: string,
    limit: number = 10,
  ): Promise<LocationWithDistance[]> {
    this.logger.debug(`Fetching nearby locations for: ${locationId}`);
    
    const location = await this.prisma.seoLocation.findUnique({
      where: { id: locationId },
    });

    if (!location) {
      this.logger.warn(`Location not found: ${locationId}`);
      return [];
    }

    // If location has coordinates, use distance calculation
    if (location.latitude && location.longitude) {
      return this.getNearbyLocationsByDistance(location, limit);
    }

    // Fallback: Get locations in same province
    return this.getNearbyLocationsByProvince(location, limit);
  }

  /**
   * Get nearby locations by geographic distance
   */
  private async getNearbyLocationsByDistance(
    location: SeoLocation,
    limit: number,
  ): Promise<LocationWithDistance[]> {
    const lat = Number(location.latitude);
    const lon = Number(location.longitude);

    // Get all locations in same province with coordinates
    const candidates = await this.prisma.seoLocation.findMany({
      where: {
        provinceSlug: location.provinceSlug,
        id: { not: location.id },
        latitude: { not: null },
        longitude: { not: null },
      },
    });

    // Calculate distances and sort
    const locationsWithDistance = candidates
      .map(candidate => {
        const distance = this.calculateDistance(
          lat,
          lon,
          Number(candidate.latitude),
          Number(candidate.longitude),
        );
        return { ...candidate, distance };
      })
      .sort((a, b) => a.distance! - b.distance!)
      .slice(0, limit);

    this.logger.debug(
      `Found ${locationsWithDistance.length} nearby locations by distance`,
    );
    return locationsWithDistance;
  }

  /**
   * Get nearby locations by province (fallback when no coordinates)
   */
  private async getNearbyLocationsByProvince(
    location: SeoLocation,
    limit: number,
  ): Promise<SeoLocation[]> {
    const where: any = {
      provinceSlug: location.provinceSlug,
      id: { not: location.id },
    };

    // If it's a suburb, get other suburbs in same city
    if (
      location.type === LocationType.SUBURB ||
      location.type === LocationType.TOWNSHIP
    ) {
      if (location.parentLocationId) {
        where.parentLocationId = location.parentLocationId;
      }
    } else {
      // For cities/towns, get other cities/towns in same province
      where.type = {
        in: [LocationType.CITY, LocationType.TOWN],
      };
    }

    const nearby = await this.prisma.seoLocation.findMany({
      where,
      orderBy: [
        { population: 'desc' },
        { name: 'asc' },
      ],
      take: limit,
    });

    this.logger.debug(
      `Found ${nearby.length} nearby locations by province`,
    );
    return nearby;
  }

  /**
   * Calculate distance between two coordinates using Haversine formula
   * Returns distance in kilometers
   */
  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
        Math.cos(this.toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return Math.round(distance * 10) / 10; // Round to 1 decimal place
  }

  /**
   * Convert degrees to radians
   */
  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Get all cities (for sitemap generation)
   */
  async getAllCities(): Promise<SeoLocation[]> {
    this.logger.log('Fetching all cities from database');
    
    const cities = await this.prisma.seoLocation.findMany({
      where: {
        type: {
          in: [LocationType.CITY, LocationType.TOWN],
        },
      },
      orderBy: [
        { population: 'desc' },
        { name: 'asc' },
      ],
    });

    this.logger.log(`Found ${cities.length} cities`);
    return cities;
  }

  /**
   * Get top cities by population
   */
  async getTopCities(limit: number = 100): Promise<SeoLocation[]> {
    this.logger.debug(`Fetching top ${limit} cities by population`);
    
    const cities = await this.prisma.seoLocation.findMany({
      where: {
        type: {
          in: [LocationType.CITY, LocationType.TOWN],
        },
      },
      orderBy: [
        { population: 'desc' },
        { salonCount: 'desc' },
      ],
      take: limit,
    });

    return cities;
  }

  /**
   * Clear the cache (useful for testing or after bulk updates)
   */
  clearCache(): void {
    this.logger.log('Clearing location cache');
    this.locationCache.clear();
    this.provincesCache = null;
    this.cacheTimestamp = 0;
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; age: number; isValid: boolean } {
    const age = Date.now() - this.cacheTimestamp;
    return {
      size: this.locationCache.size,
      age: age,
      isValid: age < this.CACHE_TTL,
    };
  }
}
