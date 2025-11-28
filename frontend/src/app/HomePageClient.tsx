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
import { FeaturedServiceCardSkeleton } from '@/components/FeaturedServiceCard';
import { SkeletonGroup } from '@/components/Skeleton/Skeleton';
import FeaturedSalons from '@/components/FeaturedSalons';
import FeaturedServicesCategoryRow from '@/components/FeaturedServicesCategoryRow/FeaturedServicesCategoryRow';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import MobileSearch from '@/components/MobileSearch/MobileSearch';
import BeforeAfterSlideshow from '@/components/BeforeAfterSlideshow/BeforeAfterSlideshow';
import VideoSlideshow from '@/components/VideoSlideshow/VideoSlideshow';
import TrendRow from '@/components/TrendRow/TrendRow';
import ForYouRecommendations from '@/components/ForYouRecommendations/ForYouRecommendations';
import LoadingSpinner from '@/components/LoadingSpinner/LoadingSpinner';
import { getCategorySlug } from '@/utils/categorySlug';

const HERO_IMAGE = {
  src: '/image_01.jpg',
  alt: 'Professional hair styling and beauty services at South African salons'
};

type ServiceWithSalon = Service & { salon: { id: string; name: string, city: string, province: string } };

interface HomePageClientProps {
  initialServices: ServiceWithSalon[];
  initialTrends: Record<TrendCategory, Trend[]>;
  initialHasMore: boolean;
  initialTotalPages: number;
}

export default function HomePageClient({
  initialServices,
  initialTrends,
  initialHasMore,
  initialTotalPages
}: HomePageClientProps) {
  const router = useRouter();
  const { openModal } = useAuthModal();
  const [services, setServices] = useState<ServiceWithSalon[]>(initialServices);
  const [page, setPage] = useState(2); // Start at page 2 since we have page 1
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [isLoading, setIsLoading] = useState(false);
  const loader = useRef(null);
  const [trendsData, setTrendsData] = useState<Record<TrendCategory, Trend[]>>(initialTrends);

  const observer = useRef<IntersectionObserver | null>(null);
  const socket = useSocket();
  const isMobile = useMediaQuery('(max-width: 768px)');

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.stylrsa.co.za';

  const fetchServices = useCallback(async (pageNum: number) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/services/approved?page=${pageNum}&pageSize=24`);
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
      console.error('Failed to fetch services:', error);
      setHasMore(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const groupedServices = useMemo(() => {
    const grouped: Record<string, ServiceWithSalon[]> = {};

    services.forEach((service) => {
      const categoryName =
        (service as any).category?.name ||
        (service as any).categoryName ||
        service.category ||
        'Other Services';

      if (!grouped[categoryName]) {
        grouped[categoryName] = [];
      }
      grouped[categoryName].push(service);
    });

    const sorted = Object.entries(grouped)
      .sort(([, aServices], [, bServices]) => bServices.length - aServices.length)
      .reduce((acc, [category, categoryServices]) => {
        acc[category] = categoryServices.sort((a, b) => {
          const planWeightA = (a.salon as any)?.visibilityWeight || 0;
          const planWeightB = (b.salon as any)?.visibilityWeight || 0;
          return planWeightB - planWeightA;
        });
        return acc;
      }, {} as Record<string, ServiceWithSalon[]>);

    return sorted;
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
          sizes="100vw"
          quality={isMobile ? 75 : 85}
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

      <FeaturedSalons />

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

      <BeforeAfterSlideshow />

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

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Featured Services</h2>
        {services.length > 0 && Object.keys(groupedServices).length > 0 ? (
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
        ) : (
          <SkeletonGroup count={8} className={styles.grid}>
            {() => <FeaturedServiceCardSkeleton />}
          </SkeletonGroup>
        )}

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
