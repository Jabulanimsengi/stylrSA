import { apiJson } from './api';

type LocationsByProvince = Record<string, string[]>;

type CacheEntry<T> = {
  data: T;
  expiresAt: number;
};

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

type CategoryRecord = {
  id: string;
  name: string;
  [key: string]: unknown;
};

let locationsCache: CacheEntry<LocationsByProvince> | null = null;
let categoriesCache: CacheEntry<CategoryRecord[]> | null = null;

let locationsPromise: Promise<LocationsByProvince> | null = null;
let categoriesPromise: Promise<CategoryRecord[]> | null = null;

const STORAGE_KEYS = {
  locations: 'cache:locations',
  categories: 'cache:categories',
} as const;

function loadFromStorage<T>(key: string): CacheEntry<T> | null {
  if (typeof window === 'undefined') {
    return null;
  }
  try {
    const raw = window.sessionStorage.getItem(key);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as CacheEntry<T> | null;
    if (!parsed || typeof parsed !== 'object' || !('data' in parsed) || !('expiresAt' in parsed)) {
      return null;
    }
    if (typeof parsed.expiresAt !== 'number' || parsed.expiresAt <= Date.now()) {
      window.sessionStorage.removeItem(key);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function saveToStorage<T>(key: string, entry: CacheEntry<T>) {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    window.sessionStorage.setItem(key, JSON.stringify(entry));
  } catch {
    // Ignore storage errors (quota, private mode, etc.)
  }
}

function isFresh<T>(entry: CacheEntry<T> | null): entry is CacheEntry<T> {
  return Boolean(entry && entry.expiresAt > Date.now());
}

export async function getLocationsCached(): Promise<LocationsByProvince> {
  if (isFresh(locationsCache)) {
    return locationsCache.data;
  }
  const stored = loadFromStorage<LocationsByProvince>(STORAGE_KEYS.locations);
  if (isFresh(stored)) {
    locationsCache = stored;
    return stored.data;
  }
  if (!locationsPromise) {
    locationsPromise = apiJson<LocationsByProvince>('/api/locations')
      .then((data) => {
        const entry: CacheEntry<LocationsByProvince> = {
          data,
          expiresAt: Date.now() + CACHE_TTL,
        };
        locationsCache = entry;
        saveToStorage(STORAGE_KEYS.locations, entry);
        locationsPromise = null;
        return data;
      })
      .catch((error) => {
        locationsPromise = null;
        throw error;
      });
  }
  return locationsPromise;
}

export async function getCategoriesCached(): Promise<CategoryRecord[]> {
  if (isFresh(categoriesCache)) {
    return categoriesCache.data;
  }
  const stored = loadFromStorage<CategoryRecord[]>(STORAGE_KEYS.categories);
  if (isFresh(stored)) {
    categoriesCache = stored;
    return stored.data;
  }
  if (!categoriesPromise) {
    categoriesPromise = apiJson<CategoryRecord[]>('/api/categories')
      .then((data) => {
        const entry: CacheEntry<CategoryRecord[]> = {
          data,
          expiresAt: Date.now() + CACHE_TTL,
        };
        categoriesCache = entry;
        saveToStorage(STORAGE_KEYS.categories, entry);
        categoriesPromise = null;
        return data;
      })
      .catch((error) => {
        categoriesPromise = null;
        throw error;
      });
  }
  return categoriesPromise;
}

export function clearResourceCaches() {
  locationsCache = null;
  categoriesCache = null;
  if (typeof window !== 'undefined') {
    try {
      window.sessionStorage.removeItem(STORAGE_KEYS.locations);
      window.sessionStorage.removeItem(STORAGE_KEYS.categories);
    } catch {
      // ignore
    }
  }
}
