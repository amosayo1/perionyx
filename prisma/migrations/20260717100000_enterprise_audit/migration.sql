-- CreateTable
CREATE TABLE "audit_plans" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "planName" TEXT NOT NULL,
    "planType" TEXT NOT NULL DEFAULT 'annual',
    "status" TEXT NOT NULL DEFAULT 'draft',
    "fiscalYear" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "scope" JSONB NOT NULL DEFAULT '{}',
    "riskAssessment" JSONB NOT NULL DEFAULT '{}',
    "resourceAllocation" JSONB NOT NULL DEFAULT '{}',
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "audit_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_engagements" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "planId" TEXT,
    "engagementNumber" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "engagementType" TEXT NOT NULL DEFAULT 'financial',
    "status" TEXT NOT NULL DEFAULT 'planning',
    "leadAuditor" TEXT NOT NULL,
    "teamMembers" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "scope" JSONB NOT NULL DEFAULT '{}',
    "objectives" JSONB NOT NULL DEFAULT '{}',
    "methodology" JSONB NOT NULL DEFAULT '{}',
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "audit_engagements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_controls" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "controlName" TEXT NOT NULL,
    "controlCode" TEXT NOT NULL,
    "controlType" TEXT NOT NULL DEFAULT 'preventive',
    "category" TEXT NOT NULL DEFAULT 'approval',
    "description" TEXT NOT NULL DEFAULT '',
    "frequency" TEXT NOT NULL DEFAULT 'monthly',
    "owner" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "riskLevel" TEXT NOT NULL DEFAULT 'medium',
    "lastTestedAt" TIMESTAMP(3),
    "effectiveness" DECIMAL(5,4),
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "audit_controls_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "control_tests" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "controlId" TEXT NOT NULL,
    "testType" TEXT NOT NULL DEFAULT 'operating_effectiveness',
    "testMethod" TEXT NOT NULL DEFAULT 'inspection',
    "sampleSize" INTEGER,
    "sampleDescription" TEXT,
    "tester" TEXT NOT NULL,
    "testDate" TIMESTAMP(3) NOT NULL,
    "result" TEXT NOT NULL DEFAULT 'not_tested',
    "findings" JSONB NOT NULL DEFAULT '{}',
    "exceptions" INTEGER NOT NULL DEFAULT 0,
    "exceptionRate" DECIMAL(5,4),
    "narrative" TEXT,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "control_tests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "control_results" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "controlId" TEXT NOT NULL,
    "assessmentPeriod" TEXT NOT NULL,
    "totalTests" INTEGER NOT NULL DEFAULT 0,
    "effectiveTests" INTEGER NOT NULL DEFAULT 0,
    "ineffectiveTests" INTEGER NOT NULL DEFAULT 0,
    "partiallyEffectiveTests" INTEGER NOT NULL DEFAULT 0,
    "overallEffectiveness" DECIMAL(5,4) NOT NULL,
    "trend" TEXT NOT NULL DEFAULT 'stable',
    "riskLevel" TEXT NOT NULL DEFAULT 'medium',
    "lastAssessedAt" TIMESTAMP(3) NOT NULL,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "control_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_findings" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "engagementId" TEXT,
    "findingNumber" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "findingType" TEXT NOT NULL DEFAULT 'observation',
    "severity" TEXT NOT NULL DEFAULT 'medium',
    "status" TEXT NOT NULL DEFAULT 'open',
    "businessImpact" JSONB NOT NULL DEFAULT '{}',
    "financialImpact" JSONB NOT NULL DEFAULT '{}',
    "controlId" TEXT,
    "affectedAreas" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "affectedEntities" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "rootCause" TEXT,
    "recommendation" TEXT,
    "owner" TEXT,
    "dueDate" TIMESTAMP(3),
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "audit_findings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "finding_evidence" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "findingId" TEXT NOT NULL,
    "evidenceType" TEXT NOT NULL DEFAULT 'report',
    "referenceId" TEXT NOT NULL,
    "referenceType" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "source" TEXT NOT NULL,
    "collectedBy" TEXT NOT NULL,
    "collectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "confidence" DECIMAL(5,4) NOT NULL,
    "verificationStatus" TEXT NOT NULL DEFAULT 'unverified',
    "immutable" BOOLEAN NOT NULL DEFAULT true,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "finding_evidence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "remediation_plans" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "findingId" TEXT NOT NULL,
    "planTitle" TEXT NOT NULL,
    "planDescription" TEXT NOT NULL DEFAULT '',
    "remediationType" TEXT NOT NULL DEFAULT 'short_term',
    "status" TEXT NOT NULL DEFAULT 'proposed',
    "owner" TEXT NOT NULL,
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "startDate" TIMESTAMP(3) NOT NULL,
    "targetDate" TIMESTAMP(3) NOT NULL,
    "completedDate" TIMESTAMP(3),
    "progress" DECIMAL(5,4) NOT NULL DEFAULT 0,
    "estimatedCost" DECIMAL(38,12),
    "actualCost" DECIMAL(38,12),
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "remediation_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "remediation_tasks" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "taskTitle" TEXT NOT NULL,
    "taskDescription" TEXT NOT NULL DEFAULT '',
    "assignedTo" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "dueDate" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "evidenceIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "blockerDescription" TEXT,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "remediation_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_evidence_packages" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "engagementId" TEXT,
    "packageNumber" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "packageType" TEXT NOT NULL DEFAULT 'fieldwork',
    "status" TEXT NOT NULL DEFAULT 'assembling',
    "evidenceCount" INTEGER NOT NULL DEFAULT 0,
    "evidenceItems" JSONB NOT NULL DEFAULT '[]',
    "assembledBy" TEXT NOT NULL,
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "audit_evidence_packages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_readiness_snapshots" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "snapshotDate" TIMESTAMP(3) NOT NULL,
    "assessmentType" TEXT NOT NULL DEFAULT 'internal',
    "overallScore" DECIMAL(5,4) NOT NULL,
    "financialStatementsScore" DECIMAL(5,4) NOT NULL,
    "documentsScore" DECIMAL(5,4) NOT NULL,
    "evidenceCompletenessScore" DECIMAL(5,4) NOT NULL,
    "policyComplianceScore" DECIMAL(5,4) NOT NULL,
    "workflowCompletionScore" DECIMAL(5,4) NOT NULL,
    "outstandingExceptions" INTEGER NOT NULL DEFAULT 0,
    "unresolvedFindings" INTEGER NOT NULL DEFAULT 0,
    "openRisks" INTEGER NOT NULL DEFAULT 0,
    "missingDocumentation" INTEGER NOT NULL DEFAULT 0,
    "missingApprovals" INTEGER NOT NULL DEFAULT 0,
    "summary" JSONB NOT NULL DEFAULT '{}',
    "recommendations" JSONB NOT NULL DEFAULT '[]',
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_readiness_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_risk_assessments" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "assessmentDate" TIMESTAMP(3) NOT NULL,
    "assessmentType" TEXT NOT NULL DEFAULT 'annual',
    "overallRiskScore" DECIMAL(5,4) NOT NULL,
    "riskByCategory" JSONB NOT NULL DEFAULT '{}',
    "highRiskAreas" JSONB NOT NULL DEFAULT '[]',
    "riskTrends" JSONB NOT NULL DEFAULT '{}',
    "mitigatingControls" JSONB NOT NULL DEFAULT '{}',
    "recommendations" JSONB NOT NULL DEFAULT '[]',
    "assessedBy" TEXT NOT NULL,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_risk_assessments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_calendar" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "eventTitle" TEXT NOT NULL,
    "eventType" TEXT NOT NULL DEFAULT 'audit_engagement',
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "recurring" BOOLEAN NOT NULL DEFAULT false,
    "recurrencePattern" TEXT,
    "engagementId" TEXT,
    "relatedEntities" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "attendees" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "status" TEXT NOT NULL DEFAULT 'scheduled',
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "audit_calendar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_reports" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "engagementId" TEXT,
    "reportNumber" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "reportType" TEXT NOT NULL DEFAULT 'audit_report',
    "status" TEXT NOT NULL DEFAULT 'draft',
    "content" JSONB NOT NULL DEFAULT '{}',
    "findings" JSONB NOT NULL DEFAULT '[]',
    "recommendations" JSONB NOT NULL DEFAULT '[]',
    "distributionList" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "issuedBy" TEXT,
    "issuedAt" TIMESTAMP(3),
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "audit_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_workspace_preferences" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "defaultView" TEXT NOT NULL DEFAULT 'dashboard',
    "alertThresholds" JSONB NOT NULL DEFAULT '{}',
    "dashboardLayout" JSONB NOT NULL DEFAULT '{}',
    "notificationPreferences" JSONB NOT NULL DEFAULT '{}',
    "focusAreas" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "audit_workspace_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "audit_plans_companyId_planType_idx" ON "audit_plans"("companyId", "planType");

