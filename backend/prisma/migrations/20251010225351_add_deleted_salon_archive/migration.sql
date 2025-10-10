-- CreateTable
CREATE TABLE "DeletedSalonArchive" (
    "id" TEXT NOT NULL,
    "salonId" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "salon" JSONB NOT NULL,
    "services" JSONB NOT NULL,
    "reason" TEXT,
    "deletedBy" TEXT,
    "deletedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "restoredAt" TIMESTAMP(3),

    CONSTRAINT "DeletedSalonArchive_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DeletedSalonArchive_deletedAt_idx" ON "DeletedSalonArchive"("deletedAt");
