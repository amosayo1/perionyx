-- Enterprise Controller Specialist — Phase 13.3
-- Creates 13 tables for close management, journal review, statement readiness, and accounting health

-- ControllerBriefing
CREATE TABLE "controller_briefings" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "briefingDate" TIMESTAMP(3) NOT NULL,
    "period" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "briefingType" TEXT NOT NULL DEFAULT 'daily',
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "closeProgress" JSONB NOT NULL DEFAULT '{}',
    "healthScore" DECIMAL(5,4) NOT NULL DEFAULT 0,
    "risks" JSONB NOT NULL DEFAULT '[]',
    "recommendations" JSONB NOT NULL DEFAULT '[]',
    "pendingApprovals" INTEGER NOT NULL DEFAULT 0,
    "outstandingExceptions" INTEGER NOT NULL DEFAULT 0,
    "lateJournals" INTEGER NOT NULL DEFAULT 0,
    "policyViolations" INTEGER NOT NULL DEFAULT 0,
    "summary" TEXT NOT NULL DEFAULT '',
    "sections" JSONB NOT NULL DEFAULT '[]',
    "distributedAt" TIMESTAMP(3),
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "controller_briefings_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "controller_briefings_companyId_briefingDate_key" ON "controller_briefings"("companyId", "briefingDate");
CREATE INDEX "controller_briefings_companyId_period_idx" ON "controller_briefings"("companyId", "period");
CREATE INDEX "controller_briefings_companyId_briefingType_idx" ON "controller_briefings"("companyId", "briefingType");
CREATE INDEX "controller_briefings_companyId_status_idx" ON "controller_briefings"("companyId", "status");

-- ClosePeriod
CREATE TABLE "close_periods" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "closeType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "overallProgress" DECIMAL(5,4) NOT NULL DEFAULT 0,
    "totalTasks" INTEGER NOT NULL DEFAULT 0,
    "completedTasks" INTEGER NOT NULL DEFAULT 0,
    "blockedTasks" INTEGER NOT NULL DEFAULT 0,
    "overdueTasks" INTEGER NOT NULL DEFAULT 0,
    "entityCompletion" JSONB NOT NULL DEFAULT '{}',
    "departmentCompletion" JSONB NOT NULL DEFAULT '{}',
    "estimatedCompletion" TIMESTAMP(3),
    "actualCloseDate" TIMESTAMP(3),
    "lockedBy" TEXT,
    "lockedAt" TIMESTAMP(3),
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "close_periods_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "close_periods_companyId_period_closeType_key" ON "close_periods"("companyId", "period", "closeType");
CREATE INDEX "close_periods_companyId_status_idx" ON "close_periods"("companyId", "status");
CREATE INDEX "close_periods_companyId_closeType_idx" ON "close_periods"("companyId", "closeType");
CREATE INDEX "close_periods_companyId_period_idx" ON "close_periods"("companyId", "period");

-- CloseTask
CREATE TABLE "close_tasks" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "closePeriodId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "category" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "assignedTo" TEXT,
    "assignedBy" TEXT,
    "dueDate" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "blockedReason" TEXT,
    "dependencyIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "entityName" TEXT,
    "departmentName" TEXT,
    "workflowInstanceId" TEXT,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "close_tasks_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "close_tasks_companyId_closePeriodId_idx" ON "close_tasks"("companyId", "closePeriodId");
CREATE INDEX "close_tasks_companyId_status_idx" ON "close_tasks"("companyId", "status");
CREATE INDEX "close_tasks_companyId_assignedTo_idx" ON "close_tasks"("companyId", "assignedTo");
CREATE INDEX "close_tasks_companyId_category_idx" ON "close_tasks"("companyId", "category");
CREATE INDEX "close_tasks_closePeriodId_status_idx" ON "close_tasks"("closePeriodId", "status");

