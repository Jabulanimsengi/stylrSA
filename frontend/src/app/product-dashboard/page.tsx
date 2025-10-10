import { Suspense } from 'react';
import ProductDashboardClient from './ProductDashboardClient';

export default function ProductDashboardPage() {
  return (
    <Suspense fallback={<div />}>
      <ProductDashboardClient />
    </Suspense>
  );
}