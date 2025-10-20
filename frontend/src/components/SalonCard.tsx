import Link from 'next/link';
import Image from 'next/image';
import { FaHeart } from 'react-icons/fa';
import { transformCloudinary } from '@/utils/cloudinary';
import { getImageWithFallback } from '@/lib/placeholders';
import { Salon } from '@/types';
import styles from './SalonCard.module.css';

type SalonWithFavorite = Salon & { isFavorited?: boolean };

interface SalonCardProps {
  salon: SalonWithFavorite;
  showFavorite?: boolean;
  onToggleFavorite?: (e: React.MouseEvent, salonId: string) => void;
}

export default function SalonCard({ salon, showFavorite = true, onToggleFavorite }: SalonCardProps) {
  return (
    <div className={styles.salonCard}>
      {showFavorite && onToggleFavorite && (
        <button
          onClick={(e) => onToggleFavorite(e, salon.id)}
          className={`${styles.favoriteButton} ${salon.isFavorited ? styles.favorited : ''}`}
          aria-label={salon.isFavorited ? 'Remove from favorites' : 'Add to favorites'}
        >
          <FaHeart />
        </button>
      )}
      <Link href={`/salons/${salon.id}`} className={styles.salonLink}>
        <div className={styles.imageWrapper}>
          <Image
            src={transformCloudinary(getImageWithFallback(salon.backgroundImage, 'wide'), { 
              width: 600, 
              quality: 'auto', 
              format: 'auto', 
              crop: 'fill' 
            })}
            alt={`A photo of ${salon.name}`}
            className={styles.cardImage}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        </div>
        <div className={styles.cardContent}>
          <h2 className={styles.cardTitle}>{salon.name}</h2>
          <p className={styles.cardLocation}>{salon.city}, {salon.province}</p>
          {(() => {
            const oh = salon.operatingHours as unknown;
            let hoursRecord: Record<string, string> | null = null;
            if (Array.isArray(oh)) {
              const derived: Record<string, string> = {};
              oh.forEach((entry: { day?: string; open?: string; close?: string }) => {
                const day = entry?.day;
                if (!day) return;
                const open = entry.open;
                const close = entry.close;
                if (!open && !close) return;
                derived[day] = `${open ?? ''} - ${close ?? ''}`.trim();
              });
              hoursRecord = Object.keys(derived).length > 0 ? derived : null;
            } else if (oh && typeof oh === 'object') {
              hoursRecord = oh as Record<string, string>;
            }
            if (!hoursRecord) return null;
            const entries = Object.entries(hoursRecord);
            if (entries.length === 0) return null;
            const samples = entries.slice(0, 2).map(([day, hrs]) => `${day.substring(0,3)} ${hrs}`);
            const extra = entries.length > 2 ? ` +${entries.length - 2} more` : '';
            return <p className={styles.cardMeta}>Hours: {samples.join(' • ')}{extra}</p>;
          })()}
        </div>
      </Link>
    </div>
  );
}
