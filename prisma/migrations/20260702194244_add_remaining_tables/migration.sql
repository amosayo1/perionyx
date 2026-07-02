-- CreateTable
CREATE TABLE "external_accounts" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "itemId" TEXT,
    "institutionName" TEXT,
    "institutionId" TEXT,
    "name" TEXT NOT NULL,
    "officialName" TEXT,
    "type" TEXT,
    "subtype" TEXT,
    "mask" TEXT,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "treasuryAccountId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "external_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "external_transactions" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "externalAccountId" TEXT NOT NULL,
    "amount" DECIMAL(38,12) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "description" TEXT,
    "merchantName" TEXT,
    "category" TEXT,
    "categoryId" TEXT,
    "pending" BOOLEAN NOT NULL DEFAULT false,
    "transactionDate" TIMESTAMP(3),
    "postDate" TIMESTAMP(3),
    "paymentChannel" TEXT,
    "transactionType" TEXT,
    "isoCurrencyCode" TEXT,
    "pendingExternalId" TEXT,
    "reconciledTransactionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "external_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "external_balances" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "externalAccountId" TEXT NOT NULL,
    "current" DECIMAL(38,12) NOT NULL,
    "available" DECIMAL(38,12),
    "limit" DECIMAL(38,12),
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "external_balances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sync_logs" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "connectorId" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "syncType" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "externalAccountId" TEXT,
    "recordsProcessed" INTEGER NOT NULL DEFAULT 0,
    "recordsCreated" INTEGER NOT NULL DEFAULT 0,
    "recordsUpdated" INTEGER NOT NULL DEFAULT 0,
    "recordsFailed" INTEGER NOT NULL DEFAULT 0,
    "errorMessage" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "sync_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounting_connections" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "connectorId" TEXT NOT NULL,
    "realmId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT,
    "tokenExpiresAt" TIMESTAMP(3),
    "syncToken" TEXT,
    "connectedAt" TIMESTAMP(3) NOT NULL,
    "lastSyncAt" TIMESTAMP(3),

    CONSTRAINT "accounting_connections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chart_of_accounts" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "accountingConnectionId" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "accountType" TEXT NOT NULL,
    "accountSubType" TEXT,
    "classification" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "balance" DECIMAL(38,12) NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "description" TEXT,

    CONSTRAINT "chart_of_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounting_vendors" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "accountingConnectionId" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "companyName" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "address" JSONB,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "balance" DECIMAL(38,12) NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'USD',

    CONSTRAINT "accounting_vendors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounting_customers" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "accountingConnectionId" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "companyName" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "address" JSONB,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "balance" DECIMAL(38,12) NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'USD',

    CONSTRAINT "accounting_customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounting_invoices" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "accountingConnectionId" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "docNumber" TEXT,
    "customerId" TEXT,
    "customerName" TEXT,
    "totalAmount" DECIMAL(38,12) NOT NULL,
    "balance" DECIMAL(38,12) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" TEXT NOT NULL,
    "dueDate" TIMESTAMP(3),
    "transactionDate" TIMESTAMP(3),
    "emailStatus" TEXT,
    "deliveryInfo" JSONB,
    "lineItems" JSONB,
    "metadata" JSONB,

    CONSTRAINT "accounting_invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reconciliation_matches" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "externalTransactionId" TEXT NOT NULL,
    "internalTransactionId" TEXT,
    "confidenceScore" DOUBLE PRECISION NOT NULL,
    "matchType" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "matchReason" TEXT,
    "approvedByUserId" TEXT,
    "approvedAt" TIMESTAMP(3),
    "rejectedAt" TIMESTAMP(3),
    "rejectedReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reconciliation_matches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auto_match_rules" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "criteria" JSONB NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "auto_match_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_usage" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "userId" TEXT,
    "provider" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "feature" TEXT NOT NULL,
    "promptTokens" INTEGER NOT NULL,
    "completionTokens" INTEGER NOT NULL,
    "totalTokens" INTEGER NOT NULL,
    "estimatedCost" DECIMAL(18,10) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_usage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_provider_health" (
    "id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "latency" INTEGER,
    "error" TEXT,
    "checkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_provider_health_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "external_accounts_companyId_source_idx" ON "external_accounts"("companyId", "source");

