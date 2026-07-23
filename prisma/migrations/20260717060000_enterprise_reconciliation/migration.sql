-- Enterprise Reconciliation Platform — Phase 13.2
-- Creates 13 tables for reconciliation cases, exceptions, matching, investigation, and workflow

-- ReconciliationCase
CREATE TABLE "reconciliation_cases" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "reconciliationType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "period" TEXT NOT NULL,
    "entityName" TEXT,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "totalDebit" DECIMAL(19,4) NOT NULL DEFAULT 0,
    "totalCredit" DECIMAL(19,4) NOT NULL DEFAULT 0,
    "matchedCount" INTEGER NOT NULL DEFAULT 0,
    "unmatchedCount" INTEGER NOT NULL DEFAULT 0,
    "exceptionCount" INTEGER NOT NULL DEFAULT 0,
    "matchRate" DECIMAL(5,4) NOT NULL DEFAULT 0,
    "readinessScore" DECIMAL(5,4) NOT NULL DEFAULT 0,
    "assignedTo" TEXT,
    "dueDate" TIMESTAMP(3),
    "closedAt" TIMESTAMP(3),
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reconciliation_cases_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "reconciliation_cases_companyId_reconciliationType_idx" ON "reconciliation_cases"("companyId", "reconciliationType");
CREATE INDEX "reconciliation_cases_companyId_status_idx" ON "reconciliation_cases"("companyId", "status");
CREATE INDEX "reconciliation_cases_companyId_period_idx" ON "reconciliation_cases"("companyId", "period");
CREATE INDEX "reconciliation_cases_companyId_assignedTo_idx" ON "reconciliation_cases"("companyId", "assignedTo");
CREATE INDEX "reconciliation_cases_companyId_reconciliationType_period_idx" ON "reconciliation_cases"("companyId", "reconciliationType", "period");

-- ReconException
CREATE TABLE "recon_exceptions" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "exceptionType" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'MEDIUM',
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "sourceSystem" TEXT NOT NULL,
    "referenceNumber" TEXT,
    "description" TEXT NOT NULL,
    "amount" DECIMAL(19,4) NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "expectedAmount" DECIMAL(19,4),
    "varianceAmount" DECIMAL(19,4),
    "variancePercentage" DECIMAL(5,4),
    "transactionDate" TIMESTAMP(3),
    "postedDate" TIMESTAMP(3),
    "explanation" JSONB NOT NULL DEFAULT '{}',
    "evidence" JSONB NOT NULL DEFAULT '[]',
    "resolution" JSONB NOT NULL DEFAULT '{}',
    "assignedTo" TEXT,
    "resolvedBy" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "recon_exceptions_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "recon_exceptions_companyId_caseId_idx" ON "recon_exceptions"("companyId", "caseId");
CREATE INDEX "recon_exceptions_companyId_exceptionType_idx" ON "recon_exceptions"("companyId", "exceptionType");
CREATE INDEX "recon_exceptions_companyId_severity_idx" ON "recon_exceptions"("companyId", "severity");
CREATE INDEX "recon_exceptions_companyId_status_idx" ON "recon_exceptions"("companyId", "status");
CREATE INDEX "recon_exceptions_companyId_assignedTo_idx" ON "recon_exceptions"("companyId", "assignedTo");
CREATE INDEX "recon_exceptions_caseId_exceptionType_idx" ON "recon_exceptions"("caseId", "exceptionType");

-- MatchingRule
CREATE TABLE "matching_rules" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "ruleType" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "version" INTEGER NOT NULL DEFAULT 1,
    "matchingCriteria" JSONB NOT NULL DEFAULT '{}',
    "scoringWeights" JSONB NOT NULL DEFAULT '{}',
    "maxConfidenceThreshold" DECIMAL(5,4) NOT NULL DEFAULT 0,
    "autoMatchEnabled" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "matching_rules_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "matching_rules_companyId_name_key" ON "matching_rules"("companyId", "name");
CREATE INDEX "matching_rules_companyId_ruleType_idx" ON "matching_rules"("companyId", "ruleType");
CREATE INDEX "matching_rules_companyId_isActive_idx" ON "matching_rules"("companyId", "isActive");
CREATE INDEX "matching_rules_companyId_priority_idx" ON "matching_rules"("companyId", "priority");

