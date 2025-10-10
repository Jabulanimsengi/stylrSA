'use client';

import { useState } from 'react';
import styles from './ProductOrderModal.module.css';
import { Product } from '@/types';
import { apiJson } from '@/lib/api';
import { toast } from 'react-toastify';
import { toFriendlyMessage } from '@/lib/errors';

interface ProductOrderModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function ProductOrderModal({ product, isOpen, onClose, onSuccess }: ProductOrderModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [deliveryMethod, setDeliveryMethod] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const total = quantity * product.price;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (quantity < 1) {
      toast.error('Quantity must be at least 1');
      return;
    }
    setIsSubmitting(true);
    try {
      await apiJson('/api/product-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          quantity,
          deliveryMethod: deliveryMethod || undefined,
          contactPhone: contactPhone || undefined,
          notes: notes || undefined,
        }),
      });
      toast.success('Order placed successfully');
      onSuccess?.();
      onClose();
      setQuantity(1);
      setDeliveryMethod('');
      setContactPhone('');
      setNotes('');
    } catch (error) {
      toast.error(toFriendlyMessage(error, 'Could not create order'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.backdrop} role="dialog" aria-modal="true">
      <div className={styles.modal}>
        <header className={styles.header}>
          <h2>Order {product.name}</h2>
          <button className={styles.closeButton} onClick={onClose} aria-label="Close order modal">
            ×
          </button>
        </header>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.fieldGroup}>
            <label htmlFor="quantity">Quantity</label>
            <input
              id="quantity"
              type="number"
              min={1}
              max={product.stock ?? undefined}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              required
            />
            {product.stock !== undefined && (
              <span className={styles.helper}>In stock: {product.stock}</span>
            )}
          </div>
          <div className={styles.fieldGroup}>
            <label htmlFor="deliveryMethod">Delivery preference</label>
            <input
              id="deliveryMethod"
              type="text"
              placeholder="Courier, pickup, etc."
              value={deliveryMethod}
              onChange={(e) => setDeliveryMethod(e.target.value)}
            />
          </div>
          <div className={styles.fieldGroup}>
            <label htmlFor="contactPhone">Contact phone</label>
            <input
              id="contactPhone"
              type="tel"
              placeholder="Provide a phone number"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
            />
          </div>
          <div className={styles.fieldGroup}>
            <label htmlFor="notes">Notes for the seller</label>
            <textarea
              id="notes"
              rows={3}
              placeholder="Add any special requests or delivery details"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
          <div className={styles.summary}>
            <span>Total</span>
            <strong>R{total.toFixed(2)}</strong>
          </div>
          <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting ? 'Placing order…' : 'Confirm Order'}
          </button>
        </form>
      </div>
    </div>
  );
}
