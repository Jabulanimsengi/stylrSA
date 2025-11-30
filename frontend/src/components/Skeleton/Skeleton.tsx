import type { CSSProperties, ReactNode } from 'react';
import styles from './Skeleton.module.css';
import clsx from 'clsx';

type SkeletonVariant = 'text' | 'circle' | 'rounded' | 'button';

interface SkeletonProps {
  variant?: SkeletonVariant;
  className?: string;
  width?: string | number;
  height?: string | number;
  style?: CSSProperties;
}

export function Skeleton({
  variant = 'rounded',
  className,
  width,
  height,
  style,
}: SkeletonProps) {
  return (
    <span
      aria-hidden
      className={clsx(
        styles.skeleton,
        {
          [styles.skeletonText]: variant === 'text',
          [styles.skeletonCircle]: variant === 'circle',
          [styles.skeletonRounded]: variant === 'rounded',
          [styles.skeletonButton]: variant === 'button',
        },
        className,
      )}
      style={{ width, height, ...style }}
    />
  );
}

interface SkeletonGroupProps {
  count?: number;
  children: (index: number) => ReactNode;
  className?: string;
}

export function SkeletonGroup({ count = 1, children, className }: SkeletonGroupProps) {
  return (
    <div className={className} aria-hidden>
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx}>{children(idx)}</div>
      ))}
    </div>
  );
}

interface SkeletonCardProps {
  lines?: number;
  hasImage?: boolean;
}

export function SkeletonCard({ lines = 3, hasImage = false }: SkeletonCardProps) {
  return (
    <div className={styles.skeletonCard} aria-hidden>
      {hasImage && (
        <Skeleton
          className={styles.skeletonRounded}
          style={{ width: '100%', height: 160, borderRadius: '0.75rem' }}
        />
      )}
      {Array.from({ length: lines }).map((_, idx) => (
        <Skeleton
          key={idx}
          variant="text"
          style={{ width: `${Math.max(45, 100 - idx * 15)}%` }}
        />
      ))}
      <Skeleton variant="button" />
    </div>
  );
}

// Service card skeleton - matches FeaturedServiceCard dimensions
export function ServiceCardSkeleton() {
  return <div className={styles.serviceCardSkeleton} aria-hidden />;
}

// Horizontal row of service card skeletons
interface ServiceRowSkeletonProps {
  count?: number;
}

export function ServiceRowSkeleton({ count = 4 }: ServiceRowSkeletonProps) {
  return (
    <div className={styles.skeletonRow} aria-hidden>
      {Array.from({ length: count }).map((_, idx) => (
        <ServiceCardSkeleton key={idx} />
      ))}
    </div>
  );
}
