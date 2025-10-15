import { Skeleton, SkeletonCard, SkeletonGroup } from './Skeleton';
import styles from './Skeleton.module.css';

export default function ProductsPageSkeleton() {
  return (
    <div className={styles.pageSkeletonContainer}>
      {/* Header skeleton */}
      <div className={styles.headerSkeleton}>
        <Skeleton variant="text" width="60%" height={36} />
        <Skeleton variant="text" width="80%" height={20} />
      </div>

      {/* Filter bar skeleton */}
      <div className={styles.filterSkeleton}>
        <Skeleton variant="rounded" width="100%" height={80} />
      </div>

      {/* Product grid skeleton */}
      <div className={styles.gridSkeleton}>
        <SkeletonGroup count={12}>
          {(idx) => (
            <div key={idx} className={styles.productCardSkeleton}>
              <Skeleton variant="rounded" width="100%" height={200} />
              <div className={styles.cardContent}>
                <Skeleton variant="text" width="80%" height={20} />
                <Skeleton variant="text" width="60%" height={16} />
                <Skeleton variant="text" width="40%" height={24} />
              </div>
            </div>
          )}
        </SkeletonGroup>
      </div>
    </div>
  );
}
