-- CreateTable
CREATE TABLE "seo_locations" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(255) NOT NULL,
    "type" VARCHAR(50) NOT NULL,
    "province" VARCHAR(100) NOT NULL,
    "province_slug" VARCHAR(100) NOT NULL,
    "parent_location_id" TEXT,
    "latitude" DECIMAL(10,8),
    "longitude" DECIMAL(11,8),
    "population" INTEGER,
    "service_count" INTEGER NOT NULL DEFAULT 0,
    "salon_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "seo_locations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "seo_locations_slug_idx" ON "seo_locations"("slug");

-- CreateIndex
CREATE INDEX "seo_locations_type_idx" ON "seo_locations"("type");

-- CreateIndex
CREATE INDEX "seo_locations_province_slug_idx" ON "seo_locations"("province_slug");

-- CreateIndex
CREATE INDEX "seo_locations_parent_location_id_idx" ON "seo_locations"("parent_location_id");

-- AddForeignKey
ALTER TABLE "seo_locations" ADD CONSTRAINT "seo_locations_parent_location_id_fkey" FOREIGN KEY ("parent_location_id") REFERENCES "seo_locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
