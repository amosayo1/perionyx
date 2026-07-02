-- Drop old key indexes
DROP INDEX IF EXISTS "api_keys_key_idx";
DROP INDEX IF EXISTS "api_keys_key_key";

-- AlterTable: add keyHash as nullable first
ALTER TABLE "api_keys" ADD COLUMN "keyHash" TEXT;

-- Migrate existing rows: compute SHA-256 hash of the plaintext key
UPDATE "api_keys" SET "keyHash" = encode(sha256(key::bytea), 'hex') WHERE "keyHash" IS NULL;

-- Make keyHash NOT NULL after migration
ALTER TABLE "api_keys" ALTER COLUMN "keyHash" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "api_keys_keyHash_key" ON "api_keys"("keyHash");
CREATE INDEX "api_keys_keyHash_idx" ON "api_keys"("keyHash");

-- Add phone column to demo_requests
ALTER TABLE "demo_requests" ADD COLUMN "phone" TEXT;
