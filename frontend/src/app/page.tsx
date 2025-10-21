'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
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
  
  const observer = useRef<IntersectionObserver | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const totalSlides = HERO_SLIDES.length;
  const socket = useSocket();
  const isMobile = useMediaQuery('(max-width: 768px)');

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
    const query = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (typeof value === 'boolean') {
        if (value) {
          query.append(key, 'true');
        }
        return;
      }
      if (value.trim().length > 0) {
        query.append(key, value);
      }
    });
    const queryString = query.toString();
    const hasServiceQuery = filters.service.trim().length > 0;
    const targetPath = hasServiceQuery ? '/services' : '/salons';
    router.push(`${targetPath}${queryString ? `?${queryString}` : ''}`);
  };

  return (
    <div className={styles.container}>
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
          <div className={styles.filterContainer}>
            <FilterBar onSearch={handleSearch} isHomePage={true} />
          </div>
          <div className={styles.heroActions}>
            <Link href="/salons" className="btn btn-primary">
              Explore Salons
            </Link>
            <Link href="/services" className="btn btn-primary">
              Browse Services
            </Link>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => openModal('register')}
            >
              List your services
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

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Recommended Salons</h2>
        <FeaturedSalons />
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