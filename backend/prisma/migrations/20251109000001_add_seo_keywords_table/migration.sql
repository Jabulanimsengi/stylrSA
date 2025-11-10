-- CreateTable
CREATE TABLE "seo_keywords" (
    "id" TEXT NOT NULL,
    "keyword" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(255) NOT NULL,
    "category" VARCHAR(50) NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 2,
    "search_volume" INTEGER,
    "difficulty" INTEGER,
    "variations" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "seo_keywords_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "seo_keywords_keyword_key" ON "seo_keywords"("keyword");

-- CreateIndex
CREATE UNIQUE INDEX "seo_keywords_slug_key" ON "seo_keywords"("slug");

-- CreateIndex
CREATE INDEX "seo_keywords_slug_idx" ON "seo_keywords"("slug");

-- CreateIndex
CREATE INDEX "seo_keywords_category_idx" ON "seo_keywords"("category");

-- CreateIndex
CREATE INDEX "seo_keywords_priority_idx" ON "seo_keywords"("priority");
