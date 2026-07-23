-- Enterprise Treasury Specialist — Phase 13.4
-- Creates 18 tables for autonomous treasury intelligence: briefings, cash snapshots, liquidity forecasting, FX analysis, bank health, risk monitoring, recommendations, debt management, investment tracking, workspace preferences, health snapshots, and specialist alerts

-- TreasuryBriefing
CREATE TABLE "treasury_briefings" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "briefingDate" TIMESTAMP(3) NOT NULL,
    "briefingType" TEXT NOT NULL DEFAULT 'daily',
    "cashPositionSummary" JSONB NOT NULL DEFAULT '{}',
    "liquiditySummary" JSONB NOT NULL DEFAULT '{}',
    "fxSummary" JSONB NOT NULL DEFAULT '{}',
    "debtSummary" JSONB NOT NULL DEFAULT '{}',
    "investmentSummary" JSONB NOT NULL DEFAULT '{}',
    "riskSummary" JSONB NOT NULL DEFAULT '{}',
    "recommendations" JSONB NOT NULL DEFAULT '[]',
    "alerts" JSONB NOT NULL DEFAULT '[]',
    "highlights" JSONB NOT NULL DEFAULT '[]',
    "actionItems" JSONB NOT NULL DEFAULT '[]',
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "treasury_briefings_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "treasury_briefings_companyId_briefingDate_briefingType_key" ON "treasury_briefings"("companyId", "briefingDate", "briefingType");
CREATE INDEX "treasury_briefings_companyId_briefingDate_idx" ON "treasury_briefings"("companyId", "briefingDate");
CREATE INDEX "treasury_briefings_companyId_briefingType_idx" ON "treasury_briefings"("companyId", "briefingType");
CREATE INDEX "treasury_briefings_companyId_createdAt_idx" ON "treasury_briefings"("companyId", "createdAt");

-- CashPositionSnapshot
CREATE TABLE "cash_position_snapshots" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "snapshotDate" TIMESTAMP(3) NOT NULL,
    "totalGlobalCash" DECIMAL(38,12) NOT NULL,
    "availableCash" DECIMAL(38,12) NOT NULL,
    "restrictedCash" DECIMAL(38,12) NOT NULL,
    "inTransitFunds" DECIMAL(38,12) NOT NULL,
    "cashByCompany" JSONB NOT NULL DEFAULT '{}',
    "cashByBank" JSONB NOT NULL DEFAULT '{}',
    "cashByCurrency" JSONB NOT NULL DEFAULT '{}',
    "cashByRegion" JSONB NOT NULL DEFAULT '{}',
    "concentrationScore" DECIMAL(5,4) NOT NULL,
    "healthScore" DECIMAL(5,4) NOT NULL,
    "alerts" JSONB NOT NULL DEFAULT '[]',
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cash_position_snapshots_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "cash_position_snapshots_companyId_snapshotDate_idx" ON "cash_position_snapshots"("companyId", "snapshotDate");
CREATE INDEX "cash_position_snapshots_companyId_createdAt_idx" ON "cash_position_snapshots"("companyId", "createdAt");

-- LiquidityForecast
CREATE TABLE "liquidity_forecasts" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "forecastDate" TIMESTAMP(3) NOT NULL,
    "horizon" TEXT NOT NULL DEFAULT 'daily',
    "currentLiquidity" DECIMAL(38,12) NOT NULL,
    "forecastLiquidity" DECIMAL(38,12) NOT NULL,
    "minCashThreshold" DECIMAL(38,12) NOT NULL,
    "burnRate" DECIMAL(38,12) NOT NULL,
    "workingCapital" DECIMAL(38,12) NOT NULL,
    "shortTermFundingNeeds" DECIMAL(38,12) NOT NULL,
    "longTermLiquidity" DECIMAL(38,12) NOT NULL,
    "liquidityScore" DECIMAL(5,4) NOT NULL,
    "riskScore" DECIMAL(5,4) NOT NULL,
    "confidence" DECIMAL(5,4) NOT NULL,
    "scenario" TEXT NOT NULL DEFAULT 'expected',
    "historicalComparison" JSONB NOT NULL DEFAULT '{}',
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "liquidity_forecasts_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "liquidity_forecasts_companyId_forecastDate_idx" ON "liquidity_forecasts"("companyId", "forecastDate");
CREATE INDEX "liquidity_forecasts_companyId_horizon_idx" ON "liquidity_forecasts"("companyId", "horizon");
CREATE INDEX "liquidity_forecasts_companyId_scenario_idx" ON "liquidity_forecasts"("companyId", "scenario");
CREATE INDEX "liquidity_forecasts_companyId_createdAt_idx" ON "liquidity_forecasts"("companyId", "createdAt");

