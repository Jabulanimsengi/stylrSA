"use client";

import { useEffect, useMemo, useState, useCallback, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import ServiceCard from "@/components/ServiceCard";
import LoadingSpinner from "@/components/LoadingSpinner";
import FilterBar, { type FilterValues } from "@/components/FilterBar/FilterBar";
import { SkeletonGroup, SkeletonCard } from "@/components/Skeleton/Skeleton";
import styles from "../salons/SalonsPage.module.css";
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

const filtersToKey = (filters: FilterValues) => JSON.stringify(filters);

function ServicesPageContent() {
  const params = useSearchParams();
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
  const isMobile = useMediaQuery('(max-width: 768px)');
  const { startConversation } = useStartConversation();
  const { authStatus } = useAuth();
  const { openModal } = useAuthModal();
  const socket = useSocket();
  const requestControllerRef = useRef<AbortController | null>(null);
  const latestRequestIdRef = useRef(0);
  const isFetchingRef = useRef(false);

  const derivedFilters = useMemo<FilterValues>(() => ({
    province: params.get("province") ?? "",
    city: params.get("city") ?? "",
    service: params.get("service") ?? params.get("q") ?? "",
    category: params.get("category") ?? "",
    offersMobile: params.get("offersMobile") === "true",
    sortBy: params.get("sortBy") ?? "",
    openNow: params.get("openNow") === "true",
    priceMin: params.get("priceMin") ?? "",
    priceMax: params.get("priceMax") ?? "",
  }), [params]);

  const [activeFilters, setActiveFilters] = useState<FilterValues>(derivedFilters);
  const activeFiltersKey = useMemo(() => filtersToKey(activeFilters), [activeFilters]);

  const fetchServices = useCallback(async (filtersToUse: FilterValues) => {
    // Prevent concurrent fetches
    if (isFetchingRef.current) {
      console.log('[ServicesPage] Fetch already in progress, skipping');
      return;
    }

    requestControllerRef.current?.abort();
    const controller = new AbortController();
    requestControllerRef.current = controller;
    const requestId = ++latestRequestIdRef.current;

    console.log('[ServicesPage] Fetching with filters:', filtersToUse);
    isFetchingRef.current = true;
    setIsLoading(true);
    try {
      const query = new URLSearchParams();
      if (filtersToUse.province) query.append("province", filtersToUse.province);
      if (filtersToUse.city) query.append("city", filtersToUse.city);
      if (filtersToUse.category) {
        query.append("category", filtersToUse.category);
        console.log('[ServicesPage] Category filter:', filtersToUse.category);
      }
      if (filtersToUse.service) {
        query.append("q", filtersToUse.service);
        console.log('[ServicesPage] Service search:', filtersToUse.service);
      }
      if (filtersToUse.offersMobile) query.append("offersMobile", "true");
      if (filtersToUse.sortBy) query.append("sortBy", filtersToUse.sortBy);
      if (filtersToUse.openNow) query.append("openNow", "true");
      if (filtersToUse.priceMin) query.append("priceMin", filtersToUse.priceMin);
      if (filtersToUse.priceMax) query.append("priceMax", filtersToUse.priceMax);

      const url = `/api/services/search${query.toString() ? `?${query.toString()}` : ""}`;
      console.log('[ServicesPage] API URL:', url);
      const res = await fetch(url, { credentials: "include", signal: controller.signal });
      if (!res.ok) {
        const errorText = await res.text();
        console.error('[ServicesPage] API error:', res.status, errorText);
        throw new Error("Failed to search services");
      }
      const data = await res.json();
      console.log('[ServicesPage] Received data:', data.length, 'services');
      if (requestId !== latestRequestIdRef.current) {
        return;
      }
      setServices(Array.isArray(data) ? data : []);
    } catch (error) {
      if (controller.signal.aborted) {
        return;
      }
      console.error('[ServicesPage] Fetch error:', error);
      const message = error instanceof Error ? error.message : "Search failed";
      toast.error(message);
      setServices([]);
    } finally {
      if (requestId === latestRequestIdRef.current) {
        setIsLoading(false);
        requestControllerRef.current = null;
        isFetchingRef.current = false;
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const newKey = filtersToKey(derivedFilters);
    const currentKey = filtersToKey(activeFilters);
    
    // Only update if filters actually changed
    if (newKey !== currentKey) {
      setActiveFilters(derivedFilters);
    }
  }, [derivedFilters, activeFilters]);

  useEffect(() => {
    void fetchServices(activeFilters);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFiltersKey]); // Use the memoized key instead of the object

  useEffect(() => {
    if (!socket) return;
    const handler = () => { void fetchServices(activeFilters); };
    socket.on('visibility:updated', handler);
    return () => { socket.off('visibility:updated', handler); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket, activeFiltersKey]); // Use the memoized key to prevent unnecessary re-subscriptions

  const handleSearch = (nextFilters: FilterValues) => {
    const nextKey = filtersToKey(nextFilters);
    if (nextKey === activeFiltersKey) {
      void fetchServices(nextFilters);
      return;
    }
    setActiveFilters(nextFilters);
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

    // Fetch salon details if not already available
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
      // If we have partial salon data, fetch full details to check for bookingMessage
      try {
        const res = await fetch(`/api/salons/${service.salonId}`, { credentials: 'include' });
        if (!res.ok) throw new Error('Failed to fetch salon details');
        salonData = await res.json();
      } catch (error) {
        toast.error('Unable to load salon details. Please try again.');
        return;
      }
    }

    // Check if salon has a booking message
    if (salonData.bookingMessage) {
      // Show confirmation modal first
      setPendingBookingService(service);
      setPendingSalon(salonData);
      setShowBookingConfirmation(true);
    } else {
      // Open booking modal directly
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
      <h1 className={styles.title}>Services</h1>

      {isMobile ? (
        <MobileSearch onSearch={handleSearch} />
      ) : (
        <FilterBar
          onSearch={handleSearch}
          initialFilters={activeFilters}
          showSearchButton
          isSearching={isLoading}
        />
      )}

      <div className={styles.resultsShell}>
        {isLoading && services.length === 0 ? (
          // Initial load - show skeletons
          <SkeletonGroup count={6} className={styles.servicesGrid}>
            {() => <SkeletonCard hasImage lines={3} />}
          </SkeletonGroup>
        ) : services.length === 0 ? (
          // No results found
          <div className={styles.emptyState}>
            <h2>No services found</h2>
            <p>Try adjusting your filters or exploring other categories.</p>
          </div>
        ) : (
          // Show services with optional loading overlay
          <>
            <div className={styles.servicesGrid} style={{ opacity: isLoading ? 0.6 : 1, transition: 'opacity 0.2s ease' }}>
              {services.map((service) => (
                <ServiceCard
                  key={service.id}
                  service={service}
                  onBook={handleBookService}
                  onImageClick={handleOpenLightbox}
                />
              ))}
            </div>
            {isLoading && (
              <div className={styles.loadingOverlay}>
                <LoadingSpinner />
              </div>
            )}
          </>
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

export default function ServicesPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <ServicesPageContent />
    </Suspense>
  );
}
