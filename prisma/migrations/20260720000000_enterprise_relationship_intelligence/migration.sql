-- CreateEnum
CREATE TYPE "ContactSource" AS ENUM ('LINKEDIN', 'EMAIL', 'REFERRAL', 'EVENT', 'WEBSITE');

-- CreateEnum
CREATE TYPE "RelationshipStage" AS ENUM ('DISCOVERY_CONVERSATION', 'CONNECTED', 'MEETING_SCHEDULED', 'IN_DISCUSSION', 'EVALUATING', 'COMMITTED', 'PARTNER', 'DISCOVERY', 'ACTIVE_PRODUCT_DISCOVERY', 'ACTIVE_ENGAGEMENT', 'WARM_INTRODUCTION');

-- CreateEnum
CREATE TYPE "ContactStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "Classification" AS ENUM ('SUBJECT_MATTER_EXPERT', 'SUBJECT_MATTER_EXPERT_PENDING', 'POTENTIAL_DESIGN_PARTNER', 'INDUSTRY_CONTACT', 'DESIGN_PARTNER');

-- CreateEnum
CREATE TYPE "DesignPartnerPotential" AS ENUM ('HIGHEST', 'VERY_HIGH', 'HIGH', 'MEDIUM', 'LOW');

-- CreateEnum
CREATE TYPE "InteractionType" AS ENUM ('PROFESSIONAL_DISCUSSION', 'DEMO', 'MEETING', 'EMAIL_EXCHANGE', 'FEEDBACK_SESSION', 'LINKEDIN_INTRODUCTION', 'LINKEDIN_REPLY');

-- CreateEnum
CREATE TYPE "InteractionChannel" AS ENUM ('LINKEDIN', 'EMAIL', 'PHONE', 'MEETING', 'DEMO');

-- CreateEnum
CREATE TYPE "InteractionDirection" AS ENUM ('INBOUND', 'OUTBOUND');

-- CreateEnum
CREATE TYPE "Sentiment" AS ENUM ('POSITIVE', 'NEUTRAL', 'NEGATIVE', 'MIXED');

-- CreateEnum
CREATE TYPE "InteractionOutcome" AS ENUM ('OPEN_TO_COLLABORATION', 'FOLLOW_UP_SCHEDULED', 'NOT_INTERESTED', 'EVALUATING', 'PARTNERED', 'FEEDBACK_PROVIDED');

-- CreateEnum
CREATE TYPE "OpportunityCategory" AS ENUM ('STRATEGIC_PARTNERSHIP', 'INVESTMENT', 'ADVISOR', 'REFERRAL', 'PRODUCT_FEEDBACK');

-- CreateEnum
CREATE TYPE "OpportunityStage" AS ENUM ('DISCOVERY', 'QUALIFICATION', 'PROPOSAL', 'NEGOTIATION', 'CLOSED_WON', 'CLOSED_LOST');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "RelationshipHealth" AS ENUM ('HEALTHY', 'NEEDS_ATTENTION', 'AT_RISK', 'DORMANT');

-- CreateEnum
CREATE TYPE "StrategicImportance" AS ENUM ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW');

-- CreateEnum
CREATE TYPE "InterviewType" AS ENUM ('DISCOVERY', 'DEMO', 'FEEDBACK', 'WORKSHOP', 'PRODUCT_REVIEW', 'CONFERENCE', 'CALL');

-- CreateEnum
CREATE TYPE "InterviewStatus" AS ENUM ('SCHEDULED', 'COMPLETED', 'CANCELLED', 'FOLLOW_UP');

-- CreateEnum
CREATE TYPE "DiscoveryStage" AS ENUM ('RESEARCH', 'CONTACTED', 'INTRODUCTORY_CALL', 'DISCOVERY_SESSION', 'WORKSHOP', 'PILOT', 'REVIEW', 'COMPLETED');

-- CreateEnum
CREATE TYPE "TimelineEventType" AS ENUM ('LINKEDIN', 'EMAIL', 'MEETING', 'CALL', 'DEMO', 'PILOT', 'WORKSHOP', 'PRODUCT_REVIEW', 'DISCOVERY_SESSION', 'CONFERENCE', 'REFERRAL');

-- CreateEnum
CREATE TYPE "PainPointCategory" AS ENUM ('MONTH_END_CLOSE', 'RECONCILIATION', 'TREASURY', 'APPROVALS', 'REPORTING', 'FP_A', 'TAX', 'AUDIT', 'COMPLIANCE', 'CASH_MANAGEMENT', 'ERP', 'INTEGRATION', 'WORKFLOW', 'COLLABORATION', 'DATA_COLLECTION', 'INTERNAL_CONTROLS', 'ANALYTICS', 'AI', 'AUTOMATION', 'OTHER');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "tokenVersion" INTEGER NOT NULL DEFAULT 1;

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

-- CreateTable
CREATE TABLE "executive_briefings" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "briefingDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "period" TEXT NOT NULL,
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

