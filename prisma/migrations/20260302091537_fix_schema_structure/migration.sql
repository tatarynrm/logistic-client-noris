-- CreateEnum
CREATE TYPE "tender_status" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "margin_payer" AS ENUM ('CLIENT', 'OWNER');

-- CreateEnum
CREATE TYPE "route_type" AS ENUM ('LOADING', 'UNLOADING');

-- Add index to users.email
CREATE INDEX IF NOT EXISTS "users_email_idx" ON "users"("email");

-- Add index to tenders.created_at
CREATE INDEX IF NOT EXISTS "tenders_created_at_idx" ON "tenders"("created_at");

-- Add temporary columns for enum migration
ALTER TABLE "tenders" ADD COLUMN "status_new" "tender_status";
ALTER TABLE "tenders" ADD COLUMN "margin_payer_new" "margin_payer";
ALTER TABLE "tender_routes" ADD COLUMN "type_new" "route_type";

-- Migrate data to new enum columns
UPDATE "tenders" SET "status_new" = 
  CASE 
    WHEN "status" = 'pending' THEN 'PENDING'::"tender_status"
    WHEN "status" = 'in_progress' THEN 'IN_PROGRESS'::"tender_status"
    WHEN "status" = 'completed' THEN 'COMPLETED'::"tender_status"
    WHEN "status" = 'cancelled' THEN 'CANCELLED'::"tender_status"
    ELSE 'PENDING'::"tender_status"
  END;

UPDATE "tenders" SET "margin_payer_new" = 
  CASE 
    WHEN "margin_payer" = 'client' THEN 'CLIENT'::"margin_payer"
    WHEN "margin_payer" = 'owner' THEN 'OWNER'::"margin_payer"
    ELSE 'CLIENT'::"margin_payer"
  END;

UPDATE "tender_routes" SET "type_new" = 
  CASE 
    WHEN "type" = 'loading' THEN 'LOADING'::"route_type"
    WHEN "type" = 'unloading' THEN 'UNLOADING'::"route_type"
    ELSE 'LOADING'::"route_type"
  END;

-- Drop old columns and rename new ones
ALTER TABLE "tenders" DROP COLUMN "status";
ALTER TABLE "tenders" RENAME COLUMN "status_new" TO "status";
ALTER TABLE "tenders" ALTER COLUMN "status" SET DEFAULT 'PENDING'::"tender_status";
ALTER TABLE "tenders" ALTER COLUMN "status" SET NOT NULL;

ALTER TABLE "tenders" DROP COLUMN "margin_payer";
ALTER TABLE "tenders" RENAME COLUMN "margin_payer_new" TO "margin_payer";
ALTER TABLE "tenders" ALTER COLUMN "margin_payer" SET DEFAULT 'CLIENT'::"margin_payer";
ALTER TABLE "tenders" ALTER COLUMN "margin_payer" SET NOT NULL;

ALTER TABLE "tender_routes" DROP COLUMN "type";
ALTER TABLE "tender_routes" RENAME COLUMN "type_new" TO "type";
ALTER TABLE "tender_routes" ALTER COLUMN "type" SET NOT NULL;

-- Add unique constraint for tender_routes
CREATE UNIQUE INDEX IF NOT EXISTS "tender_routes_tender_id_sequence_key" ON "tender_routes"("tender_id", "sequence");
