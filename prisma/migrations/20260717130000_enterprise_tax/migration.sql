-- Enterprise Tax Specialist — Phase 13.9

-- CreateTable
CREATE TABLE "tax_jurisdictions" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "jurisdictionCode" TEXT NOT NULL,
    "jurisdictionName" TEXT NOT NULL,
    "jurisdictionType" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "state" TEXT,
    "taxAuthority" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tax_jurisdictions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tax_rates" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "jurisdictionId" TEXT NOT NULL,
    "rateType" TEXT NOT NULL,
    "rateName" TEXT NOT NULL,
    "rate" DECIMAL(10,6) NOT NULL,
    "effectiveDate" TIMESTAMP(3) NOT NULL,
    "expiryDate" TIMESTAMP(3),
    "isFlatRate" BOOLEAN NOT NULL DEFAULT true,
    "brackets" JSONB,
    "status" TEXT NOT NULL DEFAULT 'active',
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tax_rates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tax_provisions" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "provisionType" TEXT NOT NULL,
    "fiscalYear" INTEGER NOT NULL,
    "period" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "currentTax" DECIMAL(38,12) NOT NULL DEFAULT 0,
    "deferredTax" DECIMAL(38,12) NOT NULL DEFAULT 0,
    "totalTaxExpense" DECIMAL(38,12) NOT NULL DEFAULT 0,
    "effectiveTaxRate" DECIMAL(10,6) NOT NULL DEFAULT 0,
    "permanentDifferences" JSONB NOT NULL DEFAULT '[]',
    "temporaryDifferences" JSONB NOT NULL DEFAULT '[]',
    "reconciliation" JSONB NOT NULL DEFAULT '{}',
    "jurisdictionBreakdown" JSONB NOT NULL DEFAULT '[]',
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tax_provisions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "deferred_taxes" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "provisionId" TEXT,
    "jurisdictionId" TEXT,
    "itemDescription" TEXT NOT NULL,
    "temporaryDifferenceType" TEXT NOT NULL,
    "taxBase" DECIMAL(38,12) NOT NULL,
    "bookBase" DECIMAL(38,12) NOT NULL,
    "temporaryDifference" DECIMAL(38,12) NOT NULL,
    "deferredTaxAsset" DECIMAL(38,12) NOT NULL DEFAULT 0,
    "deferredTaxLiability" DECIMAL(38,12) NOT NULL DEFAULT 0,
    "enactedRate" DECIMAL(10,6) NOT NULL,
    "reversalDate" TIMESTAMP(3),
    "isValuationAllowance" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "deferred_taxes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tax_returns" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "jurisdictionId" TEXT NOT NULL,
    "returnType" TEXT NOT NULL,
    "fiscalYear" INTEGER NOT NULL,
    "period" TEXT,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "filingDate" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'not_started',
    "extensionFiled" BOOLEAN NOT NULL DEFAULT false,
    "extensionDate" TIMESTAMP(3),
    "taxDue" DECIMAL(38,12) NOT NULL DEFAULT 0,
    "refundDue" DECIMAL(38,12) NOT NULL DEFAULT 0,
    "penalties" DECIMAL(38,12) NOT NULL DEFAULT 0,
    "interest" DECIMAL(38,12) NOT NULL DEFAULT 0,
    "preparer" TEXT,
    "reviewer" TEXT,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tax_returns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tax_filings" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "jurisdictionId" TEXT NOT NULL,
    "returnId" TEXT,
    "filingTitle" TEXT NOT NULL,
    "filingType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "dueDate" TIMESTAMP(3) NOT NULL,
    "submissionDate" TIMESTAMP(3),
    "evidenceCount" INTEGER NOT NULL DEFAULT 0,
    "approver" TEXT,
    "approvalStatus" TEXT,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tax_filings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tax_deadlines" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "jurisdictionId" TEXT NOT NULL,
    "deadlineTitle" TEXT NOT NULL,
    "deadlineType" TEXT NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'upcoming',
    "reminderDaysBefore" INTEGER NOT NULL DEFAULT 14,
    "relatedReturnId" TEXT,
    "escalateAfterDays" INTEGER,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tax_deadlines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tax_payments" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "jurisdictionId" TEXT NOT NULL,
    "returnId" TEXT,
    "paymentType" TEXT NOT NULL,
    "paymentDate" TIMESTAMP(3) NOT NULL,
    "amount" DECIMAL(38,12) NOT NULL,
    "paymentMethod" TEXT,
    "referenceNumber" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "reconciledAt" TIMESTAMP(3),
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tax_payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transfer_pricing_policies" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "policyName" TEXT NOT NULL,
    "intercompanyType" TEXT NOT NULL,
    "armLengthMethod" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "documentationStatus" TEXT NOT NULL,
    "lastReviewDate" TIMESTAMP(3),
    "nextReviewDate" TIMESTAMP(3),
    "riskLevel" TEXT NOT NULL DEFAULT 'medium',
    "status" TEXT NOT NULL DEFAULT 'active',
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transfer_pricing_policies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "intercompany_tax_rules" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "policyId" TEXT,
    "ruleName" TEXT NOT NULL,
    "fromJurisdictionId" TEXT NOT NULL,
    "toJurisdictionId" TEXT NOT NULL,
    "transactionType" TEXT NOT NULL,
    "withholdingRate" DECIMAL(10,6) NOT NULL DEFAULT 0,
    "vatRate" DECIMAL(10,6) NOT NULL DEFAULT 0,
    "treatyBenefits" JSONB,
    "status" TEXT NOT NULL DEFAULT 'active',
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "intercompany_tax_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tax_assessments" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "jurisdictionId" TEXT NOT NULL,
    "returnId" TEXT,
    "assessmentType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "assessedAmount" DECIMAL(38,12) NOT NULL DEFAULT 0,
    "disputedAmount" DECIMAL(38,12) NOT NULL DEFAULT 0,
    "assessedBy" TEXT NOT NULL,
    "assessmentDate" TIMESTAMP(3) NOT NULL,
    "findings" JSONB NOT NULL DEFAULT '[]',
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tax_assessments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tax_risk_assessments" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "assessmentDate" TIMESTAMP(3) NOT NULL,
    "overallRiskScore" DECIMAL(5,4) NOT NULL,
    "jurisdictionRisks" JSONB NOT NULL,
    "filingRisks" JSONB NOT NULL,
    "provisionRisks" JSONB NOT NULL,
    "transferPricingRisks" JSONB NOT NULL,
    "documentationRisks" JSONB NOT NULL,
    "exposureRisks" JSONB NOT NULL,
    "highRiskAreas" JSONB NOT NULL,
    "recommendations" JSONB NOT NULL,
    "assessedBy" TEXT NOT NULL,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tax_risk_assessments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tax_planning_scenarios" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "scenarioName" TEXT NOT NULL,
    "scenarioType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "assumptions" JSONB NOT NULL,
    "projectedTaxImpact" DECIMAL(38,12) NOT NULL,
    "projectedSavings" DECIMAL(38,12) NOT NULL DEFAULT 0,
    "riskRating" TEXT NOT NULL DEFAULT 'medium',
    "implementationComplexity" TEXT NOT NULL DEFAULT 'medium',
    "timeline" TEXT,
    "businessCase" JSONB NOT NULL,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tax_planning_scenarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tax_recommendations" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "businessReason" TEXT NOT NULL,
    "financialImpact" JSONB NOT NULL,
    "confidence" DECIMAL(5,4) NOT NULL,
    "riskLevel" TEXT NOT NULL DEFAULT 'medium',
    "status" TEXT NOT NULL DEFAULT 'proposed',
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "requiredApprovals" TEXT[],
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tax_recommendations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tax_briefings" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "briefingDate" TIMESTAMP(3) NOT NULL,
    "briefingType" TEXT NOT NULL,
    "summary" JSONB NOT NULL,
    "deadlinesSummary" JSONB NOT NULL,
    "riskSummary" JSONB NOT NULL,
    "provisionSummary" JSONB NOT NULL,
    "deferredTaxSummary" JSONB NOT NULL,
    "filingStatus" JSONB NOT NULL,
    "planningOpportunities" JSONB NOT NULL,
    "boardSummary" JSONB,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tax_briefings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tax_workspace_preferences" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "defaultView" TEXT NOT NULL DEFAULT 'dashboard',
    "defaultCurrency" TEXT NOT NULL DEFAULT 'USD',
    "focusJurisdictions" TEXT[],
    "alertThresholds" JSONB NOT NULL,
    "dashboardLayout" JSONB NOT NULL,
    "notificationPreferences" JSONB NOT NULL,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tax_workspace_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "tax_jurisdictions_companyId_jurisdictionCode_idx" ON "tax_jurisdictions"("companyId", "jurisdictionCode");

