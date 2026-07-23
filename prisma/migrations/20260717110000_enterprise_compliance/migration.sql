-- Enterprise Compliance Specialist — Phase 13.7
-- CreateTable
CREATE TABLE "compliance_frameworks" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "frameworkName" TEXT NOT NULL,
    "frameworkCode" TEXT NOT NULL,
    "frameworkType" TEXT NOT NULL,
    "description" TEXT,
    "jurisdiction" TEXT,
    "effectiveDate" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "requirements" JSONB NOT NULL DEFAULT '[]',
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "compliance_frameworks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "compliance_requirements" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "frameworkId" TEXT NOT NULL,
    "requirementCode" TEXT NOT NULL,
    "requirementName" TEXT NOT NULL,
    "description" TEXT,
    "requirementType" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "frequency" TEXT NOT NULL DEFAULT 'as_needed',
    "mandatory" BOOLEAN NOT NULL DEFAULT true,
    "owner" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "compliance_requirements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "compliance_obligations" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "requirementId" TEXT,
    "obligationTitle" TEXT NOT NULL,
    "description" TEXT,
    "obligationType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "owner" TEXT NOT NULL,
    "dueDate" TIMESTAMP(3),
    "completedDate" TIMESTAMP(3),
    "evidenceCount" INTEGER NOT NULL DEFAULT 0,
    "dependencies" TEXT[],
    "approvals" JSONB NOT NULL DEFAULT '[]',
    "escalationLevel" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "compliance_obligations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "compliance_policies" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "policyName" TEXT NOT NULL,
    "policyCode" TEXT NOT NULL,
    "policyCategory" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "effectiveDate" TIMESTAMP(3) NOT NULL,
    "reviewDate" TIMESTAMP(3),
    "owner" TEXT NOT NULL,
    "version" TEXT NOT NULL DEFAULT '1.0',
    "applicableFrameworks" TEXT[],
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "compliance_policies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "policy_versions" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "policyId" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "changeDescription" TEXT,
    "effectiveDate" TIMESTAMP(3) NOT NULL,
    "retiredDate" TIMESTAMP(3),
    "approvedBy" TEXT,
    "content" JSONB NOT NULL,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "policy_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "compliance_violations" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "policyId" TEXT,
    "violationTitle" TEXT NOT NULL,
    "description" TEXT,
    "violationType" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'medium',
    "status" TEXT NOT NULL DEFAULT 'open',
    "businessImpact" JSONB NOT NULL,
    "regulatoryImpact" JSONB NOT NULL,
    "financialImpact" JSONB NOT NULL,
    "evidenceCount" INTEGER NOT NULL DEFAULT 0,
    "controlId" TEXT,
    "riskRating" DECIMAL(5,4) NOT NULL,
    "owner" TEXT,
    "dueDate" TIMESTAMP(3),
    "remediationPlan" JSONB,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "compliance_violations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "compliance_assessments" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "assessmentTitle" TEXT NOT NULL,
    "assessmentType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'planned',
    "scope" JSONB NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "overallScore" DECIMAL(5,4),
    "findings" JSONB NOT NULL DEFAULT '[]',
    "assessor" TEXT NOT NULL,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "compliance_assessments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "compliance_health_snapshots" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "snapshotDate" TIMESTAMP(3) NOT NULL,
    "overallScore" DECIMAL(5,4) NOT NULL,
    "policyAdherenceScore" DECIMAL(5,4) NOT NULL,
    "regulatoryReadinessScore" DECIMAL(5,4) NOT NULL,
    "controlComplianceScore" DECIMAL(5,4) NOT NULL,
    "openViolations" INTEGER NOT NULL DEFAULT 0,
    "criticalViolations" INTEGER NOT NULL DEFAULT 0,
    "overdueObligations" INTEGER NOT NULL DEFAULT 0,
    "upcomingDeadlines" INTEGER NOT NULL DEFAULT 0,
    "trendData" JSONB NOT NULL,
    "alerts" JSONB NOT NULL,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "compliance_health_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "compliance_risk_assessments" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "assessmentDate" TIMESTAMP(3) NOT NULL,
    "overallRiskScore" DECIMAL(5,4) NOT NULL,
    "riskByCategory" JSONB NOT NULL,
    "riskByJurisdiction" JSONB NOT NULL,
    "riskByFramework" JSONB NOT NULL,
    "highRiskAreas" JSONB NOT NULL,
    "mitigatingControls" JSONB NOT NULL,
    "recommendations" JSONB NOT NULL,
    "assessedBy" TEXT NOT NULL,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "compliance_risk_assessments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "compliance_filings" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "filingTitle" TEXT NOT NULL,
    "filingType" TEXT NOT NULL,
    "jurisdiction" TEXT,
    "filingFrequency" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'not_started',
    "dueDate" TIMESTAMP(3) NOT NULL,
    "submissionDate" TIMESTAMP(3),
    "evidenceCount" INTEGER NOT NULL DEFAULT 0,
    "approver" TEXT,
    "approvalStatus" TEXT,
    "lateFiling" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "compliance_filings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "compliance_deadlines" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "deadlineTitle" TEXT NOT NULL,
    "deadlineType" TEXT NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "owner" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'upcoming',
    "reminderDaysBefore" INTEGER NOT NULL DEFAULT 7,
    "relatedObligationId" TEXT,
    "relatedFilingId" TEXT,
    "escalateAfterDays" INTEGER,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "compliance_deadlines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "regulatory_updates" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "updateTitle" TEXT NOT NULL,
    "description" TEXT,
    "updateType" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "jurisdiction" TEXT,
    "frameworkCode" TEXT,
    "effectiveDate" TIMESTAMP(3) NOT NULL,
    "assessmentStatus" TEXT NOT NULL DEFAULT 'pending',
    "affectedProcesses" JSONB NOT NULL DEFAULT '[]',
    "affectedControls" JSONB NOT NULL DEFAULT '[]',
    "affectedSpecialists" JSONB NOT NULL DEFAULT '[]',
    "impactAssessment" JSONB,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "regulatory_updates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "compliance_remediations" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "violationId" TEXT NOT NULL,
    "remediationTitle" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'proposed',
    "owner" TEXT NOT NULL,
    "assignedBy" TEXT,
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "startDate" TIMESTAMP(3) NOT NULL,
    "targetDate" TIMESTAMP(3) NOT NULL,
    "completedDate" TIMESTAMP(3),
    "progress" DECIMAL(5,4) NOT NULL DEFAULT 0,
    "evidenceCount" INTEGER NOT NULL DEFAULT 0,
    "effectiveness" DECIMAL(5,4),
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "compliance_remediations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "compliance_briefings" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "briefingDate" TIMESTAMP(3) NOT NULL,
    "briefingType" TEXT NOT NULL,
    "overallHealthScore" DECIMAL(5,4) NOT NULL,
    "summary" JSONB NOT NULL,
    "upcomingDeadlines" JSONB NOT NULL,
    "highRiskViolations" JSONB NOT NULL,
    "openObligations" JSONB NOT NULL,
    "regulatoryChanges" JSONB NOT NULL,
    "policyChanges" JSONB NOT NULL,
    "executiveActions" JSONB NOT NULL,
    "riskTrends" JSONB NOT NULL,
    "boardSummary" JSONB,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "compliance_briefings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "compliance_workspace_preferences" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "defaultView" TEXT NOT NULL DEFAULT 'dashboard',
    "alertThresholds" JSONB NOT NULL DEFAULT '{}',
    "dashboardLayout" JSONB NOT NULL DEFAULT '{}',
    "notificationPreferences" JSONB NOT NULL DEFAULT '{}',
    "focusFrameworks" TEXT[],
    "focusCategories" TEXT[],
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "compliance_workspace_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "compliance_frameworks_companyId_frameworkType_idx" ON "compliance_frameworks"("companyId", "frameworkType");

