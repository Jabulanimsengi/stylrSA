'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import styles from './HomePage.module.css';
import FilterBar from '@/components/FilterBar/FilterBar';
import { useEffect, useState, useRef, useCallback } from 'react';
import { Service } from '@/types';
import FeaturedServiceCard from '@/components/FeaturedServiceCard';
import LoadingSpinner from '@/components/LoadingSpinner';

const HERO_SLIDES = [
  {
    src: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=2070&auto=format&fit=crop',
    alt: 'Modern salon interior with stylish lighting',
  },
  {
    src: 'https://images.unsplash.com/photo-1520338661084-680395057dc0?q=80&w=2070&auto=format&fit=crop',
    alt: 'Stylist attending to a client in a bright salon',
  },
  {
    src: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=2070&auto=format&fit=crop',
    alt: 'Salon workspace with premium hair products on shelves',
  },
  {
    src: 'https://images.unsplash.com/photo-1502786129293-79981df4e689?q=80&w=2070&auto=format&fit=crop',
    alt: 'Comfortable salon waiting area',
  },
];

const SLIDE_INTERVAL = 6000;

type ServiceWithSalon = Service & { salon: { id: string; name: string, city: string, province: string } };

export default function HomePage() {
  const router = useRouter();
  const [services, setServices] = useState<ServiceWithSalon[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const loader = useRef(null);
  
  const observer = useRef<IntersectionObserver | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const totalSlides = HERO_SLIDES.length;

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

  const handlePrevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev === 0 ? totalSlides - 1 : prev - 1));
  }, [totalSlides]);

  const handleNextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev === totalSlides - 1 ? 0 : prev + 1));
  }, [totalSlides]);

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

  const handleSearch = (filters: any) => {
    const query = new URLSearchParams(filters).toString();
    router.push(`/salons?${query}`);
  };

  return (
    <div className={styles.container}>
      {isLoading && page === 1 && (
        <div className={styles.grid} aria-hidden>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} style={{
              height: 220,
              borderRadius: 12,
              background: 'linear-gradient(90deg, #eee 25%, #f5f5f5 37%, #eee 63%)',
              backgroundSize: '400% 100%',
              animation: 'pulse 1.4s ease infinite'
            }} />
          ))}
        </div>
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
            <span className={styles.heroBadge}>Your personal salon concierge</span>
            <h1 className={styles.heroTitle}>Find &amp; Book Your Next Salon Visit</h1>
            <p className={styles.heroSubtitle}>Discover top-rated salons, stylists, and premium experiences matched to your style.</p>
          </div>
          <div className={styles.filterContainer}>
            <FilterBar onSearch={handleSearch} isHomePage={true} />
          </div>
          <div className={styles.heroActions}>
            <Link href="/salons" className="btn btn-primary">
              Explore Salons
            </Link>
            <Link href="/services" className="btn btn-ghost">
              Browse Services
            </Link>
          </div>
        </div>
        <div className={styles.heroControls}>
          <button type="button" className={styles.heroNavButton} onClick={handlePrevSlide} aria-label="Previous slide">
            ‹
          </button>
          <button type="button" className={styles.heroNavButton} onClick={handleNextSlide} aria-label="Next slide">
            ›
          </button>
        </div>
        <div className={styles.heroDots}>
          {HERO_SLIDES.map((_, index) => (
            <button
              key={`hero-dot-${index}`}
              type="button"
              className={`${styles.heroDot} ${index === currentSlide ? styles.heroDotActive : ''}`}
              onClick={() => setCurrentSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Featured Services</h2>
        
        {services.length > 0 && (
          <div className={styles.grid}>
            {services.map((service) => (
              <FeaturedServiceCard key={service.id} service={service} />
            ))}
          </div>
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