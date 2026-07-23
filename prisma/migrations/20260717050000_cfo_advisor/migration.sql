-- CreateTable
CREATE TABLE "executive_briefings" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "briefingDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "period" TEXT NOT NULL DEFAULT 'daily',
    "status" TEXT NOT NULL DEFAULT 'GENERATED',
    "cashPosition" JSONB NOT NULL DEFAULT '{}',
    "liquidity" JSONB NOT NULL DEFAULT '{}',
    "workingCapital" JSONB NOT NULL DEFAULT '{}',
    "revenueTrends" JSONB NOT NULL DEFAULT '{}',
    "expenseTrends" JSONB NOT NULL DEFAULT '{}',
    "treasuryHealth" JSONB NOT NULL DEFAULT '{}',
    "financialIntegrity" JSONB NOT NULL DEFAULT '{}',
    "closeReadiness" JSONB NOT NULL DEFAULT '{}',
    "complianceHealth" JSONB NOT NULL DEFAULT '{}',
    "operationalRisks" JSONB NOT NULL DEFAULT '[]',
    "significantAnomalies" JSONB NOT NULL DEFAULT '[]',
    "criticalAlerts" JSONB NOT NULL DEFAULT '[]',
    "openApprovals" JSONB NOT NULL DEFAULT '[]',
    "recommendedActions" JSONB NOT NULL DEFAULT '[]',
    "executiveSummary" TEXT NOT NULL DEFAULT '',
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "executive_briefings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "executive_recommendations" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "briefingId" TEXT,
    "category" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "executiveSummary" TEXT NOT NULL DEFAULT '',
    "businessReason" TEXT NOT NULL DEFAULT '',
    "financialImpact" JSONB NOT NULL DEFAULT '{}',
    "confidence" DECIMAL(5,4) NOT NULL DEFAULT 0,
    "riskLevel" TEXT NOT NULL DEFAULT 'LOW',
    "priority" INTEGER NOT NULL DEFAULT 50,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "requiredApprovals" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "suggestedNextSteps" JSONB NOT NULL DEFAULT '[]',
    "evidenceIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "agentDecisionId" TEXT,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "executive_recommendations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scenario_analyses" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "scenarioType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "parameters" JSONB NOT NULL DEFAULT '{}',
    "assumptions" JSONB NOT NULL DEFAULT '[]',
    "results" JSONB NOT NULL DEFAULT '{}',
    "riskAssessment" JSONB NOT NULL DEFAULT '{}',
    "recommendations" JSONB NOT NULL DEFAULT '[]',
    "sensitivityAnalysis" JSONB NOT NULL DEFAULT '{}',
    "runAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "duration" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "scenario_analyses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scenario_executions" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "scenarioId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'RUNNING',
    "input" JSONB NOT NULL DEFAULT '{}',
    "output" JSONB NOT NULL DEFAULT '{}',
    "error" JSONB,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "duration" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "scenario_executions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "executive_conversations" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT 'New Conversation',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "context" JSONB NOT NULL DEFAULT '{}',
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "executive_conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "executive_messages" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "contentType" TEXT NOT NULL DEFAULT 'text',
    "references" JSONB NOT NULL DEFAULT '[]',
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "executive_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "executive_insights" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "insightType" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "severity" TEXT NOT NULL DEFAULT 'INFO',
    "data" JSONB NOT NULL DEFAULT '{}',
    "sourceType" TEXT NOT NULL,
    "sourceId" TEXT,
    "acknowledged" BOOLEAN NOT NULL DEFAULT false,
    "acknowledgedAt" TIMESTAMP(3),
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "executive_insights_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "executive_priorities" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "priorityType" TEXT NOT NULL,
    "urgency" TEXT NOT NULL DEFAULT 'MEDIUM',
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "dueDate" TIMESTAMP(3),
    "referenceType" TEXT,
    "referenceId" TEXT,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "executive_priorities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "executive_decisions" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "decisionType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "recommendation" TEXT NOT NULL DEFAULT '',
    "reasoning" TEXT NOT NULL DEFAULT '',
    "evidence" JSONB NOT NULL DEFAULT '[]',
    "alternatives" JSONB NOT NULL DEFAULT '[]',
    "financialImpact" JSONB NOT NULL DEFAULT '{}',
    "riskLevel" TEXT NOT NULL DEFAULT 'LOW',
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "executedAt" TIMESTAMP(3),
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "executive_decisions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "executive_workspace_preferences" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "layout" JSONB NOT NULL DEFAULT '{}',
    "pinnedWidgets" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "hiddenWidgets" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "briefingTime" TEXT,
    "notificationPrefs" JSONB NOT NULL DEFAULT '{}',
    "theme" TEXT NOT NULL DEFAULT 'dark',
    "config" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "executive_workspace_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "executive_board_packs" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "sections" JSONB NOT NULL DEFAULT '[]',
    "highlights" JSONB NOT NULL DEFAULT '{}',
    "commentary" JSONB NOT NULL DEFAULT '{}',
    "risks" JSONB NOT NULL DEFAULT '[]',
    "opportunities" JSONB NOT NULL DEFAULT '[]',
    "capitalAllocation" JSONB NOT NULL DEFAULT '{}',
    "cashStrategy" JSONB NOT NULL DEFAULT '{}',
    "distributedAt" TIMESTAMP(3),
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "executive_board_packs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "executive_briefings_companyId_briefingDate_period_key" ON "executive_briefings"("companyId", "briefingDate", "period");
CREATE INDEX "executive_briefings_companyId_briefingDate_idx" ON "executive_briefings"("companyId", "briefingDate");
CREATE INDEX "executive_briefings_companyId_status_idx" ON "executive_briefings"("companyId", "status");