-- CreateIndex
CREATE INDEX "tax_jurisdictions_companyId_jurisdictionType_idx" ON "tax_jurisdictions"("companyId", "jurisdictionType");

-- CreateIndex
CREATE INDEX "tax_jurisdictions_companyId_country_idx" ON "tax_jurisdictions"("companyId", "country");

-- CreateIndex
CREATE INDEX "tax_rates_companyId_jurisdictionId_idx" ON "tax_rates"("companyId", "jurisdictionId");

-- CreateIndex
CREATE INDEX "tax_rates_companyId_rateType_idx" ON "tax_rates"("companyId", "rateType");

-- CreateIndex
CREATE INDEX "tax_rates_companyId_effectiveDate_idx" ON "tax_rates"("companyId", "effectiveDate");

-- CreateIndex
CREATE INDEX "tax_provisions_companyId_provisionType_idx" ON "tax_provisions"("companyId", "provisionType");

-- CreateIndex
CREATE INDEX "tax_provisions_companyId_fiscalYear_idx" ON "tax_provisions"("companyId", "fiscalYear");

-- CreateIndex
CREATE INDEX "tax_provisions_companyId_status_idx" ON "tax_provisions"("companyId", "status");

-- CreateIndex
CREATE INDEX "deferred_taxes_companyId_provisionId_idx" ON "deferred_taxes"("companyId", "provisionId");

