-- CreateTable
CREATE TABLE "treasury_cash_positions" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "legalEntityId" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "classification" TEXT NOT NULL,
    "totalBalance" DECIMAL(38,12) NOT NULL,
    "availableBalance" DECIMAL(38,12) NOT NULL,
    "ledgerBalance" DECIMAL(38,12) NOT NULL,
    "floatBalance" DECIMAL(38,12) NOT NULL,
    "bankBalance" DECIMAL(38,12) NOT NULL,
    "bankAccountId" TEXT NOT NULL,
    "bankConnectionId" TEXT NOT NULL,
    "providerKind" TEXT NOT NULL,
    "institutionName" TEXT NOT NULL,
    "lastSyncedAt" TIMESTAMP(3) NOT NULL,
    "recordedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "treasury_cash_positions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "treasury_liquidity_positions" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "legalEntityId" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "amount" DECIMAL(38,12) NOT NULL,
    "percentageOfTotal" DOUBLE PRECISION NOT NULL,
    "daysToLiquidate" INTEGER NOT NULL,
    "instruments" JSONB NOT NULL,
    "lastCalculatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "treasury_liquidity_positions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "treasury_cash_pools" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "poolType" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "memberAccounts" JSONB NOT NULL,
    "totalBalance" DECIMAL(38,12) NOT NULL,
    "availableBalance" DECIMAL(38,12) NOT NULL,
    "targetUtilization" DOUBLE PRECISION NOT NULL,
    "currentUtilization" DOUBLE PRECISION NOT NULL,
    "interestRate" DOUBLE PRECISION,
    "notionalValue" DECIMAL(38,12),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "treasury_cash_pools_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "treasury_cash_movements" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "sourceLegalEntityId" TEXT NOT NULL,
    "targetLegalEntityId" TEXT NOT NULL,
    "sourceAccountId" TEXT NOT NULL,
    "targetAccountId" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "amount" DECIMAL(38,12) NOT NULL,
    "fundingType" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "approvalRequired" BOOLEAN NOT NULL DEFAULT false,
    "approvedById" TEXT,
    "executedAt" TIMESTAMP(3),
    "requestedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),
    "failureReason" TEXT,
    "referenceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "treasury_cash_movements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "treasury_cash_forecasts" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "legalEntityId" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "horizon" TEXT NOT NULL,
    "confidence" TEXT NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL,
    "validFrom" TIMESTAMP(3) NOT NULL,
    "validTo" TIMESTAMP(3) NOT NULL,
    "predictedInflows" JSONB NOT NULL,
    "predictedOutflows" JSONB NOT NULL,
    "netPrediction" DECIMAL(38,12) NOT NULL,
    "openingBalance" DECIMAL(38,12) NOT NULL,
    "closingBalance" DECIMAL(38,12) NOT NULL,
    "minimumProjectedBalance" DECIMAL(38,12) NOT NULL,
    "maximumProjectedBalance" DECIMAL(38,12) NOT NULL,
    "keyRisks" TEXT[],
    "keyAssumptions" TEXT[],
    "aiConfidenceScore" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "treasury_cash_forecasts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "treasury_funding_requests" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "sourceLegalEntityId" TEXT NOT NULL,
    "targetLegalEntityId" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "requestedAmount" DECIMAL(38,12) NOT NULL,
    "approvedAmount" DECIMAL(38,12),
    "fundingType" TEXT NOT NULL,
    "priority" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "requestedById" TEXT NOT NULL,
    "approvedById" TEXT,
    "requiredByDate" TIMESTAMP(3) NOT NULL,
    "approvedAt" TIMESTAMP(3),
    "executedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "treasury_funding_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "treasury_investment_buckets" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "legalEntityId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "totalAllocated" DECIMAL(38,12) NOT NULL,
    "currentValue" DECIMAL(38,12) NOT NULL,
    "availableForInvestment" DECIMAL(38,12) NOT NULL,
    "strategy" TEXT NOT NULL,
    "holdings" JSONB NOT NULL,
    "maturityProfile" JSONB NOT NULL,
    "restrictions" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "treasury_investment_buckets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "treasury_restricted_cash" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "legalEntityId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "totalAmount" DECIMAL(38,12) NOT NULL,
    "restrictionType" TEXT NOT NULL,
    "restrictionDescription" TEXT NOT NULL,
    "counterparty" TEXT NOT NULL,
    "releaseDate" TIMESTAMP(3),
    "isReleased" BOOLEAN NOT NULL DEFAULT false,
    "regulatoryReference" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "treasury_restricted_cash_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "treasury_working_capitals" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "legalEntityId" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "currentAssets" DECIMAL(38,12) NOT NULL,
    "currentLiabilities" DECIMAL(38,12) NOT NULL,
    "netWorkingCapital" DECIMAL(38,12) NOT NULL,
    "currentRatio" DOUBLE PRECISION NOT NULL,
    "quickRatio" DOUBLE PRECISION NOT NULL,
    "cashConversionCycleDays" INTEGER NOT NULL,
    "accountsReceivable" DECIMAL(38,12) NOT NULL,
    "accountsPayable" DECIMAL(38,12) NOT NULL,
    "inventory" DECIMAL(38,12) NOT NULL,
    "calculatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "treasury_working_capitals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "treasury_fx_exposures" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "legalEntityId" TEXT NOT NULL,
    "sourceCurrency" TEXT NOT NULL,
    "targetCurrency" TEXT NOT NULL,
    "exposureAmount" DECIMAL(38,12) NOT NULL,
    "exposureDirection" TEXT NOT NULL,
    "currentRate" DECIMAL(38,12) NOT NULL,
    "previousRate" DECIMAL(38,12) NOT NULL,
    "rateChange" DOUBLE PRECISION NOT NULL,
    "unrealizedPnl" DECIMAL(38,12) NOT NULL,
    "realizedPnl" DECIMAL(38,12) NOT NULL,
    "hedgeStatus" TEXT NOT NULL,
    "hedgeInstrument" TEXT,
    "policyLimit" DECIMAL(38,12),
    "breachLimit" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "treasury_fx_exposures_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "treasury_counterparty_risks" (
    "counterpartyId" TEXT NOT NULL,
    "counterpartyName" TEXT NOT NULL,
    "counterpartyType" TEXT NOT NULL,
    "creditRating" TEXT NOT NULL,
    "exposureAmount" DECIMAL(38,12) NOT NULL,
    "exposureLimit" DECIMAL(38,12) NOT NULL,
    "utilizationPercent" DOUBLE PRECISION NOT NULL,
    "collateralHeld" DECIMAL(38,12) NOT NULL,
    "daysOverLimit" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "lastReviewDate" TIMESTAMP(3) NOT NULL,
    "nextReviewDate" TIMESTAMP(3) NOT NULL,
    "riskScore" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "treasury_counterparty_risks_pkey" PRIMARY KEY ("counterpartyId")
);

