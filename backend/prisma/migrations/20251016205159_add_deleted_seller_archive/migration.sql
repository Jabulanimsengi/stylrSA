-- CreateTable
CREATE TABLE "DeletedSellerArchive" (
    "id" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "seller" JSONB NOT NULL,
    "products" JSONB NOT NULL,
    "reason" TEXT,
    "deletedBy" TEXT,
    "deletedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "restoredAt" TIMESTAMP(3),

    CONSTRAINT "DeletedSellerArchive_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DeletedSellerArchive_deletedAt_idx" ON "DeletedSellerArchive"("deletedAt");
