-- CreateTable
CREATE TABLE "governance_frameworks" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL DEFAULT 'internal',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "version" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "governance_frameworks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "governance_framework_policies" (
    "id" TEXT NOT NULL,
    "frameworkId" TEXT NOT NULL,
    "policyId" TEXT NOT NULL,
    "mappingType" TEXT NOT NULL DEFAULT 'MANDATORY',

    CONSTRAINT "governance_framework_policies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "policy_violations" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "policyId" TEXT,
    "sourceModule" TEXT NOT NULL,
    "sourceId" TEXT,
    "severity" TEXT NOT NULL DEFAULT 'MEDIUM',
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "title" TEXT NOT NULL,
    "description" TEXT,
    "entityType" TEXT,
    "entityId" TEXT,
    "action" TEXT,
    "details" JSONB,
    "resolvedById" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "resolution" TEXT,
    "exceptionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "policy_violations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "policy_exceptions" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "policyId" TEXT,
    "ruleId" TEXT,
    "grantedById" TEXT,
    "grantedToId" TEXT,
    "reason" TEXT NOT NULL,
    "scope" TEXT NOT NULL DEFAULT 'GLOBAL',
    "scopeId" TEXT,
    "criteria" JSONB,
    "expiresAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "policy_exceptions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "governance_frameworks_companyId_status_idx" ON "governance_frameworks"("companyId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "governance_frameworks_companyId_name_key" ON "governance_frameworks"("companyId", "name");

-- CreateIndex
CREATE INDEX "governance_framework_policies_frameworkId_idx" ON "governance_framework_policies"("frameworkId");

-- CreateIndex
CREATE UNIQUE INDEX "governance_framework_policies_frameworkId_policyId_key" ON "governance_framework_policies"("frameworkId", "policyId");

-- CreateIndex
CREATE INDEX "policy_violations_companyId_status_idx" ON "policy_violations"("companyId", "status");

-- CreateIndex
CREATE INDEX "policy_violations_companyId_severity_idx" ON "policy_violations"("companyId", "severity");

-- CreateIndex
CREATE INDEX "policy_violations_companyId_createdAt_idx" ON "policy_violations"("companyId", "createdAt");

-- CreateIndex
CREATE INDEX "policy_violations_policyId_idx" ON "policy_violations"("policyId");

-- CreateIndex
CREATE INDEX "policy_exceptions_companyId_status_idx" ON "policy_exceptions"("companyId", "status");

-- CreateIndex
CREATE INDEX "policy_exceptions_policyId_idx" ON "policy_exceptions"("policyId");

-- AddForeignKey
ALTER TABLE "governance_frameworks" ADD CONSTRAINT "governance_frameworks_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "governance_framework_policies" ADD CONSTRAINT "governance_framework_policies_frameworkId_fkey" FOREIGN KEY ("frameworkId") REFERENCES "governance_frameworks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "policy_violations" ADD CONSTRAINT "policy_violations_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "policy_exceptions" ADD CONSTRAINT "policy_exceptions_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