-- CreateIndex
CREATE INDEX "audit_plans_companyId_status_idx" ON "audit_plans"("companyId", "status");

-- CreateIndex
CREATE INDEX "audit_plans_companyId_fiscalYear_idx" ON "audit_plans"("companyId", "fiscalYear");

-- CreateIndex
CREATE INDEX "audit_engagements_companyId_planId_idx" ON "audit_engagements"("companyId", "planId");

-- CreateIndex
CREATE INDEX "audit_engagements_companyId_status_idx" ON "audit_engagements"("companyId", "status");

-- CreateIndex
CREATE INDEX "audit_engagements_companyId_engagementType_idx" ON "audit_engagements"("companyId", "engagementType");

-- CreateIndex
CREATE INDEX "audit_controls_companyId_controlType_idx" ON "audit_controls"("companyId", "controlType");

-- CreateIndex
CREATE INDEX "audit_controls_companyId_category_idx" ON "audit_controls"("companyId", "category");

-- CreateIndex
CREATE INDEX "audit_controls_companyId_status_idx" ON "audit_controls"("companyId", "status");

-- CreateIndex
CREATE INDEX "audit_controls_companyId_riskLevel_idx" ON "audit_controls"("companyId", "riskLevel");

-- CreateIndex
CREATE INDEX "control_tests_companyId_controlId_idx" ON "control_tests"("companyId", "controlId");

