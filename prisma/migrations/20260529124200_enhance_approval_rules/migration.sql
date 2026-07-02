/*
  Warnings:

  - You are about to drop the column `requiredApprovals` on the `ApprovalRule` table. All the data in the column will be lost.
  - You are about to drop the column `timeoutHours` on the `ApprovalRule` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "ApprovalScopeType" AS ENUM ('GLOBAL', 'WALLET', 'TRANSACTION_TYPE');

-- CreateEnum
CREATE TYPE "ApprovalScope" AS ENUM ('GLOBAL', 'WALLET', 'WALLET_TYPE', 'TRANSACTION_TYPE', 'CONNECTOR_TYPE');

-- CreateEnum
CREATE TYPE "ConditionOperator" AS ENUM ('EQUALS', 'GREATER_THAN', 'LESS_THAN', 'BETWEEN', 'IN', 'CONTAINS');

-- AlterTable
ALTER TABLE "ApprovalRule" DROP COLUMN "requiredApprovals",
DROP COLUMN "timeoutHours",
ADD COLUMN     "applicableConnectorTypes" TEXT[],
ADD COLUMN     "autoEscalateAfterHours" INTEGER,
ADD COLUMN     "createdByUserId" TEXT,
ADD COLUMN     "dualApprovalRequired" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "escalationTimeoutHours" INTEGER,
ADD COLUMN     "expiresAt" TIMESTAMP(3),
ADD COLUMN     "priority" INTEGER NOT NULL DEFAULT 100,
ADD COLUMN     "requiredApprovalsCount" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "requiresComplianceReview" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "scope" "ApprovalScope" NOT NULL DEFAULT 'GLOBAL',
ADD COLUMN     "scopeId" TEXT,
ADD COLUMN     "updatedByUserId" TEXT,
ALTER COLUMN "minAmount" SET DEFAULT 0;

-- CreateTable
CREATE TABLE "ApprovalAuthority" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "scopeType" "ApprovalScopeType" NOT NULL DEFAULT 'GLOBAL',
    "scopeId" TEXT,
    "minAmount" DECIMAL(38,12),
    "maxAmount" DECIMAL(38,12),
    "requiresDualApproval" BOOLEAN NOT NULL DEFAULT false,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApprovalAuthority_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApprovalCondition" (
    "id" TEXT NOT NULL,
    "ruleId" TEXT NOT NULL,
    "fieldName" TEXT NOT NULL,
    "operator" "ConditionOperator" NOT NULL,
    "value" TEXT NOT NULL,
    "ruleId_field_op" TEXT,

    CONSTRAINT "ApprovalCondition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApprovalStep" (
    "id" TEXT NOT NULL,
    "ruleId" TEXT NOT NULL,
    "stepNumber" INTEGER NOT NULL,
    "roleRequired" TEXT NOT NULL,
    "approvalCount" INTEGER NOT NULL DEFAULT 1,
    "timeoutHours" INTEGER,

    CONSTRAINT "ApprovalStep_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ApprovalAuthority_companyId_idx" ON "ApprovalAuthority"("companyId");

-- CreateIndex
CREATE INDEX "ApprovalAuthority_companyId_scopeType_scopeId_idx" ON "ApprovalAuthority"("companyId", "scopeType", "scopeId");

-- CreateIndex
CREATE INDEX "ApprovalCondition_ruleId_idx" ON "ApprovalCondition"("ruleId");

-- CreateIndex
CREATE INDEX "ApprovalStep_ruleId_idx" ON "ApprovalStep"("ruleId");

-- CreateIndex
CREATE INDEX "ApprovalRule_companyId_priority_enabled_idx" ON "ApprovalRule"("companyId", "priority", "enabled");

-- AddForeignKey
ALTER TABLE "ApprovalAuthority" ADD CONSTRAINT "ApprovalAuthority_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApprovalAuthority" ADD CONSTRAINT "ApprovalAuthority_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApprovalRule" ADD CONSTRAINT "ApprovalRule_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApprovalRule" ADD CONSTRAINT "ApprovalRule_updatedByUserId_fkey" FOREIGN KEY ("updatedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApprovalCondition" ADD CONSTRAINT "ApprovalCondition_ruleId_fkey" FOREIGN KEY ("ruleId") REFERENCES "ApprovalRule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApprovalStep" ADD CONSTRAINT "ApprovalStep_ruleId_fkey" FOREIGN KEY ("ruleId") REFERENCES "ApprovalRule"("id") ON DELETE CASCADE ON UPDATE CASCADE;