-- LiquidityScenario
CREATE TABLE "liquidity_scenarios" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "forecastId" TEXT NOT NULL,
    "scenarioName" TEXT NOT NULL,
    "scenarioType" TEXT NOT NULL DEFAULT 'expected',
    "probability" DECIMAL(5,4) NOT NULL,
    "projectedLiquidity" DECIMAL(38,12) NOT NULL,
    "projectedBurnRate" DECIMAL(38,12) NOT NULL,
    "fundingGap" DECIMAL(38,12) NOT NULL,
    "daysOfRunway" INTEGER NOT NULL,
    "assumptions" JSONB NOT NULL DEFAULT '[]',
    "triggers" JSONB NOT NULL DEFAULT '[]',
    "recommendations" JSONB NOT NULL DEFAULT '[]',
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "liquidity_scenarios_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "liquidity_scenarios_companyId_forecastId_idx" ON "liquidity_scenarios"("companyId", "forecastId");
CREATE INDEX "liquidity_scenarios_companyId_scenarioType_idx" ON "liquidity_scenarios"("companyId", "scenarioType");
CREATE INDEX "liquidity_scenarios_companyId_createdAt_idx" ON "liquidity_scenarios"("companyId", "createdAt");

-- FXExposureAnalysis
CREATE TABLE "fx_exposure_analyses" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "analysisDate" TIMESTAMP(3) NOT NULL,
    "totalExposure" DECIMAL(38,12) NOT NULL,
    "netOpenPosition" DECIMAL(38,12) NOT NULL,
    "hedgedExposure" DECIMAL(38,12) NOT NULL,
    "unhedgedExposure" DECIMAL(38,12) NOT NULL,
    "exposureByCurrency" JSONB NOT NULL DEFAULT '{}',
    "exposureByRegion" JSONB NOT NULL DEFAULT '{}',
    "concentrationScore" DECIMAL(5,4) NOT NULL,
    "riskScore" DECIMAL(5,4) NOT NULL,
    "volatilityScore" DECIMAL(5,4) NOT NULL,
    "hedgingOpportunities" JSONB NOT NULL DEFAULT '[]',
    "recommendations" JSONB NOT NULL DEFAULT '[]',
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "fx_exposure_analyses_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "fx_exposure_analyses_companyId_analysisDate_idx" ON "fx_exposure_analyses"("companyId", "analysisDate");
CREATE INDEX "fx_exposure_analyses_companyId_createdAt_idx" ON "fx_exposure_analyses"("companyId", "createdAt");

-- FXRecommendation
CREATE TABLE "fx_recommendations" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "exposureId" TEXT NOT NULL,
    "recommendationType" TEXT NOT NULL DEFAULT 'no_action',
    "currencyPair" TEXT NOT NULL,
    "exposureAmount" DECIMAL(38,12) NOT NULL,
    "recommendedHedgeAmount" DECIMAL(38,12) NOT NULL,
    "hedgeRatio" DECIMAL(5,4) NOT NULL,
    "instrument" TEXT NOT NULL,
    "tenor" TEXT NOT NULL,
    "businessReason" TEXT NOT NULL,
    "confidence" DECIMAL(5,4) NOT NULL,
    "riskLevel" TEXT NOT NULL DEFAULT 'LOW',
    "financialImpact" JSONB NOT NULL DEFAULT '{}',
    "evidence" JSONB NOT NULL DEFAULT '[]',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "fx_recommendations_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "fx_recommendations_companyId_exposureId_idx" ON "fx_recommendations"("companyId", "exposureId");
CREATE INDEX "fx_recommendations_companyId_status_idx" ON "fx_recommendations"("companyId", "status");
CREATE INDEX "fx_recommendations_companyId_recommendationType_idx" ON "fx_recommendations"("companyId", "recommendationType");
CREATE INDEX "fx_recommendations_companyId_createdAt_idx" ON "fx_recommendations"("companyId", "createdAt");