-- CreateIndex
CREATE INDEX "control_tests_companyId_testType_idx" ON "control_tests"("companyId", "testType");

-- CreateIndex
CREATE INDEX "control_tests_companyId_result_idx" ON "control_tests"("companyId", "result");

-- CreateIndex
CREATE INDEX "control_results_companyId_controlId_idx" ON "control_results"("companyId", "controlId");

-- CreateIndex
CREATE INDEX "control_results_companyId_overallEffectiveness_idx" ON "control_results"("companyId", "overallEffectiveness");

-- CreateIndex
CREATE INDEX "control_results_companyId_riskLevel_idx" ON "control_results"("companyId", "riskLevel");

-- CreateIndex
CREATE INDEX "audit_findings_companyId_severity_idx" ON "audit_findings"("companyId", "severity");

-- CreateIndex
CREATE INDEX "audit_findings_companyId_status_idx" ON "audit_findings"("companyId", "status");

-- CreateIndex
CREATE INDEX "audit_findings_companyId_findingType_idx" ON "audit_findings"("companyId", "findingType");

-- CreateIndex
CREATE INDEX "audit_findings_companyId_engagementId_idx" ON "audit_findings"("companyId", "engagementId");

-- CreateIndex
CREATE INDEX "audit_findings_companyId_controlId_idx" ON "audit_findings"("companyId", "controlId");

-- CreateIndex
CREATE INDEX "finding_evidence_companyId_findingId_idx" ON "finding_evidence"("companyId", "findingId");

-- CreateIndex
CREATE INDEX "finding_evidence_companyId_evidenceType_idx" ON "finding_evidence"("companyId", "evidenceType");

-- CreateIndex
CREATE INDEX "finding_evidence_companyId_referenceId_idx" ON "finding_evidence"("companyId", "referenceId");

-- CreateIndex
CREATE INDEX "remediation_plans_companyId_findingId_idx" ON "remediation_plans"("companyId", "findingId");

-- CreateIndex
CREATE INDEX "remediation_plans_companyId_status_idx" ON "remediation_plans"("companyId", "status");

-- CreateIndex
CREATE INDEX "remediation_plans_companyId_owner_idx" ON "remediation_plans"("companyId", "owner");

-- CreateIndex
CREATE INDEX "remediation_plans_companyId_targetDate_idx" ON "remediation_plans"("companyId", "targetDate");

-- CreateIndex
CREATE INDEX "remediation_tasks_companyId_planId_idx" ON "remediation_tasks"("companyId", "planId");

-- CreateIndex
CREATE INDEX "remediation_tasks_companyId_assignedTo_idx" ON "remediation_tasks"("companyId", "assignedTo");

-- CreateIndex
CREATE INDEX "remediation_tasks_companyId_status_idx" ON "remediation_tasks"("companyId", "status");

-- CreateIndex
CREATE INDEX "audit_evidence_packages_companyId_engagementId_idx" ON "audit_evidence_packages"("companyId", "engagementId");

-- CreateIndex
CREATE INDEX "audit_evidence_packages_companyId_packageType_idx" ON "audit_evidence_packages"("companyId", "packageType");