-- CloseDependency
CREATE TABLE "close_dependencies" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "closePeriodId" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "dependsOnId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "close_dependencies_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "close_dependencies_companyId_closePeriodId_idx" ON "close_dependencies"("companyId", "closePeriodId");
CREATE INDEX "close_dependencies_companyId_taskId_idx" ON "close_dependencies"("companyId", "taskId");

-- CloseMilestone
CREATE TABLE "close_milestones" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "closePeriodId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "targetDate" TIMESTAMP(3) NOT NULL,
    "actualDate" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "requiredTaskIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "close_milestones_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "close_milestones_companyId_closePeriodId_idx" ON "close_milestones"("companyId", "closePeriodId");
CREATE INDEX "close_milestones_companyId_status_idx" ON "close_milestones"("companyId", "status");

-- JournalReview
CREATE TABLE "journal_reviews" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "journalId" TEXT NOT NULL,
    "journalType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "riskLevel" TEXT NOT NULL DEFAULT 'LOW',
    "riskFlags" JSONB NOT NULL DEFAULT '[]',
    "reviewerId" TEXT,
    "reviewNotes" TEXT NOT NULL DEFAULT '',
    "amount" DECIMAL(19,4) NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "postingDate" TIMESTAMP(3),
    "accountCode" TEXT,
    "accountName" TEXT,
    "description" TEXT NOT NULL DEFAULT '',
    "reference" TEXT,
    "sourceSystem" TEXT NOT NULL DEFAULT 'gl',
    "supportingDocs" JSONB NOT NULL DEFAULT '[]',
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "journal_reviews_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "journal_reviews_companyId_journalType_idx" ON "journal_reviews"("companyId", "journalType");
CREATE INDEX "journal_reviews_companyId_status_idx" ON "journal_reviews"("companyId", "status");
CREATE INDEX "journal_reviews_companyId_riskLevel_idx" ON "journal_reviews"("companyId", "riskLevel");
CREATE INDEX "journal_reviews_companyId_reviewerId_idx" ON "journal_reviews"("companyId", "reviewerId");
CREATE INDEX "journal_reviews_companyId_postingDate_idx" ON "journal_reviews"("companyId", "postingDate");

-- JournalRisk
CREATE TABLE "journal_risks" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "journalReviewId" TEXT NOT NULL,
    "riskType" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'MEDIUM',
    "confidence" DECIMAL(5,4) NOT NULL DEFAULT 0,
    "description" TEXT NOT NULL,
    "evidence" JSONB NOT NULL DEFAULT '[]',
    "resolution" JSONB NOT NULL DEFAULT '{}',
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "journal_risks_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "journal_risks_companyId_journalReviewId_idx" ON "journal_risks"("companyId", "journalReviewId");
CREATE INDEX "journal_risks_companyId_riskType_idx" ON "journal_risks"("companyId", "riskType");
CREATE INDEX "journal_risks_companyId_severity_idx" ON "journal_risks"("companyId", "severity");

-- StatementReadiness
CREATE TABLE "statement_readiness" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "statementType" TEXT NOT NULL,
    "readinessScore" DECIMAL(5,4) NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'NOT_READY',
    "blockingIssues" JSONB NOT NULL DEFAULT '[]',
    "missingAdjustments" INTEGER NOT NULL DEFAULT 0,
    "outstandingReconciliations" INTEGER NOT NULL DEFAULT 0,
    "unapprovedJournals" INTEGER NOT NULL DEFAULT 0,
    "totalAccounts" INTEGER NOT NULL DEFAULT 0,
    "reconciledAccounts" INTEGER NOT NULL DEFAULT 0,
    "lastCheckedAt" TIMESTAMP(3),
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "statement_readiness_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "statement_readiness_companyId_period_statementType_key" ON "statement_readiness"("companyId", "period", "statementType");
CREATE INDEX "statement_readiness_companyId_period_idx" ON "statement_readiness"("companyId", "period");
CREATE INDEX "statement_readiness_companyId_status_idx" ON "statement_readiness"("companyId", "status");
CREATE INDEX "statement_readiness_companyId_readinessScore_idx" ON "statement_readiness"("companyId", "readinessScore");

