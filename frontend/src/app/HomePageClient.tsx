'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Script from 'next/script';
import styles from './HomePage.module.css';
import { type FilterValues } from '@/components/FilterBar/FilterBar';
import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { useSocket } from '@/context/SocketContext';
import { useAuthModal } from '@/context/AuthModalContext';
import { Service, Trend, TrendCategory } from '@/types';
import { ServiceRowSkeleton } from '@/components/Skeleton/Skeleton';
import dynamic from 'next/dynamic';
import FeaturedSalons from '@/components/FeaturedSalons';
import BeforeAfterSlideshow from '@/components/BeforeAfterSlideshow/BeforeAfterSlideshow';
import FeaturedServicesCategoryRow from '@/components/FeaturedServicesCategoryRow/FeaturedServicesCategoryRow';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import MobileSearch from '@/components/MobileSearch/MobileSearch';
import LoadingSpinner from '@/components/LoadingSpinner/LoadingSpinner';
import { getCategorySlug } from '@/utils/categorySlug';
import AdSense from '@/components/AdSense';
import ServiceCategoryCircles from '@/components/ServiceCategoryCircles/ServiceCategoryCircles';

// Lazy load below-the-fold components for better LCP

const VideoSlideshow = dynamic(() => import('@/components/VideoSlideshow/VideoSlideshow'), {
  loading: () => null,
  ssr: false
});
const TrendRow = dynamic(() => import('@/components/TrendRow/TrendRow'), {
  ssr: true
});
const ForYouRecommendations = dynamic(() => import('@/components/ForYouRecommendations/ForYouRecommendations'), {
  ssr: false
});

const HERO_IMAGE = {
  src: '/image_01.jpg',
  alt: 'Professional hair styling and beauty services at South African salons',
  // Preload hint for LCP optimization
  blurDataURL: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAAUH/8QAIhAAAgEDAwUBAAAAAAAAAAAAAQIDAAQRBRIhBhMiMUFR/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAZEQACAwEAAAAAAAAAAAAAAAABAgADESH/2gAMAwEAAhEDEEA/AKOm6hqF1qMUV1cSSwq2WRmJBx+VYpSlKqxYAOxP/9k='
};

type ServiceWithSalon = Service & { salon: { id: string; name: string, city: string, province: string } };

interface HomePageClientProps {
  initialServices: ServiceWithSalon[];
  initialTrends: Record<TrendCategory, Trend[]>;
  initialFeaturedSalons: any[];
  initialBeforeAfter: any[];
  initialHasMore: boolean;
  initialTotalPages: number;
}

