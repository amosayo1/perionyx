-- Enterprise FP&A Specialist — Phase 13.8

-- CreateEnum
CREATE TYPE "PlanningCycleStatus" AS ENUM ('not_started', 'in_progress', 'locked', 'completed');

-- CreateTable
CREATE TABLE "strategic_plans" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "planName" TEXT NOT NULL,
    "planType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "fiscalYear" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "scope" JSONB NOT NULL DEFAULT '{}',
    "objectives" JSONB NOT NULL DEFAULT '{}',
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "strategic_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "planning_cycles" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "cycleName" TEXT NOT NULL,
    "cycleType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'not_started',
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "lockedAt" TIMESTAMP(3),
    "lockedBy" TEXT,
    "participants" TEXT[],
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "planning_cycles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "budgets" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "planId" TEXT,
    "budgetName" TEXT NOT NULL,
    "budgetType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "fiscalYear" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "totalAmount" DECIMAL(38,12) NOT NULL,
    "version" TEXT NOT NULL DEFAULT '1.0',
    "lockedAt" TIMESTAMP(3),
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "budgets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "budget_versions" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "budgetId" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "changeDescription" TEXT NOT NULL,
    "effectiveDate" TIMESTAMP(3) NOT NULL,
    "approvedBy" TEXT,
    "totalAmount" DECIMAL(38,12) NOT NULL,
    "lineCount" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "budget_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "budget_lines" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "budgetId" TEXT NOT NULL,
    "lineNumber" INTEGER NOT NULL,
    "accountCode" TEXT,
    "accountName" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "department" TEXT,
    "entity" TEXT,
    "costCenter" TEXT,
    "description" TEXT NOT NULL,
    "budgetAmount" DECIMAL(38,12) NOT NULL,
    "actualAmount" DECIMAL(38,12) NOT NULL DEFAULT 0,
    "variance" DECIMAL(38,12) NOT NULL DEFAULT 0,
    "variancePercent" DECIMAL(10,4) NOT NULL DEFAULT 0,
    "driverId" TEXT,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "budget_lines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "forecasts" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "planId" TEXT,
    "forecastName" TEXT NOT NULL,
    "forecastType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "horizon" TEXT NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "totalAmount" DECIMAL(38,11) NOT NULL,
    "accuracy" DECIMAL(5,4),
    "confidence" DECIMAL(5,4),
    "historicalBasis" JSONB NOT NULL DEFAULT '{}',
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "forecasts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "forecast_versions" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "forecastId" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "changeDescription" TEXT NOT NULL,
    "effectiveDate" TIMESTAMP(3) NOT NULL,
    "totalAmount" DECIMAL(38,11) NOT NULL,
    "accuracy" DECIMAL(5,4),
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "forecast_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scenario_models" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "scenarioName" TEXT NOT NULL,
    "scenarioType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "assumptions" JSONB NOT NULL DEFAULT '{}',
    "baseCase" JSONB NOT NULL DEFAULT '{}',
    "bestCase" JSONB NOT NULL DEFAULT '{}',
    "worstCase" JSONB NOT NULL DEFAULT '{}',
    "probability" DECIMAL(5,4),
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "scenario_models_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fpa_scenario_executions" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "scenarioId" TEXT NOT NULL,
    "executionDate" TIMESTAMP(3) NOT NULL,
    "inputParameters" JSONB NOT NULL DEFAULT '{}',
    "results" JSONB NOT NULL DEFAULT '{}',
    "financialImpact" JSONB NOT NULL DEFAULT '{}',
    "confidence" DECIMAL(5,4) NOT NULL,
    "riskRating" TEXT NOT NULL,
    "executedBy" TEXT NOT NULL,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "fpa_scenario_executions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "business_drivers" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "driverName" TEXT NOT NULL,
    "driverCategory" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "formula" TEXT,
    "defaultValue" DECIMAL(38,12) NOT NULL,
    "currentValue" DECIMAL(38,12),
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "business_drivers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "driver_assumptions" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,
    "planId" TEXT,
    "forecastId" TEXT,
    "scenarioId" TEXT,
    "assumptionValue" DECIMAL(38,12) NOT NULL,
    "growthRate" DECIMAL(10,6),
    "justification" TEXT NOT NULL,
    "effectiveDate" TIMESTAMP(3) NOT NULL,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "driver_assumptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "variance_analyses" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "analysisTitle" TEXT NOT NULL,
    "analysisType" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'in_progress',
    "overallVariance" DECIMAL(38,12) NOT NULL,
    "variancePercent" DECIMAL(10,4) NOT NULL,
    "keyDrivers" JSONB NOT NULL DEFAULT '{}',
    "rootCauses" JSONB NOT NULL DEFAULT '{}',
    "trends" JSONB NOT NULL DEFAULT '{}',
    "recommendations" JSONB NOT NULL DEFAULT '{}',
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "variance_analyses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "capital_plans" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "planId" TEXT,
    "capitalPlanName" TEXT NOT NULL,
    "fiscalYear" INTEGER NOT NULL,
    "totalBudget" DECIMAL(38,12) NOT NULL,
    "allocatedBudget" DECIMAL(38,12) NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "capital_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "investment_proposals" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "capitalPlanId" TEXT,
    "proposalTitle" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "investmentType" TEXT NOT NULL,
    "estimatedCost" DECIMAL(38,12) NOT NULL,
    "estimatedReturn" DECIMAL(38,12),
    "paybackPeriodMonths" INTEGER,
    "roi" DECIMAL(10,4),
    "riskRating" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'proposed',
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "businessCase" JSONB NOT NULL DEFAULT '{}',
    "financialProjections" JSONB NOT NULL DEFAULT '{}',
    "approver" TEXT,
    "approvedAt" TIMESTAMP(3),
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "investment_proposals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "strategic_initiatives" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "planId" TEXT,
    "initiativeName" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "initiativeType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'planning',
    "owner" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "targetDate" TIMESTAMP(3),
    "progress" DECIMAL(5,4) NOT NULL DEFAULT 0,
    "budget" DECIMAL(38,12),
    "actualSpend" DECIMAL(38,12) NOT NULL DEFAULT 0,
    "kpis" JSONB NOT NULL DEFAULT '{}',
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "strategic_initiatives_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "planning_recommendations" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "businessReason" TEXT NOT NULL,
    "financialImpact" JSONB NOT NULL DEFAULT '{}',
    "supportingEvidence" JSONB NOT NULL DEFAULT '{}',
    "confidence" DECIMAL(5,4) NOT NULL,
    "riskLevel" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'proposed',
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "requiredApprovals" TEXT[],
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "planning_recommendations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "planning_briefings" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "briefingDate" TIMESTAMP(3) NOT NULL,
    "briefingType" TEXT NOT NULL,
    "summary" JSONB NOT NULL DEFAULT '{}',
    "budgetStatus" JSONB NOT NULL DEFAULT '{}',
    "forecastStatus" JSONB NOT NULL DEFAULT '{}',
    "scenarioHighlights" JSONB NOT NULL DEFAULT '{}',
    "capitalHighlights" JSONB NOT NULL DEFAULT '{}',
    "strategicHighlights" JSONB NOT NULL DEFAULT '{}',
    "recommendations" JSONB NOT NULL DEFAULT '{}',
    "riskHighlights" JSONB NOT NULL DEFAULT '{}',
    "boardSummary" JSONB,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "planning_briefings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "planning_workspace_preferences" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "defaultView" TEXT NOT NULL DEFAULT 'dashboard',
    "defaultCurrency" TEXT NOT NULL DEFAULT 'USD',
    "defaultHorizon" TEXT NOT NULL,
    "defaultScenario" TEXT,
    "alertThresholds" JSONB NOT NULL DEFAULT '{}',
    "dashboardLayout" JSONB NOT NULL DEFAULT '{}',
    "focusCategories" TEXT[],
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "planning_workspace_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "strategic_plans_companyId_planType_idx" ON "strategic_plans"("companyId", "planType");

