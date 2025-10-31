"use client";

import { Suspense, useEffect, useMemo, useState, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import ServiceCard from "@/components/ServiceCard";
import LoadingSpinner from "@/components/LoadingSpinner";
import FilterBar, { type FilterValues } from "@/components/FilterBar/FilterBar";
import { SkeletonGroup, SkeletonCard } from "@/components/Skeleton/Skeleton";
import styles from "../../salons/SalonsPage.module.css";
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

// SEO-optimized category information
const CATEGORY_INFO: Record<string, { title: string; description: string; keywords: string; content: string }> = {
  'haircuts-styling': {
    title: 'Haircuts & Styling Services | Book Top Stylists in South Africa',
    description: 'Find expert hairstylists for cuts, styling, and transformations. Book appointments at the best hair salons in South Africa. Professional haircuts for men, women, and children.',
    keywords: 'haircut, hair styling, hairstylist, hair salon, barber, hair transformation, professional haircut, South Africa',
    content: 'Discover South Africa\'s premier hair stylists and salons offering expert haircuts and styling services. Whether you\'re looking for a fresh new cut, a complete transformation, or a simple trim, our network of professional stylists delivers exceptional results. From classic cuts to trendy styles, book your appointment today.'
  },
  'hair-color-treatments': {
    title: 'Hair Coloring & Treatment Services | Expert Color Specialists',
    description: 'Professional hair coloring, highlights, balayage, and treatment services. Book experienced colorists at top salons across South Africa for stunning hair transformations.',
    keywords: 'hair color, hair dye, balayage, highlights, ombre, hair treatment, keratin treatment, colorist, South Africa',
    content: 'Transform your look with professional hair coloring and treatment services from South Africa\'s best salons. Our expert colorists specialize in everything from subtle highlights to bold color transformations, plus restorative treatments including keratin, deep conditioning, and more.'
  },
  'nail-care': {
    title: 'Nail Salon Services | Manicures, Pedicures & Nail Art in SA',
    description: 'Book professional nail services including manicures, pedicures, gel nails, acrylics, and custom nail art. Find the best nail salons and technicians in South Africa.',
    keywords: 'nail salon, manicure, pedicure, gel nails, acrylic nails, nail art, nail technician, nail care, South Africa',
    content: 'Pamper yourself with premium nail care services at South Africa\'s top-rated nail salons. From classic manicures and pedicures to gel extensions, acrylics, and intricate nail art designs, our skilled nail technicians deliver flawless results that last.'
  },
  'skin-care-facials': {
    title: 'Skin Care & Facial Services | Professional Estheticians in SA',
    description: 'Book professional facial treatments, skin care consultations, and rejuvenating spa services. Find expert estheticians and skin therapists across South Africa.',
    keywords: 'facial, skin care, esthetician, skin treatment, spa facial, anti-aging, acne treatment, skincare specialist, South Africa',
    content: 'Achieve radiant, healthy skin with professional facial and skin care services from certified estheticians. Our network includes specialists in anti-aging treatments, acne solutions, chemical peels, microdermabrasion, and customized skin care regimens.'
  },
  'massage-body-treatments': {
    title: 'Massage & Body Treatment Services | Wellness Spas in SA',
    description: 'Book relaxing massage therapy and body treatments. Find professional massage therapists and wellness spas offering therapeutic and relaxation services across South Africa.',
    keywords: 'massage, body treatment, spa, massage therapy, wellness, relaxation, deep tissue, Swedish massage, hot stone, South Africa',
    content: 'Experience ultimate relaxation with professional massage and body treatment services. Our certified therapists offer Swedish massage, deep tissue, hot stone therapy, aromatherapy, body scrubs, wraps, and more to rejuvenate your body and mind.'
  },
  'makeup-beauty': {
    title: 'Makeup & Beauty Services | Professional Makeup Artists in SA',
    description: 'Book professional makeup artists for special events, bridal makeup, editorial looks, and beauty services. Find expert makeup professionals across South Africa.',
    keywords: 'makeup artist, beauty services, bridal makeup, special event makeup, professional makeup, makeup application, beauty specialist, South Africa',
    content: 'Look stunning for any occasion with professional makeup services from South Africa\'s talented makeup artists. Specializing in bridal makeup, special events, editorial looks, and makeup lessons, our artists use premium products to create flawless, long-lasting results.'
  },
  'waxing-hair-removal': {
    title: 'Waxing & Hair Removal Services | Professional Waxing in SA',
    description: 'Book professional waxing and hair removal services. Find experienced technicians offering Brazilian waxing, full body waxing, and laser hair removal across South Africa.',
    keywords: 'waxing, hair removal, Brazilian wax, laser hair removal, body waxing, threading, wax specialist, South Africa',
    content: 'Get smooth, hair-free skin with professional waxing and hair removal services. Our experienced technicians provide comfortable, hygienic treatments including Brazilian waxing, full body waxing, facial hair removal, and threading for long-lasting results.'
  },
  'braiding-weaving': {
    title: 'Braiding & Weaving Services | Expert Braiders in South Africa',
    description: 'Find professional braiding and weaving specialists for box braids, cornrows, Ghana braids, crochet braids, and hair extensions. Book expert braiders across South Africa.',
    keywords: 'braiding, hair braiding, box braids, cornrows, Ghana braids, weaving, hair extensions, braider, crochet braids, South Africa',
    content: 'Experience beautiful, long-lasting braiding and weaving styles from South Africa\'s most skilled braiders. Whether you want box braids, intricate cornrows, Ghana braids, crochet styles, or premium weave installations, our specialists create stunning protective styles that protect and beautify your natural hair.'
  },
  'mens-grooming': {
    title: 'Men\'s Grooming Services | Barbers & Male Grooming in SA',
    description: 'Book professional men\'s grooming services including haircuts, beard trims, hot towel shaves, and styling. Find expert barbers across South Africa.',
    keywords: 'men\'s grooming, barber, men\'s haircut, beard trim, hot shave, male grooming, barber shop, South Africa',
    content: 'Elevate your style with premium men\'s grooming services from South Africa\'s finest barbers and stylists. Offering classic and modern haircuts, precision beard trims, hot towel shaves, and complete grooming packages tailored specifically for men.'
  },
  'bridal-services': {
    title: 'Bridal Beauty Services | Wedding Hair & Makeup in SA',
    description: 'Book professional bridal hair, makeup, and beauty services for your special day. Find experienced bridal specialists offering packages for weddings across South Africa.',
    keywords: 'bridal services, wedding hair, wedding makeup, bridal makeup artist, bridal hairstylist, wedding beauty, bridal package, South Africa',
    content: 'Look absolutely breathtaking on your wedding day with professional bridal beauty services. Our experienced bridal specialists offer complete packages including hair styling, makeup application, trials, and on-location services to ensure you look perfect for your special day.'
  },
};

function ServiceCategoryContent() {
  const params = useParams();
  const categorySlug = params.category as string;
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
  const [categoryName, setCategoryName] = useState<string>("");
  const isMobile = useMediaQuery('(max-width: 768px)');
  const { startConversation } = useStartConversation();
  const { authStatus } = useAuth();
  const { openModal } = useAuthModal();
  const socket = useSocket();
  const requestControllerRef = useRef<AbortController | null>(null);
  const latestRequestIdRef = useRef(0);

  // Convert slug to category name with improved matching
  useEffect(() => {
    const fetchCategoryName = async () => {
      try {
        const categories = await getCategoriesCached();
        console.log('[ServiceCategory] Available categories:', categories);
        console.log('[ServiceCategory] Looking for slug:', categorySlug);
        
        // Normalize slug: "haircuts-styling" -> "haircuts styling"
        const normalizedSlug = categorySlug.toLowerCase().replace(/-/g, ' ').replace(/_/g, ' ').trim();
        console.log('[ServiceCategory] Normalized slug:', normalizedSlug);
        
        // Find matching category
        const match = categories.find(cat => {
          // Normalize category name: "Haircuts & Styling" -> "haircuts styling"
          const normalizedCategoryName = cat.name
            .toLowerCase()
            .replace(/[^a-z0-9\s]/g, '')  // Remove special chars including &
            .replace(/\s+/g, ' ')  // Normalize spaces
            .trim();
          
          console.log(`[ServiceCategory] Comparing "${normalizedCategoryName}" with "${normalizedSlug}"`);
          return normalizedCategoryName === normalizedSlug;
        });
        
        if (match) {
          console.log('[ServiceCategory] Category matched:', match);
          setCategoryName(match.name);
        } else {
          console.warn(`[ServiceCategory] No exact match found for slug: ${categorySlug}`);
          
          // Fallback: Try partial matching
          const partialMatch = categories.find(cat => {
            const catWords = cat.name.toLowerCase().split(/\s+/);
            const slugWords = normalizedSlug.split(/\s+/);
            return slugWords.every(word => catWords.some(catWord => catWord.includes(word)));
          });
          
          if (partialMatch) {
            console.log('[ServiceCategory] Partial match found:', partialMatch);
            setCategoryName(partialMatch.name);
            toast.info(`Showing results for: ${partialMatch.name}`);
          } else {
            console.error('[ServiceCategory] No category match found at all');
            toast.error(`Category "${categorySlug}" not found. Showing all services.`);
            // Set to empty to allow page to load with all services
            setCategoryName('');
            setIsLoading(false);
          }
        }
      } catch (error) {
        console.error('[ServiceCategory] Failed to fetch category name:', error);
        toast.error('Failed to load category. Please try again.');
        setCategoryName('');
        setIsLoading(false);
      }
    };
    fetchCategoryName();
  }, [categorySlug]);

  const categoryInfo = CATEGORY_INFO[categorySlug] || {
    title: 'Services',
    description: 'Find and book professional beauty services in South Africa',
    keywords: 'beauty services, salon, South Africa',
    content: 'Discover professional beauty services from top-rated salons across South Africa.'
  };

  const fetchServices = useCallback(async (additionalFilters: FilterValues) => {
    requestControllerRef.current?.abort();
    const controller = new AbortController();
    requestControllerRef.current = controller;
    const requestId = ++latestRequestIdRef.current;

    setIsLoading(true);
    try {
      const query = new URLSearchParams();
      
      // Only add category if we have a categoryName
      if (categoryName) {
        query.append("category", categoryName);
      }
      
      if (additionalFilters.province) query.append("province", additionalFilters.province);
      if (additionalFilters.city) query.append("city", additionalFilters.city);
      if (additionalFilters.service) query.append("q", additionalFilters.service);
      if (additionalFilters.offersMobile) query.append("offersMobile", "true");
      if (additionalFilters.sortBy) query.append("sortBy", additionalFilters.sortBy);
      if (additionalFilters.openNow) query.append("openNow", "true");
      if (additionalFilters.priceMin) query.append("priceMin", additionalFilters.priceMin);
      if (additionalFilters.priceMax) query.append("priceMax", additionalFilters.priceMax);

      const url = `/api/services/search?${query.toString()}`;
      console.log('[ServiceCategory] Fetching services with URL:', url);
      const res = await fetch(url, { credentials: "include", signal: controller.signal });
      if (!res.ok) {
        const errorText = await res.text();
        console.error('[ServiceCategory] API error:', res.status, errorText);
        throw new Error(`Failed to search services: ${res.status}`);
      }
      const data = await res.json();
      console.log('[ServiceCategory] Services fetched:', data.length, 'items');
      if (requestId !== latestRequestIdRef.current) {
        return;
      }
      setServices(Array.isArray(data) ? data : []);
    } catch (error) {
      if (controller.signal.aborted) {
        return;
      }
      console.error('[ServiceCategory] Fetch error:', error);
      const message = error instanceof Error ? error.message : "Search failed";
      toast.error(message);
      setServices([]);
    } finally {
      if (requestId === latestRequestIdRef.current) {
        setIsLoading(false);
        requestControllerRef.current = null;
      }
    }
  }, [categoryName]);

  // Track if we've attempted to load the category
  const [categoryLoadAttempted, setCategoryLoadAttempted] = useState(false);
  
  useEffect(() => {
    // Wait a bit for category name to be resolved, but don't wait forever
    const timer = setTimeout(() => {
      setCategoryLoadAttempted(true);
    }, 2000); // Give 2 seconds for category to load
    
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Fetch services once we have categoryName OR after we've waited long enough
    if (categoryName || categoryLoadAttempted) {
      console.log('[ServiceCategory] Triggering fetch with categoryName:', categoryName);
      fetchServices({
        province: "",
        city: "",
        service: "",
        category: categoryName,
        offersMobile: false,
        sortBy: "",
        openNow: false,
        priceMin: "",
        priceMax: "",
      });
    }
  }, [categoryName, categoryLoadAttempted, fetchServices]);

  useEffect(() => {
    if (!socket) return;
    const handler = () => { 
      if (categoryName) {
        fetchServices({
          province: "",
          city: "",
          service: "",
          category: categoryName,
          offersMobile: false,
          sortBy: "",
          openNow: false,
          priceMin: "",
          priceMax: "",
        });
      }
    };
    socket.on('visibility:updated', handler);
    return () => { socket.off('visibility:updated', handler); };
  }, [socket, fetchServices, categoryName]);

  const handleSearch = (nextFilters: FilterValues) => {
    fetchServices(nextFilters);
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
        <h1 className={styles.title}>{categoryInfo.title.split('|')[0].trim()}</h1>
        <p style={{ fontSize: '1.1rem', marginBottom: '2rem', color: '#666', lineHeight: '1.6' }}>
          {categoryInfo.content}
        </p>
      </div>

      {isMobile ? (
        <MobileSearch onSearch={handleSearch} />
      ) : (
        <FilterBar
          onSearch={handleSearch}
          initialFilters={{ 
            province: "",
            city: "",
            service: "",
            category: categoryName,
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
          <div className={styles.emptyState}>
            <h2>No services found</h2>
            <p>Try adjusting your filters or exploring other categories.</p>
          </div>
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

export default function ServiceCategoryPage() {
  return (
    <Suspense
      fallback={
        <div className={styles.container}>
          <h1 className={styles.title}>Loading Services...</h1>
          <LoadingSpinner />
        </div>
      }
    >
      <ServiceCategoryContent />
    </Suspense>
  );
}
