import type { Metadata } from 'next';
import type { Salon } from '@/types';
import SalonProfileClient from './SalonProfileClient';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.stylrsa.co.za';

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
    // SSR: Always fetch fresh data, no caching for real-time availability
    const res = await fetch(url, { cache: 'no-store', signal: controller.signal });
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

async function getSalon(id: string): Promise<Salon | null> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BASE_PATH;

  if (!baseUrl) {
    console.error('ERROR: NEXT_PUBLIC_API_URL or NEXT_PUBLIC_BASE_PATH is not set.');
    return null;
  }

  const url = buildApiUrl(baseUrl, `/api/salons/${id}`);

  try {
    const salon = await fetchSalonWithTimeout(url, 5000);
    
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

// Generate dynamic metadata for SEO
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const salon = await getSalon(id);

  if (!salon) {
    return {
      title: 'Salon Not Found',
      description: 'The requested salon could not be found.',
      robots: {
        index: false,
        follow: true,
      },
    };
  }

  // Build dynamic title and description
  const title = `${salon.name} - ${salon.city || 'South Africa'} | Stylr SA`;
  const description = salon.description 
    ? `${salon.description.substring(0, 155)}...`
    : `Book appointments at ${salon.name} in ${salon.city || 'South Africa'}. Professional salon services with easy online booking.`;

  // Build keywords from services
  const serviceKeywords = salon.services?.map(s => s.name || s.title).filter(Boolean).join(', ') || '';
  const keywords = `${salon.name}, salon ${salon.city || 'South Africa'}, ${serviceKeywords}, hair salon, beauty salon, book appointment`;

  const canonicalUrl = `${siteUrl}/salons/${salon.id}`;
  const imageUrl = salon.logo || salon.backgroundImage || salon.gallery?.[0]?.imageUrl || `${siteUrl}/logo-transparent.png`;

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: 'Stylr SA',
      type: 'website',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: `${salon.name} - Salon in ${salon.city || 'South Africa'}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
  };
}

export default async function SalonProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const salon = await getSalon(id);
  return <SalonProfileClient initialSalon={salon} salonId={id} />;
}