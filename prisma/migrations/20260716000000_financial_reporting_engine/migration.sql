-- Migration: Financial Reporting Engine
-- Phase 12A.4 — Enterprise Financial Reporting & Statement Engine

CREATE TABLE "financial_report_definitions" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "reportType" TEXT NOT NULL,
    "audience" TEXT,
    "config" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isTemplate" BOOLEAN NOT NULL DEFAULT false,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdBy" TEXT NOT NULL,
    "lastRunAt" TIMESTAMP(3),
    "lastRunById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "financial_report_definitions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "financial_report_executions" (
    "id" TEXT NOT NULL,
    "definitionId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "reportType" TEXT NOT NULL,
    "config" JSONB NOT NULL,
    "sections" JSONB NOT NULL,
    "summary" JSONB,
    "totalRows" INTEGER NOT NULL DEFAULT 0,
    "executionTimeMs" INTEGER NOT NULL DEFAULT 0,
    "error" TEXT,
    "requestedBy" TEXT NOT NULL,
    "completedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "financial_report_executions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "financial_report_schedules" (
    "id" TEXT NOT NULL,
    "definitionId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "frequency" TEXT NOT NULL,
    "cronExpression" TEXT,
    "recipients" JSONB NOT NULL,
    "format" TEXT NOT NULL,
    "config" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastRunAt" TIMESTAMP(3),
    "lastRunStatus" TEXT,
    "nextRunAt" TIMESTAMP(3),
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "financial_report_schedules_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "financial_report_saved_views" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "definitionId" TEXT,
    "name" TEXT NOT NULL,
    "reportType" TEXT NOT NULL,
    "filters" JSONB NOT NULL,
    "userId" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "financial_report_saved_views_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "financial_report_commentaries" (
    "id" TEXT NOT NULL,
    "executionId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "reportType" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "model" TEXT NOT NULL,
    "tokensUsed" INTEGER NOT NULL DEFAULT 0,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "financial_report_commentaries_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "board_packs" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "period" TEXT NOT NULL,
    "fiscalYear" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "slides" JSONB NOT NULL,
    "executiveSummary" JSONB,
    "aiCommentary" JSONB,
    "generatedBy" TEXT NOT NULL,
    "generatedAt" TIMESTAMP(3),
    "distributedAt" TIMESTAMP(3),
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "board_packs_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "board_pack_distributions" (
    "id" TEXT NOT NULL,
    "boardPackId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "recipientId" TEXT NOT NULL,
    "recipientEmail" TEXT NOT NULL,
    "format" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "deliveredAt" TIMESTAMP(3),
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "board_pack_distributions_pkey" PRIMARY KEY ("id")
);

-- Indexes
CREATE INDEX "financial_report_definitions_company_id_report_type_idx" ON "financial_report_definitions"("companyId", "reportType");
CREATE INDEX "financial_report_definitions_company_id_audience_idx" ON "financial_report_definitions"("companyId", "audience");
CREATE INDEX "financial_report_definitions_company_id_active_idx" ON "financial_report_definitions"("companyId", "isActive");
CREATE INDEX "financial_report_executions_company_id_status_idx" ON "financial_report_executions"("companyId", "status");
CREATE INDEX "financial_report_executions_company_id_definition_idx" ON "financial_report_executions"("companyId", "definitionId");
CREATE INDEX "financial_report_executions_company_id_created_idx" ON "financial_report_executions"("companyId", "createdAt");
CREATE INDEX "financial_report_schedules_company_id_active_idx" ON "financial_report_schedules"("companyId", "isActive");
CREATE INDEX "financial_report_schedules_company_id_next_run_idx" ON "financial_report_schedules"("companyId", "nextRunAt");
CREATE INDEX "financial_report_saved_views_company_id_user_idx" ON "financial_report_saved_views"("companyId", "userId");
CREATE INDEX "financial_report_saved_views_company_id_type_idx" ON "financial_report_saved_views"("companyId", "reportType");
CREATE INDEX "financial_report_commentaries_company_id_execution_idx" ON "financial_report_commentaries"("companyId", "executionId");
CREATE INDEX "board_packs_company_id_status_idx" ON "board_packs"("companyId", "status");
CREATE INDEX "board_packs_company_id_period_idx" ON "board_packs"("companyId", "period", "fiscalYear");
CREATE INDEX "board_pack_distributions_company_id_pack_idx" ON "board_pack_distributions"("companyId", "boardPackId");

-- Foreign keys
ALTER TABLE "financial_report_definitions" ADD CONSTRAINT "financial_report_definitions_company_id_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "financial_report_executions" ADD CONSTRAINT "financial_report_executions_company_id_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "financial_report_executions" ADD CONSTRAINT "financial_report_executions_definition_id_fkey" FOREIGN KEY ("definitionId") REFERENCES "financial_report_definitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "financial_report_schedules" ADD CONSTRAINT "financial_report_schedules_company_id_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "financial_report_schedules" ADD CONSTRAINT "financial_report_schedules_definition_id_fkey" FOREIGN KEY ("definitionId") REFERENCES "financial_report_definitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "financial_report_saved_views" ADD CONSTRAINT "financial_report_saved_views_company_id_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "financial_report_saved_views" ADD CONSTRAINT "financial_report_saved_views_definition_id_fkey" FOREIGN KEY ("definitionId") REFERENCES "financial_report_definitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "financial_report_commentaries" ADD CONSTRAINT "financial_report_commentaries_company_id_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "financial_report_commentaries" ADD CONSTRAINT "financial_report_commentaries_execution_id_fkey" FOREIGN KEY ("executionId") REFERENCES "financial_report_executions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "board_packs" ADD CONSTRAINT "board_packs_company_id_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "board_pack_distributions" ADD CONSTRAINT "board_pack_distributions_company_id_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "board_pack_distributions" ADD CONSTRAINT "board_pack_distributions_board_pack_id_fkey" FOREIGN KEY ("boardPackId") REFERENCES "board_packs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