-- CreateIndex
CREATE INDEX "strategic_plans_companyId_status_idx" ON "strategic_plans"("companyId", "status");

-- CreateIndex
CREATE INDEX "strategic_plans_companyId_fiscalYear_idx" ON "strategic_plans"("companyId", "fiscalYear");

-- CreateIndex
CREATE INDEX "planning_cycles_companyId_planId_idx" ON "planning_cycles"("companyId", "planId");

-- CreateIndex
CREATE INDEX "planning_cycles_companyId_cycleType_idx" ON "planning_cycles"("companyId", "cycleType");

-- CreateIndex
CREATE INDEX "planning_cycles_companyId_status_idx" ON "planning_cycles"("companyId", "status");

-- CreateIndex
CREATE INDEX "budgets_companyId_budgetType_idx" ON "budgets"("companyId", "budgetType");

-- CreateIndex
CREATE INDEX "budgets_companyId_status_idx" ON "budgets"("companyId", "status");

-- CreateIndex
CREATE INDEX "budgets_companyId_fiscalYear_idx" ON "budgets"("companyId", "fiscalYear");

-- CreateIndex
CREATE INDEX "budget_versions_companyId_budgetId_idx" ON "budget_versions"("companyId", "budgetId");

-- CreateIndex
CREATE INDEX "budget_versions_companyId_version_idx" ON "budget_versions"("companyId", "version");

