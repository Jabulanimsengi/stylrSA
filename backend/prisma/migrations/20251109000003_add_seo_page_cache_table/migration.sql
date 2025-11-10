-- CreateTable
CREATE TABLE "seo_page_cache" (
    "id" TEXT NOT NULL,
    "keyword_id" TEXT NOT NULL,
    "location_id" TEXT NOT NULL,
    "url" VARCHAR(500) NOT NULL,
    "h1" TEXT NOT NULL,
    "h2_headings" TEXT[],
    "h3_headings" TEXT[],
    "intro_text" TEXT NOT NULL,
    "meta_title" VARCHAR(60) NOT NULL,
    "meta_description" VARCHAR(160) NOT NULL,
    "schema_markup" JSONB,
    "related_services" JSONB,
    "nearby_locations" JSONB,
    "service_count" INTEGER NOT NULL DEFAULT 0,
    "salon_count" INTEGER NOT NULL DEFAULT 0,
    "avg_price" DECIMAL(10,2),
    "last_generated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "seo_page_cache_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "seo_page_cache_url_key" ON "seo_page_cache"("url");

-- CreateIndex
CREATE INDEX "seo_page_cache_url_idx" ON "seo_page_cache"("url");

-- CreateIndex
CREATE INDEX "seo_page_cache_keyword_id_idx" ON "seo_page_cache"("keyword_id");

-- CreateIndex
CREATE INDEX "seo_page_cache_location_id_idx" ON "seo_page_cache"("location_id");

-- CreateIndex
CREATE INDEX "seo_page_cache_last_generated_idx" ON "seo_page_cache"("last_generated");

-- AddForeignKey
ALTER TABLE "seo_page_cache" ADD CONSTRAINT "seo_page_cache_keyword_id_fkey" FOREIGN KEY ("keyword_id") REFERENCES "seo_keywords"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seo_page_cache" ADD CONSTRAINT "seo_page_cache_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "seo_locations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