export default function HomePageClient({
  initialServices,
  initialTrends,
  initialFeaturedSalons,
  initialBeforeAfter,
  initialHasMore,
  initialTotalPages
}: HomePageClientProps) {
  const router = useRouter();
  const { openModal } = useAuthModal();
  const [services, setServices] = useState<ServiceWithSalon[]>(initialServices);
  const [page, setPage] = useState(2); // Start at page 2 since we have page 1
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [isLoading, setIsLoading] = useState(false);
  // Track if initial data has been loaded - true if server provided data (even if empty array)
  const [hasInitiallyLoaded, setHasInitiallyLoaded] = useState(true);
  const loader = useRef(null);
  const [trendsData, setTrendsData] = useState<Record<TrendCategory, Trend[]>>(initialTrends);

  const observer = useRef<IntersectionObserver | null>(null);
  const socket = useSocket();
  const isMobile = useMediaQuery('(max-width: 768px)');

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.stylrsa.co.za';

  const fetchServices = useCallback(async (pageNum: number) => {
    setIsLoading(true);
    try {
      // Add timeout to prevent infinite loading
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const res = await fetch(`/api/services/approved?page=${pageNum}&pageSize=24`, {
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (res.ok) {
        const data: { services: ServiceWithSalon[], currentPage: number, totalPages: number } = await res.json();

        setServices(prev => {
          const allServices = [...prev, ...data.services];
          const uniqueServicesMap = new Map(allServices.map(item => [item.id, item]));
          return Array.from(uniqueServicesMap.values());
        });

        setHasMore(data.currentPage < data.totalPages);
        setPage(data.currentPage + 1);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      // Silently fail on timeout/abort
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('Failed to fetch services:', error);
      }
      setHasMore(false);
    } finally {
      setIsLoading(false);
      setHasInitiallyLoaded(true);
    }
  }, []);

  // Define the specific categories to display in order (excluding "Other Services")
  const FEATURED_CATEGORIES = [
    'Braiding & Weaving',
    'Nail Care',
    'Makeup & Beauty',
    'Haircuts & Styling',
    'Massage & Spa',
    "Men's Grooming"
  ];

  const groupedServices = useMemo(() => {
    const grouped: Record<string, ServiceWithSalon[]> = {};

    services.forEach((service) => {
      const categoryName =
        (service as any).category?.name ||
        (service as any).categoryName ||
        service.category ||
        'Other Services';

      // Skip "Other Services" category
      if (categoryName === 'Other Services' || categoryName === 'Other') {
        return;
      }

      if (!grouped[categoryName]) {
        grouped[categoryName] = [];
      }
      grouped[categoryName].push(service);
    });

    // Sort services within each category by visibility weight
    Object.keys(grouped).forEach(category => {
      grouped[category] = grouped[category].sort((a, b) => {
        const planWeightA = (a.salon as any)?.visibilityWeight || 0;
        const planWeightB = (b.salon as any)?.visibilityWeight || 0;
        return planWeightB - planWeightA;
      });
    });

    // Return categories in the defined order
    const ordered: Record<string, ServiceWithSalon[]> = {};
    FEATURED_CATEGORIES.forEach(category => {
      if (grouped[category] && grouped[category].length > 0) {
        ordered[category] = grouped[category];
      }
    });

    // Add any remaining categories not in the predefined list (but not "Other Services")
    Object.keys(grouped).forEach(category => {
      if (!FEATURED_CATEGORIES.includes(category) && !ordered[category]) {
        ordered[category] = grouped[category];
      }
    });

    return ordered;
  }, [services]);

  useEffect(() => {
    if (!socket) return;
    const handler = () => {
      setServices([]);
      setPage(1);
      setHasMore(true);
      void fetchServices(1);
    };
    socket.on('visibility:updated', handler);
    return () => {
      socket.off('visibility:updated', handler);
    };
  }, [socket, fetchServices]);

  const handleObserver = useCallback((entries: IntersectionObserverEntry[]) => {
    const target = entries[0];
    if (target.isIntersecting && !isLoading && hasMore) {
      fetchServices(page);
    }
  }, [isLoading, hasMore, page, fetchServices]);

  useEffect(() => {
    const option: IntersectionObserverInit = {
      root: null,
      rootMargin: '400px 0px',
      threshold: 0.25,
    };

    observer.current = new IntersectionObserver(handleObserver, option);

    const currentLoader = loader.current;
    if (currentLoader) {
      observer.current.observe(currentLoader);
    }

    return () => {
      if (currentLoader) {
        observer.current?.unobserve(currentLoader);
      }
    };
  }, [handleObserver]);

  const handleSearch = (filters: FilterValues) => {
    const query = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (typeof value === 'boolean') {
        if (value) {
          query.append(key, 'true');
        }
        return;
      }
      if (typeof value === 'number' || (typeof value === 'string' && value.trim().length > 0)) {
        query.append(key, String(value));
      }
    });
    const queryString = query.toString();

    const hasServiceQuery = filters.service && filters.service.trim().length > 0;
    const hasCategoryQuery = filters.category && filters.category.trim().length > 0;
    const shouldSearchServices = hasServiceQuery || hasCategoryQuery;

    const targetPath = shouldSearchServices ? '/services' : '/salons';
    router.push(`${targetPath}${queryString ? `?${queryString}` : ''}`);
  };

  return (
    <div className={styles.container}>
      <div className={styles.fixedSearchBar}>
        <MobileSearch onSearch={handleSearch} />
      </div>

      <section className={styles.hero} aria-label="Hero section">
        <Image
          src={HERO_IMAGE.src}
          alt={HERO_IMAGE.alt}
          className={styles.heroImage}
          fill
          priority
          fetchPriority="high"
          sizes="100vw"
          quality={isMobile ? 70 : 80}
          placeholder="blur"
          blurDataURL={HERO_IMAGE.blurDataURL}
          loading="eager"
        />
        <div className={styles.heroGradient} />
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle} id="hero-title">
            Find Your Perfect Salon in South Africa
          </h1>

          <div className={styles.heroSearchContainer}>
            <div className={styles.heroSearchBox}>
              <input
                type="text"
                placeholder="Search for a service or location..."
                className={styles.heroSearchInput}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const value = (e.target as HTMLInputElement).value.trim();
                    if (value) {
                      router.push(`/services?service=${encodeURIComponent(value)}`);
                    }
                  }
                }}
              />
              <button
                className={styles.heroSearchButton}
                onClick={() => {
                  const input = document.querySelector(`.${styles.heroSearchInput}`) as HTMLInputElement;
                  const value = input?.value.trim();
                  if (value) {
                    router.push(`/services?service=${encodeURIComponent(value)}`);
                  } else {
                    router.push('/services');
                  }
                }}
              >
                Search
              </button>
            </div>

            <div className={styles.quickCategories}>
              <Link href="/services/haircuts-styling" className={styles.quickCategoryBtn}>
                Hair
              </Link>
              <Link href="/services/nail-care" className={styles.quickCategoryBtn}>
                Nails
              </Link>
              <Link href="/services/massage-body-treatments" className={styles.quickCategoryBtn}>
                Spa
              </Link>
              <Link href="/services/makeup-beauty" className={styles.quickCategoryBtn}>
                Makeup
              </Link>
              <Link href="/salons" className={styles.quickCategoryBtn}>
                Near Me
              </Link>
            </div>
          </div>
        </div>
      </section>

      <FeaturedSalons initialSalons={initialFeaturedSalons} />

      {/* Service Category Circles - Browse by category */}
      <ServiceCategoryCircles />

      {/* Ad placement 1: After categories - user has seen main content */}
      <AdSense slot="6873445391" format="auto" />

      {Object.keys(trendsData).length > 0 && (
        <>
          {trendsData.HAIRSTYLE && trendsData.HAIRSTYLE.length > 0 && (
            <TrendRow
              title="Trending Hairstyles"
              category="HAIRSTYLE"
              trends={trendsData.HAIRSTYLE}
            />
          )}
          {trendsData.BRAIDS && trendsData.BRAIDS.length > 0 && (
            <TrendRow
              title="Trending Braids"
              category="BRAIDS"
              trends={trendsData.BRAIDS}
            />
          )}
          {trendsData.NAILS && trendsData.NAILS.length > 0 && (
            <TrendRow
              title="Trending Nails"
              category="NAILS"
              trends={trendsData.NAILS}
            />
          )}
          {trendsData.SPA && trendsData.SPA.length > 0 && (
            <TrendRow
              title="Trending Spa"
              category="SPA"
              trends={trendsData.SPA}
            />
          )}
          {trendsData.MAKEUP && trendsData.MAKEUP.length > 0 && (
            <TrendRow
              title="Trending Makeup"
              category="MAKEUP"
              trends={trendsData.MAKEUP}
            />
          )}
          {trendsData.BARBERING && trendsData.BARBERING.length > 0 && (
            <TrendRow
              title="Trending Barbering"
              category="BARBERING"
              trends={trendsData.BARBERING}
            />
          )}
        </>
      )}

      <ForYouRecommendations />

      <BeforeAfterSlideshow initialPhotos={initialBeforeAfter} />

      {/* Ad placement 2: After slideshow - engaged users scrolling */}
      <AdSense slot="6873445391" format="auto" />

      <VideoSlideshow />

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Browse by Service Category</h2>
        <div className={styles.serviceCategoryRow}>
          <Link href="/services/braiding-weaving" className={styles.serviceCategoryBtn}>
            Braiding & Weaving
          </Link>
          <Link href="/services/nail-care" className={styles.serviceCategoryBtn}>
            Nail Care
          </Link>
          <Link href="/services/makeup-beauty" className={styles.serviceCategoryBtn}>
            Makeup & Beauty
          </Link>
          <Link href="/services/haircuts-styling" className={styles.serviceCategoryBtn}>
            Haircuts & Styling
          </Link>
          <Link href="/services/massage-body-treatments" className={styles.serviceCategoryBtn}>
            Massage & Spa
          </Link>
          <Link href="/services/mens-grooming" className={styles.serviceCategoryBtn}>
            Men's Grooming
          </Link>
        </div>
      </section>

      {/* Only show Featured Services section if there's content or still loading initial data */}
      {(Object.keys(groupedServices).length > 0 || !hasInitiallyLoaded) && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Featured Services</h2>
          {Object.keys(groupedServices).length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
              {Object.entries(groupedServices).map(([categoryName, categoryServices]) => {
                const categorySlug = getCategorySlug(categoryName);
                return (
                  <FeaturedServicesCategoryRow
                    key={categoryName}
                    categoryName={categoryName}
                    services={categoryServices}
                    categorySlug={categorySlug}
                  />
                );
              })}
            </div>
          ) : !hasInitiallyLoaded ? (
            /* Only show skeleton while initial data is loading */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '0 1rem' }}>
              {FEATURED_CATEGORIES.slice(0, 3).map((category) => (
                <div key={category}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <div style={{ height: '1rem', width: '120px', background: 'rgba(200,200,200,0.3)', borderRadius: '4px' }} />
                    <div style={{ height: '0.875rem', width: '60px', background: 'rgba(200,200,200,0.3)', borderRadius: '4px' }} />
                  </div>
                  <ServiceRowSkeleton count={5} />
                </div>
              ))}
            </div>
          ) : null}

          <div ref={loader} />

          {isLoading && page > 2 && (
            <div className={styles.spinnerContainer}>
              <LoadingSpinner size="medium" color="primary" />
            </div>
          )}

          {!hasMore && services.length > 0 && (
            <p className={styles.endOfList}>You've reached the end!</p>
          )}
        </section>
      )}

      <Script
        id="organization-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: 'Stylr SA',
            alternateName: 'StylrSA',
            url: siteUrl,
            logo: `${siteUrl}/logo-transparent.png`,
            description: 'South Africa\'s premier destination for luxury beauty & wellness. Book appointments at top-rated premium salons, medical spas, beauty clinics & expert wellness professionals.',
            sameAs: [
              'https://www.facebook.com/stylrsa',
              'https://www.instagram.com/stylrsa',
              'https://twitter.com/stylrsa',
              'https://www.linkedin.com/company/stylrsa',
            ],
            contactPoint: {
              '@type': 'ContactPoint',
              contactType: 'Customer Service',
              availableLanguage: ['English', 'Afrikaans'],
              areaServed: 'ZA',
            },
            address: {
              '@type': 'PostalAddress',
              addressCountry: 'ZA',
            },
            aggregateRating: {
              '@type': 'AggregateRating',
              ratingValue: '4.8',
              reviewCount: '1250',
              bestRating: '5',
              worstRating: '1',
            },
            offers: {
              '@type': 'AggregateOffer',
              priceCurrency: 'ZAR',
              availability: 'https://schema.org/InStock',
            },
          }),
        }}
      />
    </div>
  );
}
