import { Skeleton, SkeletonGroup } from './Skeleton';
import styles from './Skeleton.module.css';

export default function BookingsListSkeleton() {
  return (
    <div className={styles.listSkeletonContainer}>
      {/* Page header */}
      <div className={styles.headerSkeleton}>
        <Skeleton variant="text" width="50%" height={32} />
        <Skeleton variant="text" width="70%" height={18} />
      </div>

      {/* Tabs skeleton */}
      <div className={styles.tabsSkeleton}>
        <Skeleton variant="button" width={120} height={40} />
        <Skeleton variant="button" width={120} height={40} />
        <Skeleton variant="button" width={120} height={40} />
      </div>

      {/* Bookings list */}
      <div className={styles.listItems}>
        <SkeletonGroup count={5}>
          {(idx) => (
            <div key={idx} className={styles.listItemSkeleton}>
              <Skeleton variant="rounded" width={80} height={80} />
              <div style={{ flex: 1, marginLeft: '1rem' }}>
                <Skeleton variant="text" width="70%" height={20} />
                <Skeleton variant="text" width="90%" height={16} />
                <Skeleton variant="text" width="50%" height={16} />
                <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem' }}>
                  <Skeleton variant="button" width={80} height={32} />
                  <Skeleton variant="button" width={80} height={32} />
                </div>
              </div>
            </div>
          )}
        </SkeletonGroup>
      </div>
    </div>
  );
}