-- CreateIndex
CREATE INDEX "compliance_frameworks_companyId_status_idx" ON "compliance_frameworks"("companyId", "status");

-- CreateIndex
CREATE INDEX "compliance_frameworks_companyId_frameworkCode_idx" ON "compliance_frameworks"("companyId", "frameworkCode");

-- CreateIndex
CREATE INDEX "compliance_requirements_companyId_frameworkId_idx" ON "compliance_requirements"("companyId", "frameworkId");

-- CreateIndex
CREATE INDEX "compliance_requirements_companyId_requirementType_idx" ON "compliance_requirements"("companyId", "requirementType");

-- CreateIndex
CREATE INDEX "compliance_requirements_companyId_category_idx" ON "compliance_requirements"("companyId", "category");

-- CreateIndex
CREATE INDEX "compliance_requirements_companyId_status_idx" ON "compliance_requirements"("companyId", "status");

-- CreateIndex
CREATE INDEX "compliance_obligations_companyId_status_idx" ON "compliance_obligations"("companyId", "status");

-- CreateIndex
CREATE INDEX "compliance_obligations_companyId_dueDate_idx" ON "compliance_obligations"("companyId", "dueDate");

-- CreateIndex
CREATE INDEX "compliance_obligations_companyId_owner_idx" ON "compliance_obligations"("companyId", "owner");

