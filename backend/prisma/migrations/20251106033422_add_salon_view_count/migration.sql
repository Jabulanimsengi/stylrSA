-- AlterTable
ALTER TABLE "Salon" ADD COLUMN IF NOT EXISTS "viewCount" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE IF NOT EXISTS "SalonView" (
    "id" TEXT NOT NULL,
    "salonId" TEXT NOT NULL,
    "userId" TEXT,
    "ipAddress" TEXT,
    "viewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SalonView_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "SalonView_salonId_idx" ON "SalonView"("salonId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "SalonView_userId_idx" ON "SalonView"("userId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "SalonView_viewedAt_idx" ON "SalonView"("viewedAt");

-- AddForeignKey
ALTER TABLE "SalonView" ADD CONSTRAINT "SalonView_salonId_fkey" FOREIGN KEY ("salonId") REFERENCES "Salon"("id") ON DELETE CASCADE ON UPDATE CASCADE;

