import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateProductOrderDto } from './dto/create-product-order.dto';
import { NotificationsService } from 'src/notifications/notifications.service';
import { EventsGateway } from 'src/events/events.gateway';

@Injectable()
export class ProductOrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
    private readonly eventsGateway: EventsGateway,
  ) {}

  async create(buyer: any, dto: CreateProductOrderDto) {
    const product = await this.prisma.product.findUnique({
      where: { id: dto.productId },
      include: { seller: true },
    });

    if (!product || product.approvalStatus !== 'APPROVED') {
      throw new NotFoundException('Product not available for ordering');
    }

    if (product.sellerId === buyer.id) {
      throw new BadRequestException('You cannot order your own product');
    }

    if (dto.quantity <= 0) {
      throw new BadRequestException('Quantity must be at least 1');
    }

    if (product.stock < dto.quantity) {
      throw new BadRequestException('Insufficient stock for this product');
    }

    const totalPrice = product.price * dto.quantity;
    const order = await this.prisma.productOrder.create({
      data: {
        productId: product.id,
        buyerId: buyer.id,
        sellerId: product.sellerId,
        quantity: dto.quantity,
        totalPrice,
        deliveryMethod: dto.deliveryMethod,
        contactPhone: dto.contactPhone,
        notes: dto.notes,
      },
      include: {
        product: { select: { name: true, images: true } },
        seller: { select: { id: true, firstName: true, lastName: true } },
        buyer: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    await this.prisma.product.update({
      where: { id: product.id },
      data: { stock: { decrement: dto.quantity } },
    });

    const sellerMessage = `${buyer.firstName} placed an order for ${dto.quantity} × ${product.name}.`;
    const sellerNotification = await this.notificationsService.create(
      product.sellerId,
      sellerMessage,
      { link: '/product-dashboard?tab=orders' },
    );
    this.eventsGateway.sendNotificationToUser(
      product.sellerId,
      'newNotification',
      sellerNotification,
    );

    return order;
  }

  findAllForBuyer(user: any) {
    return this.prisma.productOrder.findMany({
      where: { buyerId: user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        product: { select: { name: true, images: true, price: true } },
        seller: { select: { id: true, firstName: true, lastName: true } },
      },
    });
  }

  findAllForSeller(user: any) {
    return this.prisma.productOrder.findMany({
      where: { sellerId: user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        product: { select: { name: true, images: true, price: true } },
        buyer: { select: { id: true, firstName: true, lastName: true } },
      },
    });
  }

  async updateStatus(
    user: any,
    id: string,
    status:
      | 'PENDING'
      | 'CONFIRMED'
      | 'PROCESSING'
      | 'SHIPPED'
      | 'DELIVERED'
      | 'CANCELLED',
  ) {
    const order = await this.prisma.productOrder.findUnique({
      where: { id },
      include: {
        seller: { select: { id: true } },
        buyer: { select: { id: true, firstName: true, lastName: true } },
        product: { select: { id: true, name: true } },
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const isSeller = order.seller.id === user.id;
    const isAdmin = user.role === 'ADMIN';
    if (!isSeller && !isAdmin) {
      throw new ForbiddenException('You are not allowed to update this order');
    }

    const updated = await this.prisma.productOrder.update({
      where: { id },
      data: { status },
    });

    if (status === 'CANCELLED' && order.status !== 'CANCELLED') {
      await this.prisma.product.update({
        where: { id: order.product.id },
        data: { stock: { increment: order.quantity } },
      });
    }

    const buyerMessage = `Your order for ${order.product.name} is now ${status.toLowerCase()}.`;
    const buyerNotification = await this.notificationsService.create(
      order.buyer.id,
      buyerMessage,
      { link: '/my-orders' },
    );
    this.eventsGateway.sendNotificationToUser(
      order.buyer.id,
      'newNotification',
      buyerNotification,
    );

    return updated;
  }
}
