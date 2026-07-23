-- Financial Integrity: Float → Decimal migration
-- Phase 19.1 P0: Eliminate monetary Float fields

-- MorningBriefing fields: DB already has DECIMAL(20,4) from original migration.
-- No ALTER needed — schema alignment only (Prisma Float → Decimal).

-- ApprovalMatrixRule.thresholdValue: DB has DOUBLE PRECISION.
-- Must ALTER to DECIMAL(20,4) for monetary precision.
ALTER TABLE "approval_matrix_rules"
  ALTER COLUMN "thresholdValue" SET DATA TYPE DECIMAL(20, 4);