-- BankRelationship
CREATE TABLE "bank_relationships" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "bankName" TEXT NOT NULL,
    "bankCode" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "relationshipType" TEXT NOT NULL,
    "accountCount" INTEGER NOT NULL DEFAULT 0,
    "totalBalance" DECIMAL(38,12) NOT NULL,
    "healthScore" DECIMAL(5,4) NOT NULL,
    "connectionStatus" TEXT NOT NULL DEFAULT 'active',
    "lastSyncAt" TIMESTAMP(3),
    "fees" JSONB NOT NULL DEFAULT '{}',
    "limits" JSONB NOT NULL DEFAULT '{}',
    "utilization" JSONB NOT NULL DEFAULT '{}',
    "sweeps" JSONB NOT NULL DEFAULT '{}',
    "pools" JSONB NOT NULL DEFAULT '{}',
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bank_relationships_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "bank_relationships_companyId_bankCode_key" ON "bank_relationships"("companyId", "bankCode");
CREATE INDEX "bank_relationships_companyId_relationshipType_idx" ON "bank_relationships"("companyId", "relationshipType");
CREATE INDEX "bank_relationships_companyId_connectionStatus_idx" ON "bank_relationships"("companyId", "connectionStatus");
CREATE INDEX "bank_relationships_companyId_healthScore_idx" ON "bank_relationships"("companyId", "healthScore");

-- BankHealth
CREATE TABLE "bank_healths" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "bankRelationshipId" TEXT NOT NULL,
    "assessmentDate" TIMESTAMP(3) NOT NULL,
    "overallScore" DECIMAL(5,4) NOT NULL,
    "connectionHealth" DECIMAL(5,4) NOT NULL,
    "settlementHealth" DECIMAL(5,4) NOT NULL,
    "feeCompetitiveness" DECIMAL(5,4) NOT NULL,
    "serviceQuality" DECIMAL(5,4) NOT NULL,
    "failedPayments" INTEGER NOT NULL DEFAULT 0,
    "pendingSettlements" INTEGER NOT NULL DEFAULT 0,
    "averageSettlementTime" DECIMAL(10,2) NOT NULL,
    "alerts" JSONB NOT NULL DEFAULT '[]',
    "recommendations" JSONB NOT NULL DEFAULT '[]',
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bank_healths_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "bank_healths_companyId_bankRelationshipId_idx" ON "bank_healths"("companyId", "bankRelationshipId");
CREATE INDEX "bank_healths_companyId_assessmentDate_idx" ON "bank_healths"("companyId", "assessmentDate");
CREATE INDEX "bank_healths_companyId_overallScore_idx" ON "bank_healths"("companyId", "overallScore");

-- TreasuryRisk
CREATE TABLE "treasury_risks" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "riskDate" TIMESTAMP(3) NOT NULL,
    "riskType" TEXT NOT NULL,
    "riskLevel" TEXT NOT NULL DEFAULT 'LOW',
    "riskScore" DECIMAL(5,4) NOT NULL,
    "exposure" DECIMAL(38,12) NOT NULL,
    "potentialLoss" DECIMAL(38,12) NOT NULL,
    "probability" DECIMAL(5,4) NOT NULL,
    "mitigationActions" JSONB NOT NULL DEFAULT '[]',
    "owner" TEXT,
    "status" TEXT NOT NULL DEFAULT 'open',
    "trend" TEXT NOT NULL DEFAULT 'stable',
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "treasury_risks_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "treasury_risks_companyId_riskType_idx" ON "treasury_risks"("companyId", "riskType");
CREATE INDEX "treasury_risks_companyId_riskLevel_idx" ON "treasury_risks"("companyId", "riskLevel");
CREATE INDEX "treasury_risks_companyId_status_idx" ON "treasury_risks"("companyId", "status");
CREATE INDEX "treasury_risks_companyId_riskDate_idx" ON "treasury_risks"("companyId", "riskDate");
CREATE INDEX "treasury_risks_companyId_createdAt_idx" ON "treasury_risks"("companyId", "createdAt");

