"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import ServiceCard from "@/components/ServiceCard";
import LoadingSpinner from "@/components/LoadingSpinner";
import FilterBar from "@/components/FilterBar/FilterBar";
import styles from "../salons/SalonsPage.module.css";
import { Service } from "@/types";
import { toast } from "react-toastify";

function ServicesPageContent() {
  const params = useSearchParams();
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
      setServices(data || []);
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

  const handleSearch = (nextFilters: any) => {
    // No-op here; FilterBar will push URL updates itself when on home page.
    // On this page, FilterBar is wired to debounce and call this; we'll refetch via params effect
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Services</h1>

      <FilterBar onSearch={handleSearch} initialFilters={filters} />

      {isLoading ? (
        <LoadingSpinner />
      ) : services.length === 0 ? (
        <p style={{ padding: "1rem" }}>No services matched your search.</p>
      ) : (
        <div className={styles.servicesGrid}>
          {services.map((service: any) => (
            <ServiceCard
              key={service.id}
              service={service}
              onBook={() => {}}
              onSendMessage={() => {
                if (service?.salon?.ownerId) {
                  window.openChatWidget?.(service.salon.ownerId, service?.salon?.name);
                }
              }}
              onImageClick={() => {}}
            />
          ))}
        </div>
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
