import Link from 'next/link';
import styles from './InternalLinks.module.css';

interface InternalLinksProps {
  currentCategory?: string;
  currentCity?: string;
  currentProvince?: string;
  variant?: 'related-services' | 'popular-in-city' | 'nearby-cities' | 'all-categories';
}

const SERVICE_CATEGORIES = [
  { slug: 'nail-care', name: 'Nail Care', keywords: 'manicure, pedicure, gel nails' },
  { slug: 'massage-body-treatments', name: 'Massage & Spa', keywords: 'massage therapy, spa treatments' },
  { slug: 'skin-care-facials', name: 'Skin Care & Facials', keywords: 'facial treatments, skincare' },
  { slug: 'braiding-weaving', name: 'Braiding & Weaving', keywords: 'box braids, knotless braids' },
  { slug: 'makeup-beauty', name: 'Makeup & Beauty', keywords: 'makeup artist, beauty services' },
  { slug: 'haircuts-styling', name: 'Haircuts & Styling', keywords: 'hair salon, hairstylist' },
  { slug: 'hair-color-treatments', name: 'Hair Color & Treatments', keywords: 'hair coloring, balayage' },
  { slug: 'waxing-hair-removal', name: 'Waxing & Hair Removal', keywords: 'waxing, hair removal' },
  { slug: 'mens-grooming', name: 'Men\'s Grooming', keywords: 'barber, men\'s haircut' },
  { slug: 'bridal-services', name: 'Bridal Services', keywords: 'bridal makeup, wedding hair' },
  { slug: 'wig-installations', name: 'Wig Installations', keywords: 'wig installation, lace front' },
  { slug: 'natural-hair-specialists', name: 'Natural Hair Specialists', keywords: 'natural hair care' },
  { slug: 'lashes-brows', name: 'Lashes & Brows', keywords: 'eyelash extensions, microblading' },
  { slug: 'aesthetics-advanced-skin', name: 'Aesthetics & Advanced Skin', keywords: 'botox, fillers' },
  { slug: 'tattoos-piercings', name: 'Tattoos & Piercings', keywords: 'tattoo artist, piercing' },
  { slug: 'wellness-holistic-spa', name: 'Wellness & Holistic Spa', keywords: 'wellness, holistic spa' },
];

const MAJOR_CITIES = [
  { slug: 'johannesburg', name: 'Johannesburg', province: 'gauteng' },
  { slug: 'cape-town', name: 'Cape Town', province: 'western-cape' },
  { slug: 'durban', name: 'Durban', province: 'kwazulu-natal' },
  { slug: 'pretoria', name: 'Pretoria', province: 'gauteng' },
  { slug: 'sandton', name: 'Sandton', province: 'gauteng' },
  { slug: 'port-elizabeth', name: 'Port Elizabeth', province: 'eastern-cape' },
  { slug: 'bloemfontein', name: 'Bloemfontein', province: 'free-state' },
  { slug: 'east-london', name: 'East London', province: 'eastern-cape' },
];

/**
 * SEO-optimized internal linking component
 * Helps distribute page authority and improve crawlability
 */
export default function InternalLinks({
  currentCategory,
  currentCity,
  currentProvince,
  variant = 'related-services',
}: InternalLinksProps) {
  
  // Related Services - Show other service categories
  if (variant === 'related-services') {
    const relatedServices = SERVICE_CATEGORIES
      .filter(cat => cat.slug !== currentCategory)
      .slice(0, 6);

    return (
      <section className={styles.container}>
        <h2 className={styles.title}>Related Services{currentCity ? ` in ${currentCity}` : ''}</h2>
        <p className={styles.description}>
          Looking for other beauty services{currentCity ? ` in ${currentCity}` : ''}? 
          Check out our other service categories:
        </p>
        <div className={styles.linkGrid}>
          {relatedServices.map(service => {
            const href = currentCity && currentProvince
              ? `/services/${service.slug}/location/${currentProvince}/${currentCity}`
              : `/services/${service.slug}`;
            
            return (
              <Link 
                key={service.slug} 
                href={href}
                className={styles.link}
              >
                <span className={styles.linkName}>{service.name}</span>
                <span className={styles.linkKeywords}>{service.keywords}</span>
              </Link>
            );
          })}
        </div>
      </section>
    );
  }

  // Popular in City - Show same category in nearby cities
  if (variant === 'nearby-cities' && currentCategory) {
    const nearbyCities = MAJOR_CITIES
      .filter(city => city.slug !== currentCity)
      .slice(0, 8);

    const categoryName = SERVICE_CATEGORIES.find(c => c.slug === currentCategory)?.name || 'Services';

    return (
      <section className={styles.container}>
        <h2 className={styles.title}>{categoryName} in Other Cities</h2>
        <p className={styles.description}>
          Find {categoryName.toLowerCase()} services in other major cities across South Africa:
        </p>
        <div className={styles.linkGrid}>
          {nearbyCities.map(city => (
            <Link 
              key={city.slug}
              href={`/services/${currentCategory}/location/${city.province}/${city.slug}`}
              className={styles.link}
            >
              <span className={styles.linkName}>{categoryName} in {city.name}</span>
            </Link>
          ))}
        </div>
      </section>
    );
  }

  // All Categories - Show all service categories
  if (variant === 'all-categories') {
    return (
      <section className={styles.container}>
        <h2 className={styles.title}>Browse All Beauty Services</h2>
        <p className={styles.description}>
          Explore our complete range of beauty and wellness services across South Africa:
        </p>
        <div className={styles.linkGrid}>
          {SERVICE_CATEGORIES.map(service => (
            <Link 
              key={service.slug}
              href={`/services/${service.slug}`}
              className={styles.link}
            >
              <span className={styles.linkName}>{service.name}</span>
              <span className={styles.linkKeywords}>{service.keywords}</span>
            </Link>
          ))}
        </div>
      </section>
    );
  }

  // Popular in City - Show popular services in current city
  if (variant === 'popular-in-city' && currentCity) {
    const popularServices = SERVICE_CATEGORIES.slice(0, 8);

    return (
      <section className={styles.container}>
        <h2 className={styles.title}>Popular Services in {currentCity}</h2>
        <p className={styles.description}>
          Discover the most popular beauty services in {currentCity}:
        </p>
        <div className={styles.linkGrid}>
          {popularServices.map(service => {
            const href = currentProvince
              ? `/services/${service.slug}/location/${currentProvince}/${currentCity}`
              : `/services/${service.slug}`;
            
            return (
              <Link 
                key={service.slug}
                href={href}
                className={styles.link}
              >
                <span className={styles.linkName}>{service.name}</span>
                <span className={styles.linkKeywords}>{service.keywords}</span>
              </Link>
            );
          })}
        </div>
      </section>
    );
  }

  return null;
}