-- CreateIndex
CREATE INDEX "external_accounts_companyId_treasuryAccountId_idx" ON "external_accounts"("companyId", "treasuryAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "external_accounts_companyId_externalId_source_key" ON "external_accounts"("companyId", "externalId", "source");

-- CreateIndex
CREATE INDEX "external_transactions_companyId_externalAccountId_idx" ON "external_transactions"("companyId", "externalAccountId");

-- CreateIndex
CREATE INDEX "external_transactions_companyId_transactionDate_idx" ON "external_transactions"("companyId", "transactionDate");

-- CreateIndex
CREATE INDEX "external_transactions_companyId_reconciledTransactionId_idx" ON "external_transactions"("companyId", "reconciledTransactionId");

-- CreateIndex
CREATE UNIQUE INDEX "external_transactions_companyId_externalId_source_key" ON "external_transactions"("companyId", "externalId", "source");

-- CreateIndex
CREATE INDEX "external_balances_companyId_externalAccountId_idx" ON "external_balances"("companyId", "externalAccountId");

-- CreateIndex
CREATE INDEX "external_balances_companyId_recordedAt_idx" ON "external_balances"("companyId", "recordedAt");

-- CreateIndex
CREATE INDEX "sync_logs_companyId_connectorId_idx" ON "sync_logs"("companyId", "connectorId");

-- CreateIndex
CREATE INDEX "sync_logs_companyId_syncType_idx" ON "sync_logs"("companyId", "syncType");

-- CreateIndex
CREATE INDEX "sync_logs_companyId_startedAt_idx" ON "sync_logs"("companyId", "startedAt");

-- CreateIndex
CREATE INDEX "accounting_connections_companyId_idx" ON "accounting_connections"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "accounting_connections_companyId_realmId_key" ON "accounting_connections"("companyId", "realmId");

-- CreateIndex
CREATE INDEX "chart_of_accounts_companyId_accountType_idx" ON "chart_of_accounts"("companyId", "accountType");

-- CreateIndex
CREATE UNIQUE INDEX "chart_of_accounts_companyId_externalId_key" ON "chart_of_accounts"("companyId", "externalId");

-- CreateIndex
CREATE INDEX "accounting_vendors_companyId_idx" ON "accounting_vendors"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "accounting_vendors_companyId_externalId_key" ON "accounting_vendors"("companyId", "externalId");

-- CreateIndex
CREATE INDEX "accounting_customers_companyId_idx" ON "accounting_customers"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "accounting_customers_companyId_externalId_key" ON "accounting_customers"("companyId", "externalId");

-- CreateIndex
CREATE INDEX "accounting_invoices_companyId_status_idx" ON "accounting_invoices"("companyId", "status");

-- CreateIndex
CREATE INDEX "accounting_invoices_companyId_dueDate_idx" ON "accounting_invoices"("companyId", "dueDate");

-- CreateIndex
CREATE UNIQUE INDEX "accounting_invoices_companyId_externalId_key" ON "accounting_invoices"("companyId", "externalId");

-- CreateIndex
CREATE INDEX "reconciliation_matches_companyId_status_idx" ON "reconciliation_matches"("companyId", "status");

-- CreateIndex
CREATE INDEX "reconciliation_matches_companyId_confidenceScore_idx" ON "reconciliation_matches"("companyId", "confidenceScore");

-- CreateIndex
CREATE INDEX "reconciliation_matches_companyId_externalTransactionId_idx" ON "reconciliation_matches"("companyId", "externalTransactionId");

-- CreateIndex
CREATE UNIQUE INDEX "reconciliation_matches_companyId_externalTransactionId_inte_key" ON "reconciliation_matches"("companyId", "externalTransactionId", "internalTransactionId");

-- CreateIndex
CREATE INDEX "auto_match_rules_companyId_enabled_idx" ON "auto_match_rules"("companyId", "enabled");

-- CreateIndex
CREATE INDEX "ai_usage_companyId_createdAt_idx" ON "ai_usage"("companyId", "createdAt");

-- CreateIndex
CREATE INDEX "ai_usage_provider_createdAt_idx" ON "ai_usage"("provider", "createdAt");

-- CreateIndex
CREATE INDEX "ai_usage_model_createdAt_idx" ON "ai_usage"("model", "createdAt");

-- CreateIndex
CREATE INDEX "ai_provider_health_provider_checkedAt_idx" ON "ai_provider_health"("provider", "checkedAt");

-- AddForeignKey
ALTER TABLE "external_accounts" ADD CONSTRAINT "external_accounts_treasuryAccountId_fkey" FOREIGN KEY ("treasuryAccountId") REFERENCES "treasury_accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "external_accounts" ADD CONSTRAINT "external_accounts_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "external_transactions" ADD CONSTRAINT "external_transactions_externalAccountId_fkey" FOREIGN KEY ("externalAccountId") REFERENCES "external_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "external_transactions" ADD CONSTRAINT "external_transactions_reconciledTransactionId_fkey" FOREIGN KEY ("reconciledTransactionId") REFERENCES "Transaction"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "external_transactions" ADD CONSTRAINT "external_transactions_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "external_balances" ADD CONSTRAINT "external_balances_externalAccountId_fkey" FOREIGN KEY ("externalAccountId") REFERENCES "external_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "external_balances" ADD CONSTRAINT "external_balances_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sync_logs" ADD CONSTRAINT "sync_logs_externalAccountId_fkey" FOREIGN KEY ("externalAccountId") REFERENCES "external_accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sync_logs" ADD CONSTRAINT "sync_logs_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accounting_connections" ADD CONSTRAINT "accounting_connections_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chart_of_accounts" ADD CONSTRAINT "chart_of_accounts_accountingConnectionId_fkey" FOREIGN KEY ("accountingConnectionId") REFERENCES "accounting_connections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chart_of_accounts" ADD CONSTRAINT "chart_of_accounts_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accounting_vendors" ADD CONSTRAINT "accounting_vendors_accountingConnectionId_fkey" FOREIGN KEY ("accountingConnectionId") REFERENCES "accounting_connections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accounting_vendors" ADD CONSTRAINT "accounting_vendors_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accounting_customers" ADD CONSTRAINT "accounting_customers_accountingConnectionId_fkey" FOREIGN KEY ("accountingConnectionId") REFERENCES "accounting_connections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accounting_customers" ADD CONSTRAINT "accounting_customers_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accounting_invoices" ADD CONSTRAINT "accounting_invoices_accountingConnectionId_fkey" FOREIGN KEY ("accountingConnectionId") REFERENCES "accounting_connections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accounting_invoices" ADD CONSTRAINT "accounting_invoices_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reconciliation_matches" ADD CONSTRAINT "reconciliation_matches_externalTransactionId_fkey" FOREIGN KEY ("externalTransactionId") REFERENCES "external_transactions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reconciliation_matches" ADD CONSTRAINT "reconciliation_matches_internalTransactionId_fkey" FOREIGN KEY ("internalTransactionId") REFERENCES "Transaction"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reconciliation_matches" ADD CONSTRAINT "reconciliation_matches_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auto_match_rules" ADD CONSTRAINT "auto_match_rules_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
