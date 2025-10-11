-- CreateEnum
CREATE TYPE "PlanCode" AS ENUM ('STARTER', 'ESSENTIAL', 'GROWTH', 'PRO', 'ELITE');

-- AlterTable
ALTER TABLE "Salon" ADD COLUMN     "featuredUntil" TIMESTAMP(3),
ADD COLUMN     "maxListings" INTEGER NOT NULL DEFAULT 2,
ADD COLUMN     "planCode" "PlanCode" DEFAULT 'STARTER',
ADD COLUMN     "visibilityWeight" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "sellerFeaturedUntil" TIMESTAMP(3),
ADD COLUMN     "sellerMaxListings" INTEGER DEFAULT 2,
ADD COLUMN     "sellerPlanCode" "PlanCode",
ADD COLUMN     "sellerVisibilityWeight" INTEGER DEFAULT 1;

-- CreateTable
CREATE TABLE "Plan" (
    "id" TEXT NOT NULL,
    "code" "PlanCode" NOT NULL,
    "name" TEXT NOT NULL,
    "priceCents" INTEGER NOT NULL,
    "visibilityWeight" INTEGER NOT NULL,
    "maxListings" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Plan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Plan_code_key" ON "Plan"("code");

-- CreateIndex
CREATE INDEX "Booking_userId_idx" ON "Booking"("userId");

-- CreateIndex
CREATE INDEX "Booking_salonId_idx" ON "Booking"("salonId");

-- CreateIndex
CREATE INDEX "Booking_serviceId_idx" ON "Booking"("serviceId");

-- CreateIndex
CREATE INDEX "Conversation_user1Id_idx" ON "Conversation"("user1Id");

-- CreateIndex
CREATE INDEX "Conversation_user2Id_idx" ON "Conversation"("user2Id");

-- CreateIndex
CREATE INDEX "Favorite_salonId_idx" ON "Favorite"("salonId");

-- CreateIndex
CREATE INDEX "GalleryImage_salonId_idx" ON "GalleryImage"("salonId");

-- CreateIndex
CREATE INDEX "Message_conversationId_idx" ON "Message"("conversationId");

-- CreateIndex
CREATE INDEX "Message_senderId_idx" ON "Message"("senderId");

-- CreateIndex
CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");

-- CreateIndex
CREATE INDEX "ProductOrder_buyerId_idx" ON "ProductOrder"("buyerId");

-- CreateIndex
CREATE INDEX "ProductOrder_sellerId_idx" ON "ProductOrder"("sellerId");

-- CreateIndex
CREATE INDEX "ProductOrder_productId_idx" ON "ProductOrder"("productId");

-- CreateIndex
CREATE INDEX "Review_salonId_idx" ON "Review"("salonId");

-- CreateIndex
CREATE INDEX "Salon_approvalStatus_idx" ON "Salon"("approvalStatus");

-- CreateIndex
CREATE INDEX "Salon_city_idx" ON "Salon"("city");

-- CreateIndex
CREATE INDEX "Salon_province_idx" ON "Salon"("province");

-- CreateIndex
CREATE INDEX "Service_salonId_idx" ON "Service"("salonId");

-- CreateIndex
CREATE INDEX "Service_approvalStatus_idx" ON "Service"("approvalStatus");

-- CreateIndex
CREATE INDEX "ServiceLike_serviceId_idx" ON "ServiceLike"("serviceId");
