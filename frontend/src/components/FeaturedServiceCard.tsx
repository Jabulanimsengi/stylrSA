'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Service } from '@/types';
import styles from './FeaturedServiceCard.module.css';
import { transformCloudinary } from '@/utils/cloudinary';

interface FeaturedServiceCardProps {
  service: Service & { salon: { id: string; name: string; city: string; province: string } };
}

export default function FeaturedServiceCard({ service }: FeaturedServiceCardProps) {
  return (
    <Link href={`/salons/${service.salon.id}`} className={styles.card}>
      <div className={styles.cardImageWrapper}>
        <Image
          src={transformCloudinary(service.images[0] || 'https://via.placeholder.com/300x150', { width: 600, quality: 'auto', format: 'auto', crop: 'fill' })}
          alt={service.title}
          className={styles.cardImage}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>
      <div className={styles.cardContent}>
        <h3 className={styles.cardTitle}>{service.title}</h3>
        <p className={styles.salonName}>{service.salon.name}</p>
        <p className={styles.salonLocation}>{service.salon.city}, {service.salon.province}</p>
        <p className={styles.price}>R{service.price.toFixed(2)}</p>
      </div>
    </Link>
  );
}