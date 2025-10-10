"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import ServiceCard from "@/components/ServiceCard";
import LoadingSpinner from "@/components/LoadingSpinner";
import FilterBar from "@/components/FilterBar/FilterBar";
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

  const filters = useMemo(() => {
    const obj: Record<string, string> = {};
    params.forEach((value, key) => {
      obj[key] = value;
    });
    return obj;
  }, [params]);

  const fetchServices = async () => {
    try {
      setIsLoading(true);
      const query = new URLSearchParams(filters as Record<string, string>);
      // Map 'service' filter to backend's 'q'
      if (query.get("service")) {
        query.set("q", String(query.get("service")));
        query.delete("service");
      }
      const res = await fetch(`/api/services/search?${query.toString()}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to search services");
      const data = await res.json();
      setServices(Array.isArray(data) ? data : []);
    } catch (err: any) {
      toast.error(err.message || "Search failed");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  useEffect(() => {
    if (!socket) return;
    const handler = () => { void fetchServices(); };
    socket.on('visibility:updated', handler);
    return () => { socket.off('visibility:updated', handler); };
  }, [socket]);

  const handleSearch = (nextFilters: any) => {
    // No-op here; FilterBar will push URL updates itself when on home page.
    // On this page, FilterBar is wired to debounce and call this; we'll refetch via params effect
  };

  const handleOpenLightbox = (images: string[], index: number) => {
    if (!images || images.length === 0) return;
    setLightboxImages(images);
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Services</h1>

      <FilterBar onSearch={handleSearch} initialFilters={filters} />

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
          <h1 className={styles.title}>Services</h1>
          <LoadingSpinner />
        </div>
      }
    >
      <ServicesPageContent />
    </Suspense>
  );
}
