-- CreateEnum
CREATE TYPE "PlanPaymentStatus" AS ENUM ('PENDING_SELECTION', 'AWAITING_PROOF', 'PROOF_SUBMITTED', 'VERIFIED');

-- AlterTable
ALTER TABLE "Salon" ADD COLUMN     "planPaymentReference" TEXT,
ADD COLUMN     "planPaymentStatus" "PlanPaymentStatus" NOT NULL DEFAULT 'PENDING_SELECTION',
ADD COLUMN     "planPriceCents" INTEGER,
ADD COLUMN     "planProofSubmittedAt" TIMESTAMP(3),
ADD COLUMN     "planVerifiedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "sellerPlanPaymentReference" TEXT,
ADD COLUMN     "sellerPlanPaymentStatus" "PlanPaymentStatus" NOT NULL DEFAULT 'PENDING_SELECTION',
ADD COLUMN     "sellerPlanPriceCents" INTEGER,
ADD COLUMN     "sellerPlanProofSubmittedAt" TIMESTAMP(3),
ADD COLUMN     "sellerPlanVerifiedAt" TIMESTAMP(3);
