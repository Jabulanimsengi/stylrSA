-- AlterTable
ALTER TABLE "public"."Salon" ADD COLUMN     "avgRating" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "operatingDays" TEXT[];
