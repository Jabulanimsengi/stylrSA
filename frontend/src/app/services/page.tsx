"use client";

import { Suspense, useEffect, useMemo, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import ServiceCard from "@/components/ServiceCard";
import LoadingSpinner from "@/components/LoadingSpinner";
import FilterBar, { type FilterValues } from "@/components/FilterBar/FilterBar";
import styles from "../salons/SalonsPage.module.css";
import { Service } from "@/types";
import { toast } from "react-toastify";
import ImageLightbox from "@/components/ImageLightbox";
import { useStartConversation } from "@/hooks/useStartConversation";
import { useSocket } from "@/context/SocketContext";

function ServicesPageContent() {
  const params = useSearchParams();
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const { startConversation } = useStartConversation();
  const socket = useSocket();

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

  const fetchServices = useCallback(async (filtersToUse: FilterValues) => {
    try {
      setIsLoading(true);
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
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to search services");
      const data = await res.json();
      setServices(Array.isArray(data) ? data : []);
    } catch (err: any) {
      toast.error(err.message || "Search failed");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    setActiveFilters(derivedFilters);
    void fetchServices(derivedFilters);
  }, [derivedFilters, fetchServices]);

  useEffect(() => {
    if (!socket) return;
    const handler = () => { void fetchServices(activeFilters); };
    socket.on('visibility:updated', handler);
    return () => { socket.off('visibility:updated', handler); };
  }, [socket, fetchServices, activeFilters]);

  const handleSearch = (nextFilters: FilterValues) => {
    setActiveFilters(nextFilters);
    void fetchServices(nextFilters);
  };

  const handleOpenLightbox = (images: string[], index: number) => {
    if (!images || images.length === 0) return;
    setLightboxImages(images);
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  return (
    <div className={styles.container}>
      <div className={styles.pageHeading}>
        <h1 className={styles.title}>Services</h1>
      </div>

      <FilterBar
        onSearch={handleSearch}
        initialFilters={activeFilters}
        key={JSON.stringify(activeFilters)}
      />

      <div className={styles.resultsShell}>
        {isLoading ? (
          <div className={styles.loadingState}>
            <LoadingSpinner />
          </div>
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
          <div className={styles.pageHeading}>
            <h1 className={styles.title}>Services</h1>
          </div>
          <LoadingSpinner />
        </div>
      }
    >
      <ServicesPageContent />
    </Suspense>
  );
}
