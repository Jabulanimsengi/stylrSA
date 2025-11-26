'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Product } from '@/types';
import styles from './ProductsPage.module.css';
import ProductCard from '@/components/ProductCard';
import ImageLightbox from '@/components/ImageLightbox';
import { SkeletonGroup, SkeletonCard } from '@/components/Skeleton/Skeleton';
import ProductFilter, { type ProductFilterValues } from '@/components/ProductFilter/ProductFilter';
import PageNav from '@/components/PageNav';
import { toast } from 'react-toastify';
import { toFriendlyMessage } from '@/lib/errors';
import { logger } from '@/lib/logger';
import EmptyState from '@/components/EmptyState/EmptyState';

const DEFAULT_FILTERS: ProductFilterValues = {
  search: '',
  category: '',
  priceMin: '',
  priceMax: '',
  inStock: false,
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lightboxImages, setLightboxImages] = useState<string[] | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [filters, setFilters] = useState<ProductFilterValues>(DEFAULT_FILTERS);
  const abortRef = useRef<AbortController | null>(null);
  const requestIdRef = useRef(0);

  const queryString = useMemo(() => {
    const query = new URLSearchParams();
    if (filters.search.trim()) query.append('q', filters.search.trim());
    if (filters.category) query.append('category', filters.category);
    if (filters.priceMin) query.append('priceMin', filters.priceMin);
    if (filters.priceMax) query.append('priceMax', filters.priceMax);
    if (filters.inStock) query.append('inStock', 'true');
    const qs = query.toString();
    return qs.length > 0 ? `?${qs}` : '';
  }, [filters]);

  const fetchProducts = useCallback(async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    const requestId = ++requestIdRef.current;

    setIsLoading(true);
    try {
      const res = await fetch(`/api/products${queryString}`, {
        signal: controller.signal,
      });
      if (res.ok) {
        const data: Product[] = await res.json();
        if (requestId === requestIdRef.current) {
          setProducts(data);
        }
      }
    } catch (error) {
      if (!controller.signal.aborted) {
        logger.error('Failed to fetch products:', error);
        toast.error(toFriendlyMessage(error, 'Failed to load products. Please try again.'));
      }
    } finally {
      if (requestId === requestIdRef.current) {
        setIsLoading(false);
        abortRef.current = null;
      }
    }
  }, [queryString]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => () => abortRef.current?.abort(), []);

  const handleOpenLightbox = useCallback((images: string[], startIndex: number) => {
    setLightboxImages(images);
    setLightboxIndex(startIndex);
  }, []);

  const handleCloseLightbox = useCallback(() => {
    setLightboxImages(null);
    setLightboxIndex(0);
  }, []);

  return (
    <div className={styles.container}>
      <PageNav />
      <h1 className={styles.title}>Products</h1>

      <div className={styles.filterShell}>
        <ProductFilter
          initialValues={filters}
          onChange={setFilters}
          isSubmitting={isLoading}
        />
      </div>

      {isLoading ? (
        <SkeletonGroup count={8} className={styles.grid}>
          {() => <SkeletonCard hasImage lines={3} />}
        </SkeletonGroup>
      ) : products.length === 0 ? (
        <div className={styles.emptyStateWrapper}>
          <EmptyState
            variant="no-results"
            title="No Products Found"
            description="We couldn't find any products matching your filters. Try adjusting your search or filters."
          />
        </div>
      ) : (
        <div className={styles.grid}>
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onOrderSuccess={fetchProducts}
              onOpenLightbox={handleOpenLightbox}
            />
          ))}
        </div>
      )}

      {lightboxImages && (
        <ImageLightbox
          images={lightboxImages}
          initialImageIndex={lightboxIndex}
          onClose={handleCloseLightbox}
        />
      )}
    </div>
  );
}
