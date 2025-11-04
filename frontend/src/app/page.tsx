'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Script from 'next/script';
import styles from './HomePage.module.css';
import FilterBar, { type FilterValues } from '@/components/FilterBar/FilterBar';
import { useEffect, useState, useRef, useCallback } from 'react';
import { useSocket } from '@/context/SocketContext';
import { useAuthModal } from '@/context/AuthModalContext';
import { Service } from '@/types';
import FeaturedServiceCard, { FeaturedServiceCardSkeleton } from '@/components/FeaturedServiceCard';
import { SkeletonGroup } from '@/components/Skeleton/Skeleton';
import FeaturedSalons from '@/components/FeaturedSalons';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import MobileSearch from '@/components/MobileSearch/MobileSearch';
import BeforeAfterSlideshow from '@/components/BeforeAfterSlideshow/BeforeAfterSlideshow';
import VideoSlideshow from '@/components/VideoSlideshow/VideoSlideshow';
import TrendRow from '@/components/TrendRow/TrendRow';
import { Trend, TrendCategory } from '@/types';

const HERO_SLIDES = [
  { src: '/image_01.png', alt: 'Salon hero 1' },
  { src: '/image_02.png', alt: 'Salon hero 2' },
  { src: '/image_03.png', alt: 'Salon hero 3' },
  { src: '/image_04.png', alt: 'Salon hero 4' },
  { src: '/image_05.png', alt: 'Salon hero 5' },
  { src: '/image_06.png', alt: 'Salon hero 6' },
  { src: '/image_07.png', alt: 'Salon hero 7' },
];

const SLIDE_INTERVAL = 6000;

type ServiceWithSalon = Service & { salon: { id: string; name: string, city: string, province: string } };

