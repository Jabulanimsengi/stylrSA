'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import ServiceCard from '@/components/ServiceCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import FilterBar, { type FilterValues } from '@/components/FilterBar/FilterBar';
import { SkeletonGroup, SkeletonCard } from '@/components/Skeleton/Skeleton';
import styles from '../../../../../salons/SalonsPage.module.css';
import { Service, Salon, Booking } from '@/types';
import { toast } from 'react-toastify';
import ImageLightbox from '@/components/ImageLightbox';
import { useSocket } from '@/context/SocketContext';
import PageNav from '@/components/PageNav';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import MobileSearch from '@/components/MobileSearch/MobileSearch';
import BookingModal from '@/components/BookingModal';
import BookingConfirmationModal from '@/components/BookingConfirmationModal/BookingConfirmationModal';
import { useAuth } from '@/hooks/useAuth';
import { useAuthModal } from '@/context/AuthModalContext';
import { getCategoriesCached } from '@/lib/resourceCache';
import EmptyState from '@/components/EmptyState/EmptyState';
import { generateNearYouH1, generateNearYouContent, CATEGORY_INFO, getAllCategorySlugs } from '@/lib/nearYouContent';
import { getCityInfo, getCitiesByProvince, getProvinceInfo } from '@/lib/locationData';
import RelatedLocations from '@/components/RelatedLocations/RelatedLocations';
import Breadcrumbs from '@/components/Breadcrumbs/Breadcrumbs';
import { pageview } from '@/lib/analytics';

interface Props {
  categorySlug: string;
  provinceSlug: string;
  citySlug: string;
}

