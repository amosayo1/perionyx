-- CreateTable
CREATE TABLE "automation_templates" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "category" TEXT NOT NULL DEFAULT 'general',
    "icon" TEXT NOT NULL DEFAULT 'FileText',
    "kind" TEXT NOT NULL DEFAULT 'semi_automated',
    "steps" JSONB NOT NULL,
    "inputSchema" JSONB,
    "outputSchema" JSONB,
    "triggerType" TEXT NOT NULL DEFAULT 'manual',
    "popularity" TEXT NOT NULL DEFAULT 'medium',
    "status" TEXT NOT NULL DEFAULT 'active',
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "version" INTEGER NOT NULL DEFAULT 1,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "createdByUserId" TEXT,
    "updatedByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "automation_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "approval_matrix_rules" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "priority" INTEGER NOT NULL DEFAULT 100,
    "conditions" JSONB NOT NULL DEFAULT '[]',
    "requiredApprovers" INTEGER NOT NULL DEFAULT 1,
    "approverRoles" TEXT[],
    "approvalMode" TEXT NOT NULL DEFAULT 'sequential',
    "timeoutMinutes" INTEGER NOT NULL DEFAULT 1440,
    "escalationEnabled" BOOLEAN NOT NULL DEFAULT false,
    "escalationDelayMinutes" INTEGER,
    "escalationRoles" TEXT[],
    "delegationEnabled" BOOLEAN NOT NULL DEFAULT false,
    "delegationRoles" TEXT[],
    "departmentScope" TEXT,
    "thresholdField" TEXT,
    "thresholdOperator" TEXT,
    "thresholdValue" DOUBLE PRECISION,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdByUserId" TEXT,
    "updatedByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "approval_matrix_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "business_rule_definitions" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "category" TEXT NOT NULL DEFAULT 'general',
    "priority" INTEGER NOT NULL DEFAULT 50,
    "when" JSONB NOT NULL,
    "then" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdByUserId" TEXT,
    "updatedByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "business_rule_definitions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "automation_schedules" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "triggerType" TEXT NOT NULL,
    "cronExpression" TEXT,
    "startAt" TIMESTAMP(3),
    "eventSource" TEXT,
    "eventType" TEXT,
    "templateId" TEXT,
    "blueprintId" TEXT,
    "input" JSONB,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "lastRunAt" TIMESTAMP(3),
    "nextRunAt" TIMESTAMP(3),
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdByUserId" TEXT,
    "updatedByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "automation_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "readiness_reports" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "overallScore" INTEGER NOT NULL,
    "passedChecks" INTEGER NOT NULL DEFAULT 0,
    "warnedChecks" INTEGER NOT NULL DEFAULT 0,
    "failedChecks" INTEGER NOT NULL DEFAULT 0,
    "checks" JSONB NOT NULL,
    "suggestions" TEXT[],
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "readiness_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_preferences" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "automation_templates_companyId_category_idx" ON "automation_templates"("companyId", "category");

-- CreateIndex
CREATE INDEX "automation_templates_companyId_status_idx" ON "automation_templates"("companyId", "status");

-- CreateIndex
CREATE INDEX "automation_templates_companyId_triggerType_idx" ON "automation_templates"("companyId", "triggerType");

-- CreateIndex
CREATE UNIQUE INDEX "automation_templates_companyId_name_key" ON "automation_templates"("companyId", "name");

-- CreateIndex
CREATE INDEX "approval_matrix_rules_companyId_isActive_priority_idx" ON "approval_matrix_rules"("companyId", "isActive", "priority");

-- CreateIndex
CREATE INDEX "approval_matrix_rules_companyId_departmentScope_idx" ON "approval_matrix_rules"("companyId", "departmentScope");

-- CreateIndex
CREATE UNIQUE INDEX "approval_matrix_rules_companyId_name_key" ON "approval_matrix_rules"("companyId", "name");

-- CreateIndex
CREATE INDEX "business_rule_definitions_companyId_isActive_priority_idx" ON "business_rule_definitions"("companyId", "isActive", "priority");

-- CreateIndex
CREATE INDEX "business_rule_definitions_companyId_category_idx" ON "business_rule_definitions"("companyId", "category");

-- CreateIndex
CREATE UNIQUE INDEX "business_rule_definitions_companyId_name_key" ON "business_rule_definitions"("companyId", "name");

-- CreateIndex
CREATE INDEX "automation_schedules_companyId_enabled_triggerType_idx" ON "automation_schedules"("companyId", "enabled", "triggerType");

-- CreateIndex
CREATE INDEX "automation_schedules_companyId_eventType_idx" ON "automation_schedules"("companyId", "eventType");

-- CreateIndex
CREATE INDEX "automation_schedules_companyId_nextRunAt_idx" ON "automation_schedules"("companyId", "nextRunAt");

-- CreateIndex
CREATE INDEX "readiness_reports_companyId_createdAt_idx" ON "readiness_reports"("companyId", "createdAt");

-- CreateIndex
CREATE INDEX "user_preferences_companyId_userId_idx" ON "user_preferences"("companyId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "user_preferences_companyId_userId_key_key" ON "user_preferences"("companyId", "userId", "key");

-- AddForeignKey
ALTER TABLE "automation_templates" ADD CONSTRAINT "automation_templates_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "automation_templates" ADD CONSTRAINT "automation_templates_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "automation_templates" ADD CONSTRAINT "automation_templates_updatedByUserId_fkey" FOREIGN KEY ("updatedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "approval_matrix_rules" ADD CONSTRAINT "approval_matrix_rules_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "approval_matrix_rules" ADD CONSTRAINT "approval_matrix_rules_updatedByUserId_fkey" FOREIGN KEY ("updatedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "approval_matrix_rules" ADD CONSTRAINT "approval_matrix_rules_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "business_rule_definitions" ADD CONSTRAINT "business_rule_definitions_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "business_rule_definitions" ADD CONSTRAINT "business_rule_definitions_updatedByUserId_fkey" FOREIGN KEY ("updatedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "business_rule_definitions" ADD CONSTRAINT "business_rule_definitions_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "automation_schedules" ADD CONSTRAINT "automation_schedules_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "automation_schedules" ADD CONSTRAINT "automation_schedules_updatedByUserId_fkey" FOREIGN KEY ("updatedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "automation_schedules" ADD CONSTRAINT "automation_schedules_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "readiness_reports" ADD CONSTRAINT "readiness_reports_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_preferences" ADD CONSTRAINT "user_preferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_preferences" ADD CONSTRAINT "user_preferences_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
