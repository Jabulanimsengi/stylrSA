import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateSellerPlanDto } from './dto/update-seller-plan.dto';

type PlanCode = 'FREE' | 'STARTER' | 'ESSENTIAL' | 'GROWTH' | 'PRO' | 'ELITE';
type PlanPaymentStatus =
  | 'PENDING_SELECTION'
  | 'AWAITING_PROOF'
  | 'PROOF_SUBMITTED'
  | 'VERIFIED';

const PLAN_FALLBACKS: Record<
  PlanCode,
  { visibilityWeight: number; maxListings: number; priceCents: number }
> = {
  FREE: { visibilityWeight: 0, maxListings: 1, priceCents: 0 },
  STARTER: { visibilityWeight: 2, maxListings: 10, priceCents: 22900 },
  PRO: { visibilityWeight: 3, maxListings: 25, priceCents: 32900 },
  ELITE: { visibilityWeight: 5, maxListings: 9999, priceCents: 49900 },
  ESSENTIAL: { visibilityWeight: 2, maxListings: 7, priceCents: 9900 },
  GROWTH: { visibilityWeight: 3, maxListings: 15, priceCents: 19900 },
};

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) { }

  private async resolvePlanMeta(planCode: PlanCode) {
    try {
      const plan = await this.prisma.plan.findUnique({
        where: { code: planCode },
        select: {
          visibilityWeight: true,
          maxListings: true,
          priceCents: true,
        },
      });
      if (plan) return plan;
    } catch {
      // swallow and fall back
    }
    return PLAN_FALLBACKS[planCode];
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
        sellerPlanCode: true,
        sellerPlanPriceCents: true,
        sellerPlanPaymentStatus: true,
        sellerPlanPaymentReference: true,
        sellerPlanProofSubmittedAt: true,
        sellerPlanVerifiedAt: true,
        sellerVisibilityWeight: true,
        sellerMaxListings: true,
      },
    });
    return user;
  }

  async updateProfile(userId: string, dto: UpdateUserDto) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { ...dto },
    });
    const { password, ...result } = user;
    return result;
  }

  async updateSellerPlan(userId: string, dto: UpdateSellerPlanDto) {
    const seller = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        role: true,
        firstName: true,
        lastName: true,
        sellerPlanCode: true,
        sellerPlanPaymentStatus: true,
        sellerPlanPaymentReference: true,
        sellerPlanProofSubmittedAt: true,
        sellerPlanVerifiedAt: true,
      },
    });

    if (!seller) {
      throw new NotFoundException('Seller not found');
    }
    if (seller.role !== 'PRODUCT_SELLER') {
      throw new ForbiddenException('Only product sellers can select a package');
    }

    const planCode = (dto.planCode as string).toUpperCase() as PlanCode;
    if (!PLAN_FALLBACKS[planCode]) {
      throw new ForbiddenException('Invalid package selection.');
    }

    const planMeta = await this.resolvePlanMeta(planCode);
    const currentStatus = (seller.sellerPlanPaymentStatus ??
      'PENDING_SELECTION') as PlanPaymentStatus;
    const planChanged = planCode !== (seller.sellerPlanCode as PlanCode | null);

    let nextStatus: PlanPaymentStatus = currentStatus;
    if (planCode === 'FREE') {
      nextStatus = 'VERIFIED';
    }
    if (planChanged) {
      nextStatus = planCode === 'FREE' ? 'VERIFIED' : dto.hasSentProof ? 'PROOF_SUBMITTED' : 'AWAITING_PROOF';
    }
    if (typeof dto.hasSentProof === 'boolean') {
      if (dto.hasSentProof) {
        nextStatus = 'PROOF_SUBMITTED';
      } else {
        nextStatus =
          planChanged || currentStatus !== 'PENDING_SELECTION'
            ? 'AWAITING_PROOF'
            : 'PENDING_SELECTION';
      }
    } else if (currentStatus === 'PENDING_SELECTION' && !planChanged) {
      nextStatus = 'AWAITING_PROOF';
    }

    if (!planChanged && currentStatus === 'VERIFIED') {
      nextStatus = 'VERIFIED';
    }

    const paymentReferenceRaw = dto.paymentReference;
    const defaultRef =
      `${seller.firstName} ${seller.lastName}`.trim() || 'Product Seller';
    const paymentReference =
      typeof paymentReferenceRaw === 'string' &&
        paymentReferenceRaw.trim().length > 0
        ? paymentReferenceRaw.trim()
        : defaultRef;

    const data: any = {
      sellerPlanCode: planCode,
      sellerVisibilityWeight: planMeta.visibilityWeight,
      sellerMaxListings: planMeta.maxListings,
      sellerPlanPriceCents: planMeta.priceCents,
      sellerPlanPaymentStatus: nextStatus,
      sellerPlanPaymentReference: paymentReference,
    };

    if (nextStatus === 'VERIFIED') {
      data.sellerPlanProofSubmittedAt = null;
      data.sellerPlanVerifiedAt = new Date();
    } else if (nextStatus === 'PROOF_SUBMITTED') {
      data.sellerPlanProofSubmittedAt =
        seller.sellerPlanProofSubmittedAt ?? new Date();
      data.sellerPlanVerifiedAt = null;
    } else if (
      nextStatus === 'AWAITING_PROOF' ||
      nextStatus === 'PENDING_SELECTION'
    ) {
      data.sellerPlanProofSubmittedAt = null;
      data.sellerPlanVerifiedAt = null;
    }

    if (planChanged) {
      data.sellerPlanVerifiedAt = null;
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data,
    });
    const { password, ...result } = updated;
    return result;
  }
}