-- CreateIndex
CREATE INDEX "audit_evidence_packages_companyId_status_idx" ON "audit_evidence_packages"("companyId", "status");

-- CreateIndex
CREATE INDEX "audit_readiness_snapshots_companyId_assessmentType_idx" ON "audit_readiness_snapshots"("companyId", "assessmentType");

-- CreateIndex
CREATE INDEX "audit_readiness_snapshots_companyId_snapshotDate_idx" ON "audit_readiness_snapshots"("companyId", "snapshotDate");

-- CreateIndex
CREATE INDEX "audit_risk_assessments_companyId_assessmentType_idx" ON "audit_risk_assessments"("companyId", "assessmentType");

-- CreateIndex
CREATE INDEX "audit_risk_assessments_companyId_overallRiskScore_idx" ON "audit_risk_assessments"("companyId", "overallRiskScore");

-- CreateIndex
CREATE INDEX "audit_calendar_companyId_eventType_idx" ON "audit_calendar"("companyId", "eventType");

-- CreateIndex
CREATE INDEX "audit_calendar_companyId_startDate_idx" ON "audit_calendar"("companyId", "startDate");

-- CreateIndex
CREATE INDEX "audit_calendar_companyId_status_idx" ON "audit_calendar"("companyId", "status");

-- CreateIndex
CREATE INDEX "audit_reports_companyId_reportType_idx" ON "audit_reports"("companyId", "reportType");

-- CreateIndex
CREATE INDEX "audit_reports_companyId_status_idx" ON "audit_reports"("companyId", "status");

-- CreateIndex
CREATE INDEX "audit_reports_companyId_engagementId_idx" ON "audit_reports"("companyId", "engagementId");

-- CreateIndex
CREATE INDEX "audit_workspace_preferences_companyId_userId_idx" ON "audit_workspace_preferences"("companyId", "userId");

-- AddForeignKey
ALTER TABLE "audit_plans" ADD CONSTRAINT "audit_plans_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_engagements" ADD CONSTRAINT "audit_engagements_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_engagements" ADD CONSTRAINT "audit_engagements_planId_fkey" FOREIGN KEY ("planId") REFERENCES "audit_plans"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_controls" ADD CONSTRAINT "audit_controls_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "control_tests" ADD CONSTRAINT "control_tests_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "control_tests" ADD CONSTRAINT "control_tests_controlId_fkey" FOREIGN KEY ("controlId") REFERENCES "audit_controls"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "control_results" ADD CONSTRAINT "control_results_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "control_results" ADD CONSTRAINT "control_results_controlId_fkey" FOREIGN KEY ("controlId") REFERENCES "audit_controls"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_findings" ADD CONSTRAINT "audit_findings_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_findings" ADD CONSTRAINT "audit_findings_engagementId_fkey" FOREIGN KEY ("engagementId") REFERENCES "audit_engagements"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "finding_evidence" ADD CONSTRAINT "finding_evidence_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "finding_evidence" ADD CONSTRAINT "finding_evidence_findingId_fkey" FOREIGN KEY ("findingId") REFERENCES "audit_findings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "remediation_plans" ADD CONSTRAINT "remediation_plans_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "remediation_plans" ADD CONSTRAINT "remediation_plans_findingId_fkey" FOREIGN KEY ("findingId") REFERENCES "audit_findings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "remediation_tasks" ADD CONSTRAINT "remediation_tasks_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "remediation_tasks" ADD CONSTRAINT "remediation_tasks_planId_fkey" FOREIGN KEY ("planId") REFERENCES "remediation_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_evidence_packages" ADD CONSTRAINT "audit_evidence_packages_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_evidence_packages" ADD CONSTRAINT "audit_evidence_packages_engagementId_fkey" FOREIGN KEY ("engagementId") REFERENCES "audit_engagements"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_readiness_snapshots" ADD CONSTRAINT "audit_readiness_snapshots_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_risk_assessments" ADD CONSTRAINT "audit_risk_assessments_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_calendar" ADD CONSTRAINT "audit_calendar_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_calendar" ADD CONSTRAINT "audit_calendar_engagementId_fkey" FOREIGN KEY ("engagementId") REFERENCES "audit_engagements"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_reports" ADD CONSTRAINT "audit_reports_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_reports" ADD CONSTRAINT "audit_reports_engagementId_fkey" FOREIGN KEY ("engagementId") REFERENCES "audit_engagements"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_workspace_preferences" ADD CONSTRAINT "audit_workspace_preferences_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
