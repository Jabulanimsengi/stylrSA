"use client";

import { Suspense, useEffect, useMemo, useState, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import ServiceCard from "@/components/ServiceCard";
import LoadingSpinner from "@/components/LoadingSpinner";
import FilterBar, { type FilterValues } from "@/components/FilterBar/FilterBar";
import { SkeletonGroup, SkeletonCard } from "@/components/Skeleton/Skeleton";
import styles from "../salons/SalonsPage.module.css";
import { Service } from "@/types";
import { toast } from "react-toastify";
import ImageLightbox from "@/components/ImageLightbox";
import { useStartConversation } from "@/hooks/useStartConversation";
import { useSocket } from "@/context/SocketContext";
import PageNav from "@/components/PageNav";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import MobileSearch from "@/components/MobileSearch/MobileSearch";

const filtersToKey = (filters: FilterValues) => JSON.stringify(filters);

function ServicesPageContent() {
  const params = useSearchParams();
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const isMobile = useMediaQuery('(max-width: 768px)');
  const { startConversation } = useStartConversation();
  const socket = useSocket();
  const requestControllerRef = useRef<AbortController | null>(null);
  const latestRequestIdRef = useRef(0);

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
    requestControllerRef.current?.abort();
    const controller = new AbortController();
    requestControllerRef.current = controller;
    const requestId = ++latestRequestIdRef.current;

    setIsLoading(true);
    try {
      const query = new URLSearchParams();
      if (filtersToUse.province) query.append("province", filtersToUse.province);
      if (filtersToUse.city) query.append("city", filtersToUse.city);
      if (filtersToUse.category) query.append("category", filtersToUse.category);
      if (filtersToUse.service) {
        query.append("q", filtersToUse.service);
      }
      if (filtersToUse.offersMobile) query.append("offersMobile", "true");
      if (filtersToUse.sortBy) query.append("sortBy", filtersToUse.sortBy);
      if (filtersToUse.openNow) query.append("openNow", "true");
      if (filtersToUse.priceMin) query.append("priceMin", filtersToUse.priceMin);
      if (filtersToUse.priceMax) query.append("priceMax", filtersToUse.priceMax);

      const url = `/api/services/search${query.toString() ? `?${query.toString()}` : ""}`;
      const res = await fetch(url, { credentials: "include", signal: controller.signal });
      if (!res.ok) throw new Error("Failed to search services");
      const data = await res.json();
      if (requestId !== latestRequestIdRef.current) {
        return;
      }
      setServices(Array.isArray(data) ? data : []);
    } catch (error) {
      if (controller.signal.aborted) {
        return;
      }
      const message = error instanceof Error ? error.message : "Search failed";
      toast.error(message);
    } finally {
      if (requestId === latestRequestIdRef.current) {
        setIsLoading(false);
        requestControllerRef.current = null;
      }
    }
  }, []);

  useEffect(() => {
    setActiveFilters(derivedFilters);
  }, [derivedFilters]);

  useEffect(() => {
    void fetchServices(activeFilters);
  }, [fetchServices, activeFilters]);

  useEffect(() => {
    if (!socket) return;
    const handler = () => { void fetchServices(activeFilters); };
    socket.on('visibility:updated', handler);
    return () => { socket.off('visibility:updated', handler); };
  }, [socket, fetchServices, activeFilters]);

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
                onBook={() => {}}
                onSendMessage={() => {
                  if (service?.salon?.ownerId) {
                    void startConversation(service.salon.ownerId, {
                      recipientName: service?.salon?.name,
                    });
                  }
                }}
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
    </div>
  );
}

export default function ServicesPage() {
  return (
    <Suspense
      fallback={
        <div className={styles.container}>
          <h1 className={styles.title}>Services</h1>
          <LoadingSpinner />
        </div>
      }
    >
      <ServicesPageContent />
    </Suspense>
  );
}