-- AccountingHealthSnapshot
CREATE TABLE "accounting_health_snapshots" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "snapshotDate" TIMESTAMP(3) NOT NULL,
    "period" TEXT NOT NULL,
    "healthScore" DECIMAL(5,4) NOT NULL DEFAULT 0,
    "riskScore" DECIMAL(5,4) NOT NULL DEFAULT 0,
    "integrityScore" DECIMAL(5,4) NOT NULL DEFAULT 0,
    "ledgerConsistency" DECIMAL(5,4) NOT NULL DEFAULT 0,
    "journalQuality" DECIMAL(5,4) NOT NULL DEFAULT 0,
    "reconciliationCompletion" DECIMAL(5,4) NOT NULL DEFAULT 0,
    "policyCompliance" DECIMAL(5,4) NOT NULL DEFAULT 0,
    "postingCompleteness" DECIMAL(5,4) NOT NULL DEFAULT 0,
    "duplicatePostings" INTEGER NOT NULL DEFAULT 0,
    "suspenseAccounts" INTEGER NOT NULL DEFAULT 0,
    "openExceptions" INTEGER NOT NULL DEFAULT 0,
    "trends" JSONB NOT NULL DEFAULT '[]',
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "accounting_health_snapshots_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "accounting_health_snapshots_companyId_snapshotDate_key" ON "accounting_health_snapshots"("companyId", "snapshotDate");
CREATE INDEX "accounting_health_snapshots_companyId_period_idx" ON "accounting_health_snapshots"("companyId", "period");
CREATE INDEX "accounting_health_snapshots_companyId_healthScore_idx" ON "accounting_health_snapshots"("companyId", "healthScore");

-- AccountingRecommendation
CREATE TABLE "accounting_recommendations" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "businessReason" TEXT NOT NULL DEFAULT '',
    "financialImpact" JSONB NOT NULL DEFAULT '{}',
    "confidence" DECIMAL(5,4) NOT NULL DEFAULT 0,
    "riskLevel" TEXT NOT NULL DEFAULT 'LOW',
    "evidence" JSONB NOT NULL DEFAULT '[]',
    "affectedModules" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "requiredApprovals" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "priority" INTEGER NOT NULL DEFAULT 0,
    "assignedTo" TEXT,
    "expiresAt" TIMESTAMP(3),
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "accounting_recommendations_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "accounting_recommendations_companyId_category_idx" ON "accounting_recommendations"("companyId", "category");
CREATE INDEX "accounting_recommendations_companyId_status_idx" ON "accounting_recommendations"("companyId", "status");
CREATE INDEX "accounting_recommendations_companyId_riskLevel_idx" ON "accounting_recommendations"("companyId", "riskLevel");
CREATE INDEX "accounting_recommendations_companyId_priority_idx" ON "accounting_recommendations"("companyId", "priority");

-- ControllerWorkspacePreference
CREATE TABLE "controller_workspace_preferences" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "layout" JSONB NOT NULL DEFAULT '{}',
    "pinnedWidgets" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "hiddenWidgets" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "briefingTime" TEXT,
    "theme" TEXT NOT NULL DEFAULT 'dark',
    "config" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "controller_workspace_preferences_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "controller_workspace_preferences_companyId_key" ON "controller_workspace_preferences"("companyId");
CREATE UNIQUE INDEX "controller_workspace_preferences_userId_key" ON "controller_workspace_preferences"("userId");