-- MatchingExecution
CREATE TABLE "matching_executions" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "ruleId" TEXT,
    "executionType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "inputCount" INTEGER NOT NULL DEFAULT 0,
    "matchedCount" INTEGER NOT NULL DEFAULT 0,
    "unmatchedCount" INTEGER NOT NULL DEFAULT 0,
    "averageConfidence" DECIMAL(5,4) NOT NULL DEFAULT 0,
    "executionTimeMs" INTEGER NOT NULL DEFAULT 0,
    "results" JSONB NOT NULL DEFAULT '[]',
    "errors" JSONB NOT NULL DEFAULT '[]',
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "matching_executions_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "matching_executions_companyId_caseId_idx" ON "matching_executions"("companyId", "caseId");
CREATE INDEX "matching_executions_companyId_ruleId_idx" ON "matching_executions"("companyId", "ruleId");
CREATE INDEX "matching_executions_companyId_status_idx" ON "matching_executions"("companyId", "status");
CREATE INDEX "matching_executions_caseId_status_idx" ON "matching_executions"("caseId", "status");

-- MatchingSuggestion
CREATE TABLE "matching_suggestions" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "executionId" TEXT,
    "suggestionType" TEXT NOT NULL,
    "confidence" DECIMAL(5,4) NOT NULL DEFAULT 0,
    "sourceTransactionIds" JSONB NOT NULL DEFAULT '[]',
    "targetTransactionIds" JSONB NOT NULL DEFAULT '[]',
    "sourceTotal" DECIMAL(19,4) NOT NULL DEFAULT 0,
    "targetTotal" DECIMAL(19,4) NOT NULL DEFAULT 0,
    "variance" DECIMAL(19,4) NOT NULL DEFAULT 0,
    "explanation" JSONB NOT NULL DEFAULT '{}',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "acceptedBy" TEXT,
    "acceptedAt" TIMESTAMP(3),
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "matching_suggestions_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "matching_suggestions_companyId_caseId_idx" ON "matching_suggestions"("companyId", "caseId");
CREATE INDEX "matching_suggestions_companyId_executionId_idx" ON "matching_suggestions"("companyId", "executionId");
CREATE INDEX "matching_suggestions_companyId_confidence_idx" ON "matching_suggestions"("companyId", "confidence");
CREATE INDEX "matching_suggestions_companyId_status_idx" ON "matching_suggestions"("companyId", "status");
CREATE INDEX "matching_suggestions_caseId_status_idx" ON "matching_suggestions"("caseId", "status");

-- ReconciliationEvidence
CREATE TABLE "reconciliation_evidence" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "evidenceType" TEXT NOT NULL,
    "sourceSystem" TEXT NOT NULL,
    "referenceId" TEXT,
    "referenceType" TEXT,
    "description" TEXT NOT NULL,
    "amount" DECIMAL(19,4),
    "currency" TEXT,
    "transactionDate" TIMESTAMP(3),
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reconciliation_evidence_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "reconciliation_evidence_companyId_caseId_idx" ON "reconciliation_evidence"("companyId", "caseId");
CREATE INDEX "reconciliation_evidence_companyId_evidenceType_idx" ON "reconciliation_evidence"("companyId", "evidenceType");
CREATE INDEX "reconciliation_evidence_companyId_sourceSystem_idx" ON "reconciliation_evidence"("companyId", "sourceSystem");

-- InvestigationTimeline
CREATE TABLE "investigation_timelines" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "exceptionId" TEXT,
    "action" TEXT NOT NULL,
    "actor" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "previousState" JSONB,
    "newState" JSONB,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "investigation_timelines_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "investigation_timelines_companyId_caseId_idx" ON "investigation_timelines"("companyId", "caseId");
CREATE INDEX "investigation_timelines_companyId_exceptionId_idx" ON "investigation_timelines"("companyId", "exceptionId");
CREATE INDEX "investigation_timelines_companyId_action_idx" ON "investigation_timelines"("companyId", "action");
CREATE INDEX "investigation_timelines_caseId_createdAt_idx" ON "investigation_timelines"("caseId", "createdAt");

