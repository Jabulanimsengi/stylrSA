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

export default async function SalonProfilePage({ params }: { params: { id: string } }) {
  const salon = await getSalon(params.id);
  return <SalonProfileClient initialSalon={salon} />;
}