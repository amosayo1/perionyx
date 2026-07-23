-- AlterTable: Add MFA fields to User model
ALTER TABLE "User" ADD COLUMN "mfa_enabled" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN "mfa_secret" TEXT;
ALTER TABLE "User" ADD COLUMN "mfa_recovery_codes" TEXT;
ALTER TABLE "User" ADD COLUMN "mfa_enrolled_at" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN "mfa_last_verified_at" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN "mfa_required" BOOLEAN NOT NULL DEFAULT false;
