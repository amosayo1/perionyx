-- AlterTable
ALTER TABLE "Company" ADD COLUMN     "address" TEXT,
ADD COLUMN     "ein" TEXT,
ADD COLUMN     "entity_type" TEXT,
ADD COLUMN     "incorporation_date" TIMESTAMP(3),
ADD COLUMN     "jurisdiction" TEXT,
ADD COLUMN     "legal_name" TEXT,
ADD COLUMN     "verification_status" TEXT NOT NULL DEFAULT 'UNVERIFIED',
ADD COLUMN     "verified_at" TIMESTAMP(3);
