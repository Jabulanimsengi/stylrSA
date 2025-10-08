// frontend/src/app/product-dashboard/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';
import { Product } from '@/types';
import LoadingSpinner from '@/components/LoadingSpinner';
import ProductFormModal from '@/components/ProductFormModal';
import ConfirmationModal from '@/components/ConfirmationModal/ConfirmationModal';
import styles from './ProductDashboard.module.css';
import { toast } from 'react-toastify';

export default function ProductDashboard() {
  const { user, authStatus } = useAuth();
  const isAuthLoading = authStatus === 'loading';
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);

  const fetchProducts = useCallback(async () => {
    if (!user) {
      return;
    }
    try {
      const res = await fetch(`/api/products/my-products`, {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to fetch products');
      const data = await res.json();
      setProducts(data);
    } catch (error) {
      console.error(error);
      toast.error('Could not load your products.');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!isAuthLoading) {
      fetchProducts();
    }
  }, [isAuthLoading, fetchProducts]);

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleProductSave = (product: Product) => {
    if (editingProduct) {
      setProducts(products.map((p) => (p.id === product.id ? product : p)));
    } else {
      setProducts([...products, product]);
    }
    handleModalClose();
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingProduct) return;
    try {
      const res = await fetch(`/api/products/${deletingProduct.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to delete product');
      setProducts(products.filter((p) => p.id !== deletingProduct.id));
      toast.success('Product deleted successfully.');
    } catch (error) {
      console.error(error);
      toast.error('Failed to delete product.');
    } finally {
      setDeletingProduct(null);
    }
  };

  if (isLoading || isAuthLoading) return <LoadingSpinner />;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Product Dashboard</h1>
      <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">Add New Product</button>
      <div className={styles.productList}>
        {products.map((product) => (
          <div key={product.id} className={styles.productCard}>
            <div className={styles.productImageWrapper}>
              <Image
                src={product.images[0] || 'https://via.placeholder.com/150'}
                alt={product.name}
                className={styles.productImage}
                fill
                sizes="(max-width: 768px) 100vw, 120px"
              />
            </div>
            <div className={styles.productInfo}>
              <h2>{product.name}</h2>
              <p>Price: R{product.price.toFixed(2)}</p>
              <p>Stock: {product.stockQuantity > 0 ? `${product.stockQuantity} available` : 'Out of stock'}</p>
              <p>Status: <span className={`${styles.status} ${styles[product.approvalStatus.toLowerCase()]}`}>{product.approvalStatus}</span></p>
              <div className={styles.actions}>
                <button onClick={() => handleEdit(product)} className="btn btn-secondary">Edit</button>
                <button onClick={() => setDeletingProduct(product)} className="btn btn-danger">Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <ProductFormModal
          initialData={editingProduct}
          onClose={handleModalClose}
          onProductAdded={handleProductSave}
        />
      )}

      {deletingProduct && (
        <ConfirmationModal
          message={`Are you sure you want to delete "${deletingProduct.name}"?`}
          onConfirm={handleDelete}
          onCancel={() => setDeletingProduct(null)}
          confirmText="Delete"
        />
      )}
    </div>
  );
}