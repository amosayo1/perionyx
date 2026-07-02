-- Phase 2: align TransactionStatus with app lifecycle; add Wallet.version.
-- Legacy enum value POSTED becomes COMPLETED; new states PROCESSING and FAILED.

ALTER TABLE "Transaction" ALTER COLUMN "status" DROP DEFAULT;

ALTER TYPE "TransactionStatus" RENAME VALUE 'POSTED' TO 'COMPLETED';

ALTER TYPE "TransactionStatus" ADD VALUE 'PROCESSING';
ALTER TYPE "TransactionStatus" ADD VALUE 'FAILED';

ALTER TABLE "Transaction" ALTER COLUMN "status" SET DEFAULT 'PENDING'::"TransactionStatus";

ALTER TABLE "Wallet" ADD COLUMN IF NOT EXISTS "version" INTEGER NOT NULL DEFAULT 0;
