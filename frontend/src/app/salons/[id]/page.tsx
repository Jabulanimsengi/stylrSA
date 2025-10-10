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

async function getSalon(id: string): Promise<Salon | null> {
  const uniqueUrls = Array.from(
    new Set([
      ...apiBases.map((base) => buildApiUrl(base, `/api/salons/${id}`)),
      `/api/salons/${id}`,
    ]),
  );

  for (const url of uniqueUrls) {
    try {
      const res = await fetch(url, { cache: 'no-store' });
      if (!res.ok) continue;
      return res.json();
    } catch {
      continue;
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
