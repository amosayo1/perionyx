-- Migration: Enterprise Integration Platform
-- Phase 12A.5 — ERP Connectivity & Integration Platform

CREATE TABLE "integration_connector_defs" (
    "id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "authTypes" JSONB NOT NULL,
    "supportedModules" JSONB NOT NULL,
    "capabilities" JSONB NOT NULL,
    "configSchema" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "iconUrl" TEXT,
    "docsUrl" TEXT,
    "version" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "integration_connector_defs_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "integration_connector_defs_provider_key" UNIQUE ("provider")
);

CREATE TABLE "integration_instances" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "connectorDefId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "healthStatus" TEXT NOT NULL DEFAULT 'unknown',
    "config" JSONB NOT NULL,
    "authMethod" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastSyncAt" TIMESTAMP(3),
    "lastHealthCheckAt" TIMESTAMP(3),
    "error" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "integration_instances_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "integration_credentials" (
    "id" TEXT NOT NULL,
    "instanceId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "encryptedValue" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "rotatedAt" TIMESTAMP(3),
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "integration_credentials_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "integration_credentials_instance_id_key_unique" UNIQUE ("instanceId", "key")
);

CREATE TABLE "sync_history" (
    "id" TEXT NOT NULL,
    "instanceId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "syncType" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),
    "durationMs" INTEGER,
    "totalRecords" INTEGER NOT NULL DEFAULT 0,
    "inserted" INTEGER NOT NULL DEFAULT 0,
    "updated" INTEGER NOT NULL DEFAULT 0,
    "skipped" INTEGER NOT NULL DEFAULT 0,
    "failed" INTEGER NOT NULL DEFAULT 0,
    "error" TEXT,
    "details" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "sync_history_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "import_templates" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sourceType" TEXT NOT NULL,
    "mapping" JSONB NOT NULL,
    "preview" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isShared" BOOLEAN NOT NULL DEFAULT false,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "import_templates_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "csv_mapping_rules" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "sourceColumn" TEXT NOT NULL,
    "targetField" TEXT NOT NULL,
    "defaultValue" TEXT,
    "transform" TEXT,
    "isRequired" BOOLEAN NOT NULL DEFAULT false,
    "validation" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "csv_mapping_rules_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "csv_mapping_rules_template_id_source_column_unique" UNIQUE ("templateId", "sourceColumn")
);

CREATE TABLE "validation_issues" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "instanceId" TEXT,
    "syncHistoryId" TEXT,
    "severity" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "affectedRecords" JSONB,
    "resolution" TEXT,
    "isResolved" BOOLEAN NOT NULL DEFAULT false,
    "resolvedBy" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "validation_issues_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "integration_health" (
    "id" TEXT NOT NULL,
    "instanceId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "responseTimeMs" INTEGER,
    "error" TEXT,
    "diagnostics" JSONB,
    "checkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "integration_health_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "integration_audit" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "instanceId" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "changes" JSONB,
    "metadata" JSONB,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "integration_audit_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "lineage_records" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "instanceId" TEXT NOT NULL,
    "sourceType" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "parentId" TEXT,
    "lineageDepth" INTEGER NOT NULL DEFAULT 0,
    "transformation" TEXT,
    "checksum" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "lineage_records_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "conflict_records" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "instanceId" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "localValue" JSONB NOT NULL,
    "remoteValue" JSONB NOT NULL,
    "resolution" TEXT,
    "resolvedBy" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'open',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "conflict_records_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "bank_connections" (
    "id" TEXT NOT NULL,
    "instanceId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "bankName" TEXT NOT NULL,
    "accountNumber" TEXT,
    "iban" TEXT,
    "swiftCode" TEXT,
    "currency" TEXT NOT NULL,
    "format" TEXT NOT NULL,
    "lastStatementAt" TIMESTAMP(3),
    "lastSyncAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "bank_connections_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "sandbox_datasets" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "dataset" JSONB NOT NULL,
    "connectorDefId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "sandbox_datasets_pkey" PRIMARY KEY ("id")
);

