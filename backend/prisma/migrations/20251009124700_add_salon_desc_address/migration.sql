-- Adds missing optional columns to Salon
-- Safe to run multiple times due to IF NOT EXISTS guards

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'Salon' AND column_name = 'description'
  ) THEN
    ALTER TABLE "Salon" ADD COLUMN "description" TEXT;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'Salon' AND column_name = 'address'
  ) THEN
    ALTER TABLE "Salon" ADD COLUMN "address" TEXT;
  END IF;
END $$;
