"use client";

import { Suspense, useEffect, useMemo, useState, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import ServiceCard from "@/components/ServiceCard";
import LoadingSpinner from "@/components/LoadingSpinner";
import FilterBar, { type FilterValues } from "@/components/FilterBar/FilterBar";
import { SkeletonGroup, SkeletonCard } from "@/components/Skeleton/Skeleton";
import styles from "../../../../../../salons/SalonsPage.module.css";
import { Service, Salon, Booking } from "@/types";
import { toast } from "react-toastify";
import ImageLightbox from "@/components/ImageLightbox";
import { useStartConversation } from "@/hooks/useStartConversation";
import { useSocket } from "@/context/SocketContext";
import PageNav from "@/components/PageNav";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import MobileSearch from "@/components/MobileSearch/MobileSearch";
import BookingModal from "@/components/BookingModal";
import BookingConfirmationModal from "@/components/BookingConfirmationModal/BookingConfirmationModal";
import { useAuth } from "@/hooks/useAuth";
import { useAuthModal } from "@/context/AuthModalContext";
import { getCategoriesCached } from "@/lib/resourceCache";
import EmptyState from "@/components/EmptyState/EmptyState";
import { PROVINCES, getCityInfo } from "@/lib/locationData";

// Category information
const CATEGORY_INFO: Record<string, { title: string; description: string; content: string }> = {
  'nail-care': {
    title: 'Nail Care',
    description: 'Professional nail services',
    content: 'Pamper yourself with premium nail care services including manicures, pedicures, gel extensions, acrylics, and intricate nail art designs.'
  },
  'massage-body-treatments': {
    title: 'Massage & Body Treatments',
    description: 'Relaxing massage therapy and body treatments',
    content: 'Experience ultimate relaxation with professional massage and body treatment services including Swedish massage, deep tissue, hot stone therapy, and more.'
  },
  'skin-care-facials': {
    title: 'Skin Care & Facials',
    description: 'Professional facial treatments and skin care',
    content: 'Achieve radiant, healthy skin with professional facial and skin care services from certified estheticians.'
  },
  'haircuts-styling': {
    title: 'Haircuts & Styling',
    description: 'Expert hairstylists for cuts and styling',
    content: 'Discover South Africa\'s premier hair stylists and salons offering expert haircuts and styling services.'
  },
  'hair-color-treatments': {
    title: 'Hair Coloring & Treatments',
    description: 'Professional hair coloring and treatment services',
    content: 'Transform your look with professional hair coloring and treatment services from South Africa\'s best salons.'
  },
  'makeup-beauty': {
    title: 'Makeup & Beauty',
    description: 'Professional makeup artists',
    content: 'Look stunning for any occasion with professional makeup services from South Africa\'s talented makeup artists.'
  },
  'waxing-hair-removal': {
    title: 'Waxing & Hair Removal',
    description: 'Professional waxing and hair removal services',
    content: 'Get smooth, hair-free skin with professional waxing and hair removal services.'
  },
  'braiding-weaving': {
    title: 'Braiding & Weaving',
    description: 'Professional braiding and weaving specialists',
    content: 'Experience beautiful, long-lasting braiding and weaving styles from South Africa\'s most skilled braiders.'
  },
  'mens-grooming': {
    title: 'Men\'s Grooming',
    description: 'Professional men\'s grooming services',
    content: 'Elevate your style with premium men\'s grooming services from South Africa\'s finest barbers and stylists.'
  },
  'bridal-services': {
    title: 'Bridal Services',
    description: 'Professional bridal hair and makeup services',
    content: 'Look absolutely breathtaking on your wedding day with professional bridal beauty services.'
  },
};

function ServiceLocationContent() {
  const params = useParams();
  const categorySlug = params.category as string;
  const locationSlug = params.location as string;
  const citySlug = params.city as string;
  
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
  const { startConversation } = useStartConversation();
  const { authStatus } = useAuth();
  const { openModal } = useAuthModal();
  const socket = useSocket();
  const requestControllerRef = useRef<AbortController | null>(null);
  const latestRequestIdRef = useRef(0);

  // Get location info
  const cityInfo = getCityInfo(locationSlug, citySlug);
  const cityName = cityInfo?.name || citySlug.charAt(0).toUpperCase() + citySlug.slice(1);
  const provinceName = cityInfo?.province || locationSlug.charAt(0).toUpperCase() + locationSlug.slice(1);

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
        console.error('[ServiceLocation] Failed to fetch category name:', error);
        setCategoryName('');
      }
    };
    fetchCategoryName();
  }, [categorySlug]);

  const categoryInfo = CATEGORY_INFO[categorySlug] || {
    title: 'Services',
    description: 'Professional beauty services',
    content: 'Discover professional beauty services from top-rated salons.'
  };

  const fetchServices = useCallback(async (catName: string, additionalFilters: FilterValues) => {
    requestControllerRef.current?.abort();
    const controller = new AbortController();
    requestControllerRef.current = controller;
    const requestId = ++latestRequestIdRef.current;

    setIsLoading(true);
    try {
      const query = new URLSearchParams();
      
      // Always filter by category and location
      if (catName && catName.trim()) {
        query.append("category", catName);
      }
      
      // Set location filters
      query.append("province", provinceName);
      query.append("city", cityName);
      
      // Additional filters
      if (additionalFilters.service) query.append("q", additionalFilters.service);
      if (additionalFilters.offersMobile) query.append("offersMobile", "true");
      if (additionalFilters.sortBy) query.append("sortBy", additionalFilters.sortBy);
      if (additionalFilters.openNow) query.append("openNow", "true");
      if (additionalFilters.priceMin) query.append("priceMin", additionalFilters.priceMin);
      if (additionalFilters.priceMax) query.append("priceMax", additionalFilters.priceMax);

      const url = `/api/services/search?${query.toString()}`;
      const res = await fetch(url, { credentials: "include", signal: controller.signal });
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
      console.error('[ServiceLocation] Fetch error:', error);
      toast.error('Failed to load services. Please try again.');
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
        service: "",
        category: categoryName,
        offersMobile: false,
        sortBy: "",
        openNow: false,
        priceMin: "",
        priceMax: "",
      });
    }
  }, [categoryName, fetchServices, cityName, provinceName]);

  useEffect(() => {
    if (!socket || categoryName === null) return;
    const handler = () => {
      fetchServices(categoryName, {
        province: provinceName,
        city: cityName,
        service: "",
        category: categoryName,
        offersMobile: false,
        sortBy: "",
        openNow: false,
        priceMin: "",
        priceMax: "",
      });
    };
    socket.on('visibility:updated', handler);
    return () => { socket.off('visibility:updated', handler); };
  }, [socket, categoryName, fetchServices, cityName, provinceName]);

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
        <h1 className={styles.title}>
          {categoryInfo.title} in {cityName}, {provinceName}
        </h1>
        <p style={{ fontSize: '1.1rem', marginBottom: '2rem', color: '#666', lineHeight: '1.6' }}>
          {categoryInfo.content} Find the best {categoryInfo.description.toLowerCase()} in {cityName}, {provinceName} and book appointments near you.
        </p>
      </div>

      {isMobile ? (
        <MobileSearch onSearch={handleSearch} />
      ) : (
        <FilterBar
          onSearch={handleSearch}
          initialFilters={{ 
            province: provinceName,
            city: cityName,
            service: "",
            category: categoryName || "",
            offersMobile: false,
            sortBy: "",
            openNow: false,
            priceMin: "",
            priceMax: "",
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
            title={`No ${categoryInfo.title} Found in ${cityName}`}
            description={`We couldn't find any ${categoryInfo.description.toLowerCase()} in ${cityName}. Try adjusting your filters or exploring other locations.`}
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
          salonLogo={pendingSalon.backgroundImage}
          message={pendingSalon.bookingMessage || ''}
        />
      )}
    </div>
  );
}

export default function ServiceLocationPage() {
  return (
    <Suspense
      fallback={
        <div className={styles.container}>
          <h1 className={styles.title}>Loading Services...</h1>
          <LoadingSpinner />
        </div>
      }
    >
      <ServiceLocationContent />
    </Suspense>
  );
}
