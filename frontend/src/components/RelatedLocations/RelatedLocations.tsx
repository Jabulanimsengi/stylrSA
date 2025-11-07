import Link from 'next/link';
import styles from './RelatedLocations.module.css';

interface RelatedLocation {
  name: string;
  url: string;
}

interface RelatedLocationsProps {
  title?: string;
  locations: RelatedLocation[];
  type?: 'cities' | 'provinces' | 'categories';
}

export default function RelatedLocations({ 
  title, 
  locations, 
  type = 'cities' 
}: RelatedLocationsProps) {
  if (!locations || locations.length === 0) {
    return null;
  }

  const defaultTitle = type === 'cities' 
    ? 'Popular Cities' 
    : type === 'provinces' 
    ? 'Other Provinces' 
    : 'Related Services';

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>{title || defaultTitle}</h3>
      <ul className={styles.list}>
        {locations.map((location, index) => (
          <li key={index} className={styles.item}>
            <Link href={location.url} className={styles.link}>
              {location.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