-- AccountingException
CREATE TABLE "accounting_exceptions" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "exceptionType" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'MEDIUM',
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "sourceSystem" TEXT NOT NULL DEFAULT 'gl',
    "referenceId" TEXT,
    "referenceType" TEXT,
    "description" TEXT NOT NULL,
    "amount" DECIMAL(19,4),
    "currency" TEXT,
    "explanation" JSONB NOT NULL DEFAULT '{}',
    "evidence" JSONB NOT NULL DEFAULT '[]',
    "assignedTo" TEXT,
    "resolvedBy" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "accounting_exceptions_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "accounting_exceptions_companyId_exceptionType_idx" ON "accounting_exceptions"("companyId", "exceptionType");
CREATE INDEX "accounting_exceptions_companyId_severity_idx" ON "accounting_exceptions"("companyId", "severity");
CREATE INDEX "accounting_exceptions_companyId_status_idx" ON "accounting_exceptions"("companyId", "status");
CREATE INDEX "accounting_exceptions_companyId_assignedTo_idx" ON "accounting_exceptions"("companyId", "assignedTo");
CREATE INDEX "accounting_exceptions_companyId_referenceId_idx" ON "accounting_exceptions"("companyId", "referenceId");

-- CloseForecast
CREATE TABLE "close_forecasts" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "closePeriodId" TEXT NOT NULL,
    "forecastDate" TIMESTAMP(3) NOT NULL,
    "estimatedCompletion" TIMESTAMP(3) NOT NULL,
    "confidence" DECIMAL(5,4) NOT NULL DEFAULT 0,
    "remainingTasks" INTEGER NOT NULL DEFAULT 0,
    "blockedTasks" INTEGER NOT NULL DEFAULT 0,
    "averageTaskDurationHours" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "criticalPathTaskIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "risks" JSONB NOT NULL DEFAULT '[]',
    "scenarios" JSONB NOT NULL DEFAULT '[]',
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "close_forecasts_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "close_forecasts_companyId_closePeriodId_idx" ON "close_forecasts"("companyId", "closePeriodId");
CREATE INDEX "close_forecasts_companyId_forecastDate_idx" ON "close_forecasts"("companyId", "forecastDate");

-- Foreign Keys
ALTER TABLE "controller_briefings" ADD CONSTRAINT "controller_briefings_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "close_periods" ADD CONSTRAINT "close_periods_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "close_tasks" ADD CONSTRAINT "close_tasks_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "close_tasks" ADD CONSTRAINT "close_tasks_closePeriodId_fkey" FOREIGN KEY ("closePeriodId") REFERENCES "close_periods"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "close_dependencies" ADD CONSTRAINT "close_dependencies_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "close_dependencies" ADD CONSTRAINT "close_dependencies_closePeriodId_fkey" FOREIGN KEY ("closePeriodId") REFERENCES "close_periods"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "close_milestones" ADD CONSTRAINT "close_milestones_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "close_milestones" ADD CONSTRAINT "close_milestones_closePeriodId_fkey" FOREIGN KEY ("closePeriodId") REFERENCES "close_periods"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "journal_reviews" ADD CONSTRAINT "journal_reviews_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "journal_risks" ADD CONSTRAINT "journal_risks_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "journal_risks" ADD CONSTRAINT "journal_risks_journalReviewId_fkey" FOREIGN KEY ("journalReviewId") REFERENCES "journal_reviews"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "statement_readiness" ADD CONSTRAINT "statement_readiness_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "accounting_health_snapshots" ADD CONSTRAINT "accounting_health_snapshots_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "accounting_recommendations" ADD CONSTRAINT "accounting_recommendations_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "controller_workspace_preferences" ADD CONSTRAINT "controller_workspace_preferences_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "accounting_exceptions" ADD CONSTRAINT "accounting_exceptions_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "close_forecasts" ADD CONSTRAINT "close_forecasts_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "close_forecasts" ADD CONSTRAINT "close_forecasts_closePeriodId_fkey" FOREIGN KEY ("closePeriodId") REFERENCES "close_periods"("id") ON DELETE CASCADE ON UPDATE CASCADE;
