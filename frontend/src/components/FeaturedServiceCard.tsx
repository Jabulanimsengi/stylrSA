'use client';

import Link from 'next/link';
import { Service } from '@/types';
import styles from './FeaturedServiceCard.module.css';

interface FeaturedServiceCardProps {
  service: Service & { salon: { id: string; name: string } };
}

export default function FeaturedServiceCard({ service }: FeaturedServiceCardProps) {
  return (
    <Link href={`/salons/${service.salon.id}`} className={styles.card}>
      <img
        src={service.images[0] || 'https://via.placeholder.com/300x150'}
        alt={service.title}
        className={styles.cardImage}
      />
      <div className={styles.cardContent}>
        <h3 className={styles.cardTitle}>{service.title}</h3>
        <p className={styles.salonName}>{service.salon.name}</p>
        <p className={styles.price}>R{service.price.toFixed(2)}</p>
      </div>
    </Link>
  );
}