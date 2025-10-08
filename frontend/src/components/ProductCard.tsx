'use client';

import { Product } from '@/types';
import Image from 'next/image';
import styles from './ProductCard.module.css';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <div className={styles.card}>
      <div className={styles.cardImageWrapper}>
        <Image
          src={product.images[0] || 'https://via.placeholder.com/300x200'}
          alt={product.name}
          className={styles.cardImage}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
        />
      </div>
      <div className={styles.cardContent}>
        <h3 className={styles.cardTitle}>{product.name}</h3>
        <p className={styles.price}>R{product.price.toFixed(2)}</p>
      </div>
    </div>
  );
}