-- JournalSuggestion
CREATE TABLE "journal_suggestions" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "exceptionId" TEXT,
    "suggestionType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "journalEntries" JSONB NOT NULL DEFAULT '[]',
    "totalDebit" DECIMAL(19,4) NOT NULL DEFAULT 0,
    "totalCredit" DECIMAL(19,4) NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "explanation" TEXT NOT NULL DEFAULT '',
    "businessReason" TEXT NOT NULL DEFAULT '',
    "supportingEvidence" JSONB NOT NULL DEFAULT '[]',
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "postedAt" TIMESTAMP(3),
    "postedBy" TEXT,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "journal_suggestions_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "journal_suggestions_companyId_caseId_idx" ON "journal_suggestions"("companyId", "caseId");
CREATE INDEX "journal_suggestions_companyId_exceptionId_idx" ON "journal_suggestions"("companyId", "exceptionId");
CREATE INDEX "journal_suggestions_companyId_suggestionType_idx" ON "journal_suggestions"("companyId", "suggestionType");
CREATE INDEX "journal_suggestions_companyId_status_idx" ON "journal_suggestions"("companyId", "status");

-- ReconciliationAssignment
CREATE TABLE "reconciliation_assignments" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "assignedTo" TEXT NOT NULL,
    "assignedBy" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'reconciler',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "notes" TEXT NOT NULL DEFAULT '',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reconciliation_assignments_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "reconciliation_assignments_companyId_caseId_idx" ON "reconciliation_assignments"("companyId", "caseId");
CREATE INDEX "reconciliation_assignments_companyId_assignedTo_idx" ON "reconciliation_assignments"("companyId", "assignedTo");
CREATE INDEX "reconciliation_assignments_companyId_status_idx" ON "reconciliation_assignments"("companyId", "status");
CREATE INDEX "reconciliation_assignments_caseId_status_idx" ON "reconciliation_assignments"("caseId", "status");

-- ReconciliationEscalation
CREATE TABLE "reconciliation_escalations" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "escalationType" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'MEDIUM',
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "reason" TEXT NOT NULL,
    "escalatedBy" TEXT NOT NULL,
    "escalatedTo" TEXT,
    "resolution" TEXT,
    "resolvedBy" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reconciliation_escalations_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "reconciliation_escalations_companyId_caseId_idx" ON "reconciliation_escalations"("companyId", "caseId");
CREATE INDEX "reconciliation_escalations_companyId_escalationType_idx" ON "reconciliation_escalations"("companyId", "escalationType");
CREATE INDEX "reconciliation_escalations_companyId_severity_idx" ON "reconciliation_escalations"("companyId", "severity");
CREATE INDEX "reconciliation_escalations_companyId_status_idx" ON "reconciliation_escalations"("companyId", "status");

-- ExceptionClassification
CREATE TABLE "exception_classifications" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "exceptionId" TEXT NOT NULL,
    "classifier" TEXT NOT NULL,
    "previousType" TEXT,
    "newType" TEXT NOT NULL,
    "confidence" DECIMAL(5,4) NOT NULL DEFAULT 0,
    "reasoning" TEXT NOT NULL DEFAULT '',
    "evidence" JSONB NOT NULL DEFAULT '[]',
    "approvedBy" TEXT,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "exception_classifications_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "exception_classifications_companyId_exceptionId_idx" ON "exception_classifications"("companyId", "exceptionId");
CREATE INDEX "exception_classifications_companyId_classifier_idx" ON "exception_classifications"("companyId", "classifier");
CREATE INDEX "exception_classifications_companyId_newType_idx" ON "exception_classifications"("companyId", "newType");

-- MatchingHistory
CREATE TABLE "matching_histories" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "sourceSystem" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "transactionDate" TIMESTAMP(3),
    "amount" DECIMAL(19,4) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "reference" TEXT,
    "vendorName" TEXT,
    "customerName" TEXT,
    "description" TEXT,
    "normalizedReference" TEXT,
    "normalizedVendor" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "matching_histories_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "matching_histories_companyId_caseId_idx" ON "matching_histories"("companyId", "caseId");
