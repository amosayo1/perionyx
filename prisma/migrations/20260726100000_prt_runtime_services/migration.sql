-- Phase 24.0B: Runtime Services
-- Shared enterprise services consumed by every Platform, Provider Driver,
-- AI Agent, Workflow, and Financial Domain.

-- ── Configuration ─────────────────────────────────────────────────────────

CREATE TYPE "RuntimeConfigScope" AS ENUM ('GLOBAL', 'ENVIRONMENT', 'TENANT', 'PROVIDER');
CREATE TYPE "RuntimeConfigStatus" AS ENUM ('ACTIVE', 'DEPRECATED', 'OVERRIDDEN', 'DELETED');

CREATE TABLE "RuntimeConfiguration" (
    "id" TEXT NOT NULL,
    "companyId" TEXT,
    "key" TEXT NOT NULL,
    "scope" "RuntimeConfigScope" NOT NULL,
    "value" JSONB NOT NULL,
    "environment" TEXT,
    "provider" TEXT,
    "status" "RuntimeConfigStatus" NOT NULL DEFAULT 'ACTIVE',
    "sensitive" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT,
    "tags" TEXT,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "schemaKey" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RuntimeConfiguration_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "RuntimeConfiguration_key_scope_companyId_environment_provide_key" ON "RuntimeConfiguration"("key", "scope", "companyId", "environment", "provider");
CREATE INDEX "RuntimeConfiguration_companyId_key_idx" ON "RuntimeConfiguration"("companyId", "key");
CREATE INDEX "RuntimeConfiguration_scope_idx" ON "RuntimeConfiguration"("scope");
CREATE INDEX "RuntimeConfiguration_companyId_scope_idx" ON "RuntimeConfiguration"("companyId", "scope");
CREATE INDEX "RuntimeConfiguration_status_idx" ON "RuntimeConfiguration"("status");
CREATE INDEX "RuntimeConfiguration_key_idx" ON "RuntimeConfiguration"("key");
CREATE INDEX "RuntimeConfiguration_companyId_idx" ON "RuntimeConfiguration"("companyId");

CREATE TABLE "RuntimeConfigurationVersion" (
    "id" TEXT NOT NULL,
    "configId" TEXT NOT NULL,
    "companyId" TEXT,
    "value" JSONB NOT NULL,
    "version" INTEGER NOT NULL,
    "changedBy" TEXT,
    "changeNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RuntimeConfigurationVersion_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "RuntimeConfigurationVersion_configId_idx" ON "RuntimeConfigurationVersion"("configId");
CREATE INDEX "RuntimeConfigurationVersion_companyId_configId_idx" ON "RuntimeConfigurationVersion"("companyId", "configId");
CREATE INDEX "RuntimeConfigurationVersion_createdAt_idx" ON "RuntimeConfigurationVersion"("createdAt");

-- ── Feature Flags ─────────────────────────────────────────────────────────

CREATE TYPE "RuntimeFeatureFlagStatus" AS ENUM ('ACTIVE', 'DISABLED', 'ARCHIVED');
CREATE TYPE "RuntimeFeatureFlagRollout" AS ENUM ('ALL', 'PERCENTAGE', 'TENANT', 'ENVIRONMENT');

CREATE TABLE "RuntimeFeatureFlag" (
    "id" TEXT NOT NULL,
    "companyId" TEXT,
    "key" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT,
    "rolloutStrategy" "RuntimeFeatureFlagRollout" NOT NULL DEFAULT 'ALL',
    "percentage" INTEGER,
    "allowedEnvs" TEXT,
    "allowedTenants" TEXT,
    "tags" TEXT,
    "status" "RuntimeFeatureFlagStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "ownerTeam" TEXT,
    "activatesAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RuntimeFeatureFlag_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "RuntimeFeatureFlag_key_key" ON "RuntimeFeatureFlag"("key");
CREATE INDEX "RuntimeFeatureFlag_companyId_idx" ON "RuntimeFeatureFlag"("companyId");
CREATE INDEX "RuntimeFeatureFlag_status_idx" ON "RuntimeFeatureFlag"("status");
CREATE INDEX "RuntimeFeatureFlag_tags_idx" ON "RuntimeFeatureFlag"("tags");
CREATE INDEX "RuntimeFeatureFlag_companyId_key_idx" ON "RuntimeFeatureFlag"("companyId", "key");

CREATE TABLE "RuntimeFeatureFlagOverride" (
    "id" TEXT NOT NULL,
    "flagId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL,
    "reason" TEXT,
    "enabledBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RuntimeFeatureFlagOverride_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "RuntimeFeatureFlagOverride_flagId_companyId_key" ON "RuntimeFeatureFlagOverride"("flagId", "companyId");
CREATE INDEX "RuntimeFeatureFlagOverride_flagId_idx" ON "RuntimeFeatureFlagOverride"("flagId");
CREATE INDEX "RuntimeFeatureFlagOverride_companyId_idx" ON "RuntimeFeatureFlagOverride"("companyId");

-- ── Secrets ───────────────────────────────────────────────────────────────

CREATE TYPE "RuntimeSecretProvider" AS ENUM ('ENVIRONMENT', 'VAULT', 'AWS_SECRETS', 'AZURE_KEYVAULT', 'GCP_SECRET_MANAGER');
CREATE TYPE "RuntimeSecretCategory" AS ENUM ('DATABASE', 'API_KEY', 'ENCRYPTION_KEY', 'OAUTH_TOKEN', 'WEBHOOK_SECRET', 'CERTIFICATE', 'SERVICE_ACCOUNT', 'LICENSE_KEY', 'OTHER');
CREATE TYPE "RuntimeSecretStatus" AS ENUM ('ACTIVE', 'ROTATING', 'DEPRECATED', 'DELETED');

CREATE TABLE "RuntimeSecretMetadata" (
    "id" TEXT NOT NULL,
    "companyId" TEXT,
    "name" TEXT NOT NULL,
    "category" "RuntimeSecretCategory" NOT NULL DEFAULT 'API_KEY',
    "provider" "RuntimeSecretProvider" NOT NULL DEFAULT 'ENVIRONMENT',
    "providerKey" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "rotationIntervalDays" INTEGER,
    "nextRotationAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "ownerTeam" TEXT,
    "ownerUserId" TEXT,
    "status" "RuntimeSecretStatus" NOT NULL DEFAULT 'ACTIVE',
    "lastAccessedAt" TIMESTAMP(3),
    "lastAccessedBy" TEXT,
    "lastRotatedAt" TIMESTAMP(3),
    "lastRotatedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RuntimeSecretMetadata_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "RuntimeSecretMetadata_companyId_name_key" ON "RuntimeSecretMetadata"("companyId", "name");
CREATE INDEX "RuntimeSecretMetadata_companyId_idx" ON "RuntimeSecretMetadata"("companyId");
CREATE INDEX "RuntimeSecretMetadata_name_idx" ON "RuntimeSecretMetadata"("name");
CREATE INDEX "RuntimeSecretMetadata_provider_idx" ON "RuntimeSecretMetadata"("provider");
CREATE INDEX "RuntimeSecretMetadata_status_idx" ON "RuntimeSecretMetadata"("status");
CREATE INDEX "RuntimeSecretMetadata_nextRotationAt_idx" ON "RuntimeSecretMetadata"("nextRotationAt");

CREATE TABLE "RuntimeSecretVersion" (
    "id" TEXT NOT NULL,
    "secretId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "valueHash" TEXT NOT NULL,
    "rotatedBy" TEXT,
    "rotatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reason" TEXT,
    "providerMetadata" JSONB,

    CONSTRAINT "RuntimeSecretVersion_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "RuntimeSecretVersion_secretId_version_key" ON "RuntimeSecretVersion"("secretId", "version");
CREATE INDEX "RuntimeSecretVersion_secretId_idx" ON "RuntimeSecretVersion"("secretId");
CREATE INDEX "RuntimeSecretVersion_rotatedAt_idx" ON "RuntimeSecretVersion"("rotatedAt");

-- ── Capability Registry ───────────────────────────────────────────────────

CREATE TYPE "RuntimeCapabilityCategory" AS ENUM ('INTEGRATION', 'BANKING', 'ERP', 'PAYMENTS', 'IDENTITY', 'NOTIFICATION', 'DOCUMENT', 'AI', 'WORKFLOW', 'AUDIT', 'OBSERVABILITY', 'SEARCH', 'STORAGE', 'SECURITY', 'ANALYTICS');
CREATE TYPE "RuntimeCapabilityStatus" AS ENUM ('HEALTHY', 'DEGRADED', 'UNHEALTHY', 'DISABLED', 'UNKNOWN');

CREATE TABLE "RuntimeCapability" (
    "id" TEXT NOT NULL,
    "companyId" TEXT,
    "capabilityId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" "RuntimeCapabilityCategory" NOT NULL,
    "platformId" TEXT,
    "status" "RuntimeCapabilityStatus" NOT NULL DEFAULT 'UNKNOWN',
    "lastHealthCheckAt" TIMESTAMP(3),
    "healthLatencyMs" INTEGER,
    "healthError" TEXT,
    "version" TEXT,
    "dependencies" TEXT,
    "createdBy" TEXT,
    "ownerTeam" TEXT,
    "description" TEXT,
    "metadata" JSONB,
    "deprecatedAt" TIMESTAMP(3),
    "deprecationNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RuntimeCapability_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "RuntimeCapability_capabilityId_key" ON "RuntimeCapability"("capabilityId");
CREATE INDEX "RuntimeCapability_companyId_idx" ON "RuntimeCapability"("companyId");
CREATE INDEX "RuntimeCapability_category_idx" ON "RuntimeCapability"("category");
CREATE INDEX "RuntimeCapability_status_idx" ON "RuntimeCapability"("status");
CREATE INDEX "RuntimeCapability_platformId_idx" ON "RuntimeCapability"("platformId");
CREATE INDEX "RuntimeCapability_companyId_category_idx" ON "RuntimeCapability"("companyId", "category");

CREATE TABLE "RuntimeCapabilityHealthHistory" (
    "id" TEXT NOT NULL,
    "capabilityId" TEXT NOT NULL,
    "companyId" TEXT,
    "status" "RuntimeCapabilityStatus" NOT NULL,
    "latencyMs" INTEGER,
    "error" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RuntimeCapabilityHealthHistory_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "RuntimeCapabilityHealthHistory_capabilityId_idx" ON "RuntimeCapabilityHealthHistory"("capabilityId");
CREATE INDEX "RuntimeCapabilityHealthHistory_companyId_capabilityId_idx" ON "RuntimeCapabilityHealthHistory"("companyId", "capabilityId");
CREATE INDEX "RuntimeCapabilityHealthHistory_createdAt_idx" ON "RuntimeCapabilityHealthHistory"("createdAt");
CREATE INDEX "RuntimeCapabilityHealthHistory_status_idx" ON "RuntimeCapabilityHealthHistory"("status");

-- ── Data Classification ───────────────────────────────────────────────────

CREATE TYPE "RuntimeClassificationLevel" AS ENUM ('PUBLIC', 'INTERNAL', 'CONFIDENTIAL', 'SECRET', 'TOP_SECRET', 'RESTRICTED', 'SENSITIVE', 'PROPRIETARY', 'PII', 'PHI', 'SYSTEM');

CREATE TABLE "RuntimeClassificationEntry" (
    "id" TEXT NOT NULL,
    "companyId" TEXT,
    "entityType" TEXT NOT NULL,
    "fieldName" TEXT NOT NULL,
    "level" "RuntimeClassificationLevel" NOT NULL DEFAULT 'INTERNAL',
    "policy" JSONB,
    "source" TEXT NOT NULL DEFAULT 'manual',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RuntimeClassificationEntry_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "RuntimeClassificationEntry_entityType_fieldName_key" ON "RuntimeClassificationEntry"("entityType", "fieldName");
CREATE INDEX "RuntimeClassificationEntry_entityType_idx" ON "RuntimeClassificationEntry"("entityType");
CREATE INDEX "RuntimeClassificationEntry_level_idx" ON "RuntimeClassificationEntry"("level");
CREATE INDEX "RuntimeClassificationEntry_companyId_idx" ON "RuntimeClassificationEntry"("companyId");

CREATE TABLE "RuntimeClassificationEntity" (
    "id" TEXT NOT NULL,
    "companyId" TEXT,
    "entityType" TEXT NOT NULL,
    "level" "RuntimeClassificationLevel" NOT NULL DEFAULT 'INTERNAL',
    "policy" JSONB,
    "source" TEXT NOT NULL DEFAULT 'manual',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RuntimeClassificationEntity_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "RuntimeClassificationEntity_entityType_key" ON "RuntimeClassificationEntity"("entityType");
CREATE INDEX "RuntimeClassificationEntity_companyId_idx" ON "RuntimeClassificationEntity"("companyId");
CREATE INDEX "RuntimeClassificationEntity_level_idx" ON "RuntimeClassificationEntity"("level");

CREATE TABLE "RuntimeClassificationAudit" (
    "id" TEXT NOT NULL,
    "companyId" TEXT,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "fieldName" TEXT,
    "level" "RuntimeClassificationLevel" NOT NULL,
    "granted" BOOLEAN NOT NULL,
    "userRole" TEXT,
    "reason" TEXT,
    "userId" TEXT,
    "correlationId" TEXT,
    "ipAddress" TEXT,
    "maskingApplied" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RuntimeClassificationAudit_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "RuntimeClassificationAudit_companyId_idx" ON "RuntimeClassificationAudit"("companyId");
CREATE INDEX "RuntimeClassificationAudit_entityType_entityId_idx" ON "RuntimeClassificationAudit"("entityType", "entityId");
CREATE INDEX "RuntimeClassificationAudit_level_idx" ON "RuntimeClassificationAudit"("level");
CREATE INDEX "RuntimeClassificationAudit_granted_idx" ON "RuntimeClassificationAudit"("granted");
CREATE INDEX "RuntimeClassificationAudit_createdAt_idx" ON "RuntimeClassificationAudit"("createdAt");
CREATE INDEX "RuntimeClassificationAudit_companyId_createdAt_idx" ON "RuntimeClassificationAudit"("companyId", "createdAt");

-- ── Policy Engine ─────────────────────────────────────────────────────────

CREATE TYPE "RuntimePolicyType" AS ENUM ('RBAC', 'ABAC', 'APPROVAL', 'FINANCIAL', 'COMPLIANCE', 'RISK', 'DATA_ACCESS', 'MUTATION');
CREATE TYPE "RuntimePolicyStatus" AS ENUM ('ACTIVE', 'DISABLED', 'DRAFT');

CREATE TABLE "RuntimePolicy" (
    "id" TEXT NOT NULL,
    "companyId" TEXT,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "RuntimePolicyType" NOT NULL,
    "status" "RuntimePolicyStatus" NOT NULL DEFAULT 'ACTIVE',
    "rules" JSONB NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "description" TEXT,
    "createdBy" TEXT,
    "ownerTeam" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RuntimePolicy_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "RuntimePolicy_key_key" ON "RuntimePolicy"("key");
CREATE INDEX "RuntimePolicy_companyId_idx" ON "RuntimePolicy"("companyId");
CREATE INDEX "RuntimePolicy_type_idx" ON "RuntimePolicy"("type");
CREATE INDEX "RuntimePolicy_status_idx" ON "RuntimePolicy"("status");
CREATE INDEX "RuntimePolicy_companyId_type_idx" ON "RuntimePolicy"("companyId", "type");
CREATE INDEX "RuntimePolicy_priority_idx" ON "RuntimePolicy"("priority");

CREATE TABLE "RuntimePolicyEvaluation" (
    "id" TEXT NOT NULL,
    "policyId" TEXT NOT NULL,
    "companyId" TEXT,
    "granted" BOOLEAN NOT NULL,
    "reason" TEXT,
    "userId" TEXT,
    "action" TEXT,
    "resourceType" TEXT,
    "resourceId" TEXT,
    "evaluationMs" INTEGER,
    "rulesEvaluated" INTEGER,
    "correlationId" TEXT,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RuntimePolicyEvaluation_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "RuntimePolicyEvaluation_policyId_idx" ON "RuntimePolicyEvaluation"("policyId");
CREATE INDEX "RuntimePolicyEvaluation_companyId_idx" ON "RuntimePolicyEvaluation"("companyId");
CREATE INDEX "RuntimePolicyEvaluation_granted_idx" ON "RuntimePolicyEvaluation"("granted");
CREATE INDEX "RuntimePolicyEvaluation_createdAt_idx" ON "RuntimePolicyEvaluation"("createdAt");
CREATE INDEX "RuntimePolicyEvaluation_companyId_createdAt_idx" ON "RuntimePolicyEvaluation"("companyId", "createdAt");

-- ── Event Outbox ──────────────────────────────────────────────────────────

CREATE TYPE "RuntimeEventStatus" AS ENUM ('PENDING', 'DELIVERED', 'FAILED', 'DEAD_LETTER', 'REPLAYED');

CREATE TABLE "RuntimeEventEnvelope" (
    "id" TEXT NOT NULL,
    "companyId" TEXT,
    "type" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "status" "RuntimeEventStatus" NOT NULL DEFAULT 'PENDING',
    "correlationId" TEXT,
    "causationId" TEXT,
    "schemaVersion" INTEGER NOT NULL DEFAULT 1,
    "attemptCount" INTEGER NOT NULL DEFAULT 0,
    "maxAttempts" INTEGER NOT NULL DEFAULT 3,
    "nextRetryAt" TIMESTAMP(3),
    "lastError" TEXT,
    "lastAttemptAt" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deliveredAt" TIMESTAMP(3),

    CONSTRAINT "RuntimeEventEnvelope_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "RuntimeEventEnvelope_companyId_idx" ON "RuntimeEventEnvelope"("companyId");
CREATE INDEX "RuntimeEventEnvelope_type_idx" ON "RuntimeEventEnvelope"("type");
CREATE INDEX "RuntimeEventEnvelope_status_idx" ON "RuntimeEventEnvelope"("status");
CREATE INDEX "RuntimeEventEnvelope_companyId_type_idx" ON "RuntimeEventEnvelope"("companyId", "type");
CREATE INDEX "RuntimeEventEnvelope_status_createdAt_idx" ON "RuntimeEventEnvelope"("status", "createdAt");
CREATE INDEX "RuntimeEventEnvelope_status_nextRetryAt_idx" ON "RuntimeEventEnvelope"("status", "nextRetryAt");
CREATE INDEX "RuntimeEventEnvelope_correlationId_idx" ON "RuntimeEventEnvelope"("correlationId");
CREATE INDEX "RuntimeEventEnvelope_createdAt_idx" ON "RuntimeEventEnvelope"("createdAt");

CREATE TABLE "RuntimeEventDeadLetter" (
    "id" TEXT NOT NULL,
    "companyId" TEXT,
    "type" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "error" TEXT NOT NULL,
    "attemptCount" INTEGER NOT NULL,
    "firstFailedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastFailedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "correlationId" TEXT,
    "causationId" TEXT,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "resolvedBy" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "resolveNote" TEXT,
    "metadata" JSONB,

    CONSTRAINT "RuntimeEventDeadLetter_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "RuntimeEventDeadLetter_companyId_idx" ON "RuntimeEventDeadLetter"("companyId");
CREATE INDEX "RuntimeEventDeadLetter_type_idx" ON "RuntimeEventDeadLetter"("type");
CREATE INDEX "RuntimeEventDeadLetter_resolved_idx" ON "RuntimeEventDeadLetter"("resolved");
CREATE INDEX "RuntimeEventDeadLetter_companyId_resolved_idx" ON "RuntimeEventDeadLetter"("companyId", "resolved");
CREATE INDEX "RuntimeEventDeadLetter_firstFailedAt_idx" ON "RuntimeEventDeadLetter"("firstFailedAt");