export default function HomePage() {
  const router = useRouter();
  const { openModal } = useAuthModal();
  const [services, setServices] = useState<ServiceWithSalon[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const loader = useRef(null);
  const [trendsData, setTrendsData] = useState<Record<TrendCategory, Trend[]>>({} as Record<TrendCategory, Trend[]>);
  const [trendsLoading, setTrendsLoading] = useState(true);
  
  const observer = useRef<IntersectionObserver | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const totalSlides = HERO_SLIDES.length;
  const socket = useSocket();
  const isMobile = useMediaQuery('(max-width: 768px)');

  // Comprehensive Schema.org markup for homepage SEO and brand recognition
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.stylrsa.co.za';
  
  // Organization Schema - Critical for brand recognition
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${siteUrl}/#organization`,
    name: 'Stylr SA',
    legalName: 'Stylr South Africa',
    alternateName: ['stylrsa', 'Stylr', 'Stylr South Africa'],
    url: siteUrl,
    logo: {
      '@type': 'ImageObject',
      '@id': `${siteUrl}/#logo`,
      url: `${siteUrl}/logo-transparent.png`,
      width: '800',
      height: '600',
      caption: 'Stylr SA Logo',
    },
    image: `${siteUrl}/logo-transparent.png`,
    description: 'South Africa\'s premier platform for discovering and booking beauty services. Connect with top-rated salons, hair stylists, braiders, nail technicians, makeup artists, and wellness professionals across South Africa.',
    foundingDate: '2024',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'ZA',
      addressRegion: 'Gauteng',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      availableLanguage: ['en', 'zu', 'xh', 'af'],
    },
    sameAs: [
      // Add your social media profiles here when available
      // 'https://www.facebook.com/stylrsa',
      // 'https://www.instagram.com/stylrsa',
      // 'https://twitter.com/stylrsa',
    ],
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      reviewCount: '50000',
      bestRating: '5',
      worstRating: '1',
    },
    areaServed: {
      '@type': 'Country',
      name: 'South Africa',
    },
  };

  // WebSite Schema - Enables Google sitelinks search box
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${siteUrl}/#website`,
    url: siteUrl,
    name: 'Stylr SA',
    alternateName: 'stylrsa.co.za',
    description: 'Book beauty services online - Find salons, stylists, and beauty professionals in South Africa',
    publisher: {
      '@id': `${siteUrl}/#organization`,
    },
    potentialAction: [
      {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${siteUrl}/salons?q={search_term_string}`,
        },
        'query-input': 'required name=search_term_string',
      },
    ],
  };

  // BreadcrumbList Schema for homepage
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: siteUrl,
      },
    ],
  };

  const fetchServices = useCallback(async (pageNum: number) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/services/approved?page=${pageNum}&pageSize=12`);
      if (res.ok) {
        // FIX: Explicitly typing the 'data' object from the API response
        const data: { services: ServiceWithSalon[], currentPage: number, totalPages: number } = await res.json();
        
        setServices(prev => {
          const allServices = pageNum === 1 ? data.services : [...prev, ...data.services];
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

  useEffect(() => {
    fetchServices(1);
  }, [fetchServices]);

  // Fetch trends data
  useEffect(() => {
    const fetchTrends = async () => {
      try {
        const res = await fetch('/api/trends');
        if (res.ok) {
          const data = await res.json();
          setTrendsData(data);
        }
      } catch (error) {
        console.error('Failed to fetch trends:', error);
      } finally {
        setTrendsLoading(false);
      }
    };

    fetchTrends();
  }, []);

  useEffect(() => {
    if (!socket) return;
    const handler = () => {
      // Re-fetch first page to reflect latest visibility ordering
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
    console.log('[HomePage] Search triggered with filters:', filters);
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
    
    // Route to /services if:
    // 1. User typed a service name, OR
    // 2. User selected a category
    const hasServiceQuery = filters.service && filters.service.trim().length > 0;
    const hasCategoryQuery = filters.category && filters.category.trim().length > 0;
    const shouldSearchServices = hasServiceQuery || hasCategoryQuery;
    
    const targetPath = shouldSearchServices ? '/services' : '/salons';
    console.log('[HomePage] Routing to:', targetPath, 'with query:', queryString);
    router.push(`${targetPath}${queryString ? `?${queryString}` : ''}`);
  };

  return (
    <div className={styles.container}>
      <Script
        id="organization-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        strategy="afterInteractive"
      />
      <div className={styles.fixedSearchBar}>
        <MobileSearch onSearch={handleSearch} />
      </div>
      {isLoading && services.length === 0 && (
        <SkeletonGroup count={8} className={styles.grid}>
          {() => <FeaturedServiceCardSkeleton />}</SkeletonGroup>
      )}
      <section className={styles.hero}>
        <div className={styles.heroMedia} aria-hidden="true">
          {HERO_SLIDES.map((slide, index) => (
            <Image
              key={slide.src}
              src={slide.src}
              alt={slide.alt}
              className={`${styles.heroImage} ${index === currentSlide ? styles.heroImageActive : ''}`}
              fill
              priority={index === 0}
              sizes="100vw"
            />
          ))}
          <div className={styles.heroGradient} />
        </div>
        <div className={styles.heroContent}>
          <div className={styles.heroCopy}>
            <h1 className={styles.heroTitle}>Discover South Africa's Top Salons &amp; Beauty Experts</h1>
            <p className={styles.heroSubtitle}>Connect with trusted hairstylists, barbers, and beauty professionals — all in one digital hub built to grow your business and simplify client bookings.</p>
          </div>
          
          {/* Social Proof Stats */}
          <div className={styles.heroStats}>
            <div className={styles.stat}>
              <strong className={styles.statValue}>10,000+</strong>
              <span className={styles.statLabel}>Showed Interests</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.stat}>
              <strong className={styles.statValue}>50,000+</strong>
              <span className={styles.statLabel}>Projected Happy Clients</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.stat}>
              <strong className={styles.statValue}>4.8★</strong>
              <span className={styles.statLabel}>Average Rating</span>
            </div>
          </div>
          
          <div className={styles.filterContainer}>
            <FilterBar onSearch={handleSearch} isHomePage={true} />
          </div>
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
        </div>

        {/* Progress bar */}
        <div className={styles.progressBar}>
          <div 
            className={styles.progressFill}
            key={currentSlide}
          />
        </div>
      </section>

      {/* Trendz Sections */}
      {!trendsLoading && Object.keys(trendsData).length > 0 && (
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

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Recommended</h2>
        <FeaturedSalons />
      </section>

      {/* Before & After Photos Slideshow */}
      <BeforeAfterSlideshow />

      {/* Service Videos Slideshow */}
      <VideoSlideshow />

      {/* Service Categories Section for SEO */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Browse by Service Category</h2>
        <div 
          className={styles.categoryGrid} 
          style={isMobile ? { 
            display: 'flex',
            gap: '1rem',
            overflowX: 'auto',
            scrollSnapType: 'x mandatory',
            WebkitOverflowScrolling: 'touch',
            marginBottom: '2rem',
            scrollbarWidth: 'none', // Firefox
            msOverflowStyle: 'none', // IE/Edge
          } : { 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
            gap: '1.5rem',
            marginBottom: '3rem'
          }}
        >
          <Link href="/services/braiding-weaving" className="btn btn-primary" style={isMobile ? { 
            minWidth: 'calc(42% - 0.5rem)',
            flex: '0 0 auto',
            textAlign: 'center',
            scrollSnapAlign: 'start',
            padding: '0.75rem 0.5rem',
            fontSize: '0.85rem',
            lineHeight: '1.3',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '3rem'
          } : { textAlign: 'center' }}>
            Braiding & Weaving
          </Link>
          <Link href="/services/nail-care" className="btn btn-primary" style={isMobile ? { 
            minWidth: 'calc(42% - 0.5rem)',
            flex: '0 0 auto',
            textAlign: 'center',
            scrollSnapAlign: 'start',
            padding: '0.75rem 0.5rem',
            fontSize: '0.85rem',
            lineHeight: '1.3',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '3rem'
          } : { textAlign: 'center' }}>
            Nail Care
          </Link>
          <Link href="/services/makeup-beauty" className="btn btn-primary" style={isMobile ? { 
            minWidth: 'calc(42% - 0.5rem)',
            flex: '0 0 auto',
            textAlign: 'center',
            scrollSnapAlign: 'start',
            padding: '0.75rem 0.5rem',
            fontSize: '0.85rem',
            lineHeight: '1.3',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '3rem'
          } : { textAlign: 'center' }}>
            Makeup & Beauty
          </Link>
          <Link href="/services/haircuts-styling" className="btn btn-primary" style={isMobile ? { 
            minWidth: 'calc(42% - 0.5rem)',
            flex: '0 0 auto',
            textAlign: 'center',
            scrollSnapAlign: 'start',
            padding: '0.75rem 0.5rem',
            fontSize: '0.85rem',
            lineHeight: '1.3',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '3rem'
          } : { textAlign: 'center' }}>
            Haircuts & Styling
          </Link>
          <Link href="/services/massage-body-treatments" className="btn btn-primary" style={isMobile ? { 
            minWidth: 'calc(42% - 0.5rem)',
            flex: '0 0 auto',
            textAlign: 'center',
            scrollSnapAlign: 'start',
            padding: '0.75rem 0.5rem',
            fontSize: '0.85rem',
            lineHeight: '1.3',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '3rem'
          } : { textAlign: 'center' }}>
            Massage & Spa
          </Link>
          <Link href="/services/mens-grooming" className="btn btn-primary" style={isMobile ? { 
            minWidth: 'calc(42% - 0.5rem)',
            flex: '0 0 auto',
            textAlign: 'center',
            scrollSnapAlign: 'start',
            padding: '0.75rem 0.5rem',
            fontSize: '0.85rem',
            lineHeight: '1.3',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '3rem'
          } : { textAlign: 'center' }}>
            Men's Grooming
          </Link>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Featured Services</h2>
        {isLoading && services.length === 0 ? (
          <SkeletonGroup count={8} className={styles.grid}>
            {() => <FeaturedServiceCardSkeleton />}</SkeletonGroup>
        ) : (
          services.length > 0 && (
            <div className={styles.grid}>
              {services.map((service) => (
                <FeaturedServiceCard key={service.id} service={service} />
              ))}
            </div>
          )
        )}

        <div ref={loader} />

        {isLoading && page > 1 && <div className={styles.spinnerContainer}><div className={styles.spinner}></div></div>}
        
        {!hasMore && services.length > 0 && (
          <p className={styles.endOfList}>You've reached the end!</p>
        )}
      </section>
    </div>
  );
}