-- CreateIndex
CREATE INDEX "deferred_taxes_companyId_temporaryDifferenceType_idx" ON "deferred_taxes"("companyId", "temporaryDifferenceType");

-- CreateIndex
CREATE INDEX "deferred_taxes_companyId_jurisdictionId_idx" ON "deferred_taxes"("companyId", "jurisdictionId");

-- CreateIndex
CREATE INDEX "tax_returns_companyId_jurisdictionId_idx" ON "tax_returns"("companyId", "jurisdictionId");

-- CreateIndex
CREATE INDEX "tax_returns_companyId_returnType_idx" ON "tax_returns"("companyId", "returnType");

-- CreateIndex
CREATE INDEX "tax_returns_companyId_status_idx" ON "tax_returns"("companyId", "status");

-- CreateIndex
CREATE INDEX "tax_returns_companyId_dueDate_idx" ON "tax_returns"("companyId", "dueDate");

-- CreateIndex
CREATE INDEX "tax_filings_companyId_filingType_idx" ON "tax_filings"("companyId", "filingType");

-- CreateIndex
CREATE INDEX "tax_filings_companyId_status_idx" ON "tax_filings"("companyId", "status");

-- CreateIndex
CREATE INDEX "tax_filings_companyId_dueDate_idx" ON "tax_filings"("companyId", "dueDate");

-- CreateIndex
CREATE INDEX "tax_deadlines_companyId_dueDate_idx" ON "tax_deadlines"("companyId", "dueDate");

-- CreateIndex
CREATE INDEX "tax_deadlines_companyId_status_idx" ON "tax_deadlines"("companyId", "status");

-- CreateIndex
CREATE INDEX "tax_deadlines_companyId_deadlineType_idx" ON "tax_deadlines"("companyId", "deadlineType");

-- CreateIndex
CREATE INDEX "tax_payments_companyId_jurisdictionId_idx" ON "tax_payments"("companyId", "jurisdictionId");

-- CreateIndex
CREATE INDEX "tax_payments_companyId_paymentType_idx" ON "tax_payments"("companyId", "paymentType");

-- CreateIndex
CREATE INDEX "tax_payments_companyId_status_idx" ON "tax_payments"("companyId", "status");

-- CreateIndex
CREATE INDEX "tax_payments_companyId_paymentDate_idx" ON "tax_payments"("companyId", "paymentDate");

-- CreateIndex
CREATE INDEX "transfer_pricing_policies_companyId_intercompanyType_idx" ON "transfer_pricing_policies"("companyId", "intercompanyType");

-- CreateIndex
CREATE INDEX "transfer_pricing_policies_companyId_riskLevel_idx" ON "transfer_pricing_policies"("companyId", "riskLevel");

-- CreateIndex
CREATE INDEX "transfer_pricing_policies_companyId_status_idx" ON "transfer_pricing_policies"("companyId", "status");

-- CreateIndex
CREATE INDEX "intercompany_tax_rules_companyId_policyId_idx" ON "intercompany_tax_rules"("companyId", "policyId");

-- CreateIndex
CREATE INDEX "intercompany_tax_rules_companyId_fromJurisdictionId_idx" ON "intercompany_tax_rules"("companyId", "fromJurisdictionId");

-- CreateIndex
CREATE INDEX "intercompany_tax_rules_companyId_toJurisdictionId_idx" ON "intercompany_tax_rules"("companyId", "toJurisdictionId");

-- CreateIndex
CREATE INDEX "tax_assessments_companyId_jurisdictionId_idx" ON "tax_assessments"("companyId", "jurisdictionId");

