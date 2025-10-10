import type { Salon } from '@/types';
import SalonProfileClient from './SalonProfileClient';

async function getSalon(id: string): Promise<Salon | null> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/api/salons/${id}`, { cache: 'no-store' });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

type RouteParams = { id: string } | Promise<{ id: string }>;

export default async function SalonProfilePage({ params }: { params: RouteParams }) {
  const { id } = await Promise.resolve(params);
  const salon = await getSalon(id);
  return <SalonProfileClient initialSalon={salon} />;
}
