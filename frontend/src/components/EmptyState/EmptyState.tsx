'use client';

import { ReactNode } from 'react';
import { 
  FaSearch, 
  FaHeart, 
  FaCalendarAlt, 
  FaInbox, 
  FaExclamationCircle,
  FaShoppingBag,
  FaImages,
  FaUsers,
  FaMapMarkerAlt
} from 'react-icons/fa';
import styles from './EmptyState.module.css';

export type EmptyStateVariant = 
  | 'no-results' 
  | 'no-favorites' 
  | 'no-bookings' 
  | 'no-orders'
  | 'no-messages'
  | 'no-promotions'
  | 'no-gallery'
  | 'no-services'
  | 'no-location'
  | 'error'
  | 'custom';

interface EmptyStateProps {
  variant?: EmptyStateVariant;
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  illustration?: ReactNode;
  className?: string;
}

const variantConfig: Record<EmptyStateVariant, { icon: ReactNode; defaultTitle: string; defaultDescription: string }> = {
  'no-results': {
    icon: <FaSearch />,
    defaultTitle: 'No Results Found',
    defaultDescription: 'Try adjusting your filters or search terms to find what you\'re looking for.'
  },
  'no-favorites': {
    icon: <FaHeart />,
    defaultTitle: 'No Favorites Yet',
    defaultDescription: 'Start exploring salons and services, then add them to your favorites for easy access.'
  },
  'no-bookings': {
    icon: <FaCalendarAlt />,
    defaultTitle: 'No Bookings Yet',
    defaultDescription: 'Book your first appointment with any of our amazing salons and services.'
  },
  'no-orders': {
    icon: <FaShoppingBag />,
    defaultTitle: 'No Orders Yet',
    defaultDescription: 'Browse our product catalog and place your first order to get started.'
  },
  'no-messages': {
    icon: <FaInbox />,
    defaultTitle: 'No Messages',
    defaultDescription: 'Your conversations with salon owners will appear here.'
  },
  'no-promotions': {
    icon: <FaExclamationCircle />,
    defaultTitle: 'No Promotions Available',
    defaultDescription: 'Check back soon for exciting deals and special offers from our salons.'
  },
  'no-gallery': {
    icon: <FaImages />,
    defaultTitle: 'No Gallery Images',
    defaultDescription: 'Gallery images will be displayed here once available.'
  },
  'no-services': {
    icon: <FaUsers />,
    defaultTitle: 'No Services Available',
    defaultDescription: 'Services will appear here once they are added.'
  },
  'no-location': {
    icon: <FaMapMarkerAlt />,
    defaultTitle: 'No Salons in This Area',
    defaultDescription: 'Try searching in a different location or check back soon as we expand.'
  },
  'error': {
    icon: <FaExclamationCircle />,
    defaultTitle: 'Something Went Wrong',
    defaultDescription: 'We encountered an error. Please try again or contact support if the problem persists.'
  },
  'custom': {
    icon: null,
    defaultTitle: '',
    defaultDescription: ''
  }
};

export default function EmptyState({ 
  variant = 'custom',
  icon, 
  title, 
  description, 
  action, 
  illustration,
  className = ''
}: EmptyStateProps) {
  const config = variantConfig[variant];
  const displayIcon = icon || config.icon;
  const displayTitle = title || config.defaultTitle;
  const displayDescription = description || config.defaultDescription;

  return (
    <div className={`${styles.emptyState} ${className}`}>
      {illustration && (
        <div className={styles.illustration}>
          {illustration}
        </div>
      )}
      {displayIcon && !illustration && (
        <div className={styles.icon}>
          {displayIcon}
        </div>
      )}
      <h3 className={styles.title}>{displayTitle}</h3>
      {displayDescription && (
        <p className={styles.description}>{displayDescription}</p>
      )}
      {action && (
        <div className={styles.action}>
          {action}
        </div>
      )}
    </div>
  );
}
