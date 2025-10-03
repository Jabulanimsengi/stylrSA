'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import styles from './ProductDashboard.module.css';
import { Product } from '@/types';
import ProductFormModal from '@/components/ProductFormModal';
import ConfirmationModal from '@/components/ConfirmationModal/ConfirmationModal';
import { toast } from 'react-toastify';
import LoadingSpinner from '@/components/LoadingSpinner';

const ProductDashboard = () => {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading) {
      if (!user || user.role !== 'PRODUCT_SELLER') {
        router.push('/login');
      } else {
        fetchProducts();
      }
    }
  }, [user, isLoading, router]);

  const fetchProducts = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/products/my-products', {
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      } else {
        toast.error('Failed to fetch products.');
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('An error occurred while fetching products.');
    }
  };

  const handleSaveProduct = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    fetchProducts();
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const openDeleteConfirm = (id: string) => {
    setProductToDelete(id);
    setIsConfirmModalOpen(true);
  };

  const handleDeleteProduct = async () => {
    if (!productToDelete) return;

    try {
      const res = await fetch(`http://localhost:3000/api/products/${productToDelete}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (res.ok) {
        toast.success('Product deleted successfully');
        fetchProducts();
      } else {
        const errorData = await res.json();
        toast.error(`Failed to delete product: ${errorData.message}`);
      }
    } catch (error) {
      toast.error('An error occurred while deleting the product.');
    } finally {
      setIsConfirmModalOpen(false);
      setProductToDelete(null);
    }
  };

  if (isLoading || !user) {
    return <LoadingSpinner />;
  }

  return (
    <div className={styles.dashboardContainer}>
      <div className={styles.header}>
        <h1>My Products</h1>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>Add New Product</button>
      </div>

      <div className={styles.productList}>
        {products.length > 0 ? (
          products.map((product) => (
            <div key={product.id} className={styles.productCard}>
              <img src={product.images[0] || '/logo-transparent.png'} alt={product.title} className={styles.productImage} />
              <div className={styles.productInfo}>
                <h3>{product.title}</h3>
                <p>R{product.price.toFixed(2)}</p>
                <p>{product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}</p>
              </div>
              <div className={styles.productActions}>
                <button className="btn btn-secondary" onClick={() => handleEditProduct(product)}>Edit</button>
                <button className="btn btn-danger" onClick={() => openDeleteConfirm(product.id)}>Delete</button>
              </div>
            </div>
          ))
        ) : (
          <p>You have not added any products yet.</p>
        )}
      </div>

      {isModalOpen && (
        <ProductFormModal
          product={editingProduct}
          onClose={() => {
            setIsModalOpen(false);
            setEditingProduct(null);
          }}
          onSave={handleSaveProduct}
        />
      )}

      {isConfirmModalOpen && (
        <ConfirmationModal
          isOpen={isConfirmModalOpen}
          onClose={() => setIsConfirmModalOpen(false)}
          onConfirm={handleDeleteProduct}
          title="Delete Product"
          message="Are you sure you want to delete this product? This action cannot be undone."
        />
      )}
    </div>
  );
};

export default ProductDashboard;