-- CreateIndex
CREATE INDEX "budget_lines_companyId_budgetId_idx" ON "budget_lines"("companyId", "budgetId");

-- CreateIndex
CREATE INDEX "budget_lines_companyId_category_idx" ON "budget_lines"("companyId", "category");

-- CreateIndex
CREATE INDEX "budget_lines_companyId_department_idx" ON "budget_lines"("companyId", "department");

-- CreateIndex
CREATE INDEX "budget_lines_companyId_accountCode_idx" ON "budget_lines"("companyId", "accountCode");

-- CreateIndex
CREATE INDEX "forecasts_companyId_forecastType_idx" ON "forecasts"("companyId", "forecastType");

-- CreateIndex
CREATE INDEX "forecasts_companyId_status_idx" ON "forecasts"("companyId", "status");

-- CreateIndex
CREATE INDEX "forecasts_companyId_horizon_idx" ON "forecasts"("companyId", "horizon");

-- CreateIndex
CREATE INDEX "forecast_versions_companyId_forecastId_idx" ON "forecast_versions"("companyId", "forecastId");

-- CreateIndex
CREATE INDEX "forecast_versions_companyId_version_idx" ON "forecast_versions"("companyId", "version");

-- CreateIndex
CREATE INDEX "scenario_models_companyId_scenarioType_idx" ON "scenario_models"("companyId", "scenarioType");

-- CreateIndex
CREATE INDEX "scenario_models_companyId_status_idx" ON "scenario_models"("companyId", "status");

-- CreateIndex
CREATE INDEX "fpa_scenario_executions_companyId_scenarioId_idx" ON "fpa_scenario_executions"("companyId", "scenarioId");

-- CreateIndex
CREATE INDEX "fpa_scenario_executions_companyId_executionDate_idx" ON "fpa_scenario_executions"("companyId", "executionDate");

-- CreateIndex
CREATE INDEX "business_drivers_companyId_driverCategory_idx" ON "business_drivers"("companyId", "driverCategory");

-- CreateIndex
CREATE INDEX "driver_assumptions_companyId_driverId_idx" ON "driver_assumptions"("companyId", "driverId");

-- CreateIndex
CREATE INDEX "driver_assumptions_companyId_planId_idx" ON "driver_assumptions"("companyId", "planId");

-- CreateIndex
CREATE INDEX "driver_assumptions_companyId_scenarioId_idx" ON "driver_assumptions"("companyId", "scenarioId");

-- CreateIndex
CREATE INDEX "variance_analyses_companyId_analysisType_idx" ON "variance_analyses"("companyId", "analysisType");

-- CreateIndex
CREATE INDEX "variance_analyses_companyId_period_idx" ON "variance_analyses"("companyId", "period");

-- CreateIndex
CREATE INDEX "variance_analyses_companyId_status_idx" ON "variance_analyses"("companyId", "status");

-- CreateIndex
CREATE INDEX "capital_plans_companyId_fiscalYear_idx" ON "capital_plans"("companyId", "fiscalYear");

-- CreateIndex
CREATE INDEX "capital_plans_companyId_status_idx" ON "capital_plans"("companyId", "status");

