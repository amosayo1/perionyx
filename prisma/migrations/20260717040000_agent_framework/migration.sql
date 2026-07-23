-- CreateTable
CREATE TABLE "agent_definitions" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "role" TEXT NOT NULL,
    "version" TEXT NOT NULL DEFAULT '1.0.0',
    "owner" TEXT,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "config" JSONB NOT NULL DEFAULT '{}',
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "agent_definitions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agent_capabilities" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "capabilityType" TEXT NOT NULL,
    "inputSchema" JSONB NOT NULL DEFAULT '{}',
    "outputSchema" JSONB NOT NULL DEFAULT '{}',
    "requiredPermissions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "requiredEvidence" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "confidence" DECIMAL(5,4) NOT NULL DEFAULT 0,
    "riskLevel" TEXT NOT NULL DEFAULT 'LOW',
    "requiresApproval" BOOLEAN NOT NULL DEFAULT false,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "config" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "agent_capabilities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agent_sessions" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "userId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "context" JSONB NOT NULL DEFAULT '{}',
    "config" JSONB NOT NULL DEFAULT '{}',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "duration" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "agent_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agent_tasks" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "sessionId" TEXT,
    "capabilityId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "taskType" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 50,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "input" JSONB NOT NULL DEFAULT '{}',
    "output" JSONB,
    "error" JSONB,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "duration" INTEGER,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "maxRetries" INTEGER NOT NULL DEFAULT 3,
    "config" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "agent_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agent_executions" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "capabilityId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'RUNNING',
    "input" JSONB NOT NULL DEFAULT '{}',
    "output" JSONB,
    "error" JSONB,
    "metrics" JSONB NOT NULL DEFAULT '{}',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "duration" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "agent_executions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agent_decisions" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "sessionId" TEXT,
    "taskId" TEXT,
    "title" TEXT NOT NULL,
    "recommendation" TEXT NOT NULL,
    "reason" TEXT NOT NULL DEFAULT '',
    "confidence" DECIMAL(5,4) NOT NULL DEFAULT 0,
    "impact" TEXT NOT NULL DEFAULT 'LOW',
    "risk" TEXT NOT NULL DEFAULT 'LOW',
    "alternatives" JSONB NOT NULL DEFAULT '[]',
    "requiredApprovals" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "executedAt" TIMESTAMP(3),
    "evidence" JSONB NOT NULL DEFAULT '[]',
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "agent_decisions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agent_evidence" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "executionId" TEXT NOT NULL,
    "sourceType" TEXT NOT NULL,
    "sourceId" TEXT,
    "sourceSystem" TEXT NOT NULL,
    "sourceModule" TEXT,
    "sourceRecordId" TEXT,
    "description" TEXT NOT NULL DEFAULT '',
    "data" JSONB NOT NULL DEFAULT '{}',
    "confidence" DECIMAL(5,4) NOT NULL DEFAULT 1,
    "relevance" DECIMAL(5,4) NOT NULL DEFAULT 1,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "agent_evidence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agent_memory" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "userId" TEXT,
    "memoryType" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'general',
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "importance" DECIMAL(5,4) NOT NULL DEFAULT 0.5,
    "accessCount" INTEGER NOT NULL DEFAULT 0,
    "lastAccessedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "agent_memory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agent_health" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'HEALTHY',
    "checkType" TEXT NOT NULL,
    "message" TEXT NOT NULL DEFAULT '',
    "metrics" JSONB NOT NULL DEFAULT '{}',
    "checkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "agent_health_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agent_permissions" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "permission" TEXT NOT NULL,
    "effect" TEXT NOT NULL DEFAULT 'ALLOW',
    "conditions" JSONB NOT NULL DEFAULT '{}',
    "reason" TEXT NOT NULL DEFAULT '',
    "grantedBy" TEXT,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "agent_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agent_configurations" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "maxConcurrentTasks" INTEGER NOT NULL DEFAULT 5,
    "taskTimeout" INTEGER NOT NULL DEFAULT 300000,
    "maxRetries" INTEGER NOT NULL DEFAULT 3,
    "rateLimitPerMinute" INTEGER NOT NULL DEFAULT 60,
    "allowedActions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "forbiddenActions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "escalationRules" JSONB NOT NULL DEFAULT '{}',
    "safetyPolicies" JSONB NOT NULL DEFAULT '{}',
    "notificationPrefs" JSONB NOT NULL DEFAULT '{}',
    "config" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "agent_configurations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agent_conversations" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "decisionId" TEXT,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "contentType" TEXT NOT NULL DEFAULT 'text',
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "agent_conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agent_delegations" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "fromAgentId" TEXT NOT NULL,
    "toAgentId" TEXT NOT NULL,
    "taskId" TEXT,
    "delegationType" TEXT NOT NULL,
    "reason" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "context" JSONB NOT NULL DEFAULT '{}',
    "result" JSONB,
    "traceId" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "agent_delegations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agent_audit" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "sessionId" TEXT,
    "action" TEXT NOT NULL,
    "resourceType" TEXT NOT NULL DEFAULT 'Agent',
    "resourceId" TEXT,
    "actorUserId" TEXT,
    "actorAgentId" TEXT,
    "before" JSONB,
    "after" JSONB,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "ipAddress" TEXT,
    "correlationId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "agent_audit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "agent_definitions_companyId_name_key" ON "agent_definitions"("companyId", "name");
