-- CreateEnum
CREATE TYPE "public"."BookingType" AS ENUM ('ONSITE', 'MOBILE', 'BOTH');

-- AlterTable
ALTER TABLE "public"."Salon" ADD COLUMN     "bookingType" "public"."BookingType" NOT NULL DEFAULT 'ONSITE',
ADD COLUMN     "operatingHours" JSONB;