CREATE INDEX "matching_histories_companyId_sourceSystem_idx" ON "matching_histories"("companyId", "sourceSystem");
CREATE INDEX "matching_histories_companyId_transactionId_idx" ON "matching_histories"("companyId", "transactionId");
CREATE INDEX "matching_histories_companyId_normalizedReference_idx" ON "matching_histories"("companyId", "normalizedReference");
CREATE INDEX "matching_histories_companyId_normalizedVendor_idx" ON "matching_histories"("companyId", "normalizedVendor");
CREATE INDEX "matching_histories_caseId_sourceSystem_idx" ON "matching_histories"("caseId", "sourceSystem");

-- RuleVersion
CREATE TABLE "rule_versions" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "ruleId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "matchingCriteria" JSONB NOT NULL DEFAULT '{}',
    "scoringWeights" JSONB NOT NULL DEFAULT '{}',
    "changeNote" TEXT NOT NULL DEFAULT '',
    "changedBy" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rule_versions_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "rule_versions_ruleId_version_key" ON "rule_versions"("ruleId", "version");
CREATE INDEX "rule_versions_companyId_ruleId_idx" ON "rule_versions"("companyId", "ruleId");
CREATE INDEX "rule_versions_companyId_version_idx" ON "rule_versions"("companyId", "version");

-- Foreign Keys
ALTER TABLE "reconciliation_cases" ADD CONSTRAINT "reconciliation_cases_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "recon_exceptions" ADD CONSTRAINT "recon_exceptions_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "recon_exceptions" ADD CONSTRAINT "recon_exceptions_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "reconciliation_cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "matching_rules" ADD CONSTRAINT "matching_rules_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "matching_executions" ADD CONSTRAINT "matching_executions_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "matching_executions" ADD CONSTRAINT "matching_executions_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "reconciliation_cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "matching_executions" ADD CONSTRAINT "matching_executions_ruleId_fkey" FOREIGN KEY ("ruleId") REFERENCES "matching_rules"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "matching_suggestions" ADD CONSTRAINT "matching_suggestions_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "matching_suggestions" ADD CONSTRAINT "matching_suggestions_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "reconciliation_cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "matching_suggestions" ADD CONSTRAINT "matching_suggestions_executionId_fkey" FOREIGN KEY ("executionId") REFERENCES "matching_executions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "reconciliation_evidence" ADD CONSTRAINT "reconciliation_evidence_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "reconciliation_evidence" ADD CONSTRAINT "reconciliation_evidence_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "reconciliation_cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "investigation_timelines" ADD CONSTRAINT "investigation_timelines_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "investigation_timelines" ADD CONSTRAINT "investigation_timelines_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "reconciliation_cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "journal_suggestions" ADD CONSTRAINT "journal_suggestions_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "journal_suggestions" ADD CONSTRAINT "journal_suggestions_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "reconciliation_cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "journal_suggestions" ADD CONSTRAINT "journal_suggestions_exceptionId_fkey" FOREIGN KEY ("exceptionId") REFERENCES "recon_exceptions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "reconciliation_assignments" ADD CONSTRAINT "reconciliation_assignments_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "reconciliation_assignments" ADD CONSTRAINT "reconciliation_assignments_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "reconciliation_cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "reconciliation_escalations" ADD CONSTRAINT "reconciliation_escalations_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "reconciliation_escalations" ADD CONSTRAINT "reconciliation_escalations_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "reconciliation_cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "exception_classifications" ADD CONSTRAINT "exception_classifications_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "exception_classifications" ADD CONSTRAINT "exception_classifications_exceptionId_fkey" FOREIGN KEY ("exceptionId") REFERENCES "recon_exceptions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "matching_histories" ADD CONSTRAINT "matching_histories_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "matching_histories" ADD CONSTRAINT "matching_histories_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "reconciliation_cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "rule_versions" ADD CONSTRAINT "rule_versions_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "rule_versions" ADD CONSTRAINT "rule_versions_ruleId_fkey" FOREIGN KEY ("ruleId") REFERENCES "matching_rules"("id") ON DELETE CASCADE ON UPDATE CASCADE;
