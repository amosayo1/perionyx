-- Phase 12D — Platform Orchestration & Automation
-- New orchestration models for WorkflowExecution, WorkflowStepExecution,
-- WorkflowTemplate, AutomationRule, WorkflowTrigger, WorkflowSchedule,
-- WorkflowLog, WorkflowMetric, WorkflowNotification

-- Workflow Execution: tracks workflow runs with status/retry/error
CREATE TABLE "workflow_executions" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "workflowId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "trigger" TEXT NOT NULL,
    "input" JSONB,
    "output" JSONB,
    "error" TEXT,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "durationMs" INTEGER,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "maxRetries" INTEGER NOT NULL DEFAULT 3,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "workflow_executions_pkey" PRIMARY KEY ("id")
);

-- Workflow Step Execution: per-step tracking within a workflow run
CREATE TABLE "workflow_step_executions" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "executionId" TEXT NOT NULL,
    "workflowId" TEXT NOT NULL,
    "stepIndex" INTEGER NOT NULL,
    "stepType" TEXT NOT NULL,
    "module" TEXT,
    "action" TEXT,
    "input" JSONB,
    "output" JSONB,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "error" TEXT,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "durationMs" INTEGER,
    "retryCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "workflow_step_executions_pkey" PRIMARY KEY ("id")
);

-- Workflow Template: reusable workflow definitions
CREATE TABLE "workflow_templates" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "steps" JSONB NOT NULL,
    "estimatedDuration" TEXT,
    "requiredModules" JSONB,
    "isBuiltIn" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workflow_templates_pkey" PRIMARY KEY ("id")
);

-- Automation Rule: event-driven IF/THEN automation
CREATE TABLE "automation_rules" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "eventType" TEXT NOT NULL,
    "condition" JSONB,
    "actions" JSONB NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "cooldown_sec" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "automation_rules_pkey" PRIMARY KEY ("id")
);

-- Workflow Trigger: event-based workflow activation
CREATE TABLE "workflow_triggers" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "workflowId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "condition" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workflow_triggers_pkey" PRIMARY KEY ("id")
);

-- Workflow Schedule: cron-based workflow scheduling
CREATE TABLE "workflow_schedules" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "workflowId" TEXT NOT NULL,
    "cron" TEXT NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastRunAt" TIMESTAMP(3),
    "nextRunAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workflow_schedules_pkey" PRIMARY KEY ("id")
);

-- Workflow Log: execution log entries
CREATE TABLE "workflow_logs" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "executionId" TEXT NOT NULL,
    "workflowId" TEXT NOT NULL,
    "level" TEXT NOT NULL DEFAULT 'info',
    "message" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "workflow_logs_pkey" PRIMARY KEY ("id")
);

-- Workflow Metric: aggregated workflow execution metrics
CREATE TABLE "workflow_metrics" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "workflowId" TEXT NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "totalExecutions" INTEGER NOT NULL DEFAULT 0,
    "completed" INTEGER NOT NULL DEFAULT 0,
    "failed" INTEGER NOT NULL DEFAULT 0,
    "avg_duration_ms" INTEGER,
    "p95_duration_ms" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "workflow_metrics_pkey" PRIMARY KEY ("id")
);

-- Workflow Notification: per-workflow notification config
CREATE TABLE "workflow_notifications" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "workflowId" TEXT NOT NULL,
    "triggerOn" TEXT NOT NULL,
    "roleTarget" TEXT,
    "channel" TEXT NOT NULL DEFAULT 'in-app',
    "template" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workflow_notifications_pkey" PRIMARY KEY ("id")
);

-- Foreign keys
ALTER TABLE "workflow_executions" ADD CONSTRAINT "workflow_executions_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "workflow_executions" ADD CONSTRAINT "workflow_executions_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "workflow_definitions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "workflow_step_executions" ADD CONSTRAINT "workflow_step_executions_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "workflow_step_executions" ADD CONSTRAINT "workflow_step_executions_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "workflow_definitions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "workflow_step_executions" ADD CONSTRAINT "workflow_step_executions_executionId_fkey" FOREIGN KEY ("executionId") REFERENCES "workflow_executions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "workflow_templates" ADD CONSTRAINT "workflow_templates_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "automation_rules" ADD CONSTRAINT "automation_rules_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "workflow_triggers" ADD CONSTRAINT "workflow_triggers_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "workflow_definitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "workflow_schedules" ADD CONSTRAINT "workflow_schedules_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "workflow_definitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "workflow_logs" ADD CONSTRAINT "workflow_logs_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "workflow_logs" ADD CONSTRAINT "workflow_logs_executionId_fkey" FOREIGN KEY ("executionId") REFERENCES "workflow_executions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "workflow_logs" ADD CONSTRAINT "workflow_logs_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "workflow_definitions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "workflow_metrics" ADD CONSTRAINT "workflow_metrics_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "workflow_definitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "workflow_notifications" ADD CONSTRAINT "workflow_notifications_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "workflow_definitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Indexes
CREATE INDEX "workflow_executions_companyId_workflowId_status_idx" ON "workflow_executions"("companyId", "workflowId", "status");
CREATE INDEX "workflow_executions_companyId_status_startedAt_idx" ON "workflow_executions"("companyId", "status", "startedAt");

CREATE INDEX "workflow_step_executions_companyId_executionId_idx" ON "workflow_step_executions"("companyId", "executionId");
CREATE INDEX "workflow_step_executions_companyId_workflowId_status_idx" ON "workflow_step_executions"("companyId", "workflowId", "status");

CREATE UNIQUE INDEX "workflow_templates_companyId_slug_key" ON "workflow_templates"("companyId", "slug");
CREATE INDEX "workflow_templates_companyId_category_idx" ON "workflow_templates"("companyId", "category");

CREATE INDEX "automation_rules_companyId_eventType_isActive_idx" ON "automation_rules"("companyId", "eventType", "isActive");

CREATE INDEX "workflow_triggers_companyId_eventType_isActive_idx" ON "workflow_triggers"("companyId", "eventType", "isActive");

CREATE INDEX "workflow_schedules_companyId_isActive_idx" ON "workflow_schedules"("companyId", "isActive");

CREATE INDEX "workflow_logs_companyId_executionId_idx" ON "workflow_logs"("companyId", "executionId");
CREATE INDEX "workflow_logs_companyId_workflowId_level_idx" ON "workflow_logs"("companyId", "workflowId", "level");

CREATE INDEX "workflow_metrics_companyId_workflowId_periodStart_periodEnd_idx" ON "workflow_metrics"("companyId", "workflowId", "periodStart", "periodEnd");

CREATE INDEX "workflow_notifications_companyId_workflowId_triggerOn_idx" ON "workflow_notifications"("companyId", "workflowId", "triggerOn");