-- CreateIndex
CREATE INDEX "investment_proposals_companyId_investmentType_idx" ON "investment_proposals"("companyId", "investmentType");

-- CreateIndex
CREATE INDEX "investment_proposals_companyId_status_idx" ON "investment_proposals"("companyId", "status");

-- CreateIndex
CREATE INDEX "investment_proposals_companyId_priority_idx" ON "investment_proposals"("companyId", "priority");

-- CreateIndex
CREATE INDEX "strategic_initiatives_companyId_initiativeType_idx" ON "strategic_initiatives"("companyId", "initiativeType");

-- CreateIndex
CREATE INDEX "strategic_initiatives_companyId_status_idx" ON "strategic_initiatives"("companyId", "status");

-- CreateIndex
CREATE INDEX "strategic_initiatives_companyId_owner_idx" ON "strategic_initiatives"("companyId", "owner");

-- CreateIndex
CREATE INDEX "planning_recommendations_companyId_category_idx" ON "planning_recommendations"("companyId", "category");

-- CreateIndex
CREATE INDEX "planning_recommendations_companyId_status_idx" ON "planning_recommendations"("companyId", "status");

-- CreateIndex
CREATE INDEX "planning_recommendations_companyId_priority_idx" ON "planning_recommendations"("companyId", "priority");

-- CreateIndex
CREATE INDEX "planning_briefings_companyId_briefingType_idx" ON "planning_briefings"("companyId", "briefingType");

-- CreateIndex
CREATE INDEX "planning_briefings_companyId_briefingDate_idx" ON "planning_briefings"("companyId", "briefingDate");

-- CreateIndex
CREATE INDEX "planning_workspace_preferences_companyId_userId_idx" ON "planning_workspace_preferences"("companyId", "userId");

-- AddForeignKey
ALTER TABLE "strategic_plans" ADD CONSTRAINT "strategic_plans_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "planning_cycles" ADD CONSTRAINT "planning_cycles_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "planning_cycles" ADD CONSTRAINT "planning_cycles_planId_fkey" FOREIGN KEY ("planId") REFERENCES "strategic_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "budgets" ADD CONSTRAINT "budgets_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "budget_versions" ADD CONSTRAINT "budget_versions_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "budget_versions" ADD CONSTRAINT "budget_versions_budgetId_fkey" FOREIGN KEY ("budgetId") REFERENCES "budgets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "budget_lines" ADD CONSTRAINT "budget_lines_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "budget_lines" ADD CONSTRAINT "budget_lines_budgetId_fkey" FOREIGN KEY ("budgetId") REFERENCES "budgets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "forecasts" ADD CONSTRAINT "forecasts_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "forecast_versions" ADD CONSTRAINT "forecast_versions_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "forecast_versions" ADD CONSTRAINT "forecast_versions_forecastId_fkey" FOREIGN KEY ("forecastId") REFERENCES "forecasts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scenario_models" ADD CONSTRAINT "scenario_models_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fpa_scenario_executions" ADD CONSTRAINT "fpa_scenario_executions_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fpa_scenario_executions" ADD CONSTRAINT "fpa_scenario_executions_scenarioId_fkey" FOREIGN KEY ("scenarioId") REFERENCES "scenario_models"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "business_drivers" ADD CONSTRAINT "business_drivers_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "driver_assumptions" ADD CONSTRAINT "driver_assumptions_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "driver_assumptions" ADD CONSTRAINT "driver_assumptions_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "business_drivers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "driver_assumptions" ADD CONSTRAINT "driver_assumptions_scenarioId_fkey" FOREIGN KEY ("scenarioId") REFERENCES "scenario_models"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "variance_analyses" ADD CONSTRAINT "variance_analyses_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "capital_plans" ADD CONSTRAINT "capital_plans_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "investment_proposals" ADD CONSTRAINT "investment_proposals_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "strategic_initiatives" ADD CONSTRAINT "strategic_initiatives_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "planning_recommendations" ADD CONSTRAINT "planning_recommendations_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "planning_briefings" ADD CONSTRAINT "planning_briefings_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "planning_workspace_preferences" ADD CONSTRAINT "planning_workspace_preferences_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
