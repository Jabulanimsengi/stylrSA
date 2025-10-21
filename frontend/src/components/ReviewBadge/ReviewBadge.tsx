import styles from './ReviewBadge.module.css';

interface ReviewBadgeProps {
  reviewCount: number;
  avgRating: number;
}

export default function ReviewBadge({ reviewCount, avgRating }: ReviewBadgeProps) {
  if (reviewCount === 0) return null;

  return (
    <div className={styles.badge}>
      <div className={styles.rating}>{avgRating.toFixed(1)}</div>
      <div className={styles.count}>({reviewCount})</div>
    </div>
  );
}
