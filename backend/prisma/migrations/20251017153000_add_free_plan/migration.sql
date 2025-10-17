-- Add FREE to PlanCode enum if not already present
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t
    JOIN pg_enum e ON t.oid = e.enumtypid
    WHERE t.typname = 'PlanCode' AND e.enumlabel = 'FREE'
  ) THEN
    ALTER TYPE "PlanCode" ADD VALUE 'FREE';
  END IF;
END$$;
