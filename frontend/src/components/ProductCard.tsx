'use client';

import { Product } from '@/types';
import styles from './ProductCard.module.css';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <div className={styles.card}>
      <img
        src={product.images[0] || 'https://via.placeholder.com/300x200'}
        alt={product.name}
        className={styles.cardImage}
      />
      <div className={styles.cardContent}>
        <h3 className={styles.cardTitle}>{product.name}</h3>
        <p className={styles.price}>R{product.price.toFixed(2)}</p>
      </div>
    </div>
  );
}