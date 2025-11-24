'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Script from 'next/script';
import styles from './HomePage.module.css';
import FilterBar, { type FilterValues } from '@/components/FilterBar/FilterBar';
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
import TypingAnimation from '@/components/TypingAnimation/TypingAnimation';

const HERO_SLIDES = [
  { src: '/image_01.png', alt: 'Professional hair styling and beauty services at South African salons' },
  { src: '/image_02.png', alt: 'Expert hairdresser creating beautiful hairstyles' },
  { src: '/image_03.png', alt: 'Modern salon interior with professional beauty equipment' },
  { src: '/image_04.png', alt: 'Hair coloring and treatment services by certified stylists' },
  { src: '/image_05.png', alt: 'Nail care and manicure services at premium salons' },
  { src: '/image_06.png', alt: 'Makeup application and beauty consultation services' },
  { src: '/image_07.png', alt: 'Hair braiding and African hairstyle specialists' },
];

const SLIDE_INTERVAL = 6000;

const TYPING_WORDS = [
  'Luxury Beauty',
  'Wellness',
  'Premium Salons',
  'Spa Experiences',
  'Expert Stylists',
  'Beauty Treatments',
];

const getMobileSlides = () => {
  return HERO_SLIDES.slice(0, 4);
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
  const [currentSlide, setCurrentSlide] = useState(0);
  const socket = useSocket();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const slidesToShow = isMobile ? getMobileSlides() : HERO_SLIDES;
  const totalSlides = slidesToShow.length;

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

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev === totalSlides - 1 ? 0 : prev + 1));
    }, SLIDE_INTERVAL);

    return () => clearInterval(timer);
  }, [totalSlides]);

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

      <section className={styles.hero} aria-label="Hero section with rotating images">
        <div className={styles.heroMedia} aria-hidden="true">
          {slidesToShow.map((slide, index) => (
            <Image
              key={slide.src}
              src={slide.src}
              alt={slide.alt}
              className={`${styles.heroImage} ${index === currentSlide ? styles.heroImageActive : ''}`}
              fill
              priority={index === 0}
              sizes="100vw"
              loading={index === 0 ? 'eager' : 'lazy'}
              quality={isMobile ? 75 : 85}
            />
          ))}
          <div className={styles.heroGradient} />
        </div>
        <div className={styles.heroContent}>
          <div className={styles.heroLeft}>
            <div className={styles.heroBadge}>No. 1 Beauty Platform</div>
            <div className={styles.heroCopy}>
              <h1 className={styles.heroTitle} id="hero-title">
                South Africa's Premier Destination for <TypingAnimation words={TYPING_WORDS} />
              </h1>
              <p className={styles.heroSubtitle} aria-describedby="hero-title">Experience excellence with South Africa's most trusted premium salons, luxury spas, beauty clinics, and expert wellness professionals. Elevate your beauty journey with the finest service providers in one exclusive platform.</p>
            </div>

            {!isMobile && (
              <div className={styles.heroActions}>
                <Link href="/salons" className="btn btn-primary">
                  Explore Premium Salons
                </Link>
                <Link href="/services" className="btn btn-primary">
                  Browse Luxury Services
                </Link>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => openModal('register')}
                >
                  Join as Premium Partner
                </button>
              </div>
            )}

            <div className={styles.heroStats}>
              <div className={styles.stat}>
                <strong className={styles.statValue}>500+</strong>
                <span className={styles.statLabel}>Premium Partners</span>
              </div>
              <div className={styles.statDivider} />
              <div className={styles.stat}>
                <strong className={styles.statValue}>50,000+</strong>
                <span className={styles.statLabel}>Exclusive Bookings</span>
              </div>
              <div className={styles.statDivider} />
              <div className={styles.stat}>
                <strong className={styles.statValue}>4.9★</strong>
                <span className={styles.statLabel}>Elite Service Rating</span>
              </div>
            </div>
          </div>

          {!isMobile && (
            <div className={styles.heroRight}>
              <div className={styles.filterContainer}>
                <FilterBar onSearch={handleSearch} isHomePage={true} orientation="vertical" />
              </div>
            </div>
          )}
        </div>

        <div className={styles.progressBar}>
          <div
            className={styles.progressFill}
            key={currentSlide}
          />
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

      {!isMobile && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Browse by Service Category</h2>
          <div
            className={styles.categoryGrid}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1.5rem',
              marginBottom: '3rem'
            }}
          >
            <Link href="/services/braiding-weaving" className="btn btn-primary" style={{ textAlign: 'center' }}>
              Braiding & Weaving
            </Link>
            <Link href="/services/nail-care" className="btn btn-primary" style={{ textAlign: 'center' }}>
              Nail Care
            </Link>
            <Link href="/services/makeup-beauty" className="btn btn-primary" style={{ textAlign: 'center' }}>
              Makeup & Beauty
            </Link>
            <Link href="/services/haircuts-styling" className="btn btn-primary" style={{ textAlign: 'center' }}>
              Haircuts & Styling
            </Link>
            <Link href="/services/massage-body-treatments" className="btn btn-primary" style={{ textAlign: 'center' }}>
              Massage & Spa
            </Link>
            <Link href="/services/mens-grooming" className="btn btn-primary" style={{ textAlign: 'center' }}>
              Men's Grooming
            </Link>
          </div>
        </section>
      )}

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