export default function ServiceCityNearYouClient({ categorySlug, provinceSlug, citySlug }: Props) {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [showBookingConfirmation, setShowBookingConfirmation] = useState(false);
  const [pendingBookingService, setPendingBookingService] = useState<Service | null>(null);
  const [pendingSalon, setPendingSalon] = useState<Salon | null>(null);
  const [categoryName, setCategoryName] = useState<string | null>(null);
  const isMobile = useMediaQuery('(max-width: 768px)');
  const { authStatus } = useAuth();
  const { openModal } = useAuthModal();
  const socket = useSocket();
  const requestControllerRef = useRef<AbortController | null>(null);
  const latestRequestIdRef = useRef(0);

  const cityInfo = getCityInfo(provinceSlug, citySlug);
  const cityName = cityInfo?.name || citySlug.charAt(0).toUpperCase() + citySlug.slice(1);
  const provinceName = cityInfo?.province || provinceSlug;
  const province = getProvinceInfo(provinceSlug);
  const category = CATEGORY_INFO[categorySlug];
  const h1 = generateNearYouH1(categorySlug, provinceSlug, citySlug);
  const content = generateNearYouContent(categorySlug, provinceSlug, citySlug);

  // Analytics tracking
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const url = `/services/${categorySlug}/near-you/${provinceSlug}/${citySlug}`;
      pageview(url);
    }
  }, [categorySlug, provinceSlug, citySlug]);

  // No-index for empty pages
  useEffect(() => {
    if (services.length === 0 && !isLoading) {
      const metaRobots = document.querySelector('meta[name="robots"]');
      if (metaRobots) {
        metaRobots.setAttribute('content', 'noindex, follow');
      } else {
        const meta = document.createElement('meta');
        meta.name = 'robots';
        meta.content = 'noindex, follow';
        document.head.appendChild(meta);
      }
    }
  }, [services.length, isLoading]);

  // Breadcrumb items
  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Services', href: '/services' },
    { label: category?.name || 'Category', href: `/services/${categorySlug}` },
    { label: 'Near You', href: `/services/${categorySlug}/near-you` },
    ...(province ? [{ label: province.name, href: `/services/${categorySlug}/near-you/${provinceSlug}` }] : []),
    ...(cityInfo ? [{ label: cityInfo.name, href: `/services/${categorySlug}/near-you/${provinceSlug}/${citySlug}` }] : []),
  ];

  // Related service categories
  const relatedCategories = getAllCategorySlugs()
    .filter(slug => slug !== categorySlug)
    .slice(0, 4)
    .map(slug => ({
      name: CATEGORY_INFO[slug]?.name || slug,
      url: `/services/${slug}/near-you/${provinceSlug}/${citySlug}`
    }));

  // Convert slug to category name
  useEffect(() => {
    const fetchCategoryName = async () => {
      try {
        const categories = await getCategoriesCached();
        const normalizedSlug = categorySlug.toLowerCase().replace(/-/g, ' ').replace(/_/g, ' ').trim();
        
        const match = categories.find(cat => {
          const normalizedCategoryName = cat.name
            .toLowerCase()
            .replace(/[^a-z0-9\s]/g, '')
            .replace(/\s+/g, ' ')
            .trim();
          return normalizedCategoryName === normalizedSlug;
        });
        
        if (match) {
          setCategoryName(match.name);
        } else {
          const partialMatch = categories.find(cat => {
            const catWords = cat.name.toLowerCase().split(/\s+/);
            const slugWords = normalizedSlug.split(/\s+/);
            return slugWords.every(word => catWords.some(catWord => catWord.includes(word)));
          });
          
          if (partialMatch) {
            setCategoryName(partialMatch.name);
          } else {
            setCategoryName('');
          }
        }
      } catch (error) {
        console.error('Failed to fetch category name:', error);
        setCategoryName('');
      }
    };
    fetchCategoryName();
  }, [categorySlug]);

  const fetchServices = useCallback(async (catName: string, additionalFilters: FilterValues) => {
    requestControllerRef.current?.abort();
    const controller = new AbortController();
    requestControllerRef.current = controller;
    const requestId = ++latestRequestIdRef.current;

    setIsLoading(true);
    try {
      const query = new URLSearchParams();
      
      if (catName && catName.trim()) {
        query.append('category', catName);
      }
      
      // Add city and province filters
      query.append('city', cityName);
      query.append('province', provinceName);
      
      if (additionalFilters.service) query.append('q', additionalFilters.service);
      if (additionalFilters.offersMobile) query.append('offersMobile', 'true');
      if (additionalFilters.sortBy) query.append('sortBy', additionalFilters.sortBy);
      if (additionalFilters.openNow) query.append('openNow', 'true');
      if (additionalFilters.priceMin) query.append('priceMin', additionalFilters.priceMin);
      if (additionalFilters.priceMax) query.append('priceMax', additionalFilters.priceMax);

      const url = `/api/services/search?${query.toString()}`;
      const res = await fetch(url, { credentials: 'include', signal: controller.signal });
      if (!res.ok) {
        throw new Error(`Failed to search services: ${res.status}`);
      }
      const data = await res.json();
      if (requestId !== latestRequestIdRef.current) {
        return;
      }
      setServices(Array.isArray(data) ? data : []);
    } catch (error) {
      if (controller.signal.aborted) {
        return;
      }
      console.error('Fetch error:', error);
      const message = error instanceof Error ? error.message : 'Search failed';
      toast.error(message);
      setServices([]);
    } finally {
      if (requestId === latestRequestIdRef.current) {
        setIsLoading(false);
        requestControllerRef.current = null;
      }
    }
  }, [cityName, provinceName]);

  // Fetch services when categoryName is resolved
  useEffect(() => {
    if (categoryName !== null) {
      fetchServices(categoryName, {
        province: provinceName,
        city: cityName,
        service: '',
        category: categoryName,
        offersMobile: false,
        sortBy: '',
        openNow: false,
        priceMin: '',
        priceMax: '',
      });
    }
  }, [categoryName, cityName, provinceName, fetchServices]);

  useEffect(() => {
    if (!socket || categoryName === null) return;
    const handler = () => {
      fetchServices(categoryName, {
        province: provinceName,
        city: cityName,
        service: '',
        category: categoryName,
        offersMobile: false,
        sortBy: '',
        openNow: false,
        priceMin: '',
        priceMax: '',
      });
    };
    socket.on('visibility:updated', handler);
    return () => { socket.off('visibility:updated', handler); };
  }, [socket, categoryName, cityName, provinceName, fetchServices]);

  const handleSearch = (nextFilters: FilterValues) => {
    fetchServices(categoryName || '', nextFilters);
  };

  useEffect(() => {
    return () => {
      requestControllerRef.current?.abort();
    };
  }, []);

  const handleOpenLightbox = (images: string[], index: number) => {
    if (!images || images.length === 0) return;
    setLightboxImages(images);
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const handleBookService = async (service: Service) => {
    if (authStatus !== 'authenticated') {
      toast.info('Please log in to book a service.');
      openModal('login');
      return;
    }

    let salonData: Salon;
    if (!service.salon || !service.salon.name) {
      try {
        const res = await fetch(`/api/salons/${service.salonId}`, { credentials: 'include' });
        if (!res.ok) throw new Error('Failed to fetch salon details');
        salonData = await res.json();
        service.salon = {
          id: salonData.id,
          name: salonData.name,
          ownerId: salonData.ownerId,
          city: salonData.city,
          province: salonData.province,
        };
      } catch (error) {
        toast.error('Unable to load salon details. Please try again.');
        return;
      }
    } else {
      try {
        const res = await fetch(`/api/salons/${service.salonId}`, { credentials: 'include' });
        if (!res.ok) throw new Error('Failed to fetch salon details');
        salonData = await res.json();
      } catch (error) {
        toast.error('Unable to load salon details. Please try again.');
        return;
      }
    }

    if (salonData.bookingMessage) {
      setPendingBookingService(service);
      setPendingSalon(salonData);
      setShowBookingConfirmation(true);
    } else {
      setSelectedService(service);
      setBookingModalOpen(true);
    }
  };

  const handleBookingConfirmationAccept = () => {
    setShowBookingConfirmation(false);
    if (pendingBookingService) {
      setSelectedService(pendingBookingService);
      setBookingModalOpen(true);
      setPendingBookingService(null);
      setPendingSalon(null);
    }
  };

  const handleBookingConfirmationClose = () => {
    setShowBookingConfirmation(false);
    setPendingBookingService(null);
    setPendingSalon(null);
  };

  const handleBookingSuccess = (booking: Booking) => {
    setBookingModalOpen(false);
    setSelectedService(null);
    toast.success('Booking confirmed!');
  };

  return (
    <div className={styles.container}>
      <PageNav />
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
        <Breadcrumbs items={breadcrumbItems} />
        <h1 className={styles.title}>{h1}</h1>
        <p style={{ fontSize: '1.1rem', marginBottom: '1rem', color: '#666', lineHeight: '1.6' }}>
          {content}
        </p>
        {cityInfo && (
          <>
            <RelatedLocations
              title={`Other Cities in ${provinceName}`}
              locations={getCitiesByProvince(provinceSlug)
                .filter(c => c.slug !== citySlug)
                .slice(0, 6)
                .map(city => ({
                  name: city.name,
                  url: `/services/${categorySlug}/near-you/${provinceSlug}/${city.slug}`
                }))}
              type="cities"
            />
            {relatedCategories.length > 0 && (
              <RelatedLocations
                title="Related Services"
                locations={relatedCategories}
                type="categories"
              />
            )}
          </>
        )}
      </div>

      {isMobile ? (
        <MobileSearch onSearch={handleSearch} />
      ) : (
        <FilterBar
          onSearch={handleSearch}
          initialFilters={{ 
            province: provinceName,
            city: cityName,
            service: '',
            category: categoryName || undefined,
            offersMobile: false,
            sortBy: '',
            openNow: false,
            priceMin: '',
            priceMax: '',
          }}
          showSearchButton
          isSearching={isLoading}
        />
      )}

      <div className={styles.resultsShell}>
        {isLoading ? (
          services.length === 0 ? (
            <SkeletonGroup count={6} className={styles.servicesGrid}>
              {() => <SkeletonCard hasImage lines={3} />}
            </SkeletonGroup>
          ) : (
            <div className={styles.loadingState}>
              <LoadingSpinner />
            </div>
          )
        ) : services.length === 0 ? (
          <EmptyState
            variant="no-services"
            title="No Services Found"
            description={`Try adjusting your filters or exploring other locations near ${cityName} to find what you're looking for.`}
          />
        ) : (
          <div className={styles.servicesGrid}>
            {services.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                onBook={handleBookService}
                onImageClick={handleOpenLightbox}
              />
            ))}
          </div>
        )}
      </div>

      {lightboxOpen && (
        <ImageLightbox
          images={lightboxImages}
          initialImageIndex={lightboxIndex}
          onClose={() => setLightboxOpen(false)}
        />
      )}

      {bookingModalOpen && selectedService && selectedService.salon && (
        <BookingModal
          salon={{
            id: selectedService.salon.id,
            name: selectedService.salon.name,
            ownerId: selectedService.salon.ownerId,
            city: selectedService.salon.city || '',
            province: selectedService.salon.province || '',
          } as Salon}
          service={selectedService}
          onClose={() => {
            setBookingModalOpen(false);
            setSelectedService(null);
          }}
          onBookingSuccess={handleBookingSuccess}
        />
      )}

      {showBookingConfirmation && pendingSalon && (
        <BookingConfirmationModal
          isOpen={showBookingConfirmation}
          onClose={handleBookingConfirmationClose}
          onAccept={handleBookingConfirmationAccept}
          salonName={pendingSalon.name || ''}
          salonLogo={pendingSalon.backgroundImage || undefined}
          message={pendingSalon.bookingMessage || ''}
        />
      )}
    </div>
  );
}