-- CreateIndex
CREATE INDEX "tax_assessments_companyId_assessmentType_idx" ON "tax_assessments"("companyId", "assessmentType");

-- CreateIndex
CREATE INDEX "tax_assessments_companyId_status_idx" ON "tax_assessments"("companyId", "status");

-- CreateIndex
CREATE INDEX "tax_risk_assessments_companyId_overallRiskScore_idx" ON "tax_risk_assessments"("companyId", "overallRiskScore");

-- CreateIndex
CREATE INDEX "tax_planning_scenarios_companyId_scenarioType_idx" ON "tax_planning_scenarios"("companyId", "scenarioType");

-- CreateIndex
CREATE INDEX "tax_planning_scenarios_companyId_status_idx" ON "tax_planning_scenarios"("companyId", "status");

-- CreateIndex
CREATE INDEX "tax_recommendations_companyId_category_idx" ON "tax_recommendations"("companyId", "category");

-- CreateIndex
CREATE INDEX "tax_recommendations_companyId_status_idx" ON "tax_recommendations"("companyId", "status");

-- CreateIndex
CREATE INDEX "tax_recommendations_companyId_priority_idx" ON "tax_recommendations"("companyId", "priority");

-- CreateIndex
CREATE INDEX "tax_briefings_companyId_briefingType_idx" ON "tax_briefings"("companyId", "briefingType");

-- CreateIndex
CREATE INDEX "tax_briefings_companyId_briefingDate_idx" ON "tax_briefings"("companyId", "briefingDate");

-- CreateIndex
CREATE INDEX "tax_workspace_preferences_companyId_userId_idx" ON "tax_workspace_preferences"("companyId", "userId");

-- AddForeignKey
ALTER TABLE "tax_jurisdictions" ADD CONSTRAINT "tax_jurisdictions_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tax_rates" ADD CONSTRAINT "tax_rates_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tax_rates" ADD CONSTRAINT "tax_rates_jurisdictionId_fkey" FOREIGN KEY ("jurisdictionId") REFERENCES "tax_jurisdictions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tax_provisions" ADD CONSTRAINT "tax_provisions_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deferred_taxes" ADD CONSTRAINT "deferred_taxes_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deferred_taxes" ADD CONSTRAINT "deferred_taxes_provisionId_fkey" FOREIGN KEY ("provisionId") REFERENCES "tax_provisions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deferred_taxes" ADD CONSTRAINT "deferred_taxes_jurisdictionId_fkey" FOREIGN KEY ("jurisdictionId") REFERENCES "tax_jurisdictions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tax_returns" ADD CONSTRAINT "tax_returns_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tax_returns" ADD CONSTRAINT "tax_returns_jurisdictionId_fkey" FOREIGN KEY ("jurisdictionId") REFERENCES "tax_jurisdictions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tax_filings" ADD CONSTRAINT "tax_filings_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tax_filings" ADD CONSTRAINT "tax_filings_jurisdictionId_fkey" FOREIGN KEY ("jurisdictionId") REFERENCES "tax_jurisdictions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tax_deadlines" ADD CONSTRAINT "tax_deadlines_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tax_deadlines" ADD CONSTRAINT "tax_deadlines_jurisdictionId_fkey" FOREIGN KEY ("jurisdictionId") REFERENCES "tax_jurisdictions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tax_payments" ADD CONSTRAINT "tax_payments_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tax_payments" ADD CONSTRAINT "tax_payments_jurisdictionId_fkey" FOREIGN KEY ("jurisdictionId") REFERENCES "tax_jurisdictions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transfer_pricing_policies" ADD CONSTRAINT "transfer_pricing_policies_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "intercompany_tax_rules" ADD CONSTRAINT "intercompany_tax_rules_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "intercompany_tax_rules" ADD CONSTRAINT "intercompany_tax_rules_policyId_fkey" FOREIGN KEY ("policyId") REFERENCES "transfer_pricing_policies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tax_assessments" ADD CONSTRAINT "tax_assessments_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tax_assessments" ADD CONSTRAINT "tax_assessments_jurisdictionId_fkey" FOREIGN KEY ("jurisdictionId") REFERENCES "tax_jurisdictions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tax_risk_assessments" ADD CONSTRAINT "tax_risk_assessments_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tax_planning_scenarios" ADD CONSTRAINT "tax_planning_scenarios_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tax_recommendations" ADD CONSTRAINT "tax_recommendations_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tax_briefings" ADD CONSTRAINT "tax_briefings_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tax_workspace_preferences" ADD CONSTRAINT "tax_workspace_preferences_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