-- CreateTable
CREATE TABLE "treasury_cash_policies" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "policyType" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "legalEntityId" TEXT,
    "minimumBalance" DECIMAL(38,12),
    "targetBalance" DECIMAL(38,12),
    "maximumBalance" DECIMAL(38,12),
    "liquidityBufferPercent" DOUBLE PRECISION NOT NULL,
    "concentrationLimit" DECIMAL(38,12) NOT NULL,
    "counterpartyLimit" DECIMAL(38,12) NOT NULL,
    "investmentLimit" DECIMAL(38,12) NOT NULL,
    "rules" JSONB NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "treasury_cash_policies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "treasury_policies" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "policies" JSONB NOT NULL,
    "approvalMatrix" JSONB NOT NULL,
    "reportingSchedule" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "effectiveTo" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "treasury_policies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "treasury_alerts" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "legalEntityId" TEXT,
    "severity" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "acknowledged" BOOLEAN NOT NULL DEFAULT false,
    "acknowledgedById" TEXT,
    "acknowledgedAt" TIMESTAMP(3),
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "resolvedById" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "treasury_alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "treasury_snapshots" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "legalEntityId" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "recordedAt" TIMESTAMP(3) NOT NULL,
    "totalCash" DECIMAL(38,12) NOT NULL,
    "availableCash" DECIMAL(38,12) NOT NULL,
    "restrictedCash" DECIMAL(38,12) NOT NULL,
    "idleCash" DECIMAL(38,12) NOT NULL,
    "netLiquidity" DECIMAL(38,12) NOT NULL,
    "workingCapital" JSONB,
    "positionsByCurrency" JSONB NOT NULL,
    "liquidityByCategory" JSONB NOT NULL,
    "cashByClassification" JSONB NOT NULL,
    "totalExposure" INTEGER NOT NULL,
    "openFundingRequests" INTEGER NOT NULL,
    "activePools" INTEGER NOT NULL,
    "policyViolations" INTEGER NOT NULL,
    "alerts" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "treasury_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "treasury_cash_positions_companyId_legalEntityId_idx" ON "treasury_cash_positions"("companyId", "legalEntityId");