CREATE INDEX "agent_definitions_companyId_status_idx" ON "agent_definitions"("companyId", "status");
CREATE INDEX "agent_definitions_companyId_role_idx" ON "agent_definitions"("companyId", "role");

-- CreateIndex
CREATE UNIQUE INDEX "agent_capabilities_agentId_name_key" ON "agent_capabilities"("agentId", "name");
CREATE INDEX "agent_capabilities_companyId_agentId_idx" ON "agent_capabilities"("companyId", "agentId");
CREATE INDEX "agent_capabilities_companyId_capabilityType_idx" ON "agent_capabilities"("companyId", "capabilityType");

-- CreateIndex
CREATE INDEX "agent_sessions_companyId_agentId_idx" ON "agent_sessions"("companyId", "agentId");
CREATE INDEX "agent_sessions_companyId_status_idx" ON "agent_sessions"("companyId", "status");
CREATE INDEX "agent_sessions_companyId_userId_idx" ON "agent_sessions"("companyId", "userId");

-- CreateIndex
CREATE INDEX "agent_tasks_companyId_agentId_status_idx" ON "agent_tasks"("companyId", "agentId", "status");
CREATE INDEX "agent_tasks_companyId_status_priority_idx" ON "agent_tasks"("companyId", "status", "priority");
CREATE INDEX "agent_tasks_companyId_sessionId_idx" ON "agent_tasks"("companyId", "sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "agent_executions_taskId_key" ON "agent_executions"("taskId");
CREATE INDEX "agent_executions_companyId_agentId_idx" ON "agent_executions"("companyId", "agentId");
CREATE INDEX "agent_executions_companyId_status_idx" ON "agent_executions"("companyId", "status");
CREATE INDEX "agent_executions_companyId_startedAt_idx" ON "agent_executions"("companyId", "startedAt");

-- CreateIndex
CREATE INDEX "agent_decisions_companyId_agentId_status_idx" ON "agent_decisions"("companyId", "agentId", "status");
CREATE INDEX "agent_decisions_companyId_status_createdAt_idx" ON "agent_decisions"("companyId", "status", "createdAt");
CREATE INDEX "agent_decisions_companyId_impact_idx" ON "agent_decisions"("companyId", "impact");

-- CreateIndex
CREATE INDEX "agent_evidence_companyId_executionId_idx" ON "agent_evidence"("companyId", "executionId");
CREATE INDEX "agent_evidence_companyId_sourceType_idx" ON "agent_evidence"("companyId", "sourceType");
CREATE INDEX "agent_evidence_companyId_sourceSystem_sourceId_idx" ON "agent_evidence"("companyId", "sourceSystem", "sourceId");

-- CreateIndex
CREATE UNIQUE INDEX "agent_memory_companyId_agentId_memoryType_key_key" ON "agent_memory"("companyId", "agentId", "memoryType", "key");
CREATE INDEX "agent_memory_companyId_agentId_memoryType_idx" ON "agent_memory"("companyId", "agentId", "memoryType");
CREATE INDEX "agent_memory_companyId_agentId_importance_idx" ON "agent_memory"("companyId", "agentId", "importance");
CREATE INDEX "agent_memory_companyId_userId_idx" ON "agent_memory"("companyId", "userId");

-- CreateIndex
CREATE INDEX "agent_health_companyId_agentId_status_idx" ON "agent_health"("companyId", "agentId", "status");
CREATE INDEX "agent_health_companyId_agentId_checkedAt_idx" ON "agent_health"("companyId", "agentId", "checkedAt");

-- CreateIndex
CREATE UNIQUE INDEX "agent_permissions_companyId_agentId_permission_key" ON "agent_permissions"("companyId", "agentId", "permission");
CREATE INDEX "agent_permissions_companyId_agentId_idx" ON "agent_permissions"("companyId", "agentId");
CREATE INDEX "agent_permissions_companyId_permission_idx" ON "agent_permissions"("companyId", "permission");

-- CreateIndex
CREATE UNIQUE INDEX "agent_configurations_agentId_key" ON "agent_configurations"("agentId");

-- CreateIndex
CREATE INDEX "agent_conversations_companyId_sessionId_idx" ON "agent_conversations"("companyId", "sessionId");
CREATE INDEX "agent_conversations_companyId_agentId_idx" ON "agent_conversations"("companyId", "agentId");
CREATE INDEX "agent_conversations_companyId_role_idx" ON "agent_conversations"("companyId", "role");

-- CreateIndex
CREATE INDEX "agent_delegations_companyId_fromAgentId_idx" ON "agent_delegations"("companyId", "fromAgentId");
CREATE INDEX "agent_delegations_companyId_toAgentId_idx" ON "agent_delegations"("companyId", "toAgentId");
CREATE INDEX "agent_delegations_companyId_status_idx" ON "agent_delegations"("companyId", "status");
CREATE INDEX "agent_delegations_companyId_traceId_idx" ON "agent_delegations"("companyId", "traceId");

-- CreateIndex
CREATE INDEX "agent_audit_companyId_agentId_action_idx" ON "agent_audit"("companyId", "agentId", "action");
CREATE INDEX "agent_audit_companyId_action_createdAt_idx" ON "agent_audit"("companyId", "action", "createdAt");
CREATE INDEX "agent_audit_companyId_sessionId_idx" ON "agent_audit"("companyId", "sessionId");
CREATE INDEX "agent_audit_companyId_correlationId_idx" ON "agent_audit"("companyId", "correlationId");

-- AddForeignKey
ALTER TABLE "agent_definitions" ADD CONSTRAINT "agent_definitions_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "agent_capabilities" ADD CONSTRAINT "agent_capabilities_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "agent_definitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "agent_sessions" ADD CONSTRAINT "agent_sessions_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "agent_definitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "agent_tasks" ADD CONSTRAINT "agent_tasks_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "agent_definitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "agent_tasks" ADD CONSTRAINT "agent_tasks_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "agent_sessions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "agent_tasks" ADD CONSTRAINT "agent_tasks_capabilityId_fkey" FOREIGN KEY ("capabilityId") REFERENCES "agent_capabilities"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "agent_executions" ADD CONSTRAINT "agent_executions_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "agent_tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "agent_executions" ADD CONSTRAINT "agent_executions_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "agent_definitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "agent_executions" ADD CONSTRAINT "agent_executions_capabilityId_fkey" FOREIGN KEY ("capabilityId") REFERENCES "agent_capabilities"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "agent_decisions" ADD CONSTRAINT "agent_decisions_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "agent_definitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "agent_evidence" ADD CONSTRAINT "agent_evidence_executionId_fkey" FOREIGN KEY ("executionId") REFERENCES "agent_executions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "agent_memory" ADD CONSTRAINT "agent_memory_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "agent_definitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "agent_health" ADD CONSTRAINT "agent_health_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "agent_definitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "agent_permissions" ADD CONSTRAINT "agent_permissions_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "agent_definitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "agent_configurations" ADD CONSTRAINT "agent_configurations_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "agent_definitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "agent_conversations" ADD CONSTRAINT "agent_conversations_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "agent_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "agent_conversations" ADD CONSTRAINT "agent_conversations_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "agent_definitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "agent_conversations" ADD CONSTRAINT "agent_conversations_decisionId_fkey" FOREIGN KEY ("decisionId") REFERENCES "agent_decisions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "agent_delegations" ADD CONSTRAINT "agent_delegations_fromAgentId_fkey" FOREIGN KEY ("fromAgentId") REFERENCES "agent_definitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "agent_delegations" ADD CONSTRAINT "agent_delegations_toAgentId_fkey" FOREIGN KEY ("toAgentId") REFERENCES "agent_definitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "agent_delegations" ADD CONSTRAINT "agent_delegations_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "agent_tasks"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "agent_audit" ADD CONSTRAINT "agent_audit_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "agent_definitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "agent_audit" ADD CONSTRAINT "agent_audit_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "agent_sessions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
