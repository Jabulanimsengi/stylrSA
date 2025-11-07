import type { Salon } from '@/types';
import SalonProfileClient from './SalonProfileClient';

const apiBases = [
  process.env.NEXT_PUBLIC_BASE_PATH,
  process.env.NEXT_PUBLIC_API_URL,
  process.env.NEXT_PUBLIC_API_ORIGIN,
].filter((value): value is string => Boolean(value));

const buildApiUrl = (base: string | undefined, path: string) => {
  if (!base) return path;
  const normalizedBase = base.endsWith('/') ? base.slice(0, -1) : base;
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${normalizedBase}${normalizedPath}`;
};

const fetchSalonWithTimeout = async (url: string, timeoutMs = 10000): Promise<Salon | null> => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    // ISR: Revalidate every 10 minutes (600 seconds) for better performance and Core Web Vitals
    // This serves fast static pages while updating in the background
    const res = await fetch(url, { next: { revalidate: 600 }, signal: controller.signal });
    if (!res.ok) {
      return null;
    }
    const data: Salon = await res.json();
    return data;
  } catch (error) {
    return null;
  } finally {
    clearTimeout(timeout);
  }
};

// --- THIS IS THE FIXED FUNCTION ---
async function getSalon(id: string): Promise<Salon | null> {
  
  // 1. Determine the ONE correct, absolute base URL for your API.
  //    This must be an absolute path (e.g., https://www.your-api.com or http://localhost:3001)
  //    It should be the URL your server can access.
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BASE_PATH;

  // 2. Check if a base URL is even defined. If not, this fetch will fail.
  if (!baseUrl) {
    console.error('ERROR: NEXT_PUBLIC_API_URL or NEXT_PUBLIC_BASE_PATH is not set.');
    return null;
  }

  // 3. Build the single, correct URL.
  const url = buildApiUrl(baseUrl, `/api/salons/${id}`);

  try {
    // 4. Fetch from that one URL. 
    //    We can use a shorter 5-second timeout.
    //    The long 10-second timeout was a major part of the hang.
    const salon = await fetchSalonWithTimeout(url, 5000); // 5-second timeout
    
    if (!salon) {
      console.warn(`[getSalon] Salon not found at: ${url}`);
      return null;
    }

    return salon;

  } catch (error) {
    console.error(`[getSalon] Failed to fetch salon ${id} from ${url}`, error);
    return null;
  }
}
// --- END OF FIXED FUNCTION ---

export default async function SalonProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const salon = await getSalon(id);
  return <SalonProfileClient initialSalon={salon} salonId={id} />;
}