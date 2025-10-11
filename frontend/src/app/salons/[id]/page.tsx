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

const fetchSalonWithTimeout = async (url: string, timeoutMs = 2500): Promise<Salon | null> => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
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
  const candidates = [
    `/api/salons/${id}`,
    ...apiBases.map((base) => buildApiUrl(base, `/api/salons/${id}`)),
  ];

  const uniqueUrls = Array.from(new Set(candidates));

  for (const url of uniqueUrls) {
    const salon = await fetchSalonWithTimeout(url);
    if (salon) {
      return salon;
    }
  }

  return null;
}

type RouteParams = { id: string } | Promise<{ id: string }>;

export default async function SalonProfilePage({ params }: { params: RouteParams }) {
  const { id } = await Promise.resolve(params);
  const salon = await getSalon(id);
  return <SalonProfileClient initialSalon={salon} salonId={id} />;
}
