import { IsEnum } from 'class-validator';
import { ProductOrderStatus } from '@prisma/client';

export class UpdateProductOrderStatusDto {
  @IsEnum(ProductOrderStatus)
  status: ProductOrderStatus;
}
