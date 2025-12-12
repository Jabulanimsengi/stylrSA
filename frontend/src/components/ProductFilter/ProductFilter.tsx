'use client';

import { useMemo, useState } from 'react';
import styles from './ProductFilter.module.css';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
  Checkbox,
} from '@/components/ui';

export interface ProductFilterValues {
  search: string;
  category: string;
  priceMin: string;
  priceMax: string;
  inStock: boolean;
}

interface ProductFilterProps {
  initialValues?: Partial<ProductFilterValues>;
  categories?: string[];
  onChange: (values: ProductFilterValues) => void;
  isSubmitting?: boolean;
}

const DEFAULT_VALUES: ProductFilterValues = {
  search: '',
  category: '',
  priceMin: '',
  priceMax: '',
  inStock: false,
};

export default function ProductFilter({
  initialValues = {},
  categories = [],
  onChange,
  isSubmitting = false,
}: ProductFilterProps) {
  const [values, setValues] = useState<ProductFilterValues>({
    ...DEFAULT_VALUES,
    ...initialValues,
  });

  const categoryOptions = useMemo(() => {
    if (categories.length > 0) {
      return categories;
    }
    return [
      'Hair Pieces',
      'Hair Oils',
      'Hair Extensions',
      'Wigs',
      'Braiding Hair',
      'Nail Care',
      'Skincare',
      'Styling Tools',
    ];
  }, [categories]);

  const emitChange = (next: Partial<ProductFilterValues>) => {
    const updated = { ...values, ...next };
    setValues(updated);
    onChange(updated);
  };

  return (
    <section className={styles.filterShell} aria-label="Product filters">
      <div className={styles.field}>
        <label htmlFor="product-search" className={styles.label}>Search</label>
        <input
          id="product-search"
          className={styles.input}
          placeholder="Search products by name or description"
          value={values.search}
          onChange={(event) => emitChange({ search: event.target.value })}
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Category</label>
        <Select
          value={values.category}
          onValueChange={(value) => emitChange({ category: value === '__all__' ? '' : value })}
        >
          <SelectTrigger className={styles.select}>
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All categories</SelectItem>
            {categoryOptions.map((category) => (
              <SelectItem key={category} value={category}>{category}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Price range (R)</label>
        <div className={styles.priceRow}>
          <input
            type="number"
            min={0}
            placeholder="Min"
            className={styles.input}
            value={values.priceMin}
            onChange={(event) => emitChange({ priceMin: event.target.value })}
          />
          <input
            type="number"
            min={0}
            placeholder="Max"
            className={styles.input}
            value={values.priceMax}
            onChange={(event) => emitChange({ priceMax: event.target.value })}
          />
        </div>
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Availability</label>
        <div className={styles.toggleRow}>
          <Checkbox
            id="product-instock"
            checked={values.inStock}
            onCheckedChange={(checked) => emitChange({ inStock: checked === true })}
            label="Only show in-stock items"
          />
        </div>
      </div>

      <div className={styles.actions}>
        <button
          type="button"
          className={styles.clearButton}
          onClick={() => emitChange(DEFAULT_VALUES)}
        >
          Clear
        </button>
        <button
          type="button"
          className={styles.submitButton}
          disabled={isSubmitting}
          onClick={() => onChange(values)}
        >
          {isSubmitting ? 'Filtering…' : 'Apply Filters'}
        </button>
      </div>
    </section>
  );
}