-- CreateTable
CREATE TABLE "reconciliation_cases" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "reconciliationType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "period" TEXT NOT NULL,
    "entityName" TEXT,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "totalDebit" DECIMAL(19,4) NOT NULL DEFAULT 0,
    "totalCredit" DECIMAL(19,4) NOT NULL DEFAULT 0,
    "matchedCount" INTEGER NOT NULL DEFAULT 0,
    "unmatchedCount" INTEGER NOT NULL DEFAULT 0,
    "exceptionCount" INTEGER NOT NULL DEFAULT 0,
    "matchRate" DECIMAL(5,4) NOT NULL DEFAULT 0,
    "readinessScore" DECIMAL(5,4) NOT NULL DEFAULT 0,
    "assignedTo" TEXT,
    "dueDate" TIMESTAMP(3),
    "closedAt" TIMESTAMP(3),
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reconciliation_cases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recon_exceptions" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "exceptionType" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'MEDIUM',
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "sourceSystem" TEXT NOT NULL,
    "referenceNumber" TEXT,
    "description" TEXT NOT NULL,
    "amount" DECIMAL(19,4) NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "expectedAmount" DECIMAL(65,30),
    "varianceAmount" DECIMAL(19,4),
    "variancePercentage" DECIMAL(5,4),
    "transactionDate" TIMESTAMP(3),
    "postedDate" TIMESTAMP(3),
    "explanation" JSONB NOT NULL DEFAULT '{}',
    "evidence" JSONB NOT NULL DEFAULT '[]',
    "resolution" JSONB NOT NULL DEFAULT '{}',
    "assignedTo" TEXT,
    "resolvedBy" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "recon_exceptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "matching_rules" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "ruleType" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "version" INTEGER NOT NULL DEFAULT 1,
    "matchingCriteria" JSONB NOT NULL DEFAULT '{}',
    "scoringWeights" JSONB NOT NULL DEFAULT '{}',
    "maxConfidenceThreshold" DECIMAL(5,4) NOT NULL DEFAULT 0,
    "autoMatchEnabled" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "matching_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "matching_executions" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "ruleId" TEXT,
    "executionType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "inputCount" INTEGER NOT NULL DEFAULT 0,
    "matchedCount" INTEGER NOT NULL DEFAULT 0,
    "unmatchedCount" INTEGER NOT NULL DEFAULT 0,
    "averageConfidence" DECIMAL(5,4) NOT NULL DEFAULT 0,
    "executionTimeMs" INTEGER NOT NULL DEFAULT 0,
    "results" JSONB NOT NULL DEFAULT '[]',
    "errors" JSONB NOT NULL DEFAULT '[]',
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "matching_executions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "matching_suggestions" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "executionId" TEXT,
    "suggestionType" TEXT NOT NULL,
    "confidence" DECIMAL(5,4) NOT NULL DEFAULT 0,
    "sourceTransactionIds" JSONB NOT NULL DEFAULT '[]',
    "targetTransactionIds" JSONB NOT NULL DEFAULT '[]',
    "sourceTotal" DECIMAL(19,4) NOT NULL DEFAULT 0,
    "targetTotal" DECIMAL(19,4) NOT NULL DEFAULT 0,
    "variance" DECIMAL(19,4) NOT NULL DEFAULT 0,
    "explanation" JSONB NOT NULL DEFAULT '{}',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "acceptedBy" TEXT,
    "acceptedAt" TIMESTAMP(3),
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "matching_suggestions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reconciliation_evidence" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "evidenceType" TEXT NOT NULL,
    "sourceSystem" TEXT NOT NULL,
    "referenceId" TEXT,
    "referenceType" TEXT,
    "description" TEXT NOT NULL,
    "amount" DECIMAL(19,4),
    "currency" TEXT,
    "transactionDate" TIMESTAMP(3),
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reconciliation_evidence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "investigation_timelines" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "exceptionId" TEXT,
    "action" TEXT NOT NULL,
    "actor" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "previousState" JSONB,
    "newState" JSONB,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "investigation_timelines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "journal_suggestions" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "exceptionId" TEXT,
    "suggestionType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "journalEntries" JSONB NOT NULL DEFAULT '[]',
    "totalDebit" DECIMAL(19,4) NOT NULL DEFAULT 0,
    "totalCredit" DECIMAL(19,4) NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "explanation" TEXT NOT NULL DEFAULT '',
    "businessReason" TEXT NOT NULL DEFAULT '',
    "supportingEvidence" JSONB NOT NULL DEFAULT '[]',
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "postedAt" TIMESTAMP(3),
    "postedBy" TEXT,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "journal_suggestions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reconciliation_assignments" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "assignedTo" TEXT NOT NULL,
    "assignedBy" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'reconciler',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "notes" TEXT NOT NULL DEFAULT '',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reconciliation_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reconciliation_escalations" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "escalationType" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'MEDIUM',
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "reason" TEXT NOT NULL,
    "escalatedBy" TEXT NOT NULL,
    "escalatedTo" TEXT,
    "resolution" TEXT,
    "resolvedBy" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reconciliation_escalations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exception_classifications" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "exceptionId" TEXT NOT NULL,
    "classifier" TEXT NOT NULL,
    "previousType" TEXT,
    "newType" TEXT NOT NULL,
    "confidence" DECIMAL(5,4) NOT NULL DEFAULT 0,
    "reasoning" TEXT NOT NULL DEFAULT '',
    "evidence" JSONB NOT NULL DEFAULT '[]',
    "approvedBy" TEXT,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "exception_classifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "matching_histories" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "sourceSystem" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "transactionDate" TIMESTAMP(3),
    "amount" DECIMAL(19,4) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "reference" TEXT,
    "vendorName" TEXT,
    "customerName" TEXT,
    "description" TEXT,
    "normalizedReference" TEXT,
    "normalizedVendor" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "matching_histories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rule_versions" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "ruleId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "matchingCriteria" JSONB NOT NULL DEFAULT '{}',
    "scoringWeights" JSONB NOT NULL DEFAULT '{}',
    "changeNote" TEXT NOT NULL DEFAULT '',
    "changedBy" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rule_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "controller_briefings" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "briefingDate" TIMESTAMP(3) NOT NULL,
    "period" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "briefingType" TEXT NOT NULL DEFAULT 'daily',
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "closeProgress" JSONB NOT NULL DEFAULT '{}',
    "healthScore" DECIMAL(5,4) NOT NULL DEFAULT 0,
    "risks" JSONB NOT NULL DEFAULT '[]',
    "recommendations" JSONB NOT NULL DEFAULT '[]',
    "pendingApprovals" INTEGER NOT NULL DEFAULT 0,
    "outstandingExceptions" INTEGER NOT NULL DEFAULT 0,
    "lateJournals" INTEGER NOT NULL DEFAULT 0,
    "policyViolations" INTEGER NOT NULL DEFAULT 0,
    "summary" TEXT NOT NULL DEFAULT '',
    "sections" JSONB NOT NULL DEFAULT '[]',
    "distributedAt" TIMESTAMP(3),
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "controller_briefings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "close_periods" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "closeType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "overallProgress" DECIMAL(5,4) NOT NULL DEFAULT 0,
    "totalTasks" INTEGER NOT NULL DEFAULT 0,
    "completedTasks" INTEGER NOT NULL DEFAULT 0,
    "blockedTasks" INTEGER NOT NULL DEFAULT 0,
    "overdueTasks" INTEGER NOT NULL DEFAULT 0,
    "entityCompletion" JSONB NOT NULL DEFAULT '{}',
    "departmentCompletion" JSONB NOT NULL DEFAULT '{}',
    "estimatedCompletion" TIMESTAMP(3),
    "actualCloseDate" TIMESTAMP(3),
    "lockedBy" TEXT,
    "lockedAt" TIMESTAMP(3),
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "close_periods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "close_tasks" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "closePeriodId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "category" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "assignedTo" TEXT,
    "assignedBy" TEXT,
    "dueDate" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "blockedReason" TEXT,
    "dependencyIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "entityName" TEXT,
    "departmentName" TEXT,
    "workflowInstanceId" TEXT,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "close_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "close_dependencies" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "closePeriodId" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "dependsOnId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "close_dependencies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "close_milestones" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "closePeriodId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "targetDate" TIMESTAMP(3) NOT NULL,
    "actualDate" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "requiredTaskIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "close_milestones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "journal_reviews" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "journalId" TEXT NOT NULL,
    "journalType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "riskLevel" TEXT NOT NULL DEFAULT 'LOW',
    "riskFlags" JSONB NOT NULL DEFAULT '[]',
    "reviewerId" TEXT,
    "reviewNotes" TEXT NOT NULL DEFAULT '',
    "amount" DECIMAL(19,4) NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "postingDate" TIMESTAMP(3),
    "accountCode" TEXT,
    "accountName" TEXT,
    "description" TEXT NOT NULL DEFAULT '',
    "reference" TEXT,
    "sourceSystem" TEXT NOT NULL DEFAULT 'gl',
    "supportingDocs" JSONB NOT NULL DEFAULT '[]',
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "journal_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "journal_risks" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "journalReviewId" TEXT NOT NULL,
    "riskType" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'MEDIUM',
    "confidence" DECIMAL(5,4) NOT NULL DEFAULT 0,
    "description" TEXT NOT NULL,
    "evidence" JSONB NOT NULL DEFAULT '[]',
    "resolution" JSONB NOT NULL DEFAULT '{}',
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "journal_risks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "statement_readiness" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "statementType" TEXT NOT NULL,
    "readinessScore" DECIMAL(5,4) NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'NOT_READY',
    "blockingIssues" JSONB NOT NULL DEFAULT '[]',
    "missingAdjustments" INTEGER NOT NULL DEFAULT 0,
    "outstandingReconciliations" INTEGER NOT NULL DEFAULT 0,
    "unapprovedJournals" INTEGER NOT NULL DEFAULT 0,
    "totalAccounts" INTEGER NOT NULL DEFAULT 0,
    "reconciledAccounts" INTEGER NOT NULL DEFAULT 0,
    "lastCheckedAt" TIMESTAMP(3),
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "statement_readiness_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounting_health_snapshots" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "snapshotDate" TIMESTAMP(3) NOT NULL,
    "period" TEXT NOT NULL,
    "healthScore" DECIMAL(5,4) NOT NULL DEFAULT 0,
    "riskScore" DECIMAL(5,4) NOT NULL DEFAULT 0,
    "integrityScore" DECIMAL(5,4) NOT NULL DEFAULT 0,
    "ledgerConsistency" DECIMAL(5,4) NOT NULL DEFAULT 0,
    "journalQuality" DECIMAL(5,4) NOT NULL DEFAULT 0,
    "reconciliationCompletion" DECIMAL(5,4) NOT NULL DEFAULT 0,
    "policyCompliance" DECIMAL(5,4) NOT NULL DEFAULT 0,
    "postingCompleteness" DECIMAL(5,4) NOT NULL DEFAULT 0,
    "duplicatePostings" INTEGER NOT NULL DEFAULT 0,
    "suspenseAccounts" INTEGER NOT NULL DEFAULT 0,
    "openExceptions" INTEGER NOT NULL DEFAULT 0,
    "trends" JSONB NOT NULL DEFAULT '[]',
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "accounting_health_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounting_recommendations" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "businessReason" TEXT NOT NULL DEFAULT '',
    "financialImpact" JSONB NOT NULL DEFAULT '{}',
    "confidence" DECIMAL(5,4) NOT NULL DEFAULT 0,
    "riskLevel" TEXT NOT NULL DEFAULT 'LOW',
    "evidence" JSONB NOT NULL DEFAULT '[]',
    "affectedModules" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "requiredApprovals" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "priority" INTEGER NOT NULL DEFAULT 0,
    "assignedTo" TEXT,
    "expiresAt" TIMESTAMP(3),
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "accounting_recommendations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "controller_workspace_preferences" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "layout" JSONB NOT NULL DEFAULT '{}',
    "pinnedWidgets" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "hiddenWidgets" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "briefingTime" TEXT,
    "theme" TEXT NOT NULL DEFAULT 'dark',
    "config" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "controller_workspace_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounting_exceptions" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "exceptionType" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'MEDIUM',
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "sourceSystem" TEXT NOT NULL DEFAULT 'gl',
    "referenceId" TEXT,
    "referenceType" TEXT,
    "description" TEXT NOT NULL,
    "amount" DECIMAL(19,4),
    "currency" TEXT,
    "explanation" JSONB NOT NULL DEFAULT '{}',
    "evidence" JSONB NOT NULL DEFAULT '[]',
    "assignedTo" TEXT,
    "resolvedBy" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "accounting_exceptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "close_forecasts" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "closePeriodId" TEXT NOT NULL,
    "forecastDate" TIMESTAMP(3) NOT NULL,
    "estimatedCompletion" TIMESTAMP(3) NOT NULL,
    "confidence" DECIMAL(5,4) NOT NULL DEFAULT 0,
    "remainingTasks" INTEGER NOT NULL DEFAULT 0,
    "blockedTasks" INTEGER NOT NULL DEFAULT 0,
    "averageTaskDurationHours" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "criticalPathTaskIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "risks" JSONB NOT NULL DEFAULT '[]',
    "scenarios" JSONB NOT NULL DEFAULT '[]',
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "close_forecasts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "treasury_briefings" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "briefingDate" TIMESTAMP(3) NOT NULL,
    "briefingType" TEXT NOT NULL DEFAULT 'daily',
    "cashPositionSummary" JSONB NOT NULL DEFAULT '{}',
    "liquiditySummary" JSONB NOT NULL DEFAULT '{}',
    "fxSummary" JSONB NOT NULL DEFAULT '{}',
    "debtSummary" JSONB NOT NULL DEFAULT '{}',
    "investmentSummary" JSONB NOT NULL DEFAULT '{}',
    "riskSummary" JSONB NOT NULL DEFAULT '{}',
    "recommendations" JSONB NOT NULL DEFAULT '[]',
    "alerts" JSONB NOT NULL DEFAULT '[]',
    "highlights" JSONB NOT NULL DEFAULT '[]',
    "actionItems" JSONB NOT NULL DEFAULT '[]',
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "treasury_briefings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cash_position_snapshots" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "snapshotDate" TIMESTAMP(3) NOT NULL,
    "totalGlobalCash" DECIMAL(38,12) NOT NULL,
    "availableCash" DECIMAL(38,12) NOT NULL,
    "restrictedCash" DECIMAL(38,12) NOT NULL,
    "inTransitFunds" DECIMAL(38,12) NOT NULL,
    "cashByCompany" JSONB NOT NULL DEFAULT '{}',
    "cashByBank" JSONB NOT NULL DEFAULT '{}',
    "cashByCurrency" JSONB NOT NULL DEFAULT '{}',
    "cashByRegion" JSONB NOT NULL DEFAULT '{}',
    "concentrationScore" DECIMAL(5,4) NOT NULL,
    "healthScore" DECIMAL(5,4) NOT NULL,
    "alerts" JSONB NOT NULL DEFAULT '[]',
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cash_position_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "liquidity_forecasts" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "forecastDate" TIMESTAMP(3) NOT NULL,
    "horizon" TEXT NOT NULL DEFAULT 'daily',
    "currentLiquidity" DECIMAL(38,12) NOT NULL,
    "forecastLiquidity" DECIMAL(38,12) NOT NULL,
    "minCashThreshold" DECIMAL(38,12) NOT NULL,
    "burnRate" DECIMAL(38,12) NOT NULL,
    "workingCapital" DECIMAL(38,12) NOT NULL,
    "shortTermFundingNeeds" DECIMAL(38,12) NOT NULL,
    "longTermLiquidity" DECIMAL(38,12) NOT NULL,
    "liquidityScore" DECIMAL(5,4) NOT NULL,
    "riskScore" DECIMAL(5,4) NOT NULL,
    "confidence" DECIMAL(5,4) NOT NULL,
    "scenario" TEXT NOT NULL DEFAULT 'expected',
    "historicalComparison" JSONB NOT NULL DEFAULT '{}',
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "liquidity_forecasts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "liquidity_scenarios" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "forecastId" TEXT NOT NULL,
    "scenarioName" TEXT NOT NULL,
    "scenarioType" TEXT NOT NULL DEFAULT 'expected',
    "probability" DECIMAL(5,4) NOT NULL,
    "projectedLiquidity" DECIMAL(38,12) NOT NULL,
    "projectedBurnRate" DECIMAL(38,12) NOT NULL,
    "fundingGap" DECIMAL(38,12) NOT NULL,
    "daysOfRunway" INTEGER NOT NULL,
    "assumptions" JSONB NOT NULL DEFAULT '[]',
    "triggers" JSONB NOT NULL DEFAULT '[]',
    "recommendations" JSONB NOT NULL DEFAULT '[]',
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "liquidity_scenarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fx_exposure_analyses" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "analysisDate" TIMESTAMP(3) NOT NULL,
    "totalExposure" DECIMAL(38,12) NOT NULL,
    "netOpenPosition" DECIMAL(38,12) NOT NULL,
    "hedgedExposure" DECIMAL(38,12) NOT NULL,
    "unhedgedExposure" DECIMAL(38,12) NOT NULL,
    "exposureByCurrency" JSONB NOT NULL DEFAULT '{}',
    "exposureByRegion" JSONB NOT NULL DEFAULT '{}',
    "concentrationScore" DECIMAL(5,4) NOT NULL,
    "riskScore" DECIMAL(5,4) NOT NULL,
    "volatilityScore" DECIMAL(5,4) NOT NULL,
    "hedgingOpportunities" JSONB NOT NULL DEFAULT '[]',
    "recommendations" JSONB NOT NULL DEFAULT '[]',
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "fx_exposure_analyses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fx_recommendations" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "exposureId" TEXT NOT NULL,
    "recommendationType" TEXT NOT NULL DEFAULT 'no_action',
    "currencyPair" TEXT NOT NULL,
    "exposureAmount" DECIMAL(38,12) NOT NULL,
    "recommendedHedgeAmount" DECIMAL(38,12) NOT NULL,
    "hedgeRatio" DECIMAL(5,4) NOT NULL,
    "instrument" TEXT NOT NULL,
    "tenor" TEXT NOT NULL,
    "businessReason" TEXT NOT NULL,
    "confidence" DECIMAL(5,4) NOT NULL,
    "riskLevel" TEXT NOT NULL DEFAULT 'LOW',
    "financialImpact" JSONB NOT NULL DEFAULT '{}',
    "evidence" JSONB NOT NULL DEFAULT '[]',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "fx_recommendations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bank_relationships" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "bankName" TEXT NOT NULL,
    "bankCode" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "relationshipType" TEXT NOT NULL,
    "accountCount" INTEGER NOT NULL DEFAULT 0,
    "totalBalance" DECIMAL(38,12) NOT NULL,
    "healthScore" DECIMAL(5,4) NOT NULL,
    "connectionStatus" TEXT NOT NULL DEFAULT 'active',
    "lastSyncAt" TIMESTAMP(3),
    "fees" JSONB NOT NULL DEFAULT '{}',
    "limits" JSONB NOT NULL DEFAULT '{}',
    "utilization" JSONB NOT NULL DEFAULT '{}',
    "sweeps" JSONB NOT NULL DEFAULT '{}',
    "pools" JSONB NOT NULL DEFAULT '{}',
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bank_relationships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bank_healths" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "bankRelationshipId" TEXT NOT NULL,
    "assessmentDate" TIMESTAMP(3) NOT NULL,
    "overallScore" DECIMAL(5,4) NOT NULL,
    "connectionHealth" DECIMAL(5,4) NOT NULL,
    "settlementHealth" DECIMAL(5,4) NOT NULL,
    "feeCompetitiveness" DECIMAL(5,4) NOT NULL,
    "serviceQuality" DECIMAL(5,4) NOT NULL,
    "failedPayments" INTEGER NOT NULL DEFAULT 0,
    "pendingSettlements" INTEGER NOT NULL DEFAULT 0,
    "averageSettlementTime" DECIMAL(10,2) NOT NULL,
    "alerts" JSONB NOT NULL DEFAULT '[]',
    "recommendations" JSONB NOT NULL DEFAULT '[]',
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bank_healths_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "treasury_risks" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "riskDate" TIMESTAMP(3) NOT NULL,
    "riskType" TEXT NOT NULL,
    "riskLevel" TEXT NOT NULL DEFAULT 'LOW',
    "riskScore" DECIMAL(5,4) NOT NULL,
    "exposure" DECIMAL(38,12) NOT NULL,
    "potentialLoss" DECIMAL(38,12) NOT NULL,
    "probability" DECIMAL(5,4) NOT NULL,
    "mitigationActions" JSONB NOT NULL DEFAULT '[]',
    "owner" TEXT,
    "status" TEXT NOT NULL DEFAULT 'open',
    "trend" TEXT NOT NULL DEFAULT 'stable',
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "treasury_risks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "treasury_recommendations" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "businessReason" TEXT NOT NULL DEFAULT '',
    "supportingEvidence" JSONB NOT NULL DEFAULT '[]',
    "confidence" DECIMAL(5,4) NOT NULL,
    "riskLevel" TEXT NOT NULL DEFAULT 'LOW',
    "financialImpact" JSONB NOT NULL DEFAULT '{}',
    "affectedModules" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "requiredApprovals" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "status" TEXT NOT NULL DEFAULT 'pending',
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "treasury_recommendations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "debt_instruments" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "instrumentType" TEXT NOT NULL,
    "lenderName" TEXT NOT NULL,
    "principalAmount" DECIMAL(38,12) NOT NULL,
    "outstandingBalance" DECIMAL(38,12) NOT NULL,
    "interestRate" DECIMAL(10,6) NOT NULL,
    "rateType" TEXT NOT NULL,
    "maturityDate" TIMESTAMP(3) NOT NULL,
    "drawdownDate" TIMESTAMP(3) NOT NULL,
    "covenants" JSONB NOT NULL DEFAULT '[]',
    "utilization" DECIMAL(5,4) NOT NULL,
    "healthScore" DECIMAL(5,4) NOT NULL,
    "alerts" JSONB NOT NULL DEFAULT '[]',
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "debt_instruments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "debt_covenants" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "debtInstrumentId" TEXT NOT NULL,
    "covenantName" TEXT NOT NULL,
    "covenantType" TEXT NOT NULL,
    "threshold" DECIMAL(38,12) NOT NULL,
    "currentValue" DECIMAL(38,12) NOT NULL,
    "unit" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'compliant',
    "margin" DECIMAL(5,4) NOT NULL,
    "testFrequency" TEXT NOT NULL,
    "lastTestDate" TIMESTAMP(3) NOT NULL,
    "nextTestDate" TIMESTAMP(3) NOT NULL,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "debt_covenants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "debt_alerts" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "debtInstrumentId" TEXT NOT NULL,
    "alertType" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'info',
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "businessReason" TEXT NOT NULL DEFAULT '',
    "confidence" DECIMAL(5,4) NOT NULL,
    "recommendedAction" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "dueDate" TIMESTAMP(3),
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "debt_alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "investment_holdings" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "holdingName" TEXT NOT NULL,
    "instrumentType" TEXT NOT NULL,
    "issuer" TEXT NOT NULL,
    "counterparty" TEXT NOT NULL,
    "faceValue" DECIMAL(38,12) NOT NULL,
    "currentValue" DECIMAL(38,12) NOT NULL,
    "yield" DECIMAL(10,6) NOT NULL,
    "maturityDate" TIMESTAMP(3) NOT NULL,
    "liquidityClassification" TEXT NOT NULL,
    "counterpartyExposure" DECIMAL(38,12) NOT NULL,
    "riskRating" TEXT NOT NULL,
    "healthScore" DECIMAL(5,4) NOT NULL,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "investment_holdings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "investment_recommendations" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "holdingId" TEXT NOT NULL,
    "recommendationType" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "businessReason" TEXT NOT NULL DEFAULT '',
    "confidence" DECIMAL(5,4) NOT NULL,
    "riskLevel" TEXT NOT NULL DEFAULT 'LOW',
    "financialImpact" JSONB NOT NULL DEFAULT '{}',
    "evidence" JSONB NOT NULL DEFAULT '[]',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "investment_recommendations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "treasury_workspace_preferences" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "defaultCurrency" TEXT NOT NULL DEFAULT 'USD',
    "defaultHorizon" TEXT NOT NULL DEFAULT 'daily',
    "defaultScenario" TEXT NOT NULL DEFAULT 'expected',
    "alertThresholds" JSONB NOT NULL DEFAULT '{}',
    "dashboardLayout" JSONB NOT NULL DEFAULT '{}',
    "currencyPairs" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "riskTolerance" TEXT NOT NULL DEFAULT 'moderate',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "treasury_workspace_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "treasury_health_snapshots" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "snapshotDate" TIMESTAMP(3) NOT NULL,
    "overallScore" DECIMAL(5,4) NOT NULL,
    "cashHealth" DECIMAL(5,4) NOT NULL,
    "liquidityHealth" DECIMAL(5,4) NOT NULL,
    "fxHealth" DECIMAL(5,4) NOT NULL,
    "debtHealth" DECIMAL(5,4) NOT NULL,
    "investmentHealth" DECIMAL(5,4) NOT NULL,
    "riskHealth" DECIMAL(5,4) NOT NULL,
    "bankHealth" DECIMAL(5,4) NOT NULL,
    "policyCompliance" DECIMAL(5,4) NOT NULL,
    "trendData" JSONB NOT NULL DEFAULT '{}',
    "alerts" JSONB NOT NULL DEFAULT '[]',
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "treasury_health_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "treasury_specialist_alerts" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "alertType" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'info',
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "businessReason" TEXT NOT NULL DEFAULT '',
    "confidence" DECIMAL(5,4) NOT NULL,
    "source" TEXT NOT NULL,
    "evidence" JSONB NOT NULL DEFAULT '[]',
    "status" TEXT NOT NULL DEFAULT 'active',
    "assignedTo" TEXT,
    "dueDate" TIMESTAMP(3),
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "treasury_specialist_alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "finance_cases" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "caseNumber" INTEGER NOT NULL DEFAULT 0,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "caseType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'open',
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "severity" TEXT NOT NULL DEFAULT 'medium',
    "ownerSpecialist" TEXT NOT NULL,
    "ownerUserId" TEXT,
    "relatedSpecialists" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "evidenceCount" INTEGER NOT NULL DEFAULT 0,
    "recommendationCount" INTEGER NOT NULL DEFAULT 0,
    "taskCount" INTEGER NOT NULL DEFAULT 0,
    "decisionCount" INTEGER NOT NULL DEFAULT 0,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "finance_cases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "case_participants" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "participantType" TEXT NOT NULL,
    "participantId" TEXT NOT NULL,
    "participantName" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'contributor',
    "status" TEXT NOT NULL DEFAULT 'active',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "leftAt" TIMESTAMP(3),
    "metadata" JSONB NOT NULL DEFAULT '{}',

    CONSTRAINT "case_participants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "case_assignments" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "fromSpecialist" TEXT NOT NULL,
    "toSpecialist" TEXT NOT NULL,
    "taskTitle" TEXT NOT NULL,
    "taskDescription" TEXT NOT NULL DEFAULT '',
    "assignmentType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "dueDate" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "result" JSONB,
    "evidenceIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "case_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "case_comments" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "authorType" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "authorName" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "commentType" TEXT NOT NULL,
    "parentId" TEXT,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "case_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "case_evidence" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "evidenceType" TEXT NOT NULL,
    "referenceId" TEXT NOT NULL,
    "referenceType" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "source" TEXT NOT NULL,
    "confidence" DECIMAL(5,4) NOT NULL DEFAULT 0,
    "verificationStatus" TEXT NOT NULL DEFAULT 'unverified',
    "addedBy" TEXT NOT NULL,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "case_evidence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "case_decisions" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "decisionType" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "decidedBy" TEXT NOT NULL,
    "decisionResult" TEXT NOT NULL,
    "confidence" DECIMAL(5,4) NOT NULL DEFAULT 0,
    "evidenceIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "alternatives" JSONB NOT NULL DEFAULT '{}',
    "businessImpact" JSONB NOT NULL DEFAULT '{}',
    "financialImpact" JSONB NOT NULL DEFAULT '{}',
    "affectedSpecialists" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "status" TEXT NOT NULL DEFAULT 'proposed',
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "case_decisions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shared_recommendations" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "caseId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "category" TEXT NOT NULL,
    "contributors" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "primarySpecialist" TEXT NOT NULL,
    "evidenceIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "confidence" DECIMAL(5,4) NOT NULL DEFAULT 0,
    "riskLevel" TEXT NOT NULL DEFAULT 'low',
    "financialImpact" JSONB NOT NULL DEFAULT '{}',
    "businessReason" TEXT NOT NULL DEFAULT '',
    "requiredApprovals" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "affectedModules" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "status" TEXT NOT NULL DEFAULT 'proposed',
    "decisionId" TEXT,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shared_recommendations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "specialist_tasks" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "caseId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "taskType" TEXT NOT NULL,
    "assignedTo" TEXT NOT NULL,
    "assignedBy" TEXT NOT NULL,
    "assignedByType" TEXT NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "dueDate" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "blockedBy" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "evidenceIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "recommendationIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "reportIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "taskHistory" JSONB NOT NULL DEFAULT '[]',
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "specialist_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "task_dependencies" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "dependsOnTaskId" TEXT NOT NULL,
    "dependencyType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "task_dependencies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "task_history" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "eventDescription" TEXT NOT NULL,
    "previousValue" TEXT,
    "newValue" TEXT,
    "performedBy" TEXT NOT NULL,
    "performedByType" TEXT NOT NULL,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "task_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "collaboration_timeline" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "caseId" TEXT,
    "eventType" TEXT NOT NULL,
    "eventTitle" TEXT NOT NULL,
    "eventDescription" TEXT NOT NULL DEFAULT '',
    "eventSource" TEXT NOT NULL,
    "sourceType" TEXT NOT NULL,
    "specialistName" TEXT,
    "userId" TEXT,
    "relatedEntityId" TEXT,
    "relatedEntityType" TEXT,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "financeCaseId" TEXT,

    CONSTRAINT "collaboration_timeline_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "work_queues" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "queueName" TEXT NOT NULL,
    "queueType" TEXT NOT NULL,
    "itemCount" INTEGER NOT NULL DEFAULT 0,
    "priorityItems" INTEGER NOT NULL DEFAULT 0,
    "overdueItems" INTEGER NOT NULL DEFAULT 0,
    "assignedSpecialists" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "status" TEXT NOT NULL DEFAULT 'active',
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "work_queues_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "specialist_workloads" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "specialistName" TEXT NOT NULL,
    "totalTasks" INTEGER NOT NULL DEFAULT 0,
    "completedTasks" INTEGER NOT NULL DEFAULT 0,
    "inProgressTasks" INTEGER NOT NULL DEFAULT 0,
    "overdueTasks" INTEGER NOT NULL DEFAULT 0,
    "pendingTasks" INTEGER NOT NULL DEFAULT 0,
    "blockedTasks" INTEGER NOT NULL DEFAULT 0,
    "averageCompletionHours" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "capacity" INTEGER NOT NULL DEFAULT 10,
    "utilizationRate" DECIMAL(5,4) NOT NULL DEFAULT 0,
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "specialist_workloads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "enterprise_memory" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "memoryType" TEXT NOT NULL,
    "contextKey" TEXT NOT NULL,
    "contextValue" JSONB NOT NULL,
    "sourceSpecialist" TEXT NOT NULL,
    "relatedEntityId" TEXT,
    "relatedEntityType" TEXT,
    "expiresAt" TIMESTAMP(3),
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "enterprise_memory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "decision_registry" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "decisionNumber" INTEGER NOT NULL DEFAULT 0,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "decisionType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'proposed',
    "decidedBy" TEXT NOT NULL,
    "decidedByType" TEXT NOT NULL,
    "approvalRequired" BOOLEAN NOT NULL DEFAULT true,
    "approvals" JSONB NOT NULL DEFAULT '[]',
    "rejects" JSONB NOT NULL DEFAULT '[]',
    "alternatives" JSONB NOT NULL DEFAULT '[]',
    "evidenceIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "businessImpact" JSONB NOT NULL DEFAULT '{}',
    "financialImpact" JSONB NOT NULL DEFAULT '{}',
    "affectedSpecialists" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "caseId" TEXT,
    "workflowId" TEXT,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "decision_registry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_plans" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "planName" TEXT NOT NULL,
    "planType" TEXT NOT NULL DEFAULT 'annual',
    "status" TEXT NOT NULL DEFAULT 'draft',
    "fiscalYear" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "scope" JSONB NOT NULL DEFAULT '{}',
    "riskAssessment" JSONB NOT NULL DEFAULT '{}',
    "resourceAllocation" JSONB NOT NULL DEFAULT '{}',
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "audit_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_engagements" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "planId" TEXT,
    "engagementNumber" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "engagementType" TEXT NOT NULL DEFAULT 'financial',
    "status" TEXT NOT NULL DEFAULT 'planning',
    "leadAuditor" TEXT NOT NULL,
    "teamMembers" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "scope" JSONB NOT NULL DEFAULT '{}',
    "objectives" JSONB NOT NULL DEFAULT '{}',
    "methodology" JSONB NOT NULL DEFAULT '{}',
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "audit_engagements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_controls" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "controlName" TEXT NOT NULL,
    "controlCode" TEXT NOT NULL,
    "controlType" TEXT NOT NULL DEFAULT 'preventive',
    "category" TEXT NOT NULL DEFAULT 'approval',
    "description" TEXT NOT NULL DEFAULT '',
    "frequency" TEXT NOT NULL DEFAULT 'monthly',
    "owner" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "riskLevel" TEXT NOT NULL DEFAULT 'medium',
    "lastTestedAt" TIMESTAMP(3),
    "effectiveness" DECIMAL(5,4),
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "audit_controls_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "control_tests" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "controlId" TEXT NOT NULL,
    "testType" TEXT NOT NULL DEFAULT 'operating_effectiveness',
    "testMethod" TEXT NOT NULL DEFAULT 'inspection',
    "sampleSize" INTEGER,
    "sampleDescription" TEXT,
    "tester" TEXT NOT NULL,
    "testDate" TIMESTAMP(3) NOT NULL,
    "result" TEXT NOT NULL DEFAULT 'not_tested',
    "findings" JSONB NOT NULL DEFAULT '{}',
    "exceptions" INTEGER NOT NULL DEFAULT 0,
    "exceptionRate" DECIMAL(5,4),
    "narrative" TEXT,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "control_tests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "control_results" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "controlId" TEXT NOT NULL,
    "assessmentPeriod" TEXT NOT NULL,
    "totalTests" INTEGER NOT NULL DEFAULT 0,
    "effectiveTests" INTEGER NOT NULL DEFAULT 0,
    "ineffectiveTests" INTEGER NOT NULL DEFAULT 0,
    "partiallyEffectiveTests" INTEGER NOT NULL DEFAULT 0,
    "overallEffectiveness" DECIMAL(5,4) NOT NULL,
    "trend" TEXT NOT NULL DEFAULT 'stable',
    "riskLevel" TEXT NOT NULL DEFAULT 'medium',
    "lastAssessedAt" TIMESTAMP(3) NOT NULL,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "control_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_findings" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "engagementId" TEXT,
    "findingNumber" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "findingType" TEXT NOT NULL DEFAULT 'observation',
    "severity" TEXT NOT NULL DEFAULT 'medium',
    "status" TEXT NOT NULL DEFAULT 'open',
    "businessImpact" JSONB NOT NULL DEFAULT '{}',
    "financialImpact" JSONB NOT NULL DEFAULT '{}',
    "controlId" TEXT,
    "affectedAreas" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "affectedEntities" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "rootCause" TEXT,
    "recommendation" TEXT,
    "owner" TEXT,
    "dueDate" TIMESTAMP(3),
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "audit_findings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "finding_evidence" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "findingId" TEXT NOT NULL,
    "evidenceType" TEXT NOT NULL DEFAULT 'report',
    "referenceId" TEXT NOT NULL,
    "referenceType" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "source" TEXT NOT NULL,
    "collectedBy" TEXT NOT NULL,
    "collectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "confidence" DECIMAL(5,4) NOT NULL,
    "verificationStatus" TEXT NOT NULL DEFAULT 'unverified',
    "immutable" BOOLEAN NOT NULL DEFAULT true,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "finding_evidence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "remediation_plans" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "findingId" TEXT NOT NULL,
    "planTitle" TEXT NOT NULL,
    "planDescription" TEXT NOT NULL DEFAULT '',
    "remediationType" TEXT NOT NULL DEFAULT 'short_term',
    "status" TEXT NOT NULL DEFAULT 'proposed',
    "owner" TEXT NOT NULL,
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "startDate" TIMESTAMP(3) NOT NULL,
    "targetDate" TIMESTAMP(3) NOT NULL,
    "completedDate" TIMESTAMP(3),
    "progress" DECIMAL(5,4) NOT NULL DEFAULT 0,
    "estimatedCost" DECIMAL(38,12),
    "actualCost" DECIMAL(38,12),
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "remediation_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "remediation_tasks" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "taskTitle" TEXT NOT NULL,
    "taskDescription" TEXT NOT NULL DEFAULT '',
    "assignedTo" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "dueDate" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "evidenceIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "blockerDescription" TEXT,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "remediation_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_evidence_packages" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "engagementId" TEXT,
    "packageNumber" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "packageType" TEXT NOT NULL DEFAULT 'fieldwork',
    "status" TEXT NOT NULL DEFAULT 'assembling',
    "evidenceCount" INTEGER NOT NULL DEFAULT 0,
    "evidenceItems" JSONB NOT NULL DEFAULT '[]',
    "assembledBy" TEXT NOT NULL,
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "audit_evidence_packages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_readiness_snapshots" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "snapshotDate" TIMESTAMP(3) NOT NULL,
    "assessmentType" TEXT NOT NULL DEFAULT 'internal',
    "overallScore" DECIMAL(5,4) NOT NULL,
    "financialStatementsScore" DECIMAL(5,4) NOT NULL,
    "documentsScore" DECIMAL(5,4) NOT NULL,
    "evidenceCompletenessScore" DECIMAL(5,4) NOT NULL,
    "policyComplianceScore" DECIMAL(5,4) NOT NULL,
    "workflowCompletionScore" DECIMAL(5,4) NOT NULL,
    "outstandingExceptions" INTEGER NOT NULL DEFAULT 0,
    "unresolvedFindings" INTEGER NOT NULL DEFAULT 0,
    "openRisks" INTEGER NOT NULL DEFAULT 0,
    "missingDocumentation" INTEGER NOT NULL DEFAULT 0,
    "missingApprovals" INTEGER NOT NULL DEFAULT 0,
    "summary" JSONB NOT NULL DEFAULT '{}',
    "recommendations" JSONB NOT NULL DEFAULT '[]',
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_readiness_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_risk_assessments" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "assessmentDate" TIMESTAMP(3) NOT NULL,
    "assessmentType" TEXT NOT NULL DEFAULT 'annual',
    "overallRiskScore" DECIMAL(5,4) NOT NULL,
    "riskByCategory" JSONB NOT NULL DEFAULT '{}',
    "highRiskAreas" JSONB NOT NULL DEFAULT '[]',
    "riskTrends" JSONB NOT NULL DEFAULT '{}',
    "mitigatingControls" JSONB NOT NULL DEFAULT '{}',
    "recommendations" JSONB NOT NULL DEFAULT '[]',
    "assessedBy" TEXT NOT NULL,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_risk_assessments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_calendar" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "eventTitle" TEXT NOT NULL,
    "eventType" TEXT NOT NULL DEFAULT 'audit_engagement',
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "recurring" BOOLEAN NOT NULL DEFAULT false,
    "recurrencePattern" TEXT,
    "engagementId" TEXT,
    "relatedEntities" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "attendees" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "status" TEXT NOT NULL DEFAULT 'scheduled',
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "audit_calendar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_reports" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "engagementId" TEXT,
    "reportNumber" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "reportType" TEXT NOT NULL DEFAULT 'audit_report',
    "status" TEXT NOT NULL DEFAULT 'draft',
    "content" JSONB NOT NULL DEFAULT '{}',
    "findings" JSONB NOT NULL DEFAULT '[]',
    "recommendations" JSONB NOT NULL DEFAULT '[]',
    "distributionList" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "issuedBy" TEXT,
    "issuedAt" TIMESTAMP(3),
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "audit_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_workspace_preferences" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "defaultView" TEXT NOT NULL DEFAULT 'dashboard',
    "alertThresholds" JSONB NOT NULL DEFAULT '{}',
    "dashboardLayout" JSONB NOT NULL DEFAULT '{}',
    "notificationPreferences" JSONB NOT NULL DEFAULT '{}',
    "focusAreas" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "audit_workspace_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "compliance_frameworks" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "frameworkName" TEXT NOT NULL,
    "frameworkCode" TEXT NOT NULL,
    "frameworkType" TEXT NOT NULL,
    "description" TEXT,
    "jurisdiction" TEXT,
    "effectiveDate" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "requirements" JSONB NOT NULL DEFAULT '[]',
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "compliance_frameworks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "compliance_requirements" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "frameworkId" TEXT NOT NULL,
    "requirementCode" TEXT NOT NULL,
    "requirementName" TEXT NOT NULL,
    "description" TEXT,
    "requirementType" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "frequency" TEXT NOT NULL DEFAULT 'as_needed',
    "mandatory" BOOLEAN NOT NULL DEFAULT true,
    "owner" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "compliance_requirements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "compliance_obligations" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "requirementId" TEXT,
    "obligationTitle" TEXT NOT NULL,
    "description" TEXT,
    "obligationType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "owner" TEXT NOT NULL,
    "dueDate" TIMESTAMP(3),
    "completedDate" TIMESTAMP(3),
    "evidenceCount" INTEGER NOT NULL DEFAULT 0,
    "dependencies" TEXT[],
    "approvals" JSONB NOT NULL DEFAULT '[]',
    "escalationLevel" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "compliance_obligations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "compliance_policies" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "policyName" TEXT NOT NULL,
    "policyCode" TEXT NOT NULL,
    "policyCategory" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "effectiveDate" TIMESTAMP(3) NOT NULL,
    "reviewDate" TIMESTAMP(3),
    "owner" TEXT NOT NULL,
    "version" TEXT NOT NULL DEFAULT '1.0',
    "applicableFrameworks" TEXT[],
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "compliance_policies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "policy_versions" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "policyId" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "changeDescription" TEXT,
    "effectiveDate" TIMESTAMP(3) NOT NULL,
    "retiredDate" TIMESTAMP(3),
    "approvedBy" TEXT,
    "content" JSONB NOT NULL,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "policy_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "compliance_violations" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "policyId" TEXT,
    "violationTitle" TEXT NOT NULL,
    "description" TEXT,
    "violationType" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'medium',
    "status" TEXT NOT NULL DEFAULT 'open',
    "businessImpact" JSONB NOT NULL,
    "regulatoryImpact" JSONB NOT NULL,
    "financialImpact" JSONB NOT NULL,
    "evidenceCount" INTEGER NOT NULL DEFAULT 0,
    "controlId" TEXT,
    "riskRating" DECIMAL(5,4) NOT NULL,
    "owner" TEXT,
    "dueDate" TIMESTAMP(3),
    "remediationPlan" JSONB,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "compliance_violations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "compliance_assessments" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "assessmentTitle" TEXT NOT NULL,
    "assessmentType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'planned',
    "scope" JSONB NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "overallScore" DECIMAL(5,4),
    "findings" JSONB NOT NULL DEFAULT '[]',
    "assessor" TEXT NOT NULL,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "compliance_assessments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "compliance_health_snapshots" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "snapshotDate" TIMESTAMP(3) NOT NULL,
    "overallScore" DECIMAL(5,4) NOT NULL,
    "policyAdherenceScore" DECIMAL(5,4) NOT NULL,
    "regulatoryReadinessScore" DECIMAL(5,4) NOT NULL,
    "controlComplianceScore" DECIMAL(5,4) NOT NULL,
    "openViolations" INTEGER NOT NULL DEFAULT 0,
    "criticalViolations" INTEGER NOT NULL DEFAULT 0,
    "overdueObligations" INTEGER NOT NULL DEFAULT 0,
    "upcomingDeadlines" INTEGER NOT NULL DEFAULT 0,
    "trendData" JSONB NOT NULL,
    "alerts" JSONB NOT NULL,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "compliance_health_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "compliance_risk_assessments" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "assessmentDate" TIMESTAMP(3) NOT NULL,
    "overallRiskScore" DECIMAL(5,4) NOT NULL,
    "riskByCategory" JSONB NOT NULL,
    "riskByJurisdiction" JSONB NOT NULL,
    "riskByFramework" JSONB NOT NULL,
    "highRiskAreas" JSONB NOT NULL,
    "mitigatingControls" JSONB NOT NULL,
    "recommendations" JSONB NOT NULL,
    "assessedBy" TEXT NOT NULL,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "compliance_risk_assessments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "compliance_filings" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "filingTitle" TEXT NOT NULL,
    "filingType" TEXT NOT NULL,
    "jurisdiction" TEXT,
    "filingFrequency" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'not_started',
    "dueDate" TIMESTAMP(3) NOT NULL,
    "submissionDate" TIMESTAMP(3),
    "evidenceCount" INTEGER NOT NULL DEFAULT 0,
    "approver" TEXT,
    "approvalStatus" TEXT,
    "lateFiling" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "compliance_filings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "compliance_deadlines" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "deadlineTitle" TEXT NOT NULL,
    "deadlineType" TEXT NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "owner" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'upcoming',
    "reminderDaysBefore" INTEGER NOT NULL DEFAULT 7,
    "relatedObligationId" TEXT,
    "relatedFilingId" TEXT,
    "escalateAfterDays" INTEGER,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "compliance_deadlines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "regulatory_updates" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "updateTitle" TEXT NOT NULL,
    "description" TEXT,
    "updateType" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "jurisdiction" TEXT,
    "frameworkCode" TEXT,
    "effectiveDate" TIMESTAMP(3) NOT NULL,
    "assessmentStatus" TEXT NOT NULL DEFAULT 'pending',
    "affectedProcesses" JSONB NOT NULL DEFAULT '[]',
    "affectedControls" JSONB NOT NULL DEFAULT '[]',
    "affectedSpecialists" JSONB NOT NULL DEFAULT '[]',
    "impactAssessment" JSONB,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "regulatory_updates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "compliance_remediations" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "violationId" TEXT NOT NULL,
    "remediationTitle" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'proposed',
    "owner" TEXT NOT NULL,
    "assignedBy" TEXT,
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "startDate" TIMESTAMP(3) NOT NULL,
    "targetDate" TIMESTAMP(3) NOT NULL,
    "completedDate" TIMESTAMP(3),
    "progress" DECIMAL(5,4) NOT NULL DEFAULT 0,
    "evidenceCount" INTEGER NOT NULL DEFAULT 0,
    "effectiveness" DECIMAL(5,4),
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "compliance_remediations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "compliance_briefings" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "briefingDate" TIMESTAMP(3) NOT NULL,
    "briefingType" TEXT NOT NULL,
    "overallHealthScore" DECIMAL(5,4) NOT NULL,
    "summary" JSONB NOT NULL,
    "upcomingDeadlines" JSONB NOT NULL,
    "highRiskViolations" JSONB NOT NULL,
    "openObligations" JSONB NOT NULL,
    "regulatoryChanges" JSONB NOT NULL,
    "policyChanges" JSONB NOT NULL,
    "executiveActions" JSONB NOT NULL,
    "riskTrends" JSONB NOT NULL,
    "boardSummary" JSONB,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "compliance_briefings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "compliance_workspace_preferences" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "defaultView" TEXT NOT NULL DEFAULT 'dashboard',
    "alertThresholds" JSONB NOT NULL DEFAULT '{}',
    "dashboardLayout" JSONB NOT NULL DEFAULT '{}',
    "notificationPreferences" JSONB NOT NULL DEFAULT '{}',
    "focusFrameworks" TEXT[],
    "focusCategories" TEXT[],
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "compliance_workspace_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "strategic_plans" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "planName" TEXT NOT NULL,
    "planType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "fiscalYear" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "scope" JSONB NOT NULL DEFAULT '{}',
    "objectives" JSONB NOT NULL DEFAULT '{}',
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "strategic_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "planning_cycles" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "cycleName" TEXT NOT NULL,
    "cycleType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'not_started',
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "lockedAt" TIMESTAMP(3),
    "lockedBy" TEXT,
    "participants" TEXT[],
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "planning_cycles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "budgets" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "planId" TEXT,
    "budgetName" TEXT NOT NULL,
    "budgetType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "fiscalYear" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "totalAmount" DECIMAL(38,12) NOT NULL,
    "version" TEXT NOT NULL DEFAULT '1.0',
    "lockedAt" TIMESTAMP(3),
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "budgets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "budget_versions" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "budgetId" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "changeDescription" TEXT NOT NULL,
    "effectiveDate" TIMESTAMP(3) NOT NULL,
    "approvedBy" TEXT,
    "totalAmount" DECIMAL(38,12) NOT NULL,
    "lineCount" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "budget_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "budget_lines" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "budgetId" TEXT NOT NULL,
    "lineNumber" INTEGER NOT NULL,
    "accountCode" TEXT,
    "accountName" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "department" TEXT,
    "entity" TEXT,
    "costCenter" TEXT,
    "description" TEXT NOT NULL,
    "budgetAmount" DECIMAL(38,12) NOT NULL,
    "actualAmount" DECIMAL(38,12) NOT NULL DEFAULT 0,
    "variance" DECIMAL(38,12) NOT NULL DEFAULT 0,
    "variancePercent" DECIMAL(10,4) NOT NULL DEFAULT 0,
    "driverId" TEXT,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "budget_lines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "forecasts" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "planId" TEXT,
    "forecastName" TEXT NOT NULL,
    "forecastType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "horizon" TEXT NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "totalAmount" DECIMAL(38,11) NOT NULL,
    "accuracy" DECIMAL(5,4),
    "confidence" DECIMAL(5,4),
    "historicalBasis" JSONB NOT NULL DEFAULT '{}',
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "forecasts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "forecast_versions" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "forecastId" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "changeDescription" TEXT NOT NULL,
    "effectiveDate" TIMESTAMP(3) NOT NULL,
    "totalAmount" DECIMAL(38,11) NOT NULL,
    "accuracy" DECIMAL(5,4),
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "forecast_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scenario_models" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "scenarioName" TEXT NOT NULL,
    "scenarioType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "assumptions" JSONB NOT NULL DEFAULT '{}',
    "baseCase" JSONB NOT NULL DEFAULT '{}',
    "bestCase" JSONB NOT NULL DEFAULT '{}',
    "worstCase" JSONB NOT NULL DEFAULT '{}',
    "probability" DECIMAL(5,4),
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "scenario_models_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fpa_scenario_executions" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "scenarioId" TEXT NOT NULL,
    "executionDate" TIMESTAMP(3) NOT NULL,
    "inputParameters" JSONB NOT NULL DEFAULT '{}',
    "results" JSONB NOT NULL DEFAULT '{}',
    "financialImpact" JSONB NOT NULL DEFAULT '{}',
    "confidence" DECIMAL(5,4) NOT NULL,
    "riskRating" TEXT NOT NULL,
    "executedBy" TEXT NOT NULL,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "fpa_scenario_executions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "business_drivers" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "driverName" TEXT NOT NULL,
    "driverCategory" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "formula" TEXT,
    "defaultValue" DECIMAL(38,12) NOT NULL,
    "currentValue" DECIMAL(38,12),
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "business_drivers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "driver_assumptions" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,
    "planId" TEXT,
    "forecastId" TEXT,
    "scenarioId" TEXT,
    "assumptionValue" DECIMAL(38,12) NOT NULL,
    "growthRate" DECIMAL(10,6),
    "justification" TEXT NOT NULL,
    "effectiveDate" TIMESTAMP(3) NOT NULL,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "driver_assumptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "variance_analyses" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "analysisTitle" TEXT NOT NULL,
    "analysisType" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'in_progress',
    "overallVariance" DECIMAL(38,12) NOT NULL,
    "variancePercent" DECIMAL(10,4) NOT NULL,
    "keyDrivers" JSONB NOT NULL DEFAULT '{}',
    "rootCauses" JSONB NOT NULL DEFAULT '{}',
    "trends" JSONB NOT NULL DEFAULT '{}',
    "recommendations" JSONB NOT NULL DEFAULT '{}',
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "variance_analyses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "capital_plans" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "planId" TEXT,
    "capitalPlanName" TEXT NOT NULL,
    "fiscalYear" INTEGER NOT NULL,
    "totalBudget" DECIMAL(38,12) NOT NULL,
    "allocatedBudget" DECIMAL(38,12) NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "capital_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "investment_proposals" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "capitalPlanId" TEXT,
    "proposalTitle" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "investmentType" TEXT NOT NULL,
    "estimatedCost" DECIMAL(38,12) NOT NULL,
    "estimatedReturn" DECIMAL(38,12),
    "paybackPeriodMonths" INTEGER,
    "roi" DECIMAL(10,4),
    "riskRating" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'proposed',
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "businessCase" JSONB NOT NULL DEFAULT '{}',
    "financialProjections" JSONB NOT NULL DEFAULT '{}',
    "approver" TEXT,
    "approvedAt" TIMESTAMP(3),
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "investment_proposals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "strategic_initiatives" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "planId" TEXT,
    "initiativeName" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "initiativeType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'planning',
    "owner" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "targetDate" TIMESTAMP(3),
    "progress" DECIMAL(5,4) NOT NULL DEFAULT 0,
    "budget" DECIMAL(38,12),
    "actualSpend" DECIMAL(38,12) NOT NULL DEFAULT 0,
    "kpis" JSONB NOT NULL DEFAULT '{}',
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "strategic_initiatives_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "planning_recommendations" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "businessReason" TEXT NOT NULL,
    "financialImpact" JSONB NOT NULL DEFAULT '{}',
    "supportingEvidence" JSONB NOT NULL DEFAULT '{}',
    "confidence" DECIMAL(5,4) NOT NULL,
    "riskLevel" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'proposed',
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "requiredApprovals" TEXT[],
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "planning_recommendations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "planning_briefings" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "briefingDate" TIMESTAMP(3) NOT NULL,
    "briefingType" TEXT NOT NULL,
    "summary" JSONB NOT NULL DEFAULT '{}',
    "budgetStatus" JSONB NOT NULL DEFAULT '{}',
    "forecastStatus" JSONB NOT NULL DEFAULT '{}',
    "scenarioHighlights" JSONB NOT NULL DEFAULT '{}',
    "capitalHighlights" JSONB NOT NULL DEFAULT '{}',
    "strategicHighlights" JSONB NOT NULL DEFAULT '{}',
    "recommendations" JSONB NOT NULL DEFAULT '{}',
    "riskHighlights" JSONB NOT NULL DEFAULT '{}',
    "boardSummary" JSONB,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "planning_briefings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "planning_workspace_preferences" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "defaultView" TEXT NOT NULL DEFAULT 'dashboard',
    "defaultCurrency" TEXT NOT NULL DEFAULT 'USD',
    "defaultHorizon" TEXT NOT NULL,
    "defaultScenario" TEXT,
    "alertThresholds" JSONB NOT NULL DEFAULT '{}',
    "dashboardLayout" JSONB NOT NULL DEFAULT '{}',
    "focusCategories" TEXT[],
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "planning_workspace_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tax_jurisdictions" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "jurisdictionCode" TEXT NOT NULL,
    "jurisdictionName" TEXT NOT NULL,
    "jurisdictionType" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "state" TEXT,
    "taxAuthority" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tax_jurisdictions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tax_rates" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "jurisdictionId" TEXT NOT NULL,
    "rateType" TEXT NOT NULL,
    "rateName" TEXT NOT NULL,
    "rate" DECIMAL(10,6) NOT NULL,
    "effectiveDate" TIMESTAMP(3) NOT NULL,
    "expiryDate" TIMESTAMP(3),
    "isFlatRate" BOOLEAN NOT NULL DEFAULT true,
    "brackets" JSONB,
    "status" TEXT NOT NULL DEFAULT 'active',
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tax_rates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tax_provisions" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "provisionType" TEXT NOT NULL,
    "fiscalYear" INTEGER NOT NULL,
    "period" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "currentTax" DECIMAL(38,12) NOT NULL DEFAULT 0,
    "deferredTax" DECIMAL(38,12) NOT NULL DEFAULT 0,
    "totalTaxExpense" DECIMAL(38,12) NOT NULL DEFAULT 0,
    "effectiveTaxRate" DECIMAL(10,6) NOT NULL DEFAULT 0,
    "permanentDifferences" JSONB NOT NULL DEFAULT '[]',
    "temporaryDifferences" JSONB NOT NULL DEFAULT '[]',
    "reconciliation" JSONB NOT NULL DEFAULT '{}',
    "jurisdictionBreakdown" JSONB NOT NULL DEFAULT '[]',
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tax_provisions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "deferred_taxes" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "provisionId" TEXT,
    "jurisdictionId" TEXT,
    "itemDescription" TEXT NOT NULL,
    "temporaryDifferenceType" TEXT NOT NULL,
    "taxBase" DECIMAL(38,12) NOT NULL,
    "bookBase" DECIMAL(38,12) NOT NULL,
    "temporaryDifference" DECIMAL(38,12) NOT NULL,
    "deferredTaxAsset" DECIMAL(38,12) NOT NULL DEFAULT 0,
    "deferredTaxLiability" DECIMAL(38,12) NOT NULL DEFAULT 0,
    "enactedRate" DECIMAL(10,6) NOT NULL,
    "reversalDate" TIMESTAMP(3),
    "isValuationAllowance" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "deferred_taxes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tax_returns" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "jurisdictionId" TEXT NOT NULL,
    "returnType" TEXT NOT NULL,
    "fiscalYear" INTEGER NOT NULL,
    "period" TEXT,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "filingDate" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'not_started',
    "extensionFiled" BOOLEAN NOT NULL DEFAULT false,
    "extensionDate" TIMESTAMP(3),
    "taxDue" DECIMAL(38,12) NOT NULL DEFAULT 0,
    "refundDue" DECIMAL(38,12) NOT NULL DEFAULT 0,
    "penalties" DECIMAL(38,12) NOT NULL DEFAULT 0,
    "interest" DECIMAL(38,12) NOT NULL DEFAULT 0,
    "preparer" TEXT,
    "reviewer" TEXT,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tax_returns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tax_filings" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "jurisdictionId" TEXT NOT NULL,
    "returnId" TEXT,
    "filingTitle" TEXT NOT NULL,
    "filingType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "dueDate" TIMESTAMP(3) NOT NULL,
    "submissionDate" TIMESTAMP(3),
    "evidenceCount" INTEGER NOT NULL DEFAULT 0,
    "approver" TEXT,
    "approvalStatus" TEXT,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tax_filings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tax_deadlines" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "jurisdictionId" TEXT NOT NULL,
    "deadlineTitle" TEXT NOT NULL,
    "deadlineType" TEXT NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'upcoming',
    "reminderDaysBefore" INTEGER NOT NULL DEFAULT 14,
    "relatedReturnId" TEXT,
    "escalateAfterDays" INTEGER,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tax_deadlines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tax_payments" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "jurisdictionId" TEXT NOT NULL,
    "returnId" TEXT,
    "paymentType" TEXT NOT NULL,
    "paymentDate" TIMESTAMP(3) NOT NULL,
    "amount" DECIMAL(38,12) NOT NULL,
    "paymentMethod" TEXT,
    "referenceNumber" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "reconciledAt" TIMESTAMP(3),
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tax_payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transfer_pricing_policies" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "policyName" TEXT NOT NULL,
    "intercompanyType" TEXT NOT NULL,
    "armLengthMethod" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "documentationStatus" TEXT NOT NULL,
    "lastReviewDate" TIMESTAMP(3),
    "nextReviewDate" TIMESTAMP(3),
    "riskLevel" TEXT NOT NULL DEFAULT 'medium',
    "status" TEXT NOT NULL DEFAULT 'active',
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transfer_pricing_policies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "intercompany_tax_rules" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "policyId" TEXT,
    "ruleName" TEXT NOT NULL,
    "fromJurisdictionId" TEXT NOT NULL,
    "toJurisdictionId" TEXT NOT NULL,
    "transactionType" TEXT NOT NULL,
    "withholdingRate" DECIMAL(10,6) NOT NULL DEFAULT 0,
    "vatRate" DECIMAL(10,6) NOT NULL DEFAULT 0,
    "treatyBenefits" JSONB,
    "status" TEXT NOT NULL DEFAULT 'active',
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "intercompany_tax_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tax_assessments" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "jurisdictionId" TEXT NOT NULL,
    "returnId" TEXT,
    "assessmentType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "assessedAmount" DECIMAL(38,12) NOT NULL DEFAULT 0,
    "disputedAmount" DECIMAL(38,12) NOT NULL DEFAULT 0,
    "assessedBy" TEXT NOT NULL,
    "assessmentDate" TIMESTAMP(3) NOT NULL,
    "findings" JSONB NOT NULL DEFAULT '[]',
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tax_assessments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tax_risk_assessments" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "assessmentDate" TIMESTAMP(3) NOT NULL,
    "overallRiskScore" DECIMAL(5,4) NOT NULL,
    "jurisdictionRisks" JSONB NOT NULL,
    "filingRisks" JSONB NOT NULL,
    "provisionRisks" JSONB NOT NULL,
    "transferPricingRisks" JSONB NOT NULL,
    "documentationRisks" JSONB NOT NULL,
    "exposureRisks" JSONB NOT NULL,
    "highRiskAreas" JSONB NOT NULL,
    "recommendations" JSONB NOT NULL,
    "assessedBy" TEXT NOT NULL,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tax_risk_assessments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tax_planning_scenarios" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "scenarioName" TEXT NOT NULL,
    "scenarioType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "assumptions" JSONB NOT NULL,
    "projectedTaxImpact" DECIMAL(38,12) NOT NULL,
    "projectedSavings" DECIMAL(38,12) NOT NULL DEFAULT 0,
    "riskRating" TEXT NOT NULL DEFAULT 'medium',
    "implementationComplexity" TEXT NOT NULL DEFAULT 'medium',
    "timeline" TEXT,
    "businessCase" JSONB NOT NULL,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tax_planning_scenarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tax_recommendations" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "businessReason" TEXT NOT NULL,
    "financialImpact" JSONB NOT NULL,
    "confidence" DECIMAL(5,4) NOT NULL,
    "riskLevel" TEXT NOT NULL DEFAULT 'medium',
    "status" TEXT NOT NULL DEFAULT 'proposed',
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "requiredApprovals" TEXT[],
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tax_recommendations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tax_briefings" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "briefingDate" TIMESTAMP(3) NOT NULL,
    "briefingType" TEXT NOT NULL,
    "summary" JSONB NOT NULL,
    "deadlinesSummary" JSONB NOT NULL,
    "riskSummary" JSONB NOT NULL,
    "provisionSummary" JSONB NOT NULL,
    "deferredTaxSummary" JSONB NOT NULL,
    "filingStatus" JSONB NOT NULL,
    "planningOpportunities" JSONB NOT NULL,
    "boardSummary" JSONB,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tax_briefings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tax_workspace_preferences" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "defaultView" TEXT NOT NULL DEFAULT 'dashboard',
    "defaultCurrency" TEXT NOT NULL DEFAULT 'USD',
    "focusJurisdictions" TEXT[],
    "alertThresholds" JSONB NOT NULL,
    "dashboardLayout" JSONB NOT NULL,
    "notificationPreferences" JSONB NOT NULL,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tax_workspace_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "boards" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "boardName" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "formationDate" TIMESTAMP(3),
    "chairmanId" TEXT,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "boards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "board_members" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "boardId" TEXT NOT NULL,
    "memberName" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "email" TEXT,
    "appointmentDate" TIMESTAMP(3) NOT NULL,
    "termEndDate" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'active',
    "votingRights" BOOLEAN NOT NULL DEFAULT true,
    "committees" TEXT[],
    "attendanceRate" DECIMAL(5,4) NOT NULL DEFAULT 0,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "board_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "committees" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "boardId" TEXT NOT NULL,
    "committeeName" TEXT NOT NULL,
    "committeeType" TEXT NOT NULL,
    "description" TEXT,
    "charter" JSONB,
    "chairId" TEXT,
    "meetingFrequency" TEXT NOT NULL DEFAULT 'monthly',
    "status" TEXT NOT NULL DEFAULT 'active',
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "committees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "committee_members" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "committeeId" TEXT NOT NULL,
    "boardMemberId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'member',
    "appointedDate" TIMESTAMP(3) NOT NULL,
    "leftDate" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'active',
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "committee_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "board_meetings" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "boardId" TEXT NOT NULL,
    "committeeId" TEXT,
    "meetingNumber" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "meetingType" TEXT NOT NULL,
    "scheduledDate" TIMESTAMP(3) NOT NULL,
    "duration" INTEGER,
    "location" TEXT,
    "status" TEXT NOT NULL DEFAULT 'scheduled',
    "quorumMet" BOOLEAN,
    "attendees" JSONB NOT NULL DEFAULT '[]',
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "board_meetings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meeting_agendas" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "meetingId" TEXT NOT NULL,
    "version" TEXT NOT NULL DEFAULT '1.0',
    "status" TEXT NOT NULL DEFAULT 'draft',
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "meeting_agendas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agenda_items" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "agendaId" TEXT NOT NULL,
    "lineNumber" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL DEFAULT 'other',
    "presenter" TEXT,
    "durationMinutes" INTEGER,
    "requiresVote" BOOLEAN NOT NULL DEFAULT false,
    "requiresApproval" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "agenda_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "board_resolutions" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "meetingId" TEXT,
    "resolutionNumber" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "resolutionType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'proposed',
    "requiredVotes" INTEGER NOT NULL,
    "votesFor" INTEGER NOT NULL DEFAULT 0,
    "votesAgainst" INTEGER NOT NULL DEFAULT 0,
    "abstentions" INTEGER NOT NULL DEFAULT 0,
    "passed" BOOLEAN NOT NULL DEFAULT false,
    "effectiveDate" TIMESTAMP(3),
    "expiryDate" TIMESTAMP(3),
    "owner" TEXT,
    "dependencies" TEXT[],
    "evidenceIds" TEXT[],
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "board_resolutions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "board_votes" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "resolutionId" TEXT NOT NULL,
    "meetingId" TEXT NOT NULL,
    "boardMemberId" TEXT NOT NULL,
    "vote" TEXT NOT NULL,
    "rationale" TEXT,
    "votedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "board_votes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meeting_minutes" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "meetingId" TEXT NOT NULL,
    "minuteType" TEXT NOT NULL DEFAULT 'draft',
    "content" JSONB NOT NULL,
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "actionItemCount" INTEGER NOT NULL DEFAULT 0,
    "resolutionCount" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "meeting_minutes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "board_actions" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "meetingId" TEXT,
    "resolutionId" TEXT,
    "actionTitle" TEXT NOT NULL,
    "description" TEXT,
    "assignedTo" TEXT NOT NULL,
    "assignedToType" TEXT NOT NULL DEFAULT 'human',
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "dueDate" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),
    "progress" DECIMAL(5,4) NOT NULL DEFAULT 0,
    "evidenceIds" TEXT[],
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "board_actions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "governance_board_packs" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "meetingId" TEXT NOT NULL,
    "packTitle" TEXT NOT NULL,
    "packType" TEXT NOT NULL DEFAULT 'regular',
    "status" TEXT NOT NULL DEFAULT 'assembling',
    "sections" JSONB NOT NULL DEFAULT '[]',
    "assembledBy" TEXT NOT NULL,
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "distributedAt" TIMESTAMP(3),
    "evidenceCount" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "governance_board_packs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "board_briefings" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "briefingDate" TIMESTAMP(3) NOT NULL,
    "briefingType" TEXT NOT NULL,
    "summary" JSONB NOT NULL DEFAULT '{}',
    "meetingHighlights" JSONB NOT NULL DEFAULT '{}',
    "actionStatus" JSONB NOT NULL DEFAULT '{}',
    "riskHighlights" JSONB NOT NULL DEFAULT '{}',
    "financialHighlights" JSONB NOT NULL DEFAULT '{}',
    "auditHighlights" JSONB NOT NULL DEFAULT '{}',
    "complianceHighlights" JSONB NOT NULL DEFAULT '{}',
    "taxHighlights" JSONB NOT NULL DEFAULT '{}',
    "strategicHighlights" JSONB NOT NULL DEFAULT '{}',
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "board_briefings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "governance_metrics" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "metricDate" TIMESTAMP(3) NOT NULL,
    "overallScore" DECIMAL(5,4) NOT NULL,
    "meetingEffectiveness" DECIMAL(5,4) NOT NULL,
    "resolutionCompletionRate" DECIMAL(5,4) NOT NULL,
    "actionCompletionRate" DECIMAL(5,4) NOT NULL,
    "committeePerformance" JSONB NOT NULL DEFAULT '{}',
    "attendanceRate" DECIMAL(5,4) NOT NULL,
    "decisionCycleTimeDays" DECIMAL(10,2) NOT NULL,
    "complianceScore" DECIMAL(5,4) NOT NULL,
    "riskScore" DECIMAL(5,4) NOT NULL,
    "trendData" JSONB NOT NULL DEFAULT '{}',
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "governance_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "board_workspace_preferences" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "defaultView" TEXT NOT NULL DEFAULT 'dashboard',
    "defaultBoardId" TEXT,
    "alertThresholds" JSONB NOT NULL DEFAULT '{}',
    "dashboardLayout" JSONB NOT NULL DEFAULT '{}',
    "notificationPreferences" JSONB NOT NULL DEFAULT '{}',
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "board_workspace_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crm_contacts" (
    "id" TEXT NOT NULL,
    "companyId" TEXT,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "company" TEXT,
    "source" "ContactSource" NOT NULL DEFAULT 'WEBSITE',
    "relationshipStage" "RelationshipStage" NOT NULL DEFAULT 'DISCOVERY_CONVERSATION',
    "status" "ContactStatus" NOT NULL DEFAULT 'ACTIVE',
    "expertise" TEXT[],
    "tags" TEXT[],
    "notes" TEXT NOT NULL DEFAULT '',
    "isStrategicAdvisor" BOOLEAN NOT NULL DEFAULT false,
    "location" TEXT,
    "whatsapp" TEXT,
    "priority" TEXT,
    "region" TEXT,
    "relationshipType" TEXT,
    "potentialRoles" TEXT[],
    "classification" "Classification",
    "designPartnerPotential" "DesignPartnerPotential",
    "productModules" TEXT[],
    "conversationSummary" TEXT,
    "keyProductInsights" TEXT[],
    "preferredLanguage" TEXT,
    "industryExperience" TEXT[],
    "potentialContributions" TEXT[],
    "recommendedNextSteps" TEXT[],
    "nextFollowUp" TIMESTAMP(3),
    "conversationStatus" TEXT,
    "relationship_strength" INTEGER,
    "trust_score" INTEGER,
    "engagementLevel" TEXT,
    "champion_potential" BOOLEAN NOT NULL DEFAULT false,
    "advisor_potential" BOOLEAN NOT NULL DEFAULT false,
    "investor_potential" BOOLEAN NOT NULL DEFAULT false,
    "pilot_customer_potential" BOOLEAN NOT NULL DEFAULT false,
    "referral_potential" BOOLEAN NOT NULL DEFAULT false,
    "hiring_potential" BOOLEAN NOT NULL DEFAULT false,
    "strategic_importance" "StrategicImportance",
    "last_meaningful_conversation" TIMESTAMP(3),
    "next_recommended_action" TEXT,
    "relationship_health" "RelationshipHealth" DEFAULT 'HEALTHY',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "crm_contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crm_professional_profiles" (
    "id" TEXT NOT NULL,
    "contact_id" TEXT NOT NULL,
    "current_role" TEXT,
    "previousRoles" JSONB NOT NULL DEFAULT '[]',
    "industry" TEXT,
    "department" TEXT,
    "finance_function" TEXT,
    "years_experience" INTEGER,
    "certifications" JSONB NOT NULL DEFAULT '[]',
    "erp_experience" JSONB NOT NULL DEFAULT '[]',
    "accounting_standards" JSONB NOT NULL DEFAULT '[]',
    "company_size" TEXT,
    "country" TEXT,
    "region" TEXT,
    "decision_authority" TEXT,
    "technology_stack" JSONB NOT NULL DEFAULT '[]',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "crm_professional_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crm_interactions" (
    "id" TEXT NOT NULL,
    "contact_id" TEXT NOT NULL,
    "type" "InteractionType" NOT NULL,
    "channel" "InteractionChannel",
    "direction" "InteractionDirection",
    "sentiment" "Sentiment",
    "outcome" "InteractionOutcome",
    "notes" TEXT,
    "linked_insights" JSONB,
    "key_insights" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "crm_interactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crm_opportunities" (
    "id" TEXT NOT NULL,
    "contact_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "stage" "OpportunityStage" NOT NULL DEFAULT 'DISCOVERY',
    "probability" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "category" "OpportunityCategory" NOT NULL DEFAULT 'STRATEGIC_PARTNERSHIP',
    "potential_outcomes" JSONB NOT NULL DEFAULT '[]',
    "priority" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "crm_opportunities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crm_tasks" (
    "id" TEXT NOT NULL,
    "contact_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "assigned_to" TEXT,
    "due_date" TIMESTAMP(3),
    "status" "TaskStatus" NOT NULL DEFAULT 'OPEN',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "crm_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crm_contact_intelligence" (
    "id" TEXT NOT NULL,
    "contact_id" TEXT NOT NULL,
    "strengths" JSONB NOT NULL DEFAULT '[]',
    "potential_value" JSONB NOT NULL DEFAULT '[]',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "crm_contact_intelligence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crm_voc_insights" (
    "id" TEXT NOT NULL,
    "contact_id" TEXT NOT NULL,
    "pain_point" TEXT,
    "desired_outcome" TEXT,
    "current_process" TEXT,
    "manual_work" TEXT,
    "workaround" TEXT,
    "feature_request" TEXT,
    "idea" TEXT,
    "opportunity" TEXT,
    "risk" TEXT,
    "quote" TEXT,
    "evidence" TEXT,
    "confidence_level" TEXT,
    "interview_date" TIMESTAMP(3),
    "interview_type" "InterviewType",
    "interview_status" "InterviewStatus" DEFAULT 'SCHEDULED',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "crm_voc_insights_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crm_pain_points" (
    "id" TEXT NOT NULL,
    "category" "PainPointCategory" NOT NULL DEFAULT 'OTHER',
    "subcategory" TEXT,
    "frequency" TEXT,
    "severity" TEXT,
    "trend" TEXT,
    "industries" JSONB NOT NULL DEFAULT '[]',
    "roles" JSONB NOT NULL DEFAULT '[]',
    "companies" JSONB NOT NULL DEFAULT '[]',
    "contact_id" TEXT,
    "insight_id" TEXT,
    "first_mention" TIMESTAMP(3),
    "latest_mention" TIMESTAMP(3),
    "supporting_quotes" JSONB NOT NULL DEFAULT '[]',
    "linked_product_areas" JSONB NOT NULL DEFAULT '[]',
    "roadmap_items" JSONB NOT NULL DEFAULT '[]',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "crm_pain_points_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crm_discovery_sessions" (
    "id" TEXT NOT NULL,
    "contact_id" TEXT NOT NULL,
    "discovery_stage" "DiscoveryStage" DEFAULT 'RESEARCH',
    "interview_goals" JSONB NOT NULL DEFAULT '[]',
    "interview_questions" JSONB NOT NULL DEFAULT '[]',
    "interview_notes" TEXT,
    "key_learnings" JSONB NOT NULL DEFAULT '[]',
    "follow_up_required" BOOLEAN NOT NULL DEFAULT false,
    "feature_requests" JSONB NOT NULL DEFAULT '[]',
    "workflow_insights" JSONB NOT NULL DEFAULT '[]',
    "automation_opportunities" JSONB NOT NULL DEFAULT '[]',
    "design_observations" JSONB NOT NULL DEFAULT '[]',
    "constitution_references" JSONB NOT NULL DEFAULT '[]',
    "roadmap_links" JSONB NOT NULL DEFAULT '[]',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "crm_discovery_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crm_timeline_events" (
    "id" TEXT NOT NULL,
    "contact_id" TEXT NOT NULL,
    "event_type" "TimelineEventType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "event_date" TIMESTAMP(3),
    "link" TEXT,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "crm_timeline_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crm_knowledge_graph" (
    "id" TEXT NOT NULL,
    "source_contact_id" TEXT NOT NULL,
    "target_contact_id" TEXT,
    "target_company" TEXT,
    "target_industry" TEXT,
    "target_pain_point" TEXT,
    "target_erp" TEXT,
    "target_workflow" TEXT,
    "target_module" TEXT,
    "target_feature" TEXT,
    "target_roadmap" TEXT,
    "target_constitution" TEXT,
    "target_interview" TEXT,
    "target_recommendation" TEXT,
    "linkType" TEXT NOT NULL,
    "strength" INTEGER,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "crm_knowledge_graph_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "agent_definitions_companyId_status_idx" ON "agent_definitions"("companyId", "status");

-- CreateIndex
CREATE INDEX "agent_definitions_companyId_role_idx" ON "agent_definitions"("companyId", "role");

-- CreateIndex
CREATE UNIQUE INDEX "agent_definitions_companyId_name_key" ON "agent_definitions"("companyId", "name");

-- CreateIndex
CREATE INDEX "agent_capabilities_companyId_agentId_idx" ON "agent_capabilities"("companyId", "agentId");

-- CreateIndex
CREATE INDEX "agent_capabilities_companyId_capabilityType_idx" ON "agent_capabilities"("companyId", "capabilityType");

-- CreateIndex
CREATE UNIQUE INDEX "agent_capabilities_agentId_name_key" ON "agent_capabilities"("agentId", "name");

-- CreateIndex
CREATE INDEX "agent_sessions_companyId_agentId_idx" ON "agent_sessions"("companyId", "agentId");

-- CreateIndex
CREATE INDEX "agent_sessions_companyId_status_idx" ON "agent_sessions"("companyId", "status");

-- CreateIndex
CREATE INDEX "agent_sessions_companyId_userId_idx" ON "agent_sessions"("companyId", "userId");

-- CreateIndex
CREATE INDEX "agent_tasks_companyId_agentId_status_idx" ON "agent_tasks"("companyId", "agentId", "status");

-- CreateIndex
CREATE INDEX "agent_tasks_companyId_status_priority_idx" ON "agent_tasks"("companyId", "status", "priority");

-- CreateIndex
CREATE INDEX "agent_tasks_companyId_sessionId_idx" ON "agent_tasks"("companyId", "sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "agent_executions_taskId_key" ON "agent_executions"("taskId");

-- CreateIndex
CREATE INDEX "agent_executions_companyId_agentId_idx" ON "agent_executions"("companyId", "agentId");

-- CreateIndex
CREATE INDEX "agent_executions_companyId_status_idx" ON "agent_executions"("companyId", "status");

-- CreateIndex
CREATE INDEX "agent_executions_companyId_startedAt_idx" ON "agent_executions"("companyId", "startedAt");

-- CreateIndex
CREATE INDEX "agent_decisions_companyId_agentId_status_idx" ON "agent_decisions"("companyId", "agentId", "status");

-- CreateIndex
CREATE INDEX "agent_decisions_companyId_status_createdAt_idx" ON "agent_decisions"("companyId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "agent_decisions_companyId_impact_idx" ON "agent_decisions"("companyId", "impact");

-- CreateIndex
CREATE INDEX "agent_evidence_companyId_executionId_idx" ON "agent_evidence"("companyId", "executionId");

-- CreateIndex
CREATE INDEX "agent_evidence_companyId_sourceType_idx" ON "agent_evidence"("companyId", "sourceType");

-- CreateIndex
CREATE INDEX "agent_evidence_companyId_sourceSystem_sourceId_idx" ON "agent_evidence"("companyId", "sourceSystem", "sourceId");

-- CreateIndex
CREATE INDEX "agent_memory_companyId_agentId_memoryType_idx" ON "agent_memory"("companyId", "agentId", "memoryType");

-- CreateIndex
CREATE INDEX "agent_memory_companyId_agentId_importance_idx" ON "agent_memory"("companyId", "agentId", "importance");

-- CreateIndex
CREATE INDEX "agent_memory_companyId_userId_idx" ON "agent_memory"("companyId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "agent_memory_companyId_agentId_memoryType_key_key" ON "agent_memory"("companyId", "agentId", "memoryType", "key");

-- CreateIndex
CREATE INDEX "agent_health_companyId_agentId_status_idx" ON "agent_health"("companyId", "agentId", "status");

-- CreateIndex
CREATE INDEX "agent_health_companyId_agentId_checkedAt_idx" ON "agent_health"("companyId", "agentId", "checkedAt");

-- CreateIndex
CREATE INDEX "agent_permissions_companyId_agentId_idx" ON "agent_permissions"("companyId", "agentId");

-- CreateIndex
CREATE INDEX "agent_permissions_companyId_permission_idx" ON "agent_permissions"("companyId", "permission");

-- CreateIndex
CREATE UNIQUE INDEX "agent_permissions_companyId_agentId_permission_key" ON "agent_permissions"("companyId", "agentId", "permission");

-- CreateIndex
CREATE UNIQUE INDEX "agent_configurations_agentId_key" ON "agent_configurations"("agentId");

-- CreateIndex
CREATE INDEX "agent_conversations_companyId_sessionId_idx" ON "agent_conversations"("companyId", "sessionId");

-- CreateIndex
CREATE INDEX "agent_conversations_companyId_agentId_idx" ON "agent_conversations"("companyId", "agentId");

-- CreateIndex
CREATE INDEX "agent_conversations_companyId_role_idx" ON "agent_conversations"("companyId", "role");

-- CreateIndex
CREATE INDEX "agent_delegations_companyId_fromAgentId_idx" ON "agent_delegations"("companyId", "fromAgentId");

-- CreateIndex
CREATE INDEX "agent_delegations_companyId_toAgentId_idx" ON "agent_delegations"("companyId", "toAgentId");

-- CreateIndex
CREATE INDEX "agent_delegations_companyId_status_idx" ON "agent_delegations"("companyId", "status");

-- CreateIndex
CREATE INDEX "agent_delegations_companyId_traceId_idx" ON "agent_delegations"("companyId", "traceId");

-- CreateIndex
CREATE INDEX "agent_audit_companyId_agentId_action_idx" ON "agent_audit"("companyId", "agentId", "action");

-- CreateIndex
CREATE INDEX "agent_audit_companyId_action_createdAt_idx" ON "agent_audit"("companyId", "action", "createdAt");

-- CreateIndex
CREATE INDEX "agent_audit_companyId_sessionId_idx" ON "agent_audit"("companyId", "sessionId");

-- CreateIndex
CREATE INDEX "agent_audit_companyId_correlationId_idx" ON "agent_audit"("companyId", "correlationId");

-- CreateIndex
CREATE INDEX "executive_briefings_companyId_briefingDate_idx" ON "executive_briefings"("companyId", "briefingDate");

-- CreateIndex
CREATE INDEX "executive_briefings_companyId_status_idx" ON "executive_briefings"("companyId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "executive_briefings_companyId_briefingDate_period_key" ON "executive_briefings"("companyId", "briefingDate", "period");

-- CreateIndex
CREATE INDEX "executive_recommendations_companyId_category_idx" ON "executive_recommendations"("companyId", "category");

-- CreateIndex
CREATE INDEX "executive_recommendations_companyId_status_idx" ON "executive_recommendations"("companyId", "status");

-- CreateIndex
CREATE INDEX "executive_recommendations_companyId_priority_idx" ON "executive_recommendations"("companyId", "priority");

-- CreateIndex
CREATE INDEX "executive_recommendations_companyId_briefingId_idx" ON "executive_recommendations"("companyId", "briefingId");

-- CreateIndex
CREATE INDEX "scenario_analyses_companyId_scenarioType_idx" ON "scenario_analyses"("companyId", "scenarioType");

-- CreateIndex
CREATE INDEX "scenario_analyses_companyId_status_idx" ON "scenario_analyses"("companyId", "status");

-- CreateIndex
CREATE INDEX "scenario_analyses_companyId_createdAt_idx" ON "scenario_analyses"("companyId", "createdAt");

-- CreateIndex
CREATE INDEX "scenario_executions_companyId_scenarioId_idx" ON "scenario_executions"("companyId", "scenarioId");

-- CreateIndex
CREATE INDEX "scenario_executions_companyId_status_idx" ON "scenario_executions"("companyId", "status");

-- CreateIndex
CREATE INDEX "executive_conversations_companyId_userId_idx" ON "executive_conversations"("companyId", "userId");

-- CreateIndex
CREATE INDEX "executive_conversations_companyId_status_idx" ON "executive_conversations"("companyId", "status");

-- CreateIndex
CREATE INDEX "executive_messages_companyId_conversationId_idx" ON "executive_messages"("companyId", "conversationId");

-- CreateIndex
CREATE INDEX "executive_messages_companyId_role_idx" ON "executive_messages"("companyId", "role");

-- CreateIndex
CREATE INDEX "executive_insights_companyId_insightType_idx" ON "executive_insights"("companyId", "insightType");

-- CreateIndex
CREATE INDEX "executive_insights_companyId_severity_idx" ON "executive_insights"("companyId", "severity");

-- CreateIndex
CREATE INDEX "executive_insights_companyId_acknowledged_idx" ON "executive_insights"("companyId", "acknowledged");

-- CreateIndex
CREATE INDEX "executive_insights_companyId_createdAt_idx" ON "executive_insights"("companyId", "createdAt");

-- CreateIndex
CREATE INDEX "executive_priorities_companyId_urgency_idx" ON "executive_priorities"("companyId", "urgency");

-- CreateIndex
CREATE INDEX "executive_priorities_companyId_status_idx" ON "executive_priorities"("companyId", "status");

-- CreateIndex
CREATE INDEX "executive_priorities_companyId_priorityType_idx" ON "executive_priorities"("companyId", "priorityType");

-- CreateIndex
CREATE INDEX "executive_decisions_companyId_decisionType_idx" ON "executive_decisions"("companyId", "decisionType");

-- CreateIndex
CREATE INDEX "executive_decisions_companyId_status_idx" ON "executive_decisions"("companyId", "status");

-- CreateIndex
CREATE INDEX "executive_decisions_companyId_riskLevel_idx" ON "executive_decisions"("companyId", "riskLevel");

-- CreateIndex
CREATE INDEX "executive_decisions_companyId_createdAt_idx" ON "executive_decisions"("companyId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "executive_workspace_preferences_companyId_key" ON "executive_workspace_preferences"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "executive_workspace_preferences_userId_key" ON "executive_workspace_preferences"("userId");

-- CreateIndex
CREATE INDEX "executive_board_packs_companyId_status_idx" ON "executive_board_packs"("companyId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "executive_board_packs_companyId_period_year_key" ON "executive_board_packs"("companyId", "period", "year");

-- CreateIndex
CREATE INDEX "reconciliation_cases_companyId_reconciliationType_idx" ON "reconciliation_cases"("companyId", "reconciliationType");

-- CreateIndex
CREATE INDEX "reconciliation_cases_companyId_status_idx" ON "reconciliation_cases"("companyId", "status");

-- CreateIndex
CREATE INDEX "reconciliation_cases_companyId_period_idx" ON "reconciliation_cases"("companyId", "period");

-- CreateIndex
CREATE INDEX "reconciliation_cases_companyId_assignedTo_idx" ON "reconciliation_cases"("companyId", "assignedTo");

-- CreateIndex
CREATE INDEX "reconciliation_cases_companyId_reconciliationType_period_idx" ON "reconciliation_cases"("companyId", "reconciliationType", "period");

-- CreateIndex
CREATE INDEX "recon_exceptions_companyId_caseId_idx" ON "recon_exceptions"("companyId", "caseId");

-- CreateIndex
CREATE INDEX "recon_exceptions_companyId_exceptionType_idx" ON "recon_exceptions"("companyId", "exceptionType");

-- CreateIndex
CREATE INDEX "recon_exceptions_companyId_severity_idx" ON "recon_exceptions"("companyId", "severity");

-- CreateIndex
CREATE INDEX "recon_exceptions_companyId_status_idx" ON "recon_exceptions"("companyId", "status");

-- CreateIndex
CREATE INDEX "recon_exceptions_companyId_assignedTo_idx" ON "recon_exceptions"("companyId", "assignedTo");

-- CreateIndex
CREATE INDEX "recon_exceptions_caseId_exceptionType_idx" ON "recon_exceptions"("caseId", "exceptionType");

-- CreateIndex
CREATE INDEX "matching_rules_companyId_ruleType_idx" ON "matching_rules"("companyId", "ruleType");

-- CreateIndex
CREATE INDEX "matching_rules_companyId_isActive_idx" ON "matching_rules"("companyId", "isActive");

-- CreateIndex
CREATE INDEX "matching_rules_companyId_priority_idx" ON "matching_rules"("companyId", "priority");

-- CreateIndex
CREATE UNIQUE INDEX "matching_rules_companyId_name_key" ON "matching_rules"("companyId", "name");

-- CreateIndex
CREATE INDEX "matching_executions_companyId_caseId_idx" ON "matching_executions"("companyId", "caseId");

-- CreateIndex
CREATE INDEX "matching_executions_companyId_ruleId_idx" ON "matching_executions"("companyId", "ruleId");

-- CreateIndex
CREATE INDEX "matching_executions_companyId_status_idx" ON "matching_executions"("companyId", "status");

-- CreateIndex
CREATE INDEX "matching_executions_caseId_status_idx" ON "matching_executions"("caseId", "status");

-- CreateIndex
CREATE INDEX "matching_suggestions_companyId_caseId_idx" ON "matching_suggestions"("companyId", "caseId");

-- CreateIndex
CREATE INDEX "matching_suggestions_companyId_executionId_idx" ON "matching_suggestions"("companyId", "executionId");

-- CreateIndex
CREATE INDEX "matching_suggestions_companyId_confidence_idx" ON "matching_suggestions"("companyId", "confidence");

-- CreateIndex
CREATE INDEX "matching_suggestions_companyId_status_idx" ON "matching_suggestions"("companyId", "status");

-- CreateIndex
CREATE INDEX "matching_suggestions_caseId_status_idx" ON "matching_suggestions"("caseId", "status");

-- CreateIndex
CREATE INDEX "reconciliation_evidence_companyId_caseId_idx" ON "reconciliation_evidence"("companyId", "caseId");

-- CreateIndex
CREATE INDEX "reconciliation_evidence_companyId_evidenceType_idx" ON "reconciliation_evidence"("companyId", "evidenceType");

-- CreateIndex
CREATE INDEX "reconciliation_evidence_companyId_sourceSystem_idx" ON "reconciliation_evidence"("companyId", "sourceSystem");

-- CreateIndex
CREATE INDEX "investigation_timelines_companyId_caseId_idx" ON "investigation_timelines"("companyId", "caseId");

-- CreateIndex
CREATE INDEX "investigation_timelines_companyId_exceptionId_idx" ON "investigation_timelines"("companyId", "exceptionId");

-- CreateIndex
CREATE INDEX "investigation_timelines_companyId_action_idx" ON "investigation_timelines"("companyId", "action");

-- CreateIndex
CREATE INDEX "investigation_timelines_caseId_createdAt_idx" ON "investigation_timelines"("caseId", "createdAt");

-- CreateIndex
CREATE INDEX "journal_suggestions_companyId_caseId_idx" ON "journal_suggestions"("companyId", "caseId");

-- CreateIndex
CREATE INDEX "journal_suggestions_companyId_exceptionId_idx" ON "journal_suggestions"("companyId", "exceptionId");

-- CreateIndex
CREATE INDEX "journal_suggestions_companyId_suggestionType_idx" ON "journal_suggestions"("companyId", "suggestionType");

-- CreateIndex
CREATE INDEX "journal_suggestions_companyId_status_idx" ON "journal_suggestions"("companyId", "status");

-- CreateIndex
CREATE INDEX "reconciliation_assignments_companyId_caseId_idx" ON "reconciliation_assignments"("companyId", "caseId");

-- CreateIndex
CREATE INDEX "reconciliation_assignments_companyId_assignedTo_idx" ON "reconciliation_assignments"("companyId", "assignedTo");

-- CreateIndex
CREATE INDEX "reconciliation_assignments_companyId_status_idx" ON "reconciliation_assignments"("companyId", "status");

-- CreateIndex
CREATE INDEX "reconciliation_assignments_caseId_status_idx" ON "reconciliation_assignments"("caseId", "status");

-- CreateIndex
CREATE INDEX "reconciliation_escalations_companyId_caseId_idx" ON "reconciliation_escalations"("companyId", "caseId");

-- CreateIndex
CREATE INDEX "reconciliation_escalations_companyId_escalationType_idx" ON "reconciliation_escalations"("companyId", "escalationType");

-- CreateIndex
CREATE INDEX "reconciliation_escalations_companyId_severity_idx" ON "reconciliation_escalations"("companyId", "severity");

-- CreateIndex
CREATE INDEX "reconciliation_escalations_companyId_status_idx" ON "reconciliation_escalations"("companyId", "status");

-- CreateIndex
CREATE INDEX "exception_classifications_companyId_exceptionId_idx" ON "exception_classifications"("companyId", "exceptionId");

-- CreateIndex
CREATE INDEX "exception_classifications_companyId_classifier_idx" ON "exception_classifications"("companyId", "classifier");

-- CreateIndex
CREATE INDEX "exception_classifications_companyId_newType_idx" ON "exception_classifications"("companyId", "newType");

-- CreateIndex
CREATE INDEX "matching_histories_companyId_caseId_idx" ON "matching_histories"("companyId", "caseId");

-- CreateIndex
CREATE INDEX "matching_histories_companyId_sourceSystem_idx" ON "matching_histories"("companyId", "sourceSystem");

-- CreateIndex
CREATE INDEX "matching_histories_companyId_transactionId_idx" ON "matching_histories"("companyId", "transactionId");

-- CreateIndex
CREATE INDEX "matching_histories_companyId_normalizedReference_idx" ON "matching_histories"("companyId", "normalizedReference");

-- CreateIndex
CREATE INDEX "matching_histories_companyId_normalizedVendor_idx" ON "matching_histories"("companyId", "normalizedVendor");

-- CreateIndex
CREATE INDEX "matching_histories_caseId_sourceSystem_idx" ON "matching_histories"("caseId", "sourceSystem");

-- CreateIndex
CREATE INDEX "rule_versions_companyId_ruleId_idx" ON "rule_versions"("companyId", "ruleId");

-- CreateIndex
CREATE INDEX "rule_versions_companyId_version_idx" ON "rule_versions"("companyId", "version");

-- CreateIndex
CREATE UNIQUE INDEX "rule_versions_ruleId_version_key" ON "rule_versions"("ruleId", "version");

-- CreateIndex
CREATE INDEX "controller_briefings_companyId_period_idx" ON "controller_briefings"("companyId", "period");

-- CreateIndex
CREATE INDEX "controller_briefings_companyId_briefingType_idx" ON "controller_briefings"("companyId", "briefingType");

-- CreateIndex
CREATE INDEX "controller_briefings_companyId_status_idx" ON "controller_briefings"("companyId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "controller_briefings_companyId_briefingDate_key" ON "controller_briefings"("companyId", "briefingDate");

-- CreateIndex
CREATE INDEX "close_periods_companyId_status_idx" ON "close_periods"("companyId", "status");

-- CreateIndex
CREATE INDEX "close_periods_companyId_closeType_idx" ON "close_periods"("companyId", "closeType");

-- CreateIndex
CREATE INDEX "close_periods_companyId_period_idx" ON "close_periods"("companyId", "period");

-- CreateIndex
CREATE UNIQUE INDEX "close_periods_companyId_period_closeType_key" ON "close_periods"("companyId", "period", "closeType");

-- CreateIndex
CREATE INDEX "close_tasks_companyId_closePeriodId_idx" ON "close_tasks"("companyId", "closePeriodId");

-- CreateIndex
CREATE INDEX "close_tasks_companyId_status_idx" ON "close_tasks"("companyId", "status");

-- CreateIndex
CREATE INDEX "close_tasks_companyId_assignedTo_idx" ON "close_tasks"("companyId", "assignedTo");

-- CreateIndex
CREATE INDEX "close_tasks_companyId_category_idx" ON "close_tasks"("companyId", "category");

-- CreateIndex
CREATE INDEX "close_tasks_closePeriodId_status_idx" ON "close_tasks"("closePeriodId", "status");

-- CreateIndex
CREATE INDEX "close_dependencies_companyId_closePeriodId_idx" ON "close_dependencies"("companyId", "closePeriodId");

-- CreateIndex
CREATE INDEX "close_dependencies_companyId_taskId_idx" ON "close_dependencies"("companyId", "taskId");

-- CreateIndex
CREATE INDEX "close_milestones_companyId_closePeriodId_idx" ON "close_milestones"("companyId", "closePeriodId");

-- CreateIndex
CREATE INDEX "close_milestones_companyId_status_idx" ON "close_milestones"("companyId", "status");

-- CreateIndex
CREATE INDEX "journal_reviews_companyId_journalType_idx" ON "journal_reviews"("companyId", "journalType");

-- CreateIndex
CREATE INDEX "journal_reviews_companyId_status_idx" ON "journal_reviews"("companyId", "status");

-- CreateIndex
CREATE INDEX "journal_reviews_companyId_riskLevel_idx" ON "journal_reviews"("companyId", "riskLevel");

-- CreateIndex
CREATE INDEX "journal_reviews_companyId_reviewerId_idx" ON "journal_reviews"("companyId", "reviewerId");

-- CreateIndex
CREATE INDEX "journal_reviews_companyId_postingDate_idx" ON "journal_reviews"("companyId", "postingDate");

-- CreateIndex
CREATE INDEX "journal_risks_companyId_journalReviewId_idx" ON "journal_risks"("companyId", "journalReviewId");

-- CreateIndex
CREATE INDEX "journal_risks_companyId_riskType_idx" ON "journal_risks"("companyId", "riskType");

-- CreateIndex
CREATE INDEX "journal_risks_companyId_severity_idx" ON "journal_risks"("companyId", "severity");

-- CreateIndex
CREATE INDEX "statement_readiness_companyId_period_idx" ON "statement_readiness"("companyId", "period");

-- CreateIndex
CREATE INDEX "statement_readiness_companyId_status_idx" ON "statement_readiness"("companyId", "status");

-- CreateIndex
CREATE INDEX "statement_readiness_companyId_readinessScore_idx" ON "statement_readiness"("companyId", "readinessScore");

-- CreateIndex
CREATE UNIQUE INDEX "statement_readiness_companyId_period_statementType_key" ON "statement_readiness"("companyId", "period", "statementType");

-- CreateIndex
CREATE INDEX "accounting_health_snapshots_companyId_period_idx" ON "accounting_health_snapshots"("companyId", "period");

-- CreateIndex
CREATE INDEX "accounting_health_snapshots_companyId_healthScore_idx" ON "accounting_health_snapshots"("companyId", "healthScore");

-- CreateIndex
CREATE UNIQUE INDEX "accounting_health_snapshots_companyId_snapshotDate_key" ON "accounting_health_snapshots"("companyId", "snapshotDate");

-- CreateIndex
CREATE INDEX "accounting_recommendations_companyId_category_idx" ON "accounting_recommendations"("companyId", "category");

-- CreateIndex
CREATE INDEX "accounting_recommendations_companyId_status_idx" ON "accounting_recommendations"("companyId", "status");

-- CreateIndex
CREATE INDEX "accounting_recommendations_companyId_riskLevel_idx" ON "accounting_recommendations"("companyId", "riskLevel");

-- CreateIndex
CREATE INDEX "accounting_recommendations_companyId_priority_idx" ON "accounting_recommendations"("companyId", "priority");

-- CreateIndex
CREATE UNIQUE INDEX "controller_workspace_preferences_companyId_key" ON "controller_workspace_preferences"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "controller_workspace_preferences_userId_key" ON "controller_workspace_preferences"("userId");

-- CreateIndex
CREATE INDEX "accounting_exceptions_companyId_exceptionType_idx" ON "accounting_exceptions"("companyId", "exceptionType");

-- CreateIndex
CREATE INDEX "accounting_exceptions_companyId_severity_idx" ON "accounting_exceptions"("companyId", "severity");

-- CreateIndex
CREATE INDEX "accounting_exceptions_companyId_status_idx" ON "accounting_exceptions"("companyId", "status");

-- CreateIndex
CREATE INDEX "accounting_exceptions_companyId_assignedTo_idx" ON "accounting_exceptions"("companyId", "assignedTo");

-- CreateIndex
CREATE INDEX "accounting_exceptions_companyId_referenceId_idx" ON "accounting_exceptions"("companyId", "referenceId");

-- CreateIndex
CREATE INDEX "close_forecasts_companyId_closePeriodId_idx" ON "close_forecasts"("companyId", "closePeriodId");

-- CreateIndex
CREATE INDEX "close_forecasts_companyId_forecastDate_idx" ON "close_forecasts"("companyId", "forecastDate");

-- CreateIndex
CREATE INDEX "treasury_briefings_companyId_briefingDate_idx" ON "treasury_briefings"("companyId", "briefingDate");

-- CreateIndex
CREATE INDEX "treasury_briefings_companyId_briefingType_idx" ON "treasury_briefings"("companyId", "briefingType");

-- CreateIndex
CREATE INDEX "treasury_briefings_companyId_createdAt_idx" ON "treasury_briefings"("companyId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "treasury_briefings_companyId_briefingDate_briefingType_key" ON "treasury_briefings"("companyId", "briefingDate", "briefingType");

-- CreateIndex
CREATE INDEX "cash_position_snapshots_companyId_snapshotDate_idx" ON "cash_position_snapshots"("companyId", "snapshotDate");

-- CreateIndex
CREATE INDEX "cash_position_snapshots_companyId_createdAt_idx" ON "cash_position_snapshots"("companyId", "createdAt");

-- CreateIndex
CREATE INDEX "liquidity_forecasts_companyId_forecastDate_idx" ON "liquidity_forecasts"("companyId", "forecastDate");

-- CreateIndex
CREATE INDEX "liquidity_forecasts_companyId_horizon_idx" ON "liquidity_forecasts"("companyId", "horizon");

-- CreateIndex
CREATE INDEX "liquidity_forecasts_companyId_scenario_idx" ON "liquidity_forecasts"("companyId", "scenario");

-- CreateIndex
CREATE INDEX "liquidity_forecasts_companyId_createdAt_idx" ON "liquidity_forecasts"("companyId", "createdAt");

-- CreateIndex
CREATE INDEX "liquidity_scenarios_companyId_forecastId_idx" ON "liquidity_scenarios"("companyId", "forecastId");

-- CreateIndex
CREATE INDEX "liquidity_scenarios_companyId_scenarioType_idx" ON "liquidity_scenarios"("companyId", "scenarioType");

-- CreateIndex
CREATE INDEX "liquidity_scenarios_companyId_createdAt_idx" ON "liquidity_scenarios"("companyId", "createdAt");

-- CreateIndex
CREATE INDEX "fx_exposure_analyses_companyId_analysisDate_idx" ON "fx_exposure_analyses"("companyId", "analysisDate");

-- CreateIndex
CREATE INDEX "fx_exposure_analyses_companyId_createdAt_idx" ON "fx_exposure_analyses"("companyId", "createdAt");

-- CreateIndex
CREATE INDEX "fx_recommendations_companyId_exposureId_idx" ON "fx_recommendations"("companyId", "exposureId");

-- CreateIndex
CREATE INDEX "fx_recommendations_companyId_status_idx" ON "fx_recommendations"("companyId", "status");

-- CreateIndex
CREATE INDEX "fx_recommendations_companyId_recommendationType_idx" ON "fx_recommendations"("companyId", "recommendationType");

-- CreateIndex
CREATE INDEX "fx_recommendations_companyId_createdAt_idx" ON "fx_recommendations"("companyId", "createdAt");

-- CreateIndex
CREATE INDEX "bank_relationships_companyId_relationshipType_idx" ON "bank_relationships"("companyId", "relationshipType");

-- CreateIndex
CREATE INDEX "bank_relationships_companyId_connectionStatus_idx" ON "bank_relationships"("companyId", "connectionStatus");

-- CreateIndex
CREATE INDEX "bank_relationships_companyId_healthScore_idx" ON "bank_relationships"("companyId", "healthScore");

-- CreateIndex
CREATE UNIQUE INDEX "bank_relationships_companyId_bankCode_key" ON "bank_relationships"("companyId", "bankCode");

-- CreateIndex
CREATE INDEX "bank_healths_companyId_bankRelationshipId_idx" ON "bank_healths"("companyId", "bankRelationshipId");

-- CreateIndex
CREATE INDEX "bank_healths_companyId_assessmentDate_idx" ON "bank_healths"("companyId", "assessmentDate");

-- CreateIndex
CREATE INDEX "bank_healths_companyId_overallScore_idx" ON "bank_healths"("companyId", "overallScore");

-- CreateIndex
CREATE INDEX "treasury_risks_companyId_riskType_idx" ON "treasury_risks"("companyId", "riskType");

-- CreateIndex
CREATE INDEX "treasury_risks_companyId_riskLevel_idx" ON "treasury_risks"("companyId", "riskLevel");

-- CreateIndex
CREATE INDEX "treasury_risks_companyId_status_idx" ON "treasury_risks"("companyId", "status");

-- CreateIndex
CREATE INDEX "treasury_risks_companyId_riskDate_idx" ON "treasury_risks"("companyId", "riskDate");

-- CreateIndex
CREATE INDEX "treasury_risks_companyId_createdAt_idx" ON "treasury_risks"("companyId", "createdAt");

-- CreateIndex
CREATE INDEX "treasury_recommendations_companyId_category_idx" ON "treasury_recommendations"("companyId", "category");

-- CreateIndex
CREATE INDEX "treasury_recommendations_companyId_status_idx" ON "treasury_recommendations"("companyId", "status");

-- CreateIndex
CREATE INDEX "treasury_recommendations_companyId_priority_idx" ON "treasury_recommendations"("companyId", "priority");

-- CreateIndex
CREATE INDEX "treasury_recommendations_companyId_riskLevel_idx" ON "treasury_recommendations"("companyId", "riskLevel");

-- CreateIndex
CREATE INDEX "treasury_recommendations_companyId_createdAt_idx" ON "treasury_recommendations"("companyId", "createdAt");

-- CreateIndex
CREATE INDEX "debt_instruments_companyId_instrumentType_idx" ON "debt_instruments"("companyId", "instrumentType");

-- CreateIndex
CREATE INDEX "debt_instruments_companyId_maturityDate_idx" ON "debt_instruments"("companyId", "maturityDate");

-- CreateIndex
CREATE INDEX "debt_instruments_companyId_healthScore_idx" ON "debt_instruments"("companyId", "healthScore");

-- CreateIndex
CREATE INDEX "debt_instruments_companyId_createdAt_idx" ON "debt_instruments"("companyId", "createdAt");

-- CreateIndex
CREATE INDEX "debt_covenants_companyId_debtInstrumentId_idx" ON "debt_covenants"("companyId", "debtInstrumentId");

-- CreateIndex
CREATE INDEX "debt_covenants_companyId_status_idx" ON "debt_covenants"("companyId", "status");

-- CreateIndex
CREATE INDEX "debt_covenants_companyId_covenantType_idx" ON "debt_covenants"("companyId", "covenantType");

-- CreateIndex
CREATE INDEX "debt_covenants_companyId_nextTestDate_idx" ON "debt_covenants"("companyId", "nextTestDate");

-- CreateIndex
CREATE INDEX "debt_alerts_companyId_debtInstrumentId_idx" ON "debt_alerts"("companyId", "debtInstrumentId");

-- CreateIndex
CREATE INDEX "debt_alerts_companyId_alertType_idx" ON "debt_alerts"("companyId", "alertType");

-- CreateIndex
CREATE INDEX "debt_alerts_companyId_severity_idx" ON "debt_alerts"("companyId", "severity");

-- CreateIndex
CREATE INDEX "debt_alerts_companyId_status_idx" ON "debt_alerts"("companyId", "status");

-- CreateIndex
CREATE INDEX "debt_alerts_companyId_createdAt_idx" ON "debt_alerts"("companyId", "createdAt");

-- CreateIndex
CREATE INDEX "investment_holdings_companyId_instrumentType_idx" ON "investment_holdings"("companyId", "instrumentType");

-- CreateIndex
CREATE INDEX "investment_holdings_companyId_maturityDate_idx" ON "investment_holdings"("companyId", "maturityDate");

-- CreateIndex
CREATE INDEX "investment_holdings_companyId_liquidityClassification_idx" ON "investment_holdings"("companyId", "liquidityClassification");

-- CreateIndex
CREATE INDEX "investment_holdings_companyId_healthScore_idx" ON "investment_holdings"("companyId", "healthScore");

-- CreateIndex
CREATE INDEX "investment_holdings_companyId_counterparty_idx" ON "investment_holdings"("companyId", "counterparty");

-- CreateIndex
CREATE INDEX "investment_recommendations_companyId_holdingId_idx" ON "investment_recommendations"("companyId", "holdingId");

-- CreateIndex
CREATE INDEX "investment_recommendations_companyId_status_idx" ON "investment_recommendations"("companyId", "status");

-- CreateIndex
CREATE INDEX "investment_recommendations_companyId_recommendationType_idx" ON "investment_recommendations"("companyId", "recommendationType");

-- CreateIndex
CREATE INDEX "investment_recommendations_companyId_createdAt_idx" ON "investment_recommendations"("companyId", "createdAt");

-- CreateIndex
CREATE INDEX "treasury_workspace_preferences_companyId_userId_idx" ON "treasury_workspace_preferences"("companyId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "treasury_workspace_preferences_companyId_userId_key" ON "treasury_workspace_preferences"("companyId", "userId");

-- CreateIndex
CREATE INDEX "treasury_health_snapshots_companyId_overallScore_idx" ON "treasury_health_snapshots"("companyId", "overallScore");

-- CreateIndex
CREATE INDEX "treasury_health_snapshots_companyId_createdAt_idx" ON "treasury_health_snapshots"("companyId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "treasury_health_snapshots_companyId_snapshotDate_key" ON "treasury_health_snapshots"("companyId", "snapshotDate");

-- CreateIndex
CREATE INDEX "treasury_specialist_alerts_companyId_alertType_idx" ON "treasury_specialist_alerts"("companyId", "alertType");

-- CreateIndex
CREATE INDEX "treasury_specialist_alerts_companyId_severity_idx" ON "treasury_specialist_alerts"("companyId", "severity");

-- CreateIndex
CREATE INDEX "treasury_specialist_alerts_companyId_status_idx" ON "treasury_specialist_alerts"("companyId", "status");

-- CreateIndex
CREATE INDEX "treasury_specialist_alerts_companyId_assignedTo_idx" ON "treasury_specialist_alerts"("companyId", "assignedTo");

-- CreateIndex
CREATE INDEX "treasury_specialist_alerts_companyId_createdAt_idx" ON "treasury_specialist_alerts"("companyId", "createdAt");

-- CreateIndex
CREATE INDEX "finance_cases_companyId_status_idx" ON "finance_cases"("companyId", "status");

-- CreateIndex
CREATE INDEX "finance_cases_companyId_caseType_idx" ON "finance_cases"("companyId", "caseType");

-- CreateIndex
CREATE INDEX "finance_cases_companyId_priority_idx" ON "finance_cases"("companyId", "priority");

-- CreateIndex
CREATE INDEX "finance_cases_companyId_ownerSpecialist_idx" ON "finance_cases"("companyId", "ownerSpecialist");

-- CreateIndex
CREATE INDEX "finance_cases_companyId_caseNumber_idx" ON "finance_cases"("companyId", "caseNumber");

-- CreateIndex
CREATE UNIQUE INDEX "finance_cases_companyId_caseNumber_key" ON "finance_cases"("companyId", "caseNumber");

-- CreateIndex
CREATE INDEX "case_participants_companyId_caseId_idx" ON "case_participants"("companyId", "caseId");

-- CreateIndex
CREATE INDEX "case_participants_companyId_participantType_idx" ON "case_participants"("companyId", "participantType");

-- CreateIndex
CREATE INDEX "case_participants_companyId_participantId_idx" ON "case_participants"("companyId", "participantId");

-- CreateIndex
CREATE INDEX "case_assignments_companyId_caseId_idx" ON "case_assignments"("companyId", "caseId");

-- CreateIndex
CREATE INDEX "case_assignments_companyId_fromSpecialist_idx" ON "case_assignments"("companyId", "fromSpecialist");

-- CreateIndex
CREATE INDEX "case_assignments_companyId_toSpecialist_idx" ON "case_assignments"("companyId", "toSpecialist");

-- CreateIndex
CREATE INDEX "case_assignments_companyId_status_idx" ON "case_assignments"("companyId", "status");

-- CreateIndex
CREATE INDEX "case_comments_companyId_caseId_idx" ON "case_comments"("companyId", "caseId");

-- CreateIndex
CREATE INDEX "case_comments_companyId_authorType_idx" ON "case_comments"("companyId", "authorType");

-- CreateIndex
CREATE INDEX "case_evidence_companyId_caseId_idx" ON "case_evidence"("companyId", "caseId");

-- CreateIndex
CREATE INDEX "case_evidence_companyId_evidenceType_idx" ON "case_evidence"("companyId", "evidenceType");

-- CreateIndex
CREATE INDEX "case_evidence_companyId_referenceId_idx" ON "case_evidence"("companyId", "referenceId");

-- CreateIndex
CREATE INDEX "case_decisions_companyId_caseId_idx" ON "case_decisions"("companyId", "caseId");

-- CreateIndex
CREATE INDEX "case_decisions_companyId_decisionType_idx" ON "case_decisions"("companyId", "decisionType");

-- CreateIndex
CREATE INDEX "case_decisions_companyId_status_idx" ON "case_decisions"("companyId", "status");

-- CreateIndex
CREATE INDEX "shared_recommendations_companyId_status_idx" ON "shared_recommendations"("companyId", "status");

-- CreateIndex
CREATE INDEX "shared_recommendations_companyId_category_idx" ON "shared_recommendations"("companyId", "category");

-- CreateIndex
CREATE INDEX "shared_recommendations_companyId_primarySpecialist_idx" ON "shared_recommendations"("companyId", "primarySpecialist");

-- CreateIndex
CREATE INDEX "shared_recommendations_companyId_caseId_idx" ON "shared_recommendations"("companyId", "caseId");

-- CreateIndex
CREATE INDEX "specialist_tasks_companyId_assignedTo_idx" ON "specialist_tasks"("companyId", "assignedTo");

-- CreateIndex
CREATE INDEX "specialist_tasks_companyId_status_idx" ON "specialist_tasks"("companyId", "status");

-- CreateIndex
CREATE INDEX "specialist_tasks_companyId_caseId_idx" ON "specialist_tasks"("companyId", "caseId");

-- CreateIndex
CREATE INDEX "specialist_tasks_companyId_priority_idx" ON "specialist_tasks"("companyId", "priority");

-- CreateIndex
CREATE INDEX "specialist_tasks_companyId_taskType_idx" ON "specialist_tasks"("companyId", "taskType");

-- CreateIndex
CREATE INDEX "task_dependencies_companyId_taskId_idx" ON "task_dependencies"("companyId", "taskId");

-- CreateIndex
CREATE INDEX "task_dependencies_companyId_dependsOnTaskId_idx" ON "task_dependencies"("companyId", "dependsOnTaskId");

-- CreateIndex
CREATE INDEX "task_history_companyId_taskId_idx" ON "task_history"("companyId", "taskId");

-- CreateIndex
CREATE INDEX "task_history_companyId_eventType_idx" ON "task_history"("companyId", "eventType");

-- CreateIndex
CREATE INDEX "collaboration_timeline_companyId_eventType_idx" ON "collaboration_timeline"("companyId", "eventType");

-- CreateIndex
CREATE INDEX "collaboration_timeline_companyId_caseId_idx" ON "collaboration_timeline"("companyId", "caseId");

-- CreateIndex
CREATE INDEX "collaboration_timeline_companyId_createdAt_idx" ON "collaboration_timeline"("companyId", "createdAt");

-- CreateIndex
CREATE INDEX "collaboration_timeline_companyId_specialistName_idx" ON "collaboration_timeline"("companyId", "specialistName");

-- CreateIndex
CREATE INDEX "work_queues_companyId_queueName_idx" ON "work_queues"("companyId", "queueName");

-- CreateIndex
CREATE INDEX "work_queues_companyId_queueType_idx" ON "work_queues"("companyId", "queueType");

-- CreateIndex
CREATE INDEX "work_queues_companyId_status_idx" ON "work_queues"("companyId", "status");

-- CreateIndex
CREATE INDEX "specialist_workloads_companyId_specialistName_idx" ON "specialist_workloads"("companyId", "specialistName");

-- CreateIndex
CREATE INDEX "specialist_workloads_companyId_utilizationRate_idx" ON "specialist_workloads"("companyId", "utilizationRate");

-- CreateIndex
CREATE INDEX "enterprise_memory_companyId_memoryType_idx" ON "enterprise_memory"("companyId", "memoryType");

-- CreateIndex
CREATE INDEX "enterprise_memory_companyId_contextKey_idx" ON "enterprise_memory"("companyId", "contextKey");

-- CreateIndex
CREATE INDEX "enterprise_memory_companyId_sourceSpecialist_idx" ON "enterprise_memory"("companyId", "sourceSpecialist");

-- CreateIndex
CREATE INDEX "enterprise_memory_companyId_relatedEntityType_idx" ON "enterprise_memory"("companyId", "relatedEntityType");

-- CreateIndex
CREATE INDEX "decision_registry_companyId_status_idx" ON "decision_registry"("companyId", "status");

-- CreateIndex
CREATE INDEX "decision_registry_companyId_decisionType_idx" ON "decision_registry"("companyId", "decisionType");

-- CreateIndex
CREATE INDEX "decision_registry_companyId_decidedBy_idx" ON "decision_registry"("companyId", "decidedBy");

-- CreateIndex
CREATE INDEX "decision_registry_companyId_caseId_idx" ON "decision_registry"("companyId", "caseId");

-- CreateIndex
CREATE INDEX "decision_registry_companyId_decisionNumber_idx" ON "decision_registry"("companyId", "decisionNumber");

-- CreateIndex
CREATE UNIQUE INDEX "decision_registry_companyId_decisionNumber_key" ON "decision_registry"("companyId", "decisionNumber");

-- CreateIndex
CREATE INDEX "audit_plans_companyId_planType_idx" ON "audit_plans"("companyId", "planType");

-- CreateIndex
CREATE INDEX "audit_plans_companyId_status_idx" ON "audit_plans"("companyId", "status");

-- CreateIndex
CREATE INDEX "audit_plans_companyId_fiscalYear_idx" ON "audit_plans"("companyId", "fiscalYear");

-- CreateIndex
CREATE INDEX "audit_engagements_companyId_planId_idx" ON "audit_engagements"("companyId", "planId");

-- CreateIndex
CREATE INDEX "audit_engagements_companyId_status_idx" ON "audit_engagements"("companyId", "status");

-- CreateIndex
CREATE INDEX "audit_engagements_companyId_engagementType_idx" ON "audit_engagements"("companyId", "engagementType");

-- CreateIndex
CREATE INDEX "audit_controls_companyId_controlType_idx" ON "audit_controls"("companyId", "controlType");

-- CreateIndex
CREATE INDEX "audit_controls_companyId_category_idx" ON "audit_controls"("companyId", "category");

-- CreateIndex
CREATE INDEX "audit_controls_companyId_status_idx" ON "audit_controls"("companyId", "status");

-- CreateIndex
CREATE INDEX "audit_controls_companyId_riskLevel_idx" ON "audit_controls"("companyId", "riskLevel");

-- CreateIndex
CREATE INDEX "control_tests_companyId_controlId_idx" ON "control_tests"("companyId", "controlId");

-- CreateIndex
CREATE INDEX "control_tests_companyId_testType_idx" ON "control_tests"("companyId", "testType");

-- CreateIndex
CREATE INDEX "control_tests_companyId_result_idx" ON "control_tests"("companyId", "result");

-- CreateIndex
CREATE INDEX "control_results_companyId_controlId_idx" ON "control_results"("companyId", "controlId");

-- CreateIndex
CREATE INDEX "control_results_companyId_overallEffectiveness_idx" ON "control_results"("companyId", "overallEffectiveness");

-- CreateIndex
CREATE INDEX "control_results_companyId_riskLevel_idx" ON "control_results"("companyId", "riskLevel");

-- CreateIndex
CREATE INDEX "audit_findings_companyId_severity_idx" ON "audit_findings"("companyId", "severity");

-- CreateIndex
CREATE INDEX "audit_findings_companyId_status_idx" ON "audit_findings"("companyId", "status");

-- CreateIndex
CREATE INDEX "audit_findings_companyId_findingType_idx" ON "audit_findings"("companyId", "findingType");

-- CreateIndex
CREATE INDEX "audit_findings_companyId_engagementId_idx" ON "audit_findings"("companyId", "engagementId");

-- CreateIndex
CREATE INDEX "audit_findings_companyId_controlId_idx" ON "audit_findings"("companyId", "controlId");

-- CreateIndex
CREATE INDEX "finding_evidence_companyId_findingId_idx" ON "finding_evidence"("companyId", "findingId");

-- CreateIndex
CREATE INDEX "finding_evidence_companyId_evidenceType_idx" ON "finding_evidence"("companyId", "evidenceType");

-- CreateIndex
CREATE INDEX "finding_evidence_companyId_referenceId_idx" ON "finding_evidence"("companyId", "referenceId");

-- CreateIndex
CREATE INDEX "remediation_plans_companyId_findingId_idx" ON "remediation_plans"("companyId", "findingId");

-- CreateIndex
CREATE INDEX "remediation_plans_companyId_status_idx" ON "remediation_plans"("companyId", "status");

-- CreateIndex
CREATE INDEX "remediation_plans_companyId_owner_idx" ON "remediation_plans"("companyId", "owner");

-- CreateIndex
CREATE INDEX "remediation_plans_companyId_targetDate_idx" ON "remediation_plans"("companyId", "targetDate");

-- CreateIndex
CREATE INDEX "remediation_tasks_companyId_planId_idx" ON "remediation_tasks"("companyId", "planId");

-- CreateIndex
CREATE INDEX "remediation_tasks_companyId_assignedTo_idx" ON "remediation_tasks"("companyId", "assignedTo");

-- CreateIndex
CREATE INDEX "remediation_tasks_companyId_status_idx" ON "remediation_tasks"("companyId", "status");

-- CreateIndex
CREATE INDEX "audit_evidence_packages_companyId_engagementId_idx" ON "audit_evidence_packages"("companyId", "engagementId");

-- CreateIndex
CREATE INDEX "audit_evidence_packages_companyId_packageType_idx" ON "audit_evidence_packages"("companyId", "packageType");

-- CreateIndex
CREATE INDEX "audit_evidence_packages_companyId_status_idx" ON "audit_evidence_packages"("companyId", "status");

-- CreateIndex
CREATE INDEX "audit_readiness_snapshots_companyId_assessmentType_idx" ON "audit_readiness_snapshots"("companyId", "assessmentType");

-- CreateIndex
CREATE INDEX "audit_readiness_snapshots_companyId_snapshotDate_idx" ON "audit_readiness_snapshots"("companyId", "snapshotDate");

-- CreateIndex
CREATE INDEX "audit_risk_assessments_companyId_assessmentType_idx" ON "audit_risk_assessments"("companyId", "assessmentType");

-- CreateIndex
CREATE INDEX "audit_risk_assessments_companyId_overallRiskScore_idx" ON "audit_risk_assessments"("companyId", "overallRiskScore");

-- CreateIndex
CREATE INDEX "audit_calendar_companyId_eventType_idx" ON "audit_calendar"("companyId", "eventType");

-- CreateIndex
CREATE INDEX "audit_calendar_companyId_startDate_idx" ON "audit_calendar"("companyId", "startDate");

-- CreateIndex
CREATE INDEX "audit_calendar_companyId_status_idx" ON "audit_calendar"("companyId", "status");

-- CreateIndex
CREATE INDEX "audit_reports_companyId_reportType_idx" ON "audit_reports"("companyId", "reportType");

-- CreateIndex
CREATE INDEX "audit_reports_companyId_status_idx" ON "audit_reports"("companyId", "status");

-- CreateIndex
CREATE INDEX "audit_reports_companyId_engagementId_idx" ON "audit_reports"("companyId", "engagementId");

-- CreateIndex
CREATE INDEX "audit_workspace_preferences_companyId_userId_idx" ON "audit_workspace_preferences"("companyId", "userId");

-- CreateIndex
CREATE INDEX "compliance_frameworks_companyId_frameworkType_idx" ON "compliance_frameworks"("companyId", "frameworkType");

-- CreateIndex
CREATE INDEX "compliance_frameworks_companyId_status_idx" ON "compliance_frameworks"("companyId", "status");

-- CreateIndex
CREATE INDEX "compliance_frameworks_companyId_frameworkCode_idx" ON "compliance_frameworks"("companyId", "frameworkCode");

-- CreateIndex
CREATE INDEX "compliance_requirements_companyId_frameworkId_idx" ON "compliance_requirements"("companyId", "frameworkId");

-- CreateIndex
CREATE INDEX "compliance_requirements_companyId_requirementType_idx" ON "compliance_requirements"("companyId", "requirementType");

-- CreateIndex
CREATE INDEX "compliance_requirements_companyId_category_idx" ON "compliance_requirements"("companyId", "category");

-- CreateIndex
CREATE INDEX "compliance_requirements_companyId_status_idx" ON "compliance_requirements"("companyId", "status");

-- CreateIndex
CREATE INDEX "compliance_obligations_companyId_status_idx" ON "compliance_obligations"("companyId", "status");

-- CreateIndex
CREATE INDEX "compliance_obligations_companyId_dueDate_idx" ON "compliance_obligations"("companyId", "dueDate");

-- CreateIndex
CREATE INDEX "compliance_obligations_companyId_owner_idx" ON "compliance_obligations"("companyId", "owner");

-- CreateIndex
CREATE INDEX "compliance_obligations_companyId_obligationType_idx" ON "compliance_obligations"("companyId", "obligationType");

-- CreateIndex
CREATE INDEX "compliance_policies_companyId_policyCategory_idx" ON "compliance_policies"("companyId", "policyCategory");

-- CreateIndex
CREATE INDEX "compliance_policies_companyId_status_idx" ON "compliance_policies"("companyId", "status");

-- CreateIndex
CREATE INDEX "compliance_policies_companyId_policyCode_idx" ON "compliance_policies"("companyId", "policyCode");

-- CreateIndex
CREATE INDEX "policy_versions_companyId_policyId_idx" ON "policy_versions"("companyId", "policyId");

-- CreateIndex
CREATE INDEX "policy_versions_companyId_version_idx" ON "policy_versions"("companyId", "version");

-- CreateIndex
CREATE INDEX "compliance_violations_companyId_severity_idx" ON "compliance_violations"("companyId", "severity");

-- CreateIndex
CREATE INDEX "compliance_violations_companyId_status_idx" ON "compliance_violations"("companyId", "status");

-- CreateIndex
CREATE INDEX "compliance_violations_companyId_violationType_idx" ON "compliance_violations"("companyId", "violationType");

-- CreateIndex
CREATE INDEX "compliance_violations_companyId_policyId_idx" ON "compliance_violations"("companyId", "policyId");

-- CreateIndex
CREATE INDEX "compliance_assessments_companyId_assessmentType_idx" ON "compliance_assessments"("companyId", "assessmentType");

-- CreateIndex
CREATE INDEX "compliance_assessments_companyId_status_idx" ON "compliance_assessments"("companyId", "status");

-- CreateIndex
CREATE INDEX "compliance_assessments_companyId_startDate_idx" ON "compliance_assessments"("companyId", "startDate");

-- CreateIndex
CREATE INDEX "compliance_health_snapshots_companyId_snapshotDate_idx" ON "compliance_health_snapshots"("companyId", "snapshotDate");

-- CreateIndex
CREATE INDEX "compliance_risk_assessments_companyId_overallRiskScore_idx" ON "compliance_risk_assessments"("companyId", "overallRiskScore");

-- CreateIndex
CREATE INDEX "compliance_filings_companyId_filingType_idx" ON "compliance_filings"("companyId", "filingType");

-- CreateIndex
CREATE INDEX "compliance_filings_companyId_status_idx" ON "compliance_filings"("companyId", "status");

-- CreateIndex
CREATE INDEX "compliance_filings_companyId_dueDate_idx" ON "compliance_filings"("companyId", "dueDate");

-- CreateIndex
CREATE INDEX "compliance_filings_companyId_jurisdiction_idx" ON "compliance_filings"("companyId", "jurisdiction");

-- CreateIndex
CREATE INDEX "compliance_deadlines_companyId_dueDate_idx" ON "compliance_deadlines"("companyId", "dueDate");

-- CreateIndex
CREATE INDEX "compliance_deadlines_companyId_status_idx" ON "compliance_deadlines"("companyId", "status");

-- CreateIndex
CREATE INDEX "compliance_deadlines_companyId_owner_idx" ON "compliance_deadlines"("companyId", "owner");

-- CreateIndex
CREATE INDEX "compliance_deadlines_companyId_deadlineType_idx" ON "compliance_deadlines"("companyId", "deadlineType");

-- CreateIndex
CREATE INDEX "regulatory_updates_companyId_updateType_idx" ON "regulatory_updates"("companyId", "updateType");

-- CreateIndex
CREATE INDEX "regulatory_updates_companyId_assessmentStatus_idx" ON "regulatory_updates"("companyId", "assessmentStatus");

-- CreateIndex
CREATE INDEX "regulatory_updates_companyId_jurisdiction_idx" ON "regulatory_updates"("companyId", "jurisdiction");

-- CreateIndex
CREATE INDEX "regulatory_updates_companyId_frameworkCode_idx" ON "regulatory_updates"("companyId", "frameworkCode");

-- CreateIndex
CREATE INDEX "compliance_remediations_companyId_violationId_idx" ON "compliance_remediations"("companyId", "violationId");

-- CreateIndex
CREATE INDEX "compliance_remediations_companyId_status_idx" ON "compliance_remediations"("companyId", "status");

-- CreateIndex
CREATE INDEX "compliance_remediations_companyId_owner_idx" ON "compliance_remediations"("companyId", "owner");

-- CreateIndex
CREATE INDEX "compliance_remediations_companyId_targetDate_idx" ON "compliance_remediations"("companyId", "targetDate");

-- CreateIndex
CREATE INDEX "compliance_briefings_companyId_briefingType_idx" ON "compliance_briefings"("companyId", "briefingType");

-- CreateIndex
CREATE INDEX "compliance_briefings_companyId_briefingDate_idx" ON "compliance_briefings"("companyId", "briefingDate");

-- CreateIndex
CREATE INDEX "compliance_workspace_preferences_companyId_userId_idx" ON "compliance_workspace_preferences"("companyId", "userId");

-- CreateIndex
CREATE INDEX "strategic_plans_companyId_planType_idx" ON "strategic_plans"("companyId", "planType");

-- CreateIndex
CREATE INDEX "strategic_plans_companyId_status_idx" ON "strategic_plans"("companyId", "status");

-- CreateIndex
CREATE INDEX "strategic_plans_companyId_fiscalYear_idx" ON "strategic_plans"("companyId", "fiscalYear");

-- CreateIndex
CREATE INDEX "planning_cycles_companyId_planId_idx" ON "planning_cycles"("companyId", "planId");

-- CreateIndex
CREATE INDEX "planning_cycles_companyId_cycleType_idx" ON "planning_cycles"("companyId", "cycleType");

-- CreateIndex
CREATE INDEX "planning_cycles_companyId_status_idx" ON "planning_cycles"("companyId", "status");

-- CreateIndex
CREATE INDEX "budgets_companyId_budgetType_idx" ON "budgets"("companyId", "budgetType");

-- CreateIndex
CREATE INDEX "budgets_companyId_status_idx" ON "budgets"("companyId", "status");

-- CreateIndex
CREATE INDEX "budgets_companyId_fiscalYear_idx" ON "budgets"("companyId", "fiscalYear");

-- CreateIndex
CREATE INDEX "budget_versions_companyId_budgetId_idx" ON "budget_versions"("companyId", "budgetId");

-- CreateIndex
CREATE INDEX "budget_versions_companyId_version_idx" ON "budget_versions"("companyId", "version");

-- CreateIndex
CREATE INDEX "budget_lines_companyId_budgetId_idx" ON "budget_lines"("companyId", "budgetId");

-- CreateIndex
CREATE INDEX "budget_lines_companyId_category_idx" ON "budget_lines"("companyId", "category");

-- CreateIndex
CREATE INDEX "budget_lines_companyId_department_idx" ON "budget_lines"("companyId", "department");

-- CreateIndex
CREATE INDEX "budget_lines_companyId_accountCode_idx" ON "budget_lines"("companyId", "accountCode");

-- CreateIndex
CREATE INDEX "forecasts_companyId_forecastType_idx" ON "forecasts"("companyId", "forecastType");

-- CreateIndex
CREATE INDEX "forecasts_companyId_status_idx" ON "forecasts"("companyId", "status");

-- CreateIndex
CREATE INDEX "forecasts_companyId_horizon_idx" ON "forecasts"("companyId", "horizon");

-- CreateIndex
CREATE INDEX "forecast_versions_companyId_forecastId_idx" ON "forecast_versions"("companyId", "forecastId");

-- CreateIndex
CREATE INDEX "forecast_versions_companyId_version_idx" ON "forecast_versions"("companyId", "version");

-- CreateIndex
CREATE INDEX "scenario_models_companyId_scenarioType_idx" ON "scenario_models"("companyId", "scenarioType");

-- CreateIndex
CREATE INDEX "scenario_models_companyId_status_idx" ON "scenario_models"("companyId", "status");

-- CreateIndex
CREATE INDEX "fpa_scenario_executions_companyId_scenarioId_idx" ON "fpa_scenario_executions"("companyId", "scenarioId");

-- CreateIndex
CREATE INDEX "fpa_scenario_executions_companyId_executionDate_idx" ON "fpa_scenario_executions"("companyId", "executionDate");

-- CreateIndex
CREATE INDEX "business_drivers_companyId_driverCategory_idx" ON "business_drivers"("companyId", "driverCategory");

-- CreateIndex
CREATE INDEX "driver_assumptions_companyId_driverId_idx" ON "driver_assumptions"("companyId", "driverId");

-- CreateIndex
CREATE INDEX "driver_assumptions_companyId_planId_idx" ON "driver_assumptions"("companyId", "planId");

-- CreateIndex
CREATE INDEX "driver_assumptions_companyId_scenarioId_idx" ON "driver_assumptions"("companyId", "scenarioId");

-- CreateIndex
CREATE INDEX "variance_analyses_companyId_analysisType_idx" ON "variance_analyses"("companyId", "analysisType");

-- CreateIndex
CREATE INDEX "variance_analyses_companyId_period_idx" ON "variance_analyses"("companyId", "period");

-- CreateIndex
CREATE INDEX "variance_analyses_companyId_status_idx" ON "variance_analyses"("companyId", "status");

-- CreateIndex
CREATE INDEX "capital_plans_companyId_fiscalYear_idx" ON "capital_plans"("companyId", "fiscalYear");

-- CreateIndex
CREATE INDEX "capital_plans_companyId_status_idx" ON "capital_plans"("companyId", "status");

-- CreateIndex
CREATE INDEX "investment_proposals_companyId_investmentType_idx" ON "investment_proposals"("companyId", "investmentType");

-- CreateIndex
CREATE INDEX "investment_proposals_companyId_status_idx" ON "investment_proposals"("companyId", "status");

-- CreateIndex
CREATE INDEX "investment_proposals_companyId_priority_idx" ON "investment_proposals"("companyId", "priority");

-- CreateIndex
CREATE INDEX "strategic_initiatives_companyId_initiativeType_idx" ON "strategic_initiatives"("companyId", "initiativeType");

-- CreateIndex
CREATE INDEX "strategic_initiatives_companyId_status_idx" ON "strategic_initiatives"("companyId", "status");

-- CreateIndex
CREATE INDEX "strategic_initiatives_companyId_owner_idx" ON "strategic_initiatives"("companyId", "owner");

-- CreateIndex
CREATE INDEX "planning_recommendations_companyId_category_idx" ON "planning_recommendations"("companyId", "category");

-- CreateIndex
CREATE INDEX "planning_recommendations_companyId_status_idx" ON "planning_recommendations"("companyId", "status");

-- CreateIndex
CREATE INDEX "planning_recommendations_companyId_priority_idx" ON "planning_recommendations"("companyId", "priority");

-- CreateIndex
CREATE INDEX "planning_briefings_companyId_briefingType_idx" ON "planning_briefings"("companyId", "briefingType");

-- CreateIndex
CREATE INDEX "planning_briefings_companyId_briefingDate_idx" ON "planning_briefings"("companyId", "briefingDate");

-- CreateIndex
CREATE INDEX "planning_workspace_preferences_companyId_userId_idx" ON "planning_workspace_preferences"("companyId", "userId");

-- CreateIndex
CREATE INDEX "tax_jurisdictions_companyId_jurisdictionCode_idx" ON "tax_jurisdictions"("companyId", "jurisdictionCode");

-- CreateIndex
CREATE INDEX "tax_jurisdictions_companyId_jurisdictionType_idx" ON "tax_jurisdictions"("companyId", "jurisdictionType");

-- CreateIndex
CREATE INDEX "tax_jurisdictions_companyId_country_idx" ON "tax_jurisdictions"("companyId", "country");

-- CreateIndex
CREATE INDEX "tax_rates_companyId_jurisdictionId_idx" ON "tax_rates"("companyId", "jurisdictionId");

-- CreateIndex
CREATE INDEX "tax_rates_companyId_rateType_idx" ON "tax_rates"("companyId", "rateType");

-- CreateIndex
CREATE INDEX "tax_rates_companyId_effectiveDate_idx" ON "tax_rates"("companyId", "effectiveDate");

-- CreateIndex
CREATE INDEX "tax_provisions_companyId_provisionType_idx" ON "tax_provisions"("companyId", "provisionType");

-- CreateIndex
CREATE INDEX "tax_provisions_companyId_fiscalYear_idx" ON "tax_provisions"("companyId", "fiscalYear");

-- CreateIndex
CREATE INDEX "tax_provisions_companyId_status_idx" ON "tax_provisions"("companyId", "status");

-- CreateIndex
CREATE INDEX "deferred_taxes_companyId_provisionId_idx" ON "deferred_taxes"("companyId", "provisionId");

-- CreateIndex
CREATE INDEX "deferred_taxes_companyId_temporaryDifferenceType_idx" ON "deferred_taxes"("companyId", "temporaryDifferenceType");

-- CreateIndex
CREATE INDEX "deferred_taxes_companyId_jurisdictionId_idx" ON "deferred_taxes"("companyId", "jurisdictionId");

-- CreateIndex
CREATE INDEX "tax_returns_companyId_jurisdictionId_idx" ON "tax_returns"("companyId", "jurisdictionId");

-- CreateIndex
CREATE INDEX "tax_returns_companyId_returnType_idx" ON "tax_returns"("companyId", "returnType");

-- CreateIndex
CREATE INDEX "tax_returns_companyId_status_idx" ON "tax_returns"("companyId", "status");

-- CreateIndex
CREATE INDEX "tax_returns_companyId_dueDate_idx" ON "tax_returns"("companyId", "dueDate");

-- CreateIndex
CREATE INDEX "tax_filings_companyId_filingType_idx" ON "tax_filings"("companyId", "filingType");

-- CreateIndex
CREATE INDEX "tax_filings_companyId_status_idx" ON "tax_filings"("companyId", "status");

-- CreateIndex
CREATE INDEX "tax_filings_companyId_dueDate_idx" ON "tax_filings"("companyId", "dueDate");

-- CreateIndex
CREATE INDEX "tax_deadlines_companyId_dueDate_idx" ON "tax_deadlines"("companyId", "dueDate");

-- CreateIndex
CREATE INDEX "tax_deadlines_companyId_status_idx" ON "tax_deadlines"("companyId", "status");

-- CreateIndex
CREATE INDEX "tax_deadlines_companyId_deadlineType_idx" ON "tax_deadlines"("companyId", "deadlineType");

-- CreateIndex
CREATE INDEX "tax_payments_companyId_jurisdictionId_idx" ON "tax_payments"("companyId", "jurisdictionId");

-- CreateIndex
CREATE INDEX "tax_payments_companyId_paymentType_idx" ON "tax_payments"("companyId", "paymentType");

-- CreateIndex
CREATE INDEX "tax_payments_companyId_status_idx" ON "tax_payments"("companyId", "status");

-- CreateIndex
CREATE INDEX "tax_payments_companyId_paymentDate_idx" ON "tax_payments"("companyId", "paymentDate");

-- CreateIndex
CREATE INDEX "transfer_pricing_policies_companyId_intercompanyType_idx" ON "transfer_pricing_policies"("companyId", "intercompanyType");

-- CreateIndex
CREATE INDEX "transfer_pricing_policies_companyId_riskLevel_idx" ON "transfer_pricing_policies"("companyId", "riskLevel");

-- CreateIndex
CREATE INDEX "transfer_pricing_policies_companyId_status_idx" ON "transfer_pricing_policies"("companyId", "status");

-- CreateIndex
CREATE INDEX "intercompany_tax_rules_companyId_policyId_idx" ON "intercompany_tax_rules"("companyId", "policyId");

-- CreateIndex
CREATE INDEX "intercompany_tax_rules_companyId_fromJurisdictionId_idx" ON "intercompany_tax_rules"("companyId", "fromJurisdictionId");

-- CreateIndex
CREATE INDEX "intercompany_tax_rules_companyId_toJurisdictionId_idx" ON "intercompany_tax_rules"("companyId", "toJurisdictionId");

-- CreateIndex
CREATE INDEX "tax_assessments_companyId_jurisdictionId_idx" ON "tax_assessments"("companyId", "jurisdictionId");

-- CreateIndex
CREATE INDEX "tax_assessments_companyId_assessmentType_idx" ON "tax_assessments"("companyId", "assessmentType");

-- CreateIndex
CREATE INDEX "tax_assessments_companyId_status_idx" ON "tax_assessments"("companyId", "status");

-- CreateIndex
CREATE INDEX "tax_risk_assessments_companyId_overallRiskScore_idx" ON "tax_risk_assessments"("companyId", "overallRiskScore");

-- CreateIndex
CREATE INDEX "tax_planning_scenarios_companyId_scenarioType_idx" ON "tax_planning_scenarios"("companyId", "scenarioType");

-- CreateIndex
CREATE INDEX "tax_planning_scenarios_companyId_status_idx" ON "tax_planning_scenarios"("companyId", "status");

-- CreateIndex
CREATE INDEX "tax_recommendations_companyId_category_idx" ON "tax_recommendations"("companyId", "category");

-- CreateIndex
CREATE INDEX "tax_recommendations_companyId_status_idx" ON "tax_recommendations"("companyId", "status");

-- CreateIndex
CREATE INDEX "tax_recommendations_companyId_priority_idx" ON "tax_recommendations"("companyId", "priority");

-- CreateIndex
CREATE INDEX "tax_briefings_companyId_briefingType_idx" ON "tax_briefings"("companyId", "briefingType");

-- CreateIndex
CREATE INDEX "tax_briefings_companyId_briefingDate_idx" ON "tax_briefings"("companyId", "briefingDate");

-- CreateIndex
CREATE INDEX "tax_workspace_preferences_companyId_userId_idx" ON "tax_workspace_preferences"("companyId", "userId");

-- CreateIndex
CREATE INDEX "boards_companyId_status_idx" ON "boards"("companyId", "status");

-- CreateIndex
CREATE INDEX "board_members_companyId_boardId_idx" ON "board_members"("companyId", "boardId");

-- CreateIndex
CREATE INDEX "board_members_companyId_status_idx" ON "board_members"("companyId", "status");

-- CreateIndex
CREATE INDEX "committees_companyId_boardId_idx" ON "committees"("companyId", "boardId");

-- CreateIndex
CREATE INDEX "committees_companyId_committeeType_idx" ON "committees"("companyId", "committeeType");

-- CreateIndex
CREATE INDEX "committee_members_companyId_committeeId_idx" ON "committee_members"("companyId", "committeeId");

-- CreateIndex
CREATE INDEX "board_meetings_companyId_boardId_idx" ON "board_meetings"("companyId", "boardId");

-- CreateIndex
CREATE INDEX "board_meetings_companyId_scheduledDate_idx" ON "board_meetings"("companyId", "scheduledDate");

-- CreateIndex
CREATE INDEX "board_meetings_companyId_status_idx" ON "board_meetings"("companyId", "status");

-- CreateIndex
CREATE INDEX "meeting_agendas_companyId_meetingId_idx" ON "meeting_agendas"("companyId", "meetingId");

-- CreateIndex
CREATE INDEX "agenda_items_companyId_agendaId_idx" ON "agenda_items"("companyId", "agendaId");

-- CreateIndex
CREATE INDEX "board_resolutions_companyId_meetingId_idx" ON "board_resolutions"("companyId", "meetingId");

-- CreateIndex
CREATE INDEX "board_resolutions_companyId_status_idx" ON "board_resolutions"("companyId", "status");

-- CreateIndex
CREATE INDEX "board_votes_companyId_resolutionId_idx" ON "board_votes"("companyId", "resolutionId");

-- CreateIndex
CREATE INDEX "meeting_minutes_companyId_meetingId_idx" ON "meeting_minutes"("companyId", "meetingId");

-- CreateIndex
CREATE INDEX "board_actions_companyId_assignedTo_idx" ON "board_actions"("companyId", "assignedTo");

-- CreateIndex
CREATE INDEX "board_actions_companyId_status_idx" ON "board_actions"("companyId", "status");

-- CreateIndex
CREATE INDEX "board_actions_companyId_dueDate_idx" ON "board_actions"("companyId", "dueDate");

-- CreateIndex
CREATE UNIQUE INDEX "governance_board_packs_meetingId_key" ON "governance_board_packs"("meetingId");

-- CreateIndex
CREATE INDEX "governance_board_packs_companyId_meetingId_idx" ON "governance_board_packs"("companyId", "meetingId");

-- CreateIndex
CREATE INDEX "governance_board_packs_companyId_status_idx" ON "governance_board_packs"("companyId", "status");

-- CreateIndex
CREATE INDEX "board_briefings_companyId_briefingType_idx" ON "board_briefings"("companyId", "briefingType");

-- CreateIndex
CREATE INDEX "governance_metrics_companyId_metricDate_idx" ON "governance_metrics"("companyId", "metricDate");

-- CreateIndex
CREATE INDEX "board_workspace_preferences_companyId_userId_idx" ON "board_workspace_preferences"("companyId", "userId");

-- CreateIndex
CREATE INDEX "crm_contacts_companyId_idx" ON "crm_contacts"("companyId");

-- CreateIndex
CREATE INDEX "crm_contacts_name_idx" ON "crm_contacts"("name");

-- CreateIndex
CREATE INDEX "crm_contacts_relationshipStage_idx" ON "crm_contacts"("relationshipStage");

-- CreateIndex
CREATE INDEX "crm_contacts_status_idx" ON "crm_contacts"("status");

-- CreateIndex
CREATE INDEX "crm_contacts_priority_idx" ON "crm_contacts"("priority");

-- CreateIndex
CREATE INDEX "crm_contacts_region_idx" ON "crm_contacts"("region");

-- CreateIndex
CREATE INDEX "crm_contacts_strategic_importance_idx" ON "crm_contacts"("strategic_importance");

-- CreateIndex
CREATE INDEX "crm_contacts_relationship_health_idx" ON "crm_contacts"("relationship_health");

-- CreateIndex
CREATE UNIQUE INDEX "crm_professional_profiles_contact_id_key" ON "crm_professional_profiles"("contact_id");

-- CreateIndex
CREATE INDEX "crm_interactions_contact_id_idx" ON "crm_interactions"("contact_id");

-- CreateIndex
CREATE INDEX "crm_interactions_type_idx" ON "crm_interactions"("type");

-- CreateIndex
CREATE INDEX "crm_interactions_outcome_idx" ON "crm_interactions"("outcome");

-- CreateIndex
CREATE INDEX "crm_opportunities_contact_id_idx" ON "crm_opportunities"("contact_id");

-- CreateIndex
CREATE INDEX "crm_opportunities_stage_idx" ON "crm_opportunities"("stage");

-- CreateIndex
CREATE INDEX "crm_opportunities_category_idx" ON "crm_opportunities"("category");

-- CreateIndex
CREATE INDEX "crm_tasks_contact_id_idx" ON "crm_tasks"("contact_id");

-- CreateIndex
CREATE INDEX "crm_tasks_status_idx" ON "crm_tasks"("status");

-- CreateIndex
CREATE INDEX "crm_tasks_assigned_to_idx" ON "crm_tasks"("assigned_to");

-- CreateIndex
CREATE UNIQUE INDEX "crm_contact_intelligence_contact_id_key" ON "crm_contact_intelligence"("contact_id");

-- CreateIndex
CREATE INDEX "crm_voc_insights_contact_id_idx" ON "crm_voc_insights"("contact_id");

-- CreateIndex
CREATE INDEX "crm_voc_insights_interview_type_idx" ON "crm_voc_insights"("interview_type");

-- CreateIndex
CREATE INDEX "crm_voc_insights_interview_status_idx" ON "crm_voc_insights"("interview_status");

-- CreateIndex
CREATE INDEX "crm_pain_points_category_idx" ON "crm_pain_points"("category");

-- CreateIndex
CREATE INDEX "crm_pain_points_severity_idx" ON "crm_pain_points"("severity");

-- CreateIndex
CREATE INDEX "crm_pain_points_trend_idx" ON "crm_pain_points"("trend");

-- CreateIndex
CREATE INDEX "crm_pain_points_frequency_idx" ON "crm_pain_points"("frequency");

-- CreateIndex
CREATE INDEX "crm_pain_points_contact_id_idx" ON "crm_pain_points"("contact_id");

-- CreateIndex
CREATE INDEX "crm_discovery_sessions_contact_id_idx" ON "crm_discovery_sessions"("contact_id");

-- CreateIndex
CREATE INDEX "crm_discovery_sessions_discovery_stage_idx" ON "crm_discovery_sessions"("discovery_stage");

-- CreateIndex
CREATE INDEX "crm_timeline_events_contact_id_idx" ON "crm_timeline_events"("contact_id");

-- CreateIndex
CREATE INDEX "crm_timeline_events_event_type_idx" ON "crm_timeline_events"("event_type");

-- CreateIndex
CREATE INDEX "crm_timeline_events_event_date_idx" ON "crm_timeline_events"("event_date");

-- CreateIndex
CREATE INDEX "crm_knowledge_graph_source_contact_id_idx" ON "crm_knowledge_graph"("source_contact_id");

-- CreateIndex
CREATE INDEX "crm_knowledge_graph_target_contact_id_idx" ON "crm_knowledge_graph"("target_contact_id");

-- CreateIndex
CREATE INDEX "crm_knowledge_graph_linkType_idx" ON "crm_knowledge_graph"("linkType");

-- AddForeignKey
ALTER TABLE "agent_definitions" ADD CONSTRAINT "agent_definitions_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_capabilities" ADD CONSTRAINT "agent_capabilities_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "agent_definitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_sessions" ADD CONSTRAINT "agent_sessions_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "agent_definitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_tasks" ADD CONSTRAINT "agent_tasks_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "agent_definitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_tasks" ADD CONSTRAINT "agent_tasks_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "agent_sessions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_tasks" ADD CONSTRAINT "agent_tasks_capabilityId_fkey" FOREIGN KEY ("capabilityId") REFERENCES "agent_capabilities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_executions" ADD CONSTRAINT "agent_executions_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "agent_tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_executions" ADD CONSTRAINT "agent_executions_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "agent_definitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_executions" ADD CONSTRAINT "agent_executions_capabilityId_fkey" FOREIGN KEY ("capabilityId") REFERENCES "agent_capabilities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_decisions" ADD CONSTRAINT "agent_decisions_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "agent_definitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_evidence" ADD CONSTRAINT "agent_evidence_executionId_fkey" FOREIGN KEY ("executionId") REFERENCES "agent_executions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_memory" ADD CONSTRAINT "agent_memory_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "agent_definitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_health" ADD CONSTRAINT "agent_health_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "agent_definitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_permissions" ADD CONSTRAINT "agent_permissions_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "agent_definitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_configurations" ADD CONSTRAINT "agent_configurations_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "agent_definitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_conversations" ADD CONSTRAINT "agent_conversations_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "agent_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_conversations" ADD CONSTRAINT "agent_conversations_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "agent_definitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_conversations" ADD CONSTRAINT "agent_conversations_decisionId_fkey" FOREIGN KEY ("decisionId") REFERENCES "agent_decisions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_delegations" ADD CONSTRAINT "agent_delegations_fromAgentId_fkey" FOREIGN KEY ("fromAgentId") REFERENCES "agent_definitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_delegations" ADD CONSTRAINT "agent_delegations_toAgentId_fkey" FOREIGN KEY ("toAgentId") REFERENCES "agent_definitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_delegations" ADD CONSTRAINT "agent_delegations_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "agent_tasks"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_audit" ADD CONSTRAINT "agent_audit_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "agent_definitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_audit" ADD CONSTRAINT "agent_audit_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "agent_sessions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "executive_briefings" ADD CONSTRAINT "executive_briefings_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "executive_recommendations" ADD CONSTRAINT "executive_recommendations_briefingId_fkey" FOREIGN KEY ("briefingId") REFERENCES "executive_briefings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "executive_recommendations" ADD CONSTRAINT "executive_recommendations_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scenario_analyses" ADD CONSTRAINT "scenario_analyses_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scenario_executions" ADD CONSTRAINT "scenario_executions_scenarioId_fkey" FOREIGN KEY ("scenarioId") REFERENCES "scenario_analyses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scenario_executions" ADD CONSTRAINT "scenario_executions_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "executive_conversations" ADD CONSTRAINT "executive_conversations_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "executive_messages" ADD CONSTRAINT "executive_messages_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "executive_conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "executive_messages" ADD CONSTRAINT "executive_messages_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "executive_insights" ADD CONSTRAINT "executive_insights_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "executive_priorities" ADD CONSTRAINT "executive_priorities_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "executive_decisions" ADD CONSTRAINT "executive_decisions_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "executive_workspace_preferences" ADD CONSTRAINT "executive_workspace_preferences_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "executive_board_packs" ADD CONSTRAINT "executive_board_packs_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reconciliation_cases" ADD CONSTRAINT "reconciliation_cases_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recon_exceptions" ADD CONSTRAINT "recon_exceptions_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recon_exceptions" ADD CONSTRAINT "recon_exceptions_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "reconciliation_cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matching_rules" ADD CONSTRAINT "matching_rules_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matching_executions" ADD CONSTRAINT "matching_executions_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matching_executions" ADD CONSTRAINT "matching_executions_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "reconciliation_cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matching_executions" ADD CONSTRAINT "matching_executions_ruleId_fkey" FOREIGN KEY ("ruleId") REFERENCES "matching_rules"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matching_suggestions" ADD CONSTRAINT "matching_suggestions_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matching_suggestions" ADD CONSTRAINT "matching_suggestions_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "reconciliation_cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matching_suggestions" ADD CONSTRAINT "matching_suggestions_executionId_fkey" FOREIGN KEY ("executionId") REFERENCES "matching_executions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reconciliation_evidence" ADD CONSTRAINT "reconciliation_evidence_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reconciliation_evidence" ADD CONSTRAINT "reconciliation_evidence_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "reconciliation_cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "investigation_timelines" ADD CONSTRAINT "investigation_timelines_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "investigation_timelines" ADD CONSTRAINT "investigation_timelines_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "reconciliation_cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "journal_suggestions" ADD CONSTRAINT "journal_suggestions_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "journal_suggestions" ADD CONSTRAINT "journal_suggestions_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "reconciliation_cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "journal_suggestions" ADD CONSTRAINT "journal_suggestions_exceptionId_fkey" FOREIGN KEY ("exceptionId") REFERENCES "recon_exceptions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reconciliation_assignments" ADD CONSTRAINT "reconciliation_assignments_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reconciliation_assignments" ADD CONSTRAINT "reconciliation_assignments_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "reconciliation_cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reconciliation_escalations" ADD CONSTRAINT "reconciliation_escalations_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reconciliation_escalations" ADD CONSTRAINT "reconciliation_escalations_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "reconciliation_cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exception_classifications" ADD CONSTRAINT "exception_classifications_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exception_classifications" ADD CONSTRAINT "exception_classifications_exceptionId_fkey" FOREIGN KEY ("exceptionId") REFERENCES "recon_exceptions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matching_histories" ADD CONSTRAINT "matching_histories_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matching_histories" ADD CONSTRAINT "matching_histories_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "reconciliation_cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rule_versions" ADD CONSTRAINT "rule_versions_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rule_versions" ADD CONSTRAINT "rule_versions_ruleId_fkey" FOREIGN KEY ("ruleId") REFERENCES "matching_rules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "controller_briefings" ADD CONSTRAINT "controller_briefings_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "close_periods" ADD CONSTRAINT "close_periods_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "close_tasks" ADD CONSTRAINT "close_tasks_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "close_tasks" ADD CONSTRAINT "close_tasks_closePeriodId_fkey" FOREIGN KEY ("closePeriodId") REFERENCES "close_periods"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "close_dependencies" ADD CONSTRAINT "close_dependencies_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "close_dependencies" ADD CONSTRAINT "close_dependencies_closePeriodId_fkey" FOREIGN KEY ("closePeriodId") REFERENCES "close_periods"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "close_milestones" ADD CONSTRAINT "close_milestones_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "close_milestones" ADD CONSTRAINT "close_milestones_closePeriodId_fkey" FOREIGN KEY ("closePeriodId") REFERENCES "close_periods"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "journal_reviews" ADD CONSTRAINT "journal_reviews_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "journal_risks" ADD CONSTRAINT "journal_risks_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "journal_risks" ADD CONSTRAINT "journal_risks_journalReviewId_fkey" FOREIGN KEY ("journalReviewId") REFERENCES "journal_reviews"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "statement_readiness" ADD CONSTRAINT "statement_readiness_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accounting_health_snapshots" ADD CONSTRAINT "accounting_health_snapshots_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accounting_recommendations" ADD CONSTRAINT "accounting_recommendations_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "controller_workspace_preferences" ADD CONSTRAINT "controller_workspace_preferences_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accounting_exceptions" ADD CONSTRAINT "accounting_exceptions_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "close_forecasts" ADD CONSTRAINT "close_forecasts_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "close_forecasts" ADD CONSTRAINT "close_forecasts_closePeriodId_fkey" FOREIGN KEY ("closePeriodId") REFERENCES "close_periods"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "treasury_briefings" ADD CONSTRAINT "treasury_briefings_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cash_position_snapshots" ADD CONSTRAINT "cash_position_snapshots_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "liquidity_forecasts" ADD CONSTRAINT "liquidity_forecasts_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "liquidity_scenarios" ADD CONSTRAINT "liquidity_scenarios_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "liquidity_scenarios" ADD CONSTRAINT "liquidity_scenarios_forecastId_fkey" FOREIGN KEY ("forecastId") REFERENCES "liquidity_forecasts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fx_exposure_analyses" ADD CONSTRAINT "fx_exposure_analyses_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fx_recommendations" ADD CONSTRAINT "fx_recommendations_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fx_recommendations" ADD CONSTRAINT "fx_recommendations_exposureId_fkey" FOREIGN KEY ("exposureId") REFERENCES "fx_exposure_analyses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bank_relationships" ADD CONSTRAINT "bank_relationships_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bank_healths" ADD CONSTRAINT "bank_healths_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bank_healths" ADD CONSTRAINT "bank_healths_bankRelationshipId_fkey" FOREIGN KEY ("bankRelationshipId") REFERENCES "bank_relationships"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "treasury_risks" ADD CONSTRAINT "treasury_risks_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "treasury_recommendations" ADD CONSTRAINT "treasury_recommendations_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "debt_instruments" ADD CONSTRAINT "debt_instruments_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "debt_covenants" ADD CONSTRAINT "debt_covenants_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "debt_covenants" ADD CONSTRAINT "debt_covenants_debtInstrumentId_fkey" FOREIGN KEY ("debtInstrumentId") REFERENCES "debt_instruments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "debt_alerts" ADD CONSTRAINT "debt_alerts_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "debt_alerts" ADD CONSTRAINT "debt_alerts_debtInstrumentId_fkey" FOREIGN KEY ("debtInstrumentId") REFERENCES "debt_instruments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "investment_holdings" ADD CONSTRAINT "investment_holdings_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "investment_recommendations" ADD CONSTRAINT "investment_recommendations_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "investment_recommendations" ADD CONSTRAINT "investment_recommendations_holdingId_fkey" FOREIGN KEY ("holdingId") REFERENCES "investment_holdings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "treasury_workspace_preferences" ADD CONSTRAINT "treasury_workspace_preferences_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "treasury_health_snapshots" ADD CONSTRAINT "treasury_health_snapshots_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "treasury_specialist_alerts" ADD CONSTRAINT "treasury_specialist_alerts_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "finance_cases" ADD CONSTRAINT "finance_cases_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "case_participants" ADD CONSTRAINT "case_participants_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "case_participants" ADD CONSTRAINT "case_participants_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "finance_cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "case_assignments" ADD CONSTRAINT "case_assignments_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "case_assignments" ADD CONSTRAINT "case_assignments_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "finance_cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "case_comments" ADD CONSTRAINT "case_comments_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "case_comments" ADD CONSTRAINT "case_comments_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "finance_cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "case_evidence" ADD CONSTRAINT "case_evidence_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "case_evidence" ADD CONSTRAINT "case_evidence_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "finance_cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "case_decisions" ADD CONSTRAINT "case_decisions_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "case_decisions" ADD CONSTRAINT "case_decisions_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "finance_cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shared_recommendations" ADD CONSTRAINT "shared_recommendations_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shared_recommendations" ADD CONSTRAINT "shared_recommendations_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "finance_cases"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "specialist_tasks" ADD CONSTRAINT "specialist_tasks_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "specialist_tasks" ADD CONSTRAINT "specialist_tasks_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "finance_cases"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_dependencies" ADD CONSTRAINT "task_dependencies_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_history" ADD CONSTRAINT "task_history_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collaboration_timeline" ADD CONSTRAINT "collaboration_timeline_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collaboration_timeline" ADD CONSTRAINT "collaboration_timeline_financeCaseId_fkey" FOREIGN KEY ("financeCaseId") REFERENCES "finance_cases"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_queues" ADD CONSTRAINT "work_queues_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "specialist_workloads" ADD CONSTRAINT "specialist_workloads_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enterprise_memory" ADD CONSTRAINT "enterprise_memory_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "decision_registry" ADD CONSTRAINT "decision_registry_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_plans" ADD CONSTRAINT "audit_plans_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_engagements" ADD CONSTRAINT "audit_engagements_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_engagements" ADD CONSTRAINT "audit_engagements_planId_fkey" FOREIGN KEY ("planId") REFERENCES "audit_plans"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_controls" ADD CONSTRAINT "audit_controls_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "control_tests" ADD CONSTRAINT "control_tests_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "control_tests" ADD CONSTRAINT "control_tests_controlId_fkey" FOREIGN KEY ("controlId") REFERENCES "audit_controls"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "control_results" ADD CONSTRAINT "control_results_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "control_results" ADD CONSTRAINT "control_results_controlId_fkey" FOREIGN KEY ("controlId") REFERENCES "audit_controls"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_findings" ADD CONSTRAINT "audit_findings_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_findings" ADD CONSTRAINT "audit_findings_engagementId_fkey" FOREIGN KEY ("engagementId") REFERENCES "audit_engagements"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "finding_evidence" ADD CONSTRAINT "finding_evidence_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "finding_evidence" ADD CONSTRAINT "finding_evidence_findingId_fkey" FOREIGN KEY ("findingId") REFERENCES "audit_findings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "remediation_plans" ADD CONSTRAINT "remediation_plans_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "remediation_plans" ADD CONSTRAINT "remediation_plans_findingId_fkey" FOREIGN KEY ("findingId") REFERENCES "audit_findings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "remediation_tasks" ADD CONSTRAINT "remediation_tasks_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "remediation_tasks" ADD CONSTRAINT "remediation_tasks_planId_fkey" FOREIGN KEY ("planId") REFERENCES "remediation_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_evidence_packages" ADD CONSTRAINT "audit_evidence_packages_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_evidence_packages" ADD CONSTRAINT "audit_evidence_packages_engagementId_fkey" FOREIGN KEY ("engagementId") REFERENCES "audit_engagements"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_readiness_snapshots" ADD CONSTRAINT "audit_readiness_snapshots_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_risk_assessments" ADD CONSTRAINT "audit_risk_assessments_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_calendar" ADD CONSTRAINT "audit_calendar_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_calendar" ADD CONSTRAINT "audit_calendar_engagementId_fkey" FOREIGN KEY ("engagementId") REFERENCES "audit_engagements"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_reports" ADD CONSTRAINT "audit_reports_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_reports" ADD CONSTRAINT "audit_reports_engagementId_fkey" FOREIGN KEY ("engagementId") REFERENCES "audit_engagements"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_workspace_preferences" ADD CONSTRAINT "audit_workspace_preferences_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compliance_frameworks" ADD CONSTRAINT "compliance_frameworks_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compliance_requirements" ADD CONSTRAINT "compliance_requirements_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compliance_requirements" ADD CONSTRAINT "compliance_requirements_frameworkId_fkey" FOREIGN KEY ("frameworkId") REFERENCES "compliance_frameworks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compliance_obligations" ADD CONSTRAINT "compliance_obligations_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compliance_policies" ADD CONSTRAINT "compliance_policies_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "policy_versions" ADD CONSTRAINT "policy_versions_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "policy_versions" ADD CONSTRAINT "policy_versions_policyId_fkey" FOREIGN KEY ("policyId") REFERENCES "compliance_policies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compliance_violations" ADD CONSTRAINT "compliance_violations_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compliance_assessments" ADD CONSTRAINT "compliance_assessments_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compliance_health_snapshots" ADD CONSTRAINT "compliance_health_snapshots_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compliance_risk_assessments" ADD CONSTRAINT "compliance_risk_assessments_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compliance_filings" ADD CONSTRAINT "compliance_filings_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compliance_deadlines" ADD CONSTRAINT "compliance_deadlines_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "regulatory_updates" ADD CONSTRAINT "regulatory_updates_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compliance_remediations" ADD CONSTRAINT "compliance_remediations_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compliance_remediations" ADD CONSTRAINT "compliance_remediations_violationId_fkey" FOREIGN KEY ("violationId") REFERENCES "compliance_violations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compliance_briefings" ADD CONSTRAINT "compliance_briefings_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compliance_workspace_preferences" ADD CONSTRAINT "compliance_workspace_preferences_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "strategic_plans" ADD CONSTRAINT "strategic_plans_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "planning_cycles" ADD CONSTRAINT "planning_cycles_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "planning_cycles" ADD CONSTRAINT "planning_cycles_planId_fkey" FOREIGN KEY ("planId") REFERENCES "strategic_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "budgets" ADD CONSTRAINT "budgets_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "budget_versions" ADD CONSTRAINT "budget_versions_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "budget_versions" ADD CONSTRAINT "budget_versions_budgetId_fkey" FOREIGN KEY ("budgetId") REFERENCES "budgets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "budget_lines" ADD CONSTRAINT "budget_lines_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "budget_lines" ADD CONSTRAINT "budget_lines_budgetId_fkey" FOREIGN KEY ("budgetId") REFERENCES "budgets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "forecasts" ADD CONSTRAINT "forecasts_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "forecast_versions" ADD CONSTRAINT "forecast_versions_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "forecast_versions" ADD CONSTRAINT "forecast_versions_forecastId_fkey" FOREIGN KEY ("forecastId") REFERENCES "forecasts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scenario_models" ADD CONSTRAINT "scenario_models_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fpa_scenario_executions" ADD CONSTRAINT "fpa_scenario_executions_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fpa_scenario_executions" ADD CONSTRAINT "fpa_scenario_executions_scenarioId_fkey" FOREIGN KEY ("scenarioId") REFERENCES "scenario_models"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "business_drivers" ADD CONSTRAINT "business_drivers_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "driver_assumptions" ADD CONSTRAINT "driver_assumptions_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "driver_assumptions" ADD CONSTRAINT "driver_assumptions_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "business_drivers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "driver_assumptions" ADD CONSTRAINT "driver_assumptions_scenarioId_fkey" FOREIGN KEY ("scenarioId") REFERENCES "scenario_models"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "variance_analyses" ADD CONSTRAINT "variance_analyses_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "capital_plans" ADD CONSTRAINT "capital_plans_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "investment_proposals" ADD CONSTRAINT "investment_proposals_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "strategic_initiatives" ADD CONSTRAINT "strategic_initiatives_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "planning_recommendations" ADD CONSTRAINT "planning_recommendations_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "planning_briefings" ADD CONSTRAINT "planning_briefings_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "planning_workspace_preferences" ADD CONSTRAINT "planning_workspace_preferences_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tax_jurisdictions" ADD CONSTRAINT "tax_jurisdictions_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tax_rates" ADD CONSTRAINT "tax_rates_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tax_rates" ADD CONSTRAINT "tax_rates_jurisdictionId_fkey" FOREIGN KEY ("jurisdictionId") REFERENCES "tax_jurisdictions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tax_provisions" ADD CONSTRAINT "tax_provisions_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deferred_taxes" ADD CONSTRAINT "deferred_taxes_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deferred_taxes" ADD CONSTRAINT "deferred_taxes_provisionId_fkey" FOREIGN KEY ("provisionId") REFERENCES "tax_provisions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tax_returns" ADD CONSTRAINT "tax_returns_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tax_returns" ADD CONSTRAINT "tax_returns_jurisdictionId_fkey" FOREIGN KEY ("jurisdictionId") REFERENCES "tax_jurisdictions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tax_filings" ADD CONSTRAINT "tax_filings_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tax_filings" ADD CONSTRAINT "tax_filings_jurisdictionId_fkey" FOREIGN KEY ("jurisdictionId") REFERENCES "tax_jurisdictions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tax_deadlines" ADD CONSTRAINT "tax_deadlines_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tax_deadlines" ADD CONSTRAINT "tax_deadlines_jurisdictionId_fkey" FOREIGN KEY ("jurisdictionId") REFERENCES "tax_jurisdictions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tax_payments" ADD CONSTRAINT "tax_payments_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tax_payments" ADD CONSTRAINT "tax_payments_jurisdictionId_fkey" FOREIGN KEY ("jurisdictionId") REFERENCES "tax_jurisdictions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transfer_pricing_policies" ADD CONSTRAINT "transfer_pricing_policies_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "intercompany_tax_rules" ADD CONSTRAINT "intercompany_tax_rules_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "intercompany_tax_rules" ADD CONSTRAINT "intercompany_tax_rules_policyId_fkey" FOREIGN KEY ("policyId") REFERENCES "transfer_pricing_policies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tax_assessments" ADD CONSTRAINT "tax_assessments_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tax_assessments" ADD CONSTRAINT "tax_assessments_jurisdictionId_fkey" FOREIGN KEY ("jurisdictionId") REFERENCES "tax_jurisdictions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tax_risk_assessments" ADD CONSTRAINT "tax_risk_assessments_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tax_planning_scenarios" ADD CONSTRAINT "tax_planning_scenarios_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tax_recommendations" ADD CONSTRAINT "tax_recommendations_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tax_briefings" ADD CONSTRAINT "tax_briefings_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tax_workspace_preferences" ADD CONSTRAINT "tax_workspace_preferences_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "boards" ADD CONSTRAINT "boards_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "board_members" ADD CONSTRAINT "board_members_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "board_members" ADD CONSTRAINT "board_members_boardId_fkey" FOREIGN KEY ("boardId") REFERENCES "boards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "committees" ADD CONSTRAINT "committees_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "committees" ADD CONSTRAINT "committees_boardId_fkey" FOREIGN KEY ("boardId") REFERENCES "boards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "committee_members" ADD CONSTRAINT "committee_members_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "committee_members" ADD CONSTRAINT "committee_members_committeeId_fkey" FOREIGN KEY ("committeeId") REFERENCES "committees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "committee_members" ADD CONSTRAINT "committee_members_boardMemberId_fkey" FOREIGN KEY ("boardMemberId") REFERENCES "board_members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "board_meetings" ADD CONSTRAINT "board_meetings_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "board_meetings" ADD CONSTRAINT "board_meetings_boardId_fkey" FOREIGN KEY ("boardId") REFERENCES "boards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meeting_agendas" ADD CONSTRAINT "meeting_agendas_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meeting_agendas" ADD CONSTRAINT "meeting_agendas_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "board_meetings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agenda_items" ADD CONSTRAINT "agenda_items_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agenda_items" ADD CONSTRAINT "agenda_items_agendaId_fkey" FOREIGN KEY ("agendaId") REFERENCES "meeting_agendas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "board_resolutions" ADD CONSTRAINT "board_resolutions_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "board_resolutions" ADD CONSTRAINT "board_resolutions_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "board_meetings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "board_votes" ADD CONSTRAINT "board_votes_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "board_votes" ADD CONSTRAINT "board_votes_resolutionId_fkey" FOREIGN KEY ("resolutionId") REFERENCES "board_resolutions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "board_votes" ADD CONSTRAINT "board_votes_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "board_meetings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "board_votes" ADD CONSTRAINT "board_votes_boardMemberId_fkey" FOREIGN KEY ("boardMemberId") REFERENCES "board_members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meeting_minutes" ADD CONSTRAINT "meeting_minutes_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meeting_minutes" ADD CONSTRAINT "meeting_minutes_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "board_meetings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "board_actions" ADD CONSTRAINT "board_actions_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "board_actions" ADD CONSTRAINT "board_actions_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "board_meetings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "governance_board_packs" ADD CONSTRAINT "governance_board_packs_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "governance_board_packs" ADD CONSTRAINT "governance_board_packs_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "board_meetings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "board_briefings" ADD CONSTRAINT "board_briefings_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "governance_metrics" ADD CONSTRAINT "governance_metrics_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "board_workspace_preferences" ADD CONSTRAINT "board_workspace_preferences_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm_professional_profiles" ADD CONSTRAINT "crm_professional_profiles_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "crm_contacts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm_interactions" ADD CONSTRAINT "crm_interactions_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "crm_contacts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm_opportunities" ADD CONSTRAINT "crm_opportunities_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "crm_contacts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm_tasks" ADD CONSTRAINT "crm_tasks_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "crm_contacts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm_contact_intelligence" ADD CONSTRAINT "crm_contact_intelligence_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "crm_contacts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm_voc_insights" ADD CONSTRAINT "crm_voc_insights_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "crm_contacts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm_pain_points" ADD CONSTRAINT "crm_pain_points_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "crm_contacts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm_pain_points" ADD CONSTRAINT "crm_pain_points_insight_id_fkey" FOREIGN KEY ("insight_id") REFERENCES "crm_voc_insights"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm_discovery_sessions" ADD CONSTRAINT "crm_discovery_sessions_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "crm_contacts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm_timeline_events" ADD CONSTRAINT "crm_timeline_events_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "crm_contacts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm_knowledge_graph" ADD CONSTRAINT "crm_knowledge_graph_source_contact_id_fkey" FOREIGN KEY ("source_contact_id") REFERENCES "crm_contacts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm_knowledge_graph" ADD CONSTRAINT "crm_knowledge_graph_target_contact_id_fkey" FOREIGN KEY ("target_contact_id") REFERENCES "crm_contacts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