-- Indexes
CREATE INDEX "integration_instances_company_id_status_idx" ON "integration_instances"("companyId", "status");
CREATE INDEX "integration_instances_company_id_def_idx" ON "integration_instances"("companyId", "connectorDefId");
CREATE INDEX "sync_history_company_id_instance_idx" ON "sync_history"("companyId", "instanceId");
CREATE INDEX "sync_history_company_id_status_idx" ON "sync_history"("companyId", "status");
CREATE INDEX "sync_history_company_id_started_idx" ON "sync_history"("companyId", "startedAt");
CREATE INDEX "import_templates_company_id_type_idx" ON "import_templates"("companyId", "sourceType");
CREATE INDEX "csv_mapping_rules_company_id_field_idx" ON "csv_mapping_rules"("companyId", "targetField");
CREATE INDEX "validation_issues_company_id_severity_idx" ON "validation_issues"("companyId", "severity");
CREATE INDEX "validation_issues_company_id_category_idx" ON "validation_issues"("companyId", "category");
CREATE INDEX "validation_issues_company_id_resolved_idx" ON "validation_issues"("companyId", "isResolved");
CREATE INDEX "integration_health_company_id_instance_idx" ON "integration_health"("companyId", "instanceId");
CREATE INDEX "integration_health_company_id_checked_idx" ON "integration_health"("companyId", "checkedAt");
CREATE INDEX "integration_audit_company_id_instance_idx" ON "integration_audit"("companyId", "instanceId");
CREATE INDEX "integration_audit_company_id_action_idx" ON "integration_audit"("companyId", "action");
CREATE INDEX "integration_audit_company_id_created_idx" ON "integration_audit"("companyId", "createdAt");
CREATE INDEX "lineage_records_company_id_target_idx" ON "lineage_records"("companyId", "targetType", "targetId");
CREATE INDEX "lineage_records_company_id_source_idx" ON "lineage_records"("companyId", "sourceType", "sourceId");
CREATE INDEX "lineage_records_company_id_instance_idx" ON "lineage_records"("companyId", "instanceId");
CREATE INDEX "conflict_records_company_id_status_idx" ON "conflict_records"("companyId", "status");
CREATE INDEX "conflict_records_company_id_instance_idx" ON "conflict_records"("companyId", "instanceId");
CREATE INDEX "bank_connections_company_id_instance_idx" ON "bank_connections"("companyId", "instanceId");
CREATE INDEX "sandbox_datasets_company_id_def_idx" ON "sandbox_datasets"("companyId", "connectorDefId");

-- Foreign keys
ALTER TABLE "integration_instances" ADD CONSTRAINT "integration_instances_company_id_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE;
ALTER TABLE "integration_instances" ADD CONSTRAINT "integration_instances_def_id_fkey" FOREIGN KEY ("connectorDefId") REFERENCES "integration_connector_defs"("id") ON DELETE CASCADE;
ALTER TABLE "integration_credentials" ADD CONSTRAINT "integration_credentials_instance_id_fkey" FOREIGN KEY ("instanceId") REFERENCES "integration_instances"("id") ON DELETE CASCADE;
ALTER TABLE "integration_credentials" ADD CONSTRAINT "integration_credentials_company_id_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE;
ALTER TABLE "sync_history" ADD CONSTRAINT "sync_history_instance_id_fkey" FOREIGN KEY ("instanceId") REFERENCES "integration_instances"("id") ON DELETE CASCADE;
ALTER TABLE "sync_history" ADD CONSTRAINT "sync_history_company_id_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE;
ALTER TABLE "import_templates" ADD CONSTRAINT "import_templates_company_id_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE;
ALTER TABLE "csv_mapping_rules" ADD CONSTRAINT "csv_mapping_rules_template_id_fkey" FOREIGN KEY ("templateId") REFERENCES "import_templates"("id") ON DELETE CASCADE;
ALTER TABLE "csv_mapping_rules" ADD CONSTRAINT "csv_mapping_rules_company_id_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE;
ALTER TABLE "validation_issues" ADD CONSTRAINT "validation_issues_company_id_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE;
ALTER TABLE "validation_issues" ADD CONSTRAINT "validation_issues_instance_id_fkey" FOREIGN KEY ("instanceId") REFERENCES "integration_instances"("id") ON DELETE CASCADE;
ALTER TABLE "integration_health" ADD CONSTRAINT "integration_health_instance_id_fkey" FOREIGN KEY ("instanceId") REFERENCES "integration_instances"("id") ON DELETE CASCADE;
ALTER TABLE "integration_health" ADD CONSTRAINT "integration_health_company_id_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE;
ALTER TABLE "integration_audit" ADD CONSTRAINT "integration_audit_instance_id_fkey" FOREIGN KEY ("instanceId") REFERENCES "integration_instances"("id") ON DELETE CASCADE;
ALTER TABLE "integration_audit" ADD CONSTRAINT "integration_audit_company_id_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE;
ALTER TABLE "lineage_records" ADD CONSTRAINT "lineage_records_instance_id_fkey" FOREIGN KEY ("instanceId") REFERENCES "integration_instances"("id") ON DELETE CASCADE;
ALTER TABLE "lineage_records" ADD CONSTRAINT "lineage_records_company_id_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE;
ALTER TABLE "lineage_records" ADD CONSTRAINT "lineage_records_parent_id_fkey" FOREIGN KEY ("parentId") REFERENCES "lineage_records"("id") ON DELETE SET NULL;
ALTER TABLE "conflict_records" ADD CONSTRAINT "conflict_records_instance_id_fkey" FOREIGN KEY ("instanceId") REFERENCES "integration_instances"("id") ON DELETE CASCADE;
ALTER TABLE "conflict_records" ADD CONSTRAINT "conflict_records_company_id_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE;
ALTER TABLE "bank_connections" ADD CONSTRAINT "bank_connections_instance_id_fkey" FOREIGN KEY ("instanceId") REFERENCES "integration_instances"("id") ON DELETE CASCADE;
ALTER TABLE "bank_connections" ADD CONSTRAINT "bank_connections_company_id_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE;
ALTER TABLE "sandbox_datasets" ADD CONSTRAINT "sandbox_datasets_company_id_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE;
