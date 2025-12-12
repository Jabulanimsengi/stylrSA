"use client";

import { Suspense, useEffect, useMemo, useState, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import ServiceCard from "@/components/ServiceCard";
import LoadingSpinner from "@/components/LoadingSpinner";
import FilterBar, { type FilterValues } from "@/components/FilterBar/FilterBar";
import { SkeletonGroup, SkeletonCard } from "@/components/Skeleton/Skeleton";
import styles from "../../../../../salons/SalonsPage.module.css";
import { Service, Salon, Booking } from "@/types";
import { toast } from "react-toastify";
import ImageLightbox from "@/components/ImageLightbox";
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

// Category information with enhanced SEO keywords
const CATEGORY_INFO: Record<string, { 
  title: string; 
  description: string; 
  content: string;
  serviceName: string;
  keywords: string[];
}> = {
  'nail-care': {
    title: 'Nail Care',
    description: 'Professional nail services',
    serviceName: 'nail salon',
    content: 'Pamper yourself with premium nail care services including manicures, pedicures, gel extensions, acrylics, and intricate nail art designs.',
    keywords: ['nail salon', 'manicure', 'pedicure', 'gel nails', 'nail art', 'acrylic nails', 'nail technician', 'nail studio']
  },
  'massage-body-treatments': {
    title: 'Massage & Body Treatments',
    description: 'Relaxing massage therapy and body treatments',
    serviceName: 'massage spa',
    content: 'Experience ultimate relaxation with professional massage and body treatment services including Swedish massage, deep tissue, hot stone therapy, and more.',
    keywords: ['massage', 'spa', 'massage therapy', 'body treatment', 'wellness', 'deep tissue massage', 'Swedish massage']
  },
  'skin-care-facials': {
    title: 'Skin Care & Facials',
    description: 'Professional facial treatments and skin care',
    serviceName: 'spa',
    content: 'Achieve radiant, healthy skin with professional facial and skin care services from certified estheticians.',
    keywords: ['facial', 'spa', 'skin care', 'esthetician', 'facial treatment', 'anti-aging facial', 'acne treatment']
  },
  'haircuts-styling': {
    title: 'Haircuts & Styling',
    description: 'Expert hairstylists for cuts and styling',
    serviceName: 'hair salon',
    content: 'Discover South Africa\'s premier hair stylists and salons offering expert haircuts and styling services.',
    keywords: ['haircut', 'hair styling', 'hairstylist', 'hair salon', 'hairdresser', 'hair studio', 'blowout']
  },
  'hair-color-treatments': {
    title: 'Hair Coloring & Treatments',
    description: 'Professional hair coloring and treatment services',
    serviceName: 'hair salon',
    content: 'Transform your look with professional hair coloring and treatment services from South Africa\'s best salons.',
    keywords: ['hair color', 'balayage', 'highlights', 'hair treatment', 'hair dye', 'ombre', 'colorist']
  },
  'makeup-beauty': {
    title: 'Makeup & Beauty',
    description: 'Professional makeup artists',
    serviceName: 'makeup artist',
    content: 'Look stunning for any occasion with professional makeup services from South Africa\'s talented makeup artists.',
    keywords: ['makeup artist', 'beauty services', 'bridal makeup', 'professional makeup', 'event makeup', 'special occasion makeup']
  },
  'waxing-hair-removal': {
    title: 'Waxing & Hair Removal',
    description: 'Professional waxing and hair removal services',
    serviceName: 'waxing salon',
    content: 'Get smooth, hair-free skin with professional waxing and hair removal services.',
    keywords: ['waxing', 'hair removal', 'Brazilian wax', 'wax specialist', 'waxing salon', 'Hollywood wax', 'bikini wax']
  },
  'braiding-weaving': {
    title: 'Braiding & Weaving',
    description: 'Professional braiding and weaving specialists',
    serviceName: 'braiding salon',
    content: 'Experience beautiful, long-lasting braiding and weaving styles from South Africa\'s most skilled braiders.',
    keywords: ['braiding', 'hair braiding', 'box braids', 'weaving', 'hair extensions', 'knotless braids', 'cornrows']
  },
  'mens-grooming': {
    title: 'Men\'s Grooming',
    description: 'Professional men\'s grooming services',
    serviceName: 'barber',
    content: 'Elevate your style with premium men\'s grooming services from South Africa\'s finest barbers and stylists.',
    keywords: ['men\'s grooming', 'barber', 'men\'s haircut', 'beard trim', 'barbershop', 'fade haircut', 'hot shave']
  },
  'bridal-services': {
    title: 'Bridal Services',
    description: 'Professional bridal hair and makeup services',
    serviceName: 'bridal beauty',
    content: 'Look absolutely breathtaking on your wedding day with professional bridal beauty services.',
    keywords: ['bridal services', 'wedding hair', 'wedding makeup', 'bridal makeup', 'bridal hair', 'bridal package']
  },
  'wig-installations': {
    title: 'Wig Installations',
    description: 'Professional wig installation and styling services',
    serviceName: 'wig specialist',
    content: 'Transform your look with professional wig installation and styling services from South Africa\'s top wig specialists. Whether you need a lace front, full lace, or custom wig, our certified professionals provide expert installation, customization, and maintenance services.',
    keywords: ['wig installation', 'wig', 'wigs', 'wig specialist', 'wig stylist', 'lace front wig', 'full lace wig', 'wig fitting', 'wig customization']
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

    if ((salonData as any).bookingMessage) {
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

  // Get keywords from category info
  const primaryKeywords = categoryInfo.keywords || [categoryInfo.description];
  const primaryKeyword = primaryKeywords[0] || categoryInfo.description;
  const secondaryKeywords = primaryKeywords.slice(1, 4);

  return (
    <div className={styles.container}>
      <PageNav />
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
        {/* Enhanced H1 with primary keyword */}
        <h1 className={styles.title}>
          Best {primaryKeyword} in {cityName}, {provinceName} | Top-Rated {categoryInfo.title} Services
        </h1>
        
        {/* Enhanced description with keywords naturally integrated */}
        <p style={{ fontSize: '1.1rem', marginBottom: '1.5rem', color: '#666', lineHeight: '1.6' }}>
          {categoryInfo.content} Find the best {categoryInfo.description.toLowerCase()} in {cityName}, {provinceName}. 
          Book top-rated {primaryKeyword} services, read verified reviews, compare prices, and book instantly. 
          Professional {secondaryKeywords.join(', ')} services available near you.
        </p>

        {/* SEO-optimized content section with H2/H3 headings */}
        <div style={{ marginBottom: '2rem', padding: '1.5rem', background: '#f9f9f9', borderRadius: '8px' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', fontWeight: 600, color: '#333' }}>
            Find the Best {categoryInfo.title} Services in {cityName}
          </h2>
          <p style={{ fontSize: '1rem', marginBottom: '1rem', color: '#555', lineHeight: '1.7' }}>
            Looking for professional {primaryKeyword} services in {cityName}, {provinceName}? 
            Stylr SA connects you with top-rated {categoryInfo.description.toLowerCase()} professionals in your area. 
            Whether you're searching for {secondaryKeywords[0] || primaryKeyword}, {secondaryKeywords[1] || primaryKeyword}, 
            or {secondaryKeywords[2] || primaryKeyword} services, we make it easy to find and book the best {categoryInfo.serviceName || categoryInfo.description.toLowerCase()} near you. 
            Explore all <Link href={`/services/${categorySlug}`} style={{ color: '#0066cc', textDecoration: 'underline' }}>{categoryInfo.title.toLowerCase()} services</Link> or browse by <Link href={`/salons/location/${locationSlug}`} style={{ color: '#0066cc', textDecoration: 'underline' }}>location</Link>.
          </p>
          
          <h3 style={{ fontSize: '1.25rem', marginTop: '1.5rem', marginBottom: '0.75rem', fontWeight: 600, color: '#444' }}>
            Why Choose {categoryInfo.title} Services in {cityName}?
          </h3>
          <ul style={{ fontSize: '1rem', color: '#555', lineHeight: '1.7', paddingLeft: '1.5rem' }}>
            <li style={{ marginBottom: '0.5rem' }}>
              <strong>Verified Professionals:</strong> All {categoryInfo.description.toLowerCase()} providers are verified and reviewed by real customers
            </li>
            <li style={{ marginBottom: '0.5rem' }}>
              <strong>Easy Booking:</strong> Book {primaryKeyword} appointments instantly online, 24/7
            </li>
            <li style={{ marginBottom: '0.5rem' }}>
              <strong>Compare Prices:</strong> See transparent pricing for {categoryInfo.title.toLowerCase()} services in {cityName}
            </li>
            <li style={{ marginBottom: '0.5rem' }}>
              <strong>Read Reviews:</strong> Make informed decisions with verified customer reviews
            </li>
            <li>
              <strong>Local Experts:</strong> Find the best {categoryInfo.serviceName || categoryInfo.description.toLowerCase()} professionals in {cityName}, {provinceName}
            </li>
          </ul>

          <h3 style={{ fontSize: '1.25rem', marginTop: '1.5rem', marginBottom: '0.75rem', fontWeight: 600, color: '#444' }}>
            Popular {categoryInfo.title} Services in {cityName}
          </h3>
          <p style={{ fontSize: '1rem', color: '#555', lineHeight: '1.7' }}>
            Our platform features a wide range of {categoryInfo.title.toLowerCase()} services in {cityName}, including 
            {secondaryKeywords.length > 0 ? ` ${secondaryKeywords.join(', ')},` : ''} and more. 
            Whether you need {primaryKeyword} for a special occasion or regular maintenance, 
            you'll find experienced professionals ready to help. Browse our selection of top-rated 
            {categoryInfo.description.toLowerCase()} in <Link href={`/salons/location/${locationSlug}/${citySlug}`} style={{ color: '#0066cc', textDecoration: 'underline' }}>{cityName}</Link>, {provinceName} and book your appointment today.
          </p>
        </div>

        {/* FAQ Section for SEO */}
        <div style={{ marginTop: '2rem', marginBottom: '2rem', padding: '1.5rem', background: '#f9f9f9', borderRadius: '8px' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', fontWeight: 600, color: '#333' }}>
            Frequently Asked Questions About {categoryInfo.title} in {cityName}
          </h2>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', fontWeight: 600, color: '#444' }}>
              What is the average price for {primaryKeyword} in {cityName}?
            </h3>
            <p style={{ fontSize: '1rem', color: '#555', lineHeight: '1.7', marginBottom: '1rem' }}>
              Prices for {primaryKeyword} services in {cityName} vary depending on the salon and specific service. 
              You can compare prices from multiple {categoryInfo.serviceName} professionals on Stylr SA to find the best value. 
              Most {categoryInfo.serviceName} professionals in {cityName} offer competitive pricing and transparent rates.
            </p>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', fontWeight: 600, color: '#444' }}>
              How do I find the best {categoryInfo.serviceName} in {cityName}?
            </h3>
            <p style={{ fontSize: '1rem', color: '#555', lineHeight: '1.7', marginBottom: '1rem' }}>
              To find the best {categoryInfo.serviceName} in {cityName}, use Stylr SA to browse verified professionals with real customer reviews. 
              You can filter by ratings, read verified reviews, view galleries, and compare prices. 
              All professionals on our platform are verified and reviewed by real customers, ensuring quality service.
            </p>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', fontWeight: 600, color: '#444' }}>
              Do {categoryInfo.serviceName} professionals in {cityName} accept walk-in appointments?
            </h3>
            <p style={{ fontSize: '1rem', color: '#555', lineHeight: '1.7', marginBottom: '1rem' }}>
              Many {categoryInfo.serviceName} professionals in {cityName} accept walk-in appointments, but we recommend booking in advance to secure your preferred time slot. 
              You can book appointments instantly online 24/7 through Stylr SA. Check individual salon profiles for their walk-in policy and availability.
            </p>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', fontWeight: 600, color: '#444' }}>
              What types of {categoryInfo.title.toLowerCase()} services are available in {cityName}?
            </h3>
            <p style={{ fontSize: '1rem', color: '#555', lineHeight: '1.7', marginBottom: '1rem' }}>
              In {cityName}, you can find a wide range of {categoryInfo.title.toLowerCase()} services including {secondaryKeywords.length > 0 ? secondaryKeywords.slice(0, 3).join(', ') : primaryKeyword}, and more. 
              Browse our platform to see all available services from top-rated professionals in {cityName}, {provinceName}.
            </p>
          </div>

          <div>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', fontWeight: 600, color: '#444' }}>
              Can I read reviews before booking {primaryKeyword} services in {cityName}?
            </h3>
            <p style={{ fontSize: '1rem', color: '#555', lineHeight: '1.7' }}>
              Yes! All reviews on Stylr SA are verified and come from real customers who have completed appointments. 
              You can read detailed reviews, see ratings, and view before & after photos to make informed decisions before booking {primaryKeyword} services in {cityName}.
            </p>
          </div>
        </div>

        {/* Related Services Section with Internal Links */}
        <div style={{ marginTop: '2rem', marginBottom: '2rem', padding: '1.5rem', background: '#f0f7ff', borderRadius: '8px', border: '1px solid #d0e7ff' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', fontWeight: 600, color: '#333' }}>
            Related Services in {cityName}
          </h2>
          <p style={{ fontSize: '1rem', color: '#555', lineHeight: '1.7' }}>
            Looking for other beauty services in {cityName}? Check out our other service categories: 
            {categorySlug !== 'hair-color-treatments' && (
              <> <Link href={`/services/hair-color-treatments/location/${locationSlug}/${citySlug}`} style={{ color: '#0066cc', textDecoration: 'underline' }}>Hair Coloring & Treatments</Link>,</>
            )}
            {categorySlug !== 'nail-care' && (
              <> <Link href={`/services/nail-care/location/${locationSlug}/${citySlug}`} style={{ color: '#0066cc', textDecoration: 'underline' }}>Nail Care</Link>,</>
            )}
            {categorySlug !== 'massage-body-treatments' && (
              <> <Link href={`/services/massage-body-treatments/location/${locationSlug}/${citySlug}`} style={{ color: '#0066cc', textDecoration: 'underline' }}>Massage & Body Treatments</Link>,</>
            )}
            {categorySlug !== 'skin-care-facials' && (
              <> <Link href={`/services/skin-care-facials/location/${locationSlug}/${citySlug}`} style={{ color: '#0066cc', textDecoration: 'underline' }}>Skin Care & Facials</Link>,</>
            )}
            {categorySlug !== 'braiding-weaving' && (
              <> <Link href={`/services/braiding-weaving/location/${locationSlug}/${citySlug}`} style={{ color: '#0066cc', textDecoration: 'underline' }}>Braiding & Weaving</Link>,</>
            )}
            {categorySlug !== 'mens-grooming' && (
              <> <Link href={`/services/mens-grooming/location/${locationSlug}/${citySlug}`} style={{ color: '#0066cc', textDecoration: 'underline' }}>Men's Grooming</Link>,</>
            )}
            {categorySlug !== 'wig-installations' && (
              <> <Link href={`/services/wig-installations/location/${locationSlug}/${citySlug}`} style={{ color: '#0066cc', textDecoration: 'underline' }}>Wig Installations</Link>,</>
            )}
            {' '}and more. <Link href={`/services`} style={{ color: '#0066cc', textDecoration: 'underline', fontWeight: 600 }}>Browse all services</Link>.
          </p>
        </div>
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
          salonLogo={pendingSalon.backgroundImage ?? undefined}
          message={(pendingSalon as any).bookingMessage || ''}
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
