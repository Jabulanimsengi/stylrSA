import { IsIn } from 'class-validator';

export const PRODUCT_ORDER_STATUS = [
  'PENDING',
  'CONFIRMED',
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
] as const;
export type ProductOrderStatus = (typeof PRODUCT_ORDER_STATUS)[number];

export class UpdateProductOrderStatusDto {
  @IsIn(PRODUCT_ORDER_STATUS)
  status: ProductOrderStatus;
}
