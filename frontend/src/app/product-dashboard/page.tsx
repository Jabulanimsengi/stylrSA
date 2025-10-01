'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Product } from '@/types';
import styles from './ProductDashboard.module.css';
import LoadingSpinner from '@/components/LoadingSpinner';
import { toast } from 'react-toastify';
import ProductFormModal from '@/components/ProductFormModal';

export default function ProductDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const router = useRouter();

  const fetchProducts = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.push('/login');
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch('http://localhost:3000/api/products/mine', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setProducts(await res.json());
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [router]);

  const handleSave = () => {
    fetchProducts();
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleDelete = async (productId: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    const token = localStorage.getItem('access_token');
    try {
      const res = await fetch(`http://localhost:3000/api/products/${productId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        toast.success('Product deleted.');
        fetchProducts();
      } else {
        throw new Error('Failed to delete product.');
      }
    } catch (error) {
      toast.error('Could not delete product.');
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Product Dashboard</h1>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          + Add Product
        </button>
      </div>

      <div className={styles.productList}>
        {products.map((product) => (
          <div key={product.id} className={styles.productItem}>
            <img
              src={product.images[0] || 'https://via.placeholder.com/150'}
              alt={product.name}
              className={styles.productImage}
            />
            <div className={styles.productInfo}>
              <h3>{product.name}</h3>
              <p>R{product.price.toFixed(2)}</p>
              <span className={`${styles.status} ${styles[product.approvalStatus.toLowerCase()]}`}>
                {product.approvalStatus}
              </span>
            </div>
            <div className={styles.productActions}>
              <button className="btn btn-secondary" onClick={() => handleEdit(product)}>
                Edit
              </button>
              <button className="btn btn-danger" onClick={() => handleDelete(product.id)}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <ProductFormModal
          onClose={() => {
            setIsModalOpen(false);
            setEditingProduct(null);
          }}
          onSave={handleSave}
          product={editingProduct}
        />
      )}
    </div>
  );
}