-- TreasuryRecommendation
CREATE TABLE "treasury_recommendations" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "businessReason" TEXT NOT NULL DEFAULT '',
    "supportingEvidence" JSONB NOT NULL DEFAULT '[]',
    "confidence" DECIMAL(5,4) NOT NULL,
    "riskLevel" TEXT NOT NULL DEFAULT 'LOW',
    "financialImpact" JSONB NOT NULL DEFAULT '{}',
    "affectedModules" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "requiredApprovals" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "status" TEXT NOT NULL DEFAULT 'pending',
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "treasury_recommendations_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "treasury_recommendations_companyId_category_idx" ON "treasury_recommendations"("companyId", "category");
CREATE INDEX "treasury_recommendations_companyId_status_idx" ON "treasury_recommendations"("companyId", "status");
CREATE INDEX "treasury_recommendations_companyId_priority_idx" ON "treasury_recommendations"("companyId", "priority");
CREATE INDEX "treasury_recommendations_companyId_riskLevel_idx" ON "treasury_recommendations"("companyId", "riskLevel");
CREATE INDEX "treasury_recommendations_companyId_createdAt_idx" ON "treasury_recommendations"("companyId", "createdAt");

-- DebtInstrument
CREATE TABLE "debt_instruments" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "instrumentType" TEXT NOT NULL,
    "lenderName" TEXT NOT NULL,
    "principalAmount" DECIMAL(38,12) NOT NULL,
    "outstandingBalance" DECIMAL(38,12) NOT NULL,
    "interestRate" DECIMAL(10,6) NOT NULL,
    "rateType" TEXT NOT NULL,
    "maturityDate" TIMESTAMP(3) NOT NULL,
    "drawdownDate" TIMESTAMP(3) NOT NULL,
    "covenants" JSONB NOT NULL DEFAULT '[]',
    "utilization" DECIMAL(5,4) NOT NULL,
    "healthScore" DECIMAL(5,4) NOT NULL,
    "alerts" JSONB NOT NULL DEFAULT '[]',
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "debt_instruments_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "debt_instruments_companyId_instrumentType_idx" ON "debt_instruments"("companyId", "instrumentType");
CREATE INDEX "debt_instruments_companyId_maturityDate_idx" ON "debt_instruments"("companyId", "maturityDate");
CREATE INDEX "debt_instruments_companyId_healthScore_idx" ON "debt_instruments"("companyId", "healthScore");
CREATE INDEX "debt_instruments_companyId_createdAt_idx" ON "debt_instruments"("companyId", "createdAt");

-- DebtCovenant
CREATE TABLE "debt_covenants" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "debtInstrumentId" TEXT NOT NULL,
    "covenantName" TEXT NOT NULL,
    "covenantType" TEXT NOT NULL,
    "threshold" DECIMAL(38,12) NOT NULL,
    "currentValue" DECIMAL(38,12) NOT NULL,
    "unit" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'compliant',
    "margin" DECIMAL(5,4) NOT NULL,
    "testFrequency" TEXT NOT NULL,
    "lastTestDate" TIMESTAMP(3) NOT NULL,
    "nextTestDate" TIMESTAMP(3) NOT NULL,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "debt_covenants_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "debt_covenants_companyId_debtInstrumentId_idx" ON "debt_covenants"("companyId", "debtInstrumentId");
CREATE INDEX "debt_covenants_companyId_status_idx" ON "debt_covenants"("companyId", "status");
CREATE INDEX "debt_covenants_companyId_covenantType_idx" ON "debt_covenants"("companyId", "covenantType");
CREATE INDEX "debt_covenants_companyId_nextTestDate_idx" ON "debt_covenants"("companyId", "nextTestDate");

-- DebtAlert
CREATE TABLE "debt_alerts" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "debtInstrumentId" TEXT NOT NULL,
    "alertType" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'info',
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "businessReason" TEXT NOT NULL DEFAULT '',
    "confidence" DECIMAL(5,4) NOT NULL,
    "recommendedAction" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "dueDate" TIMESTAMP(3),
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "debt_alerts_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "debt_alerts_companyId_debtInstrumentId_idx" ON "debt_alerts"("companyId", "debtInstrumentId");
CREATE INDEX "debt_alerts_companyId_alertType_idx" ON "debt_alerts"("companyId", "alertType");
CREATE INDEX "debt_alerts_companyId_severity_idx" ON "debt_alerts"("companyId", "severity");
CREATE INDEX "debt_alerts_companyId_status_idx" ON "debt_alerts"("companyId", "status");
CREATE INDEX "debt_alerts_companyId_createdAt_idx" ON "debt_alerts"("companyId", "createdAt");