-- CreateIndex
CREATE INDEX "compliance_obligations_companyId_obligationType_idx" ON "compliance_obligations"("companyId", "obligationType");

-- CreateIndex
CREATE INDEX "compliance_policies_companyId_policyCategory_idx" ON "compliance_policies"("companyId", "policyCategory");

-- CreateIndex
CREATE INDEX "compliance_policies_companyId_status_idx" ON "compliance_policies"("companyId", "status");

-- CreateIndex
CREATE INDEX "compliance_policies_companyId_policyCode_idx" ON "compliance_policies"("companyId", "policyCode");

-- CreateIndex
CREATE INDEX "policy_versions_companyId_policyId_idx" ON "policy_versions"("companyId", "policyId");

-- CreateIndex
CREATE INDEX "policy_versions_companyId_version_idx" ON "policy_versions"("companyId", "version");

-- CreateIndex
CREATE INDEX "compliance_violations_companyId_severity_idx" ON "compliance_violations"("companyId", "severity");

-- CreateIndex
CREATE INDEX "compliance_violations_companyId_status_idx" ON "compliance_violations"("companyId", "status");

-- CreateIndex
CREATE INDEX "compliance_violations_companyId_violationType_idx" ON "compliance_violations"("companyId", "violationType");

-- CreateIndex
CREATE INDEX "compliance_violations_companyId_policyId_idx" ON "compliance_violations"("companyId", "policyId");

-- CreateIndex
CREATE INDEX "compliance_assessments_companyId_assessmentType_idx" ON "compliance_assessments"("companyId", "assessmentType");

-- CreateIndex
CREATE INDEX "compliance_assessments_companyId_status_idx" ON "compliance_assessments"("companyId", "status");

-- CreateIndex
CREATE INDEX "compliance_assessments_companyId_startDate_idx" ON "compliance_assessments"("companyId", "startDate");

-- CreateIndex
CREATE INDEX "compliance_health_snapshots_companyId_snapshotDate_idx" ON "compliance_health_snapshots"("companyId", "snapshotDate");

-- CreateIndex
CREATE INDEX "compliance_risk_assessments_companyId_overallRiskScore_idx" ON "compliance_risk_assessments"("companyId", "overallRiskScore");

-- CreateIndex
CREATE INDEX "compliance_filings_companyId_filingType_idx" ON "compliance_filings"("companyId", "filingType");

-- CreateIndex
CREATE INDEX "compliance_filings_companyId_status_idx" ON "compliance_filings"("companyId", "status");

-- CreateIndex
CREATE INDEX "compliance_filings_companyId_dueDate_idx" ON "compliance_filings"("companyId", "dueDate");

-- CreateIndex
CREATE INDEX "compliance_filings_companyId_jurisdiction_idx" ON "compliance_filings"("companyId", "jurisdiction");

