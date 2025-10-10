'use client';

import { useCallback, useEffect, useState } from 'react';
import { Product } from '@/types';
import styles from './ProductsPage.module.css';
import LoadingSpinner from '@/components/LoadingSpinner';
import ProductCard from '@/components/ProductCard';
import ImageLightbox from '@/components/ImageLightbox';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lightboxImages, setLightboxImages] = useState<string[] | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/products');
      if (res.ok) {
        setProducts(await res.json());
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleOpenLightbox = useCallback((images: string[], startIndex: number) => {
    setLightboxImages(images);
    setLightboxIndex(startIndex);
  }, []);

  const handleCloseLightbox = useCallback(() => {
    setLightboxImages(null);
    setLightboxIndex(0);
  }, []);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Hair Products</h1>
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