-- InvestmentHolding
CREATE TABLE "investment_holdings" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "holdingName" TEXT NOT NULL,
    "instrumentType" TEXT NOT NULL,
    "issuer" TEXT NOT NULL,
    "counterparty" TEXT NOT NULL,
    "faceValue" DECIMAL(38,12) NOT NULL,
    "currentValue" DECIMAL(38,12) NOT NULL,
    "yield" DECIMAL(10,6) NOT NULL,
    "maturityDate" TIMESTAMP(3) NOT NULL,
    "liquidityClassification" TEXT NOT NULL,
    "counterpartyExposure" DECIMAL(38,12) NOT NULL,
    "riskRating" TEXT NOT NULL,
    "healthScore" DECIMAL(5,4) NOT NULL,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "investment_holdings_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "investment_holdings_companyId_instrumentType_idx" ON "investment_holdings"("companyId", "instrumentType");
CREATE INDEX "investment_holdings_companyId_maturityDate_idx" ON "investment_holdings"("companyId", "maturityDate");
CREATE INDEX "investment_holdings_companyId_liquidityClassification_idx" ON "investment_holdings"("companyId", "liquidityClassification");
CREATE INDEX "investment_holdings_companyId_healthScore_idx" ON "investment_holdings"("companyId", "healthScore");
CREATE INDEX "investment_holdings_companyId_counterparty_idx" ON "investment_holdings"("companyId", "counterparty");

-- InvestmentRecommendation
CREATE TABLE "investment_recommendations" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "holdingId" TEXT NOT NULL,
    "recommendationType" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "businessReason" TEXT NOT NULL DEFAULT '',
    "confidence" DECIMAL(5,4) NOT NULL,
    "riskLevel" TEXT NOT NULL DEFAULT 'LOW',
    "financialImpact" JSONB NOT NULL DEFAULT '{}',
    "evidence" JSONB NOT NULL DEFAULT '[]',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "investment_recommendations_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "investment_recommendations_companyId_holdingId_idx" ON "investment_recommendations"("companyId", "holdingId");
CREATE INDEX "investment_recommendations_companyId_status_idx" ON "investment_recommendations"("companyId", "status");
CREATE INDEX "investment_recommendations_companyId_recommendationType_idx" ON "investment_recommendations"("companyId", "recommendationType");
CREATE INDEX "investment_recommendations_companyId_createdAt_idx" ON "investment_recommendations"("companyId", "createdAt");

-- TreasuryWorkspacePreference
CREATE TABLE "treasury_workspace_preferences" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "defaultCurrency" TEXT NOT NULL DEFAULT 'USD',
    "defaultHorizon" TEXT NOT NULL DEFAULT 'daily',
    "defaultScenario" TEXT NOT NULL DEFAULT 'expected',
    "alertThresholds" JSONB NOT NULL DEFAULT '{}',
    "dashboardLayout" JSONB NOT NULL DEFAULT '{}',
    "currencyPairs" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "riskTolerance" TEXT NOT NULL DEFAULT 'moderate',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "treasury_workspace_preferences_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "treasury_workspace_preferences_companyId_userId_key" ON "treasury_workspace_preferences"("companyId", "userId");
CREATE INDEX "treasury_workspace_preferences_companyId_userId_idx" ON "treasury_workspace_preferences"("companyId", "userId");

-- TreasuryHealthSnapshot
CREATE TABLE "treasury_health_snapshots" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "snapshotDate" TIMESTAMP(3) NOT NULL,
    "overallScore" DECIMAL(5,4) NOT NULL,
    "cashHealth" DECIMAL(5,4) NOT NULL,
    "liquidityHealth" DECIMAL(5,4) NOT NULL,
    "fxHealth" DECIMAL(5,4) NOT NULL,
    "debtHealth" DECIMAL(5,4) NOT NULL,
    "investmentHealth" DECIMAL(5,4) NOT NULL,
    "riskHealth" DECIMAL(5,4) NOT NULL,
    "bankHealth" DECIMAL(5,4) NOT NULL,
    "policyCompliance" DECIMAL(5,4) NOT NULL,
    "trendData" JSONB NOT NULL DEFAULT '{}',
    "alerts" JSONB NOT NULL DEFAULT '[]',
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "treasury_health_snapshots_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "treasury_health_snapshots_companyId_snapshotDate_key" ON "treasury_health_snapshots"("companyId", "snapshotDate");
CREATE INDEX "treasury_health_snapshots_companyId_overallScore_idx" ON "treasury_health_snapshots"("companyId", "overallScore");
CREATE INDEX "treasury_health_snapshots_companyId_createdAt_idx" ON "treasury_health_snapshots"("companyId", "createdAt");

