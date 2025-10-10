// frontend/src/app/product-dashboard/page.tsx
'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'react-toastify';
import { useAuth } from '@/hooks/useAuth';
import { Product, ProductOrder, ProductOrderStatus } from '@/types';
import LoadingSpinner from '@/components/LoadingSpinner';
import ProductFormModal from '@/components/ProductFormModal';
import ConfirmationModal from '@/components/ConfirmationModal/ConfirmationModal';
import styles from './ProductDashboard.module.css';

type TabKey = 'products' | 'orders';
const tabs: { key: TabKey; label: string }[] = [
  { key: 'products', label: 'My Products' },
  { key: 'orders', label: 'Orders' },
];

const statusOptions: ProductOrderStatus[] = [
  'PENDING',
  'CONFIRMED',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
];

export default function ProductDashboard() {
  const { user, authStatus } = useAuth();
  const router = useRouter();
  const search = useSearchParams();
  const initialTab = (search.get('tab') as TabKey) || 'products';
  const [activeTab, setActiveTab] = useState<TabKey>(initialTab);

  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<ProductOrder[]>([]);
  const [isProductsLoading, setIsProductsLoading] = useState(true);
  const [isOrdersLoading, setIsOrdersLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const fetchProducts = useCallback(async () => {
    if (!user) return;
    setIsProductsLoading(true);
    try {
      const res = await fetch('/api/products/my-products', {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to fetch products');
      setProducts(await res.json());
    } catch (error) {
      console.error(error);
      toast.error('Could not load your products.');
    } finally {
      setIsProductsLoading(false);
    }
  }, [user]);

  const fetchOrders = useCallback(async () => {
    if (!user) return;
    setIsOrdersLoading(true);
    try {
      const res = await fetch('/api/product-orders/seller', {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to fetch orders');
      setOrders(await res.json());
    } catch (error) {
      console.error(error);
      toast.error('Could not load orders.');
    } finally {
      setIsOrdersLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (authStatus !== 'authenticated') return;
    fetchProducts();
  }, [authStatus, fetchProducts]);

  useEffect(() => {
    if (authStatus !== 'authenticated') return;
    if (activeTab === 'orders') {
      fetchOrders();
    }
  }, [authStatus, activeTab, fetchOrders]);

  const handleTabChange = (tab: TabKey) => {
    setActiveTab(tab);
    const params = new URLSearchParams(search.toString());
    params.set('tab', tab);
    router.replace(`/product-dashboard?${params.toString()}`);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleProductSaved = (product: Product) => {
    setProducts((prev) => {
      const exists = prev.some((p) => p.id === product.id);
      if (exists) {
        return prev.map((p) => (p.id === product.id ? product : p));
      }
      return [product, ...prev];
    });
    handleModalClose();
  };

  const handleDelete = async () => {
    if (!deletingProduct) return;
    try {
      const res = await fetch(`/api/products/${deletingProduct.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to delete product');
      setProducts((prev) => prev.filter((p) => p.id !== deletingProduct.id));
      toast.success('Product deleted successfully.');
    } catch (error) {
      console.error(error);
      toast.error('Failed to delete product.');
    } finally {
      setDeletingProduct(null);
    }
  };

  const handleOrderStatusChange = async (orderId: string, status: ProductOrderStatus) => {
    setUpdatingOrderId(orderId);
    try {
      const res = await fetch(`/api/product-orders/${orderId}/status`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error('Failed to update order');
      setOrders((prev) => prev.map((order) => (order.id === orderId ? { ...order, status } : order)));
      toast.success('Order updated');
    } catch (error) {
      console.error(error);
      toast.error('Could not update order status.');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const isLoading = useMemo(() => {
    if (authStatus === 'loading') return true;
    if (activeTab === 'products') return isProductsLoading;
    return false;
  }, [authStatus, activeTab, isProductsLoading]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Product Dashboard</h1>
      <div className={styles.tabBar}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={`${styles.tabButton} ${activeTab === tab.key ? styles.activeTab : ''}`}
            onClick={() => handleTabChange(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'products' && (
        <>
          <div className={styles.toolbar}>
            <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">
              Add New Product
            </button>
          </div>
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
                  <p>Stock: {product.stock ?? 0}</p>
                  {product.approvalStatus && (
                    <p>
                      Status:{' '}
                      <span className={`${styles.status} ${styles[product.approvalStatus.toLowerCase()]}`}>
                        {product.approvalStatus}
                      </span>
                    </p>
                  )}
                  <div className={styles.actions}>
                    <button onClick={() => { setEditingProduct(product); setIsModalOpen(true); }} className="btn btn-secondary">
                      Edit
                    </button>
                    <button onClick={() => setDeletingProduct(product)} className="btn btn-danger">
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {activeTab === 'orders' && (
        <div className={styles.ordersSection}>
          {isOrdersLoading ? (
            <LoadingSpinner />
          ) : orders.length === 0 ? (
            <div className={styles.emptyState}>No orders yet.</div>
          ) : (
            <div className={styles.orderList}>
              {orders.map((order) => (
                <div key={order.id} className={styles.orderCard}>
                  <div className={styles.orderSummary}>
                    <div className={styles.orderImageWrapper}>
                      <Image
                        src={order.product.images[0] || 'https://via.placeholder.com/120'}
                        alt={order.product.name}
                        fill
                        sizes="120px"
                      />
                    </div>
                    <div className={styles.orderDetails}>
                      <h3>{order.product.name}</h3>
                      <p>Buyer: {`${order.buyer?.firstName ?? ''} ${order.buyer?.lastName ?? ''}`.trim() || 'Customer'}</p>
                      <p>Quantity: {order.quantity}</p>
                      <p>Total: R{order.totalPrice.toFixed(2)}</p>
                    </div>
                  </div>
                  <div className={styles.statusRow}>
                    <label htmlFor={`order-${order.id}`}>Status</label>
                    <select
                      id={`order-${order.id}`}
                      value={order.status}
                      disabled={updatingOrderId === order.id}
                      onChange={(event) => handleOrderStatusChange(order.id, event.target.value as ProductOrderStatus)}
                    >
                      {statusOptions.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>
                  {order.notes && <p className={styles.orderNotes}>Notes: {order.notes}</p>}
                  {order.contactPhone && <p className={styles.orderNotes}>Contact: {order.contactPhone}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {isModalOpen && (
        <ProductFormModal
          initialData={editingProduct}
          onClose={handleModalClose}
          onProductAdded={handleProductSaved}
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