-- CreateIndex
CREATE INDEX "executive_recommendations_companyId_category_idx" ON "executive_recommendations"("companyId", "category");
CREATE INDEX "executive_recommendations_companyId_status_idx" ON "executive_recommendations"("companyId", "status");
CREATE INDEX "executive_recommendations_companyId_priority_idx" ON "executive_recommendations"("companyId", "priority");
CREATE INDEX "executive_recommendations_companyId_briefingId_idx" ON "executive_recommendations"("companyId", "briefingId");

-- CreateIndex
CREATE INDEX "scenario_analyses_companyId_scenarioType_idx" ON "scenario_analyses"("companyId", "scenarioType");
CREATE INDEX "scenario_analyses_companyId_status_idx" ON "scenario_analyses"("companyId", "status");
CREATE INDEX "scenario_analyses_companyId_createdAt_idx" ON "scenario_analyses"("companyId", "createdAt");

-- CreateIndex
CREATE INDEX "scenario_executions_companyId_scenarioId_idx" ON "scenario_executions"("companyId", "scenarioId");
CREATE INDEX "scenario_executions_companyId_status_idx" ON "scenario_executions"("companyId", "status");

-- CreateIndex
CREATE INDEX "executive_conversations_companyId_userId_idx" ON "executive_conversations"("companyId", "userId");
CREATE INDEX "executive_conversations_companyId_status_idx" ON "executive_conversations"("companyId", "status");

-- CreateIndex
CREATE INDEX "executive_messages_companyId_conversationId_idx" ON "executive_messages"("companyId", "conversationId");
CREATE INDEX "executive_messages_companyId_role_idx" ON "executive_messages"("companyId", "role");

-- CreateIndex
CREATE INDEX "executive_insights_companyId_insightType_idx" ON "executive_insights"("companyId", "insightType");
CREATE INDEX "executive_insights_companyId_severity_idx" ON "executive_insights"("companyId", "severity");
CREATE INDEX "executive_insights_companyId_acknowledged_idx" ON "executive_insights"("companyId", "acknowledged");
CREATE INDEX "executive_insights_companyId_createdAt_idx" ON "executive_insights"("companyId", "createdAt");

-- CreateIndex
CREATE INDEX "executive_priorities_companyId_urgency_idx" ON "executive_priorities"("companyId", "urgency");
CREATE INDEX "executive_priorities_companyId_status_idx" ON "executive_priorities"("companyId", "status");
CREATE INDEX "executive_priorities_companyId_priorityType_idx" ON "executive_priorities"("companyId", "priorityType");

-- CreateIndex
CREATE INDEX "executive_decisions_companyId_decisionType_idx" ON "executive_decisions"("companyId", "decisionType");
CREATE INDEX "executive_decisions_companyId_status_idx" ON "executive_decisions"("companyId", "status");
CREATE INDEX "executive_decisions_companyId_riskLevel_idx" ON "executive_decisions"("companyId", "riskLevel");
CREATE INDEX "executive_decisions_companyId_createdAt_idx" ON "executive_decisions"("companyId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "executive_workspace_preferences_companyId_key" ON "executive_workspace_preferences"("companyId");
CREATE UNIQUE INDEX "executive_workspace_preferences_userId_key" ON "executive_workspace_preferences"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "executive_board_packs_companyId_period_year_key" ON "executive_board_packs"("companyId", "period", "year");
CREATE INDEX "executive_board_packs_companyId_status_idx" ON "executive_board_packs"("companyId", "status");

-- AddForeignKey
ALTER TABLE "executive_briefings" ADD CONSTRAINT "executive_briefings_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "executive_recommendations" ADD CONSTRAINT "executive_recommendations_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "executive_recommendations" ADD CONSTRAINT "executive_recommendations_briefingId_fkey" FOREIGN KEY ("briefingId") REFERENCES "executive_briefings"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "scenario_analyses" ADD CONSTRAINT "scenario_analyses_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "scenario_executions" ADD CONSTRAINT "scenario_executions_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "scenario_executions" ADD CONSTRAINT "scenario_executions_scenarioId_fkey" FOREIGN KEY ("scenarioId") REFERENCES "scenario_analyses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "executive_conversations" ADD CONSTRAINT "executive_conversations_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "executive_messages" ADD CONSTRAINT "executive_messages_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "executive_messages" ADD CONSTRAINT "executive_messages_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "executive_conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "executive_insights" ADD CONSTRAINT "executive_insights_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "executive_priorities" ADD CONSTRAINT "executive_priorities_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "executive_decisions" ADD CONSTRAINT "executive_decisions_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "executive_workspace_preferences" ADD CONSTRAINT "executive_workspace_preferences_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "executive_board_packs" ADD CONSTRAINT "executive_board_packs_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