-- TreasurySpecialistAlert
CREATE TABLE "treasury_specialist_alerts" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "alertType" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'info',
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "businessReason" TEXT NOT NULL DEFAULT '',
    "confidence" DECIMAL(5,4) NOT NULL,
    "source" TEXT NOT NULL,
    "evidence" JSONB NOT NULL DEFAULT '[]',
    "status" TEXT NOT NULL DEFAULT 'active',
    "assignedTo" TEXT,
    "dueDate" TIMESTAMP(3),
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "treasury_specialist_alerts_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "treasury_specialist_alerts_companyId_alertType_idx" ON "treasury_specialist_alerts"("companyId", "alertType");
CREATE INDEX "treasury_specialist_alerts_companyId_severity_idx" ON "treasury_specialist_alerts"("companyId", "severity");
CREATE INDEX "treasury_specialist_alerts_companyId_status_idx" ON "treasury_specialist_alerts"("companyId", "status");
CREATE INDEX "treasury_specialist_alerts_companyId_assignedTo_idx" ON "treasury_specialist_alerts"("companyId", "assignedTo");
CREATE INDEX "treasury_specialist_alerts_companyId_createdAt_idx" ON "treasury_specialist_alerts"("companyId", "createdAt");

-- Foreign Keys
ALTER TABLE "treasury_briefings" ADD CONSTRAINT "treasury_briefings_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "cash_position_snapshots" ADD CONSTRAINT "cash_position_snapshots_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "liquidity_forecasts" ADD CONSTRAINT "liquidity_forecasts_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "liquidity_scenarios" ADD CONSTRAINT "liquidity_scenarios_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "liquidity_scenarios" ADD CONSTRAINT "liquidity_scenarios_forecastId_fkey" FOREIGN KEY ("forecastId") REFERENCES "liquidity_forecasts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "fx_exposure_analyses" ADD CONSTRAINT "fx_exposure_analyses_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "fx_recommendations" ADD CONSTRAINT "fx_recommendations_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "fx_recommendations" ADD CONSTRAINT "fx_recommendations_exposureId_fkey" FOREIGN KEY ("exposureId") REFERENCES "fx_exposure_analyses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "bank_relationships" ADD CONSTRAINT "bank_relationships_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "bank_healths" ADD CONSTRAINT "bank_healths_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "bank_healths" ADD CONSTRAINT "bank_healths_bankRelationshipId_fkey" FOREIGN KEY ("bankRelationshipId") REFERENCES "bank_relationships"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "treasury_risks" ADD CONSTRAINT "treasury_risks_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "treasury_recommendations" ADD CONSTRAINT "treasury_recommendations_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "debt_instruments" ADD CONSTRAINT "debt_instruments_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "debt_covenants" ADD CONSTRAINT "debt_covenants_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "debt_covenants" ADD CONSTRAINT "debt_covenants_debtInstrumentId_fkey" FOREIGN KEY ("debtInstrumentId") REFERENCES "debt_instruments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "debt_alerts" ADD CONSTRAINT "debt_alerts_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "debt_alerts" ADD CONSTRAINT "debt_alerts_debtInstrumentId_fkey" FOREIGN KEY ("debtInstrumentId") REFERENCES "debt_instruments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "investment_holdings" ADD CONSTRAINT "investment_holdings_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "investment_recommendations" ADD CONSTRAINT "investment_recommendations_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "investment_recommendations" ADD CONSTRAINT "investment_recommendations_holdingId_fkey" FOREIGN KEY ("holdingId") REFERENCES "investment_holdings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "treasury_workspace_preferences" ADD CONSTRAINT "treasury_workspace_preferences_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "treasury_health_snapshots" ADD CONSTRAINT "treasury_health_snapshots_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "treasury_specialist_alerts" ADD CONSTRAINT "treasury_specialist_alerts_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
