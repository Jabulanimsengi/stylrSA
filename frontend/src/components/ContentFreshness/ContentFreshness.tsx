import styles from './ContentFreshness.module.css';

interface ContentFreshnessProps {
  publishedDate: string;
  modifiedDate?: string;
  showLabel?: boolean;
  variant?: 'inline' | 'badge';
}

/**
 * SEO component to display content freshness signals
 * Shows "Last Updated" dates to indicate content is current
 */
export default function ContentFreshness({
  publishedDate,
  modifiedDate,
  showLabel = true,
  variant = 'inline',
}: ContentFreshnessProps) {
  const published = new Date(publishedDate);
  const modified = modifiedDate ? new Date(modifiedDate) : null;
  const displayDate = modified || published;
  const isUpdated = modified && modified > published;

  // Calculate days since last update
  const daysSinceUpdate = Math.floor(
    (Date.now() - displayDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  // Determine freshness status
  const getFreshnessStatus = () => {
    if (daysSinceUpdate <= 7) return 'fresh';
    if (daysSinceUpdate <= 30) return 'recent';
    if (daysSinceUpdate <= 90) return 'moderate';
    return 'old';
  };

  const status = getFreshnessStatus();

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getRelativeTime = () => {
    if (daysSinceUpdate === 0) return 'Today';
    if (daysSinceUpdate === 1) return 'Yesterday';
    if (daysSinceUpdate < 7) return `${daysSinceUpdate} days ago`;
    if (daysSinceUpdate < 30) return `${Math.floor(daysSinceUpdate / 7)} weeks ago`;
    if (daysSinceUpdate < 365) return `${Math.floor(daysSinceUpdate / 30)} months ago`;
    return `${Math.floor(daysSinceUpdate / 365)} years ago`;
  };

  if (variant === 'badge') {
    return (
      <div className={`${styles.badge} ${styles[status]}`}>
        {isUpdated && showLabel && <span className={styles.label}>Updated: </span>}
        <time dateTime={displayDate.toISOString()}>
          {getRelativeTime()}
        </time>
      </div>
    );
  }

  return (
    <div className={styles.inline}>
      {showLabel && (
        <span className={styles.label}>
          {isUpdated ? 'Last Updated: ' : 'Published: '}
        </span>
      )}
      <time dateTime={displayDate.toISOString()} className={styles.date}>
        {formatDate(displayDate)}
      </time>
      {isUpdated && (
        <span className={styles.relative}> ({getRelativeTime()})</span>
      )}
    </div>
  );
}