-- CreateIndex
CREATE INDEX "compliance_deadlines_companyId_dueDate_idx" ON "compliance_deadlines"("companyId", "dueDate");

-- CreateIndex
CREATE INDEX "compliance_deadlines_companyId_status_idx" ON "compliance_deadlines"("companyId", "status");

-- CreateIndex
CREATE INDEX "compliance_deadlines_companyId_owner_idx" ON "compliance_deadlines"("companyId", "owner");

-- CreateIndex
CREATE INDEX "compliance_deadlines_companyId_deadlineType_idx" ON "compliance_deadlines"("companyId", "deadlineType");

-- CreateIndex
CREATE INDEX "regulatory_updates_companyId_updateType_idx" ON "regulatory_updates"("companyId", "updateType");

-- CreateIndex
CREATE INDEX "regulatory_updates_companyId_assessmentStatus_idx" ON "regulatory_updates"("companyId", "assessmentStatus");

-- CreateIndex
CREATE INDEX "regulatory_updates_companyId_jurisdiction_idx" ON "regulatory_updates"("companyId", "jurisdiction");

-- CreateIndex
CREATE INDEX "regulatory_updates_companyId_frameworkCode_idx" ON "regulatory_updates"("companyId", "frameworkCode");

-- CreateIndex
CREATE INDEX "compliance_remediations_companyId_violationId_idx" ON "compliance_remediations"("companyId", "violationId");

-- CreateIndex
CREATE INDEX "compliance_remediations_companyId_status_idx" ON "compliance_remediations"("companyId", "status");

-- CreateIndex
CREATE INDEX "compliance_remediations_companyId_owner_idx" ON "compliance_remediations"("companyId", "owner");

-- CreateIndex
CREATE INDEX "compliance_remediations_companyId_targetDate_idx" ON "compliance_remediations"("companyId", "targetDate");

-- CreateIndex
CREATE INDEX "compliance_briefings_companyId_briefingType_idx" ON "compliance_briefings"("companyId", "briefingType");

-- CreateIndex
CREATE INDEX "compliance_briefings_companyId_briefingDate_idx" ON "compliance_briefings"("companyId", "briefingDate");

-- CreateIndex
CREATE INDEX "compliance_workspace_preferences_companyId_userId_idx" ON "compliance_workspace_preferences"("companyId", "userId");

-- AddForeignKey
ALTER TABLE "compliance_frameworks" ADD CONSTRAINT "compliance_frameworks_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compliance_requirements" ADD CONSTRAINT "compliance_requirements_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compliance_requirements" ADD CONSTRAINT "compliance_requirements_frameworkId_fkey" FOREIGN KEY ("frameworkId") REFERENCES "compliance_frameworks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compliance_obligations" ADD CONSTRAINT "compliance_obligations_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compliance_policies" ADD CONSTRAINT "compliance_policies_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "policy_versions" ADD CONSTRAINT "policy_versions_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "policy_versions" ADD CONSTRAINT "policy_versions_policyId_fkey" FOREIGN KEY ("policyId") REFERENCES "compliance_policies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compliance_violations" ADD CONSTRAINT "compliance_violations_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compliance_assessments" ADD CONSTRAINT "compliance_assessments_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compliance_health_snapshots" ADD CONSTRAINT "compliance_health_snapshots_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compliance_risk_assessments" ADD CONSTRAINT "compliance_risk_assessments_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compliance_filings" ADD CONSTRAINT "compliance_filings_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compliance_deadlines" ADD CONSTRAINT "compliance_deadlines_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "regulatory_updates" ADD CONSTRAINT "regulatory_updates_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compliance_remediations" ADD CONSTRAINT "compliance_remediations_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compliance_remediations" ADD CONSTRAINT "compliance_remediations_violationId_fkey" FOREIGN KEY ("violationId") REFERENCES "compliance_violations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compliance_briefings" ADD CONSTRAINT "compliance_briefings_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compliance_workspace_preferences" ADD CONSTRAINT "compliance_workspace_preferences_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