-- CreateIndex
CREATE INDEX "treasury_cash_positions_companyId_region_idx" ON "treasury_cash_positions"("companyId", "region");

-- CreateIndex
CREATE INDEX "treasury_cash_positions_companyId_currency_idx" ON "treasury_cash_positions"("companyId", "currency");

-- CreateIndex
CREATE INDEX "treasury_liquidity_positions_companyId_legalEntityId_idx" ON "treasury_liquidity_positions"("companyId", "legalEntityId");

-- CreateIndex
CREATE INDEX "treasury_liquidity_positions_companyId_category_idx" ON "treasury_liquidity_positions"("companyId", "category");

-- CreateIndex
CREATE INDEX "treasury_cash_pools_companyId_poolType_idx" ON "treasury_cash_pools"("companyId", "poolType");

-- CreateIndex
CREATE UNIQUE INDEX "treasury_cash_pools_companyId_name_key" ON "treasury_cash_pools"("companyId", "name");

-- CreateIndex
CREATE INDEX "treasury_cash_movements_companyId_status_idx" ON "treasury_cash_movements"("companyId", "status");

-- CreateIndex
CREATE INDEX "treasury_cash_movements_companyId_fundingType_idx" ON "treasury_cash_movements"("companyId", "fundingType");

-- CreateIndex
CREATE INDEX "treasury_cash_movements_companyId_requestedAt_idx" ON "treasury_cash_movements"("companyId", "requestedAt");

-- CreateIndex
CREATE INDEX "treasury_cash_forecasts_companyId_legalEntityId_idx" ON "treasury_cash_forecasts"("companyId", "legalEntityId");

-- CreateIndex
CREATE INDEX "treasury_cash_forecasts_companyId_horizon_idx" ON "treasury_cash_forecasts"("companyId", "horizon");

-- CreateIndex
CREATE INDEX "treasury_cash_forecasts_companyId_generatedAt_idx" ON "treasury_cash_forecasts"("companyId", "generatedAt");

-- CreateIndex
CREATE INDEX "treasury_funding_requests_companyId_status_idx" ON "treasury_funding_requests"("companyId", "status");

-- CreateIndex
CREATE INDEX "treasury_funding_requests_companyId_fundingType_idx" ON "treasury_funding_requests"("companyId", "fundingType");

-- CreateIndex
CREATE INDEX "treasury_funding_requests_companyId_requiredByDate_idx" ON "treasury_funding_requests"("companyId", "requiredByDate");

-- CreateIndex
CREATE INDEX "treasury_investment_buckets_companyId_legalEntityId_idx" ON "treasury_investment_buckets"("companyId", "legalEntityId");

-- CreateIndex
CREATE UNIQUE INDEX "treasury_investment_buckets_companyId_name_key" ON "treasury_investment_buckets"("companyId", "name");

-- CreateIndex
CREATE INDEX "treasury_restricted_cash_companyId_legalEntityId_idx" ON "treasury_restricted_cash"("companyId", "legalEntityId");

-- CreateIndex
CREATE INDEX "treasury_restricted_cash_companyId_isReleased_idx" ON "treasury_restricted_cash"("companyId", "isReleased");

-- CreateIndex
CREATE INDEX "treasury_working_capitals_companyId_legalEntityId_idx" ON "treasury_working_capitals"("companyId", "legalEntityId");

-- CreateIndex
CREATE INDEX "treasury_fx_exposures_companyId_sourceCurrency_targetCurren_idx" ON "treasury_fx_exposures"("companyId", "sourceCurrency", "targetCurrency");

-- CreateIndex
CREATE INDEX "treasury_fx_exposures_companyId_hedgeStatus_idx" ON "treasury_fx_exposures"("companyId", "hedgeStatus");

-- CreateIndex
CREATE INDEX "treasury_counterparty_risks_status_idx" ON "treasury_counterparty_risks"("status");

