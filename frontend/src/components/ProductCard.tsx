'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './ProductCard.module.css';
import { Product } from '@/types';
import ProductOrderModal from './ProductOrderModal';
import { useAuth } from '@/hooks/useAuth';
import { useAuthModal } from '@/context/AuthModalContext';
import { toast } from 'react-toastify';
import { useStartConversation } from '@/hooks/useStartConversation';

interface ProductCardProps {
  product: Product;
  onOrderSuccess?: () => void;
  onOpenLightbox?: (images: string[], index: number) => void;
  showSellerLink?: boolean;
}

export default function ProductCard({
  product,
  onOrderSuccess,
  onOpenLightbox,
  showSellerLink = true,
}: ProductCardProps) {
  const { authStatus, user } = useAuth();
  const { openModal } = useAuthModal();
  const [isOrderOpen, setIsOrderOpen] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const { startConversation } = useStartConversation();

  const images = useMemo(() => {
    const unique = Array.isArray(product.images)
      ? product.images.filter((img, idx, arr) => img && arr.indexOf(img) === idx)
      : [];
    return unique.length > 0 ? unique : ['https://via.placeholder.com/640x360'];
  }, [product.images]);
  const [activeImage, setActiveImage] = useState(0);

  const handleOrderClick = () => {
    if (authStatus !== 'authenticated') {
      openModal('login');
      toast.info('Log in to place an order.');
      return;
    }
    setIsOrderOpen(true);
  };

  const handleMessageSeller = () => {
    if (!product.sellerId) {
      toast.error('Seller information is unavailable.');
      return;
    }
    const sellerName = `${product.seller?.firstName ?? ''} ${product.seller?.lastName ?? ''}`.trim();
    if (product.sellerId === user?.id) {
      toast.info('This is your product listing.');
      return;
    }
    void startConversation(product.sellerId, {
      recipientName: sellerName || product.name,
    });
  };

  const handleImageClick = () => {
    if (onOpenLightbox) {
      onOpenLightbox(images, activeImage);
    }
  };

  return (
    <>
      <div className={styles.card}>
        <div className={styles.imageContainer} onClick={handleImageClick}>
          <Image
            key={images[activeImage]}
            src={images[activeImage]}
            alt={product.name}
            className={styles.image}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
          />
          {images.length > 1 && (
            <>
              <button
                type="button"
                className={`${styles.carouselButton} ${styles.prev}`}
                onClick={(event) => {
                  event.stopPropagation();
                  setActiveImage((prev) => (prev === 0 ? images.length - 1 : prev - 1));
                }}
                aria-label="Previous image"
              >
                ‹
              </button>
              <button
                type="button"
                className={`${styles.carouselButton} ${styles.next}`}
                onClick={(event) => {
                  event.stopPropagation();
                  setActiveImage((prev) => (prev === images.length - 1 ? 0 : prev + 1));
                }}
                aria-label="Next image"
              >
                ›
              </button>
              <div className={styles.carouselDots}>
                {images.map((img, idx) => (
                  <button
                    key={`${img}-${idx}`}
                    className={`${styles.carouselDot} ${idx === activeImage ? styles.activeDot : ''}`}
                    onClick={(event) => {
                      event.stopPropagation();
                      setActiveImage(idx);
                    }}
                    aria-label={`Show image ${idx + 1}`}
                  />
                ))}
              </div>
            </>
          )}
          <div className={styles.imageOverlay}>
            <span className={styles.overlayIcon}>👁️</span>
            <span className={styles.overlayText}>View Images</span>
          </div>
        </div>
        <div className={styles.content}>
          <div className={styles.header}>
            <h3 className={styles.title}>{product.name}</h3>
            <p className={styles.price}>R{product.price.toFixed(2)}</p>
          </div>
          <button
            type="button"
            className={styles.detailsToggle}
            onClick={(event) => {
              event.stopPropagation();
              setShowDetails((prev) => !prev);
            }}
          >
            {showDetails ? 'Hide details' : 'View details'}
          </button>
          {showDetails && (
            <div className={styles.detailsSection}>
              {product.description && (
                <p className={styles.description}>{product.description}</p>
              )}
              <div className={styles.metaRow}>
                <span className={styles.metaLabel}>In stock</span>
                <span>{product.stock ?? 0}</span>
              </div>
              {showSellerLink && product.sellerId && product.seller && (
                <div className={styles.metaRow}>
                  <span className={styles.metaLabel}>Seller</span>
                  <Link href={`/sellers/${product.sellerId}`} className={styles.sellerLink}>
                    {`${product.seller.firstName ?? ''} ${product.seller.lastName ?? ''}`.trim() || 'View profile'}
                  </Link>
                </div>
              )}
            </div>
          )}
          <div className={styles.footer}>
            <button
              type="button"
              className={`${styles.actionButton} btn btn-ghost`}
              onClick={(event) => {
                event.stopPropagation();
                handleMessageSeller();
              }}
            >
              Message
            </button>
            <div className={styles.actions}>
              <button
                type="button"
                className={`${styles.actionButton} ${styles.primaryAction} btn btn-primary`}
                onClick={(event) => {
                  event.stopPropagation();
                  handleOrderClick();
                }}
              >
                Order
              </button>
            </div>
          </div>
        </div>
      </div>
      <ProductOrderModal
        product={product}
        isOpen={isOrderOpen}
        onClose={() => setIsOrderOpen(false)}
        onSuccess={onOrderSuccess}
      />
    </>
  );
}