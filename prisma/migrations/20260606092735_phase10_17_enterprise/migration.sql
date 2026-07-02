-- CreateEnum
CREATE TYPE "ReconciliationRunStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "AccountControlType" AS ENUM ('SPENDING_LIMIT', 'VELOCITY_LIMIT', 'DEBIT_BLOCK', 'CREDIT_BLOCK', 'ALLOW_LIST', 'BLOCK_LIST');

-- CreateEnum
CREATE TYPE "AccountControlScope" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY', 'PER_TRANSACTION');

-- CreateEnum
CREATE TYPE "InternalTransferStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PolicyType" AS ENUM ('APPROVAL', 'TRANSACTION_LIMIT', 'COMPLIANCE', 'RISK', 'CUSTOM');

-- CreateEnum
CREATE TYPE "PolicyRuleOperator" AS ENUM ('EQUALS', 'NOT_EQUALS', 'GREATER_THAN', 'LESS_THAN', 'BETWEEN', 'IN', 'NOT_IN', 'CONTAINS', 'MATCHES');

-- CreateEnum
CREATE TYPE "RiskAlertSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "RiskAlertStatus" AS ENUM ('OPEN', 'ACKNOWLEDGED', 'INVESTIGATING', 'RESOLVED', 'DISMISSED');

-- CreateEnum
CREATE TYPE "RiskAlertCategory" AS ENUM ('BALANCE_ANOMALY', 'FAILED_APPROVAL', 'FAILED_RECONCILIATION', 'CONNECTOR_FAILURE', 'POLICY_VIOLATION', 'SUSPICIOUS_ACTIVITY', 'SYSTEM_ERROR', 'COMPLIANCE');

-- CreateEnum
CREATE TYPE "CalendarEventType" AS ENUM ('APPROVAL_DEADLINE', 'RECONCILIATION', 'SETTLEMENT', 'CONNECTOR_SCHEDULE', 'AUDIT', 'MANUAL');

-- CreateTable
CREATE TABLE "ReconciliationRun" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "status" "ReconciliationRunStatus" NOT NULL DEFAULT 'PENDING',
    "type" TEXT NOT NULL DEFAULT 'FULL',
    "summary" JSONB,
    "metadata" JSONB,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReconciliationRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReconciliationException" (
    "id" TEXT NOT NULL,
    "runId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'ERROR',
    "resourceType" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "details" JSONB,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "resolvedAt" TIMESTAMP(3),
    "resolvedByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReconciliationException_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReconciliationReport" (
    "id" TEXT NOT NULL,
    "runId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'FULL',
    "format" TEXT NOT NULL DEFAULT 'JSON',
    "data" JSONB NOT NULL,
    "totalIssues" INTEGER NOT NULL DEFAULT 0,
    "resolvedIssues" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReconciliationReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "treasury_accounts" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "balance" DECIMAL(38,12) NOT NULL DEFAULT 0,
    "description" TEXT,
    "accountNumber" TEXT,
    "routingInfo" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "treasury_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AccountControl" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "type" "AccountControlType" NOT NULL,
    "scope" "AccountControlScope" NOT NULL DEFAULT 'PER_TRANSACTION',
    "value" DECIMAL(38,12) NOT NULL,
    "description" TEXT,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AccountControl_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InternalTransfer" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "fromAccountId" TEXT NOT NULL,
    "toAccountId" TEXT NOT NULL,
    "amount" DECIMAL(38,12) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" "InternalTransferStatus" NOT NULL DEFAULT 'PENDING',
    "reference" TEXT,
    "description" TEXT,
    "failureReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InternalTransfer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Policy" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" "PolicyType" NOT NULL DEFAULT 'APPROVAL',
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "priority" INTEGER NOT NULL DEFAULT 100,
    "appliesToTransactionTypes" TEXT[],
    "appliesToConnectorTypes" TEXT[],
    "appliesToCurrencies" TEXT[],
    "minAmount" DECIMAL(38,12),
    "maxAmount" DECIMAL(38,12),
    "actionType" TEXT NOT NULL DEFAULT 'BLOCK',
    "actionConfig" JSONB,
    "createdByUserId" TEXT,
    "lastEvaluatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Policy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PolicyRule" (
    "id" TEXT NOT NULL,
    "policyId" TEXT NOT NULL,
    "field" TEXT NOT NULL,
    "operator" "PolicyRuleOperator" NOT NULL,
    "value" TEXT NOT NULL,
    "negate" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "PolicyRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PolicyTestResult" (
    "id" TEXT NOT NULL,
    "policyId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "input" JSONB NOT NULL,
    "matched" BOOLEAN NOT NULL,
    "action" TEXT,
    "details" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PolicyTestResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RiskAlert" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "category" "RiskAlertCategory" NOT NULL,
    "severity" "RiskAlertSeverity" NOT NULL DEFAULT 'MEDIUM',
    "status" "RiskAlertStatus" NOT NULL DEFAULT 'OPEN',
    "title" TEXT NOT NULL,
    "description" TEXT,
    "source" TEXT,
    "resourceType" TEXT,
    "resourceId" TEXT,
    "metadata" JSONB,
    "acknowledgedByUserId" TEXT,
    "acknowledgedAt" TIMESTAMP(3),
    "resolvedByUserId" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RiskAlert_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RiskIncident" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "severity" "RiskAlertSeverity" NOT NULL DEFAULT 'MEDIUM',
    "status" "RiskAlertStatus" NOT NULL DEFAULT 'OPEN',
    "category" "RiskAlertCategory" NOT NULL,
    "alerts" TEXT[],
    "rootCause" TEXT,
    "resolution" TEXT,
    "timeline" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RiskIncident_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConnectorRun" (
    "id" TEXT NOT NULL,
    "connectorId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "event" TEXT NOT NULL,
    "input" JSONB,
    "output" JSONB,
    "error" TEXT,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConnectorRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConnectorEvent" (
    "id" TEXT NOT NULL,
    "runId" TEXT NOT NULL,
    "connectorId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "metadata" JSONB,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ConnectorEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CalendarEvent" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" "CalendarEventType" NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "allDay" BOOLEAN NOT NULL DEFAULT true,
    "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "referenceType" TEXT,
    "referenceId" TEXT,
    "metadata" JSONB,
    "createdByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CalendarEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ReconciliationRun_companyId_createdAt_idx" ON "ReconciliationRun"("companyId", "createdAt");

-- CreateIndex
CREATE INDEX "ReconciliationRun_companyId_status_idx" ON "ReconciliationRun"("companyId", "status");

-- CreateIndex
CREATE INDEX "ReconciliationException_runId_idx" ON "ReconciliationException"("runId");

-- CreateIndex
CREATE INDEX "ReconciliationException_companyId_resolved_idx" ON "ReconciliationException"("companyId", "resolved");

-- CreateIndex
CREATE INDEX "ReconciliationException_companyId_severity_idx" ON "ReconciliationException"("companyId", "severity");

-- CreateIndex
CREATE INDEX "ReconciliationReport_runId_idx" ON "ReconciliationReport"("runId");

-- CreateIndex
CREATE INDEX "ReconciliationReport_companyId_createdAt_idx" ON "ReconciliationReport"("companyId", "createdAt");

-- CreateIndex
CREATE INDEX "treasury_accounts_companyId_idx" ON "treasury_accounts"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "treasury_accounts_companyId_name_key" ON "treasury_accounts"("companyId", "name");

-- CreateIndex
CREATE INDEX "AccountControl_accountId_idx" ON "AccountControl"("accountId");

-- CreateIndex
CREATE INDEX "AccountControl_companyId_enabled_idx" ON "AccountControl"("companyId", "enabled");

-- CreateIndex
CREATE INDEX "InternalTransfer_companyId_idx" ON "InternalTransfer"("companyId");

-- CreateIndex
CREATE INDEX "InternalTransfer_fromAccountId_idx" ON "InternalTransfer"("fromAccountId");

-- CreateIndex
CREATE INDEX "InternalTransfer_toAccountId_idx" ON "InternalTransfer"("toAccountId");

-- CreateIndex
CREATE INDEX "InternalTransfer_status_idx" ON "InternalTransfer"("status");

-- CreateIndex
CREATE INDEX "Policy_companyId_enabled_priority_idx" ON "Policy"("companyId", "enabled", "priority");

-- CreateIndex
CREATE INDEX "Policy_companyId_type_idx" ON "Policy"("companyId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "Policy_companyId_name_key" ON "Policy"("companyId", "name");

-- CreateIndex
CREATE INDEX "PolicyRule_policyId_idx" ON "PolicyRule"("policyId");

-- CreateIndex
CREATE INDEX "PolicyTestResult_policyId_idx" ON "PolicyTestResult"("policyId");

-- CreateIndex
CREATE INDEX "PolicyTestResult_companyId_createdAt_idx" ON "PolicyTestResult"("companyId", "createdAt");

-- CreateIndex
CREATE INDEX "RiskAlert_companyId_status_idx" ON "RiskAlert"("companyId", "status");

-- CreateIndex
CREATE INDEX "RiskAlert_companyId_severity_idx" ON "RiskAlert"("companyId", "severity");

-- CreateIndex
CREATE INDEX "RiskAlert_companyId_category_idx" ON "RiskAlert"("companyId", "category");

-- CreateIndex
CREATE INDEX "RiskIncident_companyId_status_idx" ON "RiskIncident"("companyId", "status");

-- CreateIndex
CREATE INDEX "RiskIncident_companyId_severity_idx" ON "RiskIncident"("companyId", "severity");

-- CreateIndex
CREATE INDEX "ConnectorRun_connectorId_createdAt_idx" ON "ConnectorRun"("connectorId", "createdAt");

-- CreateIndex
CREATE INDEX "ConnectorRun_companyId_status_idx" ON "ConnectorRun"("companyId", "status");

-- CreateIndex
CREATE INDEX "ConnectorEvent_runId_idx" ON "ConnectorEvent"("runId");

-- CreateIndex
CREATE INDEX "ConnectorEvent_connectorId_timestamp_idx" ON "ConnectorEvent"("connectorId", "timestamp");

-- CreateIndex
CREATE INDEX "CalendarEvent_companyId_startDate_idx" ON "CalendarEvent"("companyId", "startDate");

-- CreateIndex
CREATE INDEX "CalendarEvent_companyId_type_idx" ON "CalendarEvent"("companyId", "type");

-- CreateIndex
CREATE INDEX "CalendarEvent_companyId_status_idx" ON "CalendarEvent"("companyId", "status");

-- AddForeignKey
ALTER TABLE "ReconciliationRun" ADD CONSTRAINT "ReconciliationRun_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReconciliationException" ADD CONSTRAINT "ReconciliationException_runId_fkey" FOREIGN KEY ("runId") REFERENCES "ReconciliationRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReconciliationException" ADD CONSTRAINT "ReconciliationException_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReconciliationReport" ADD CONSTRAINT "ReconciliationReport_runId_fkey" FOREIGN KEY ("runId") REFERENCES "ReconciliationRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReconciliationReport" ADD CONSTRAINT "ReconciliationReport_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "treasury_accounts" ADD CONSTRAINT "treasury_accounts_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountControl" ADD CONSTRAINT "AccountControl_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "treasury_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountControl" ADD CONSTRAINT "AccountControl_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InternalTransfer" ADD CONSTRAINT "InternalTransfer_fromAccountId_fkey" FOREIGN KEY ("fromAccountId") REFERENCES "treasury_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InternalTransfer" ADD CONSTRAINT "InternalTransfer_toAccountId_fkey" FOREIGN KEY ("toAccountId") REFERENCES "treasury_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InternalTransfer" ADD CONSTRAINT "InternalTransfer_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Policy" ADD CONSTRAINT "Policy_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PolicyRule" ADD CONSTRAINT "PolicyRule_policyId_fkey" FOREIGN KEY ("policyId") REFERENCES "Policy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PolicyTestResult" ADD CONSTRAINT "PolicyTestResult_policyId_fkey" FOREIGN KEY ("policyId") REFERENCES "Policy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PolicyTestResult" ADD CONSTRAINT "PolicyTestResult_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RiskAlert" ADD CONSTRAINT "RiskAlert_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RiskIncident" ADD CONSTRAINT "RiskIncident_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConnectorRun" ADD CONSTRAINT "ConnectorRun_connectorId_fkey" FOREIGN KEY ("connectorId") REFERENCES "ConnectorConfig"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConnectorRun" ADD CONSTRAINT "ConnectorRun_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConnectorEvent" ADD CONSTRAINT "ConnectorEvent_runId_fkey" FOREIGN KEY ("runId") REFERENCES "ConnectorRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConnectorEvent" ADD CONSTRAINT "ConnectorEvent_connectorId_fkey" FOREIGN KEY ("connectorId") REFERENCES "ConnectorConfig"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConnectorEvent" ADD CONSTRAINT "ConnectorEvent_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CalendarEvent" ADD CONSTRAINT "CalendarEvent_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