-- CreateIndex
CREATE INDEX "treasury_counterparty_risks_riskScore_idx" ON "treasury_counterparty_risks"("riskScore");

-- CreateIndex
CREATE INDEX "treasury_cash_policies_companyId_policyType_idx" ON "treasury_cash_policies"("companyId", "policyType");

-- CreateIndex
CREATE UNIQUE INDEX "treasury_cash_policies_companyId_name_key" ON "treasury_cash_policies"("companyId", "name");

-- CreateIndex
CREATE INDEX "treasury_policies_companyId_version_idx" ON "treasury_policies"("companyId", "version");

-- CreateIndex
CREATE UNIQUE INDEX "treasury_policies_companyId_name_key" ON "treasury_policies"("companyId", "name");

-- CreateIndex
CREATE INDEX "treasury_alerts_companyId_severity_idx" ON "treasury_alerts"("companyId", "severity");

-- CreateIndex
CREATE INDEX "treasury_alerts_companyId_resolved_idx" ON "treasury_alerts"("companyId", "resolved");

-- CreateIndex
CREATE INDEX "treasury_alerts_companyId_createdAt_idx" ON "treasury_alerts"("companyId", "createdAt");

-- CreateIndex
CREATE INDEX "treasury_snapshots_companyId_legalEntityId_idx" ON "treasury_snapshots"("companyId", "legalEntityId");

-- CreateIndex
CREATE INDEX "treasury_snapshots_companyId_recordedAt_idx" ON "treasury_snapshots"("companyId", "recordedAt");

-- CreateIndex
CREATE INDEX "Account_userId_idx" ON "Account"("userId");

-- CreateIndex
CREATE INDEX "LedgerEntry_walletId_idx" ON "LedgerEntry"("walletId");

-- CreateIndex
CREATE INDEX "RolePermission_roleId_idx" ON "RolePermission"("roleId");

-- CreateIndex
CREATE INDEX "RolePermission_permissionId_idx" ON "RolePermission"("permissionId");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE INDEX "Transaction_companyId_status_createdAt_idx" ON "Transaction"("companyId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "Transaction_status_idx" ON "Transaction"("status");

-- CreateIndex
CREATE INDEX "TransactionApproval_transactionId_status_idx" ON "TransactionApproval"("transactionId", "status");

-- CreateIndex
CREATE INDEX "TransactionApproval_companyId_status_createdAt_idx" ON "TransactionApproval"("companyId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "UserRole_roleId_idx" ON "UserRole"("roleId");

-- CreateIndex
CREATE INDEX "workflow_events_companyId_idx" ON "workflow_events"("companyId");

-- CreateIndex
CREATE INDEX "workflow_events_companyId_timestamp_idx" ON "workflow_events"("companyId", "timestamp");

-- CreateIndex
CREATE INDEX "workflow_instances_companyId_status_createdAt_idx" ON "workflow_instances"("companyId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "workflow_step_instances_companyId_idx" ON "workflow_step_instances"("companyId");

-- CreateIndex
CREATE INDEX "workflow_step_instances_companyId_status_idx" ON "workflow_step_instances"("companyId", "status");

-- AddForeignKey
ALTER TABLE "treasury_cash_positions" ADD CONSTRAINT "treasury_cash_positions_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "treasury_liquidity_positions" ADD CONSTRAINT "treasury_liquidity_positions_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "treasury_cash_pools" ADD CONSTRAINT "treasury_cash_pools_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "treasury_cash_movements" ADD CONSTRAINT "treasury_cash_movements_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "treasury_cash_forecasts" ADD CONSTRAINT "treasury_cash_forecasts_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "treasury_funding_requests" ADD CONSTRAINT "treasury_funding_requests_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "treasury_investment_buckets" ADD CONSTRAINT "treasury_investment_buckets_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "treasury_restricted_cash" ADD CONSTRAINT "treasury_restricted_cash_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "treasury_working_capitals" ADD CONSTRAINT "treasury_working_capitals_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "treasury_fx_exposures" ADD CONSTRAINT "treasury_fx_exposures_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "treasury_cash_policies" ADD CONSTRAINT "treasury_cash_policies_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "treasury_policies" ADD CONSTRAINT "treasury_policies_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "treasury_alerts" ADD CONSTRAINT "treasury_alerts_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "treasury_snapshots" ADD CONSTRAINT "treasury_snapshots_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
