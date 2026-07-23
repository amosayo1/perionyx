-- Phase 13.5 — Enterprise Finance Collaboration Platform

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

-- CreateIndex
CREATE UNIQUE INDEX "finance_cases_companyId_caseNumber_key" ON "finance_cases"("companyId", "caseNumber");
CREATE INDEX "finance_cases_companyId_status_idx" ON "finance_cases"("companyId", "status");
CREATE INDEX "finance_cases_companyId_caseType_idx" ON "finance_cases"("companyId", "caseType");
CREATE INDEX "finance_cases_companyId_priority_idx" ON "finance_cases"("companyId", "priority");
CREATE INDEX "finance_cases_companyId_ownerSpecialist_idx" ON "finance_cases"("companyId", "ownerSpecialist");
CREATE INDEX "finance_cases_companyId_caseNumber_idx" ON "finance_cases"("companyId", "caseNumber");

-- CreateIndex
CREATE INDEX "case_participants_companyId_caseId_idx" ON "case_participants"("companyId", "caseId");
CREATE INDEX "case_participants_companyId_participantType_idx" ON "case_participants"("companyId", "participantType");
CREATE INDEX "case_participants_companyId_participantId_idx" ON "case_participants"("companyId", "participantId");

-- CreateIndex
CREATE INDEX "case_assignments_companyId_caseId_idx" ON "case_assignments"("companyId", "caseId");
CREATE INDEX "case_assignments_companyId_fromSpecialist_idx" ON "case_assignments"("companyId", "fromSpecialist");
CREATE INDEX "case_assignments_companyId_toSpecialist_idx" ON "case_assignments"("companyId", "toSpecialist");
CREATE INDEX "case_assignments_companyId_status_idx" ON "case_assignments"("companyId", "status");

-- CreateIndex
CREATE INDEX "case_comments_companyId_caseId_idx" ON "case_comments"("companyId", "caseId");
CREATE INDEX "case_comments_companyId_authorType_idx" ON "case_comments"("companyId", "authorType");

-- CreateIndex
CREATE INDEX "case_evidence_companyId_caseId_idx" ON "case_evidence"("companyId", "caseId");
CREATE INDEX "case_evidence_companyId_evidenceType_idx" ON "case_evidence"("companyId", "evidenceType");
CREATE INDEX "case_evidence_companyId_referenceId_idx" ON "case_evidence"("companyId", "referenceId");

-- CreateIndex
CREATE INDEX "case_decisions_companyId_caseId_idx" ON "case_decisions"("companyId", "caseId");
CREATE INDEX "case_decisions_companyId_decisionType_idx" ON "case_decisions"("companyId", "decisionType");
CREATE INDEX "case_decisions_companyId_status_idx" ON "case_decisions"("companyId", "status");

-- CreateIndex
CREATE INDEX "shared_recommendations_companyId_status_idx" ON "shared_recommendations"("companyId", "status");
CREATE INDEX "shared_recommendations_companyId_category_idx" ON "shared_recommendations"("companyId", "category");
CREATE INDEX "shared_recommendations_companyId_primarySpecialist_idx" ON "shared_recommendations"("companyId", "primarySpecialist");
CREATE INDEX "shared_recommendations_companyId_caseId_idx" ON "shared_recommendations"("companyId", "caseId");

-- CreateIndex
CREATE INDEX "specialist_tasks_companyId_assignedTo_idx" ON "specialist_tasks"("companyId", "assignedTo");
CREATE INDEX "specialist_tasks_companyId_status_idx" ON "specialist_tasks"("companyId", "status");
CREATE INDEX "specialist_tasks_companyId_caseId_idx" ON "specialist_tasks"("companyId", "caseId");
CREATE INDEX "specialist_tasks_companyId_priority_idx" ON "specialist_tasks"("companyId", "priority");
CREATE INDEX "specialist_tasks_companyId_taskType_idx" ON "specialist_tasks"("companyId", "taskType");

-- CreateIndex
CREATE INDEX "task_dependencies_companyId_taskId_idx" ON "task_dependencies"("companyId", "taskId");
CREATE INDEX "task_dependencies_companyId_dependsOnTaskId_idx" ON "task_dependencies"("companyId", "dependsOnTaskId");

-- CreateIndex
CREATE INDEX "task_history_companyId_taskId_idx" ON "task_history"("companyId", "taskId");
CREATE INDEX "task_history_companyId_eventType_idx" ON "task_history"("companyId", "eventType");

-- CreateIndex
CREATE INDEX "collaboration_timeline_companyId_eventType_idx" ON "collaboration_timeline"("companyId", "eventType");
CREATE INDEX "collaboration_timeline_companyId_caseId_idx" ON "collaboration_timeline"("companyId", "caseId");
CREATE INDEX "collaboration_timeline_companyId_createdAt_idx" ON "collaboration_timeline"("companyId", "createdAt");
CREATE INDEX "collaboration_timeline_companyId_specialistName_idx" ON "collaboration_timeline"("companyId", "specialistName");

-- CreateIndex
CREATE INDEX "work_queues_companyId_queueName_idx" ON "work_queues"("companyId", "queueName");
CREATE INDEX "work_queues_companyId_queueType_idx" ON "work_queues"("companyId", "queueType");
CREATE INDEX "work_queues_companyId_status_idx" ON "work_queues"("companyId", "status");

-- CreateIndex
CREATE INDEX "specialist_workloads_companyId_specialistName_idx" ON "specialist_workloads"("companyId", "specialistName");
CREATE INDEX "specialist_workloads_companyId_utilizationRate_idx" ON "specialist_workloads"("companyId", "utilizationRate");

-- CreateIndex
CREATE INDEX "enterprise_memory_companyId_memoryType_idx" ON "enterprise_memory"("companyId", "memoryType");
CREATE INDEX "enterprise_memory_companyId_contextKey_idx" ON "enterprise_memory"("companyId", "contextKey");
CREATE INDEX "enterprise_memory_companyId_sourceSpecialist_idx" ON "enterprise_memory"("companyId", "sourceSpecialist");
CREATE INDEX "enterprise_memory_companyId_relatedEntityType_idx" ON "enterprise_memory"("companyId", "relatedEntityType");

-- CreateIndex
CREATE UNIQUE INDEX "decision_registry_companyId_decisionNumber_key" ON "decision_registry"("companyId", "decisionNumber");
CREATE INDEX "decision_registry_companyId_status_idx" ON "decision_registry"("companyId", "status");
CREATE INDEX "decision_registry_companyId_decisionType_idx" ON "decision_registry"("companyId", "decisionType");
CREATE INDEX "decision_registry_companyId_decidedBy_idx" ON "decision_registry"("companyId", "decidedBy");
CREATE INDEX "decision_registry_companyId_caseId_idx" ON "decision_registry"("companyId", "caseId");
CREATE INDEX "decision_registry_companyId_decisionNumber_idx" ON "decision_registry"("companyId", "decisionNumber");

-- AddForeignKey
ALTER TABLE "finance_cases" ADD CONSTRAINT "finance_cases_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "case_participants" ADD CONSTRAINT "case_participants_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "case_participants" ADD CONSTRAINT "case_participants_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "finance_cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "case_assignments" ADD CONSTRAINT "case_assignments_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "case_assignments" ADD CONSTRAINT "case_assignments_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "finance_cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "case_comments" ADD CONSTRAINT "case_comments_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "case_comments" ADD CONSTRAINT "case_comments_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "finance_cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "case_evidence" ADD CONSTRAINT "case_evidence_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "case_evidence" ADD CONSTRAINT "case_evidence_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "finance_cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "case_decisions" ADD CONSTRAINT "case_decisions_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "case_decisions" ADD CONSTRAINT "case_decisions_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "finance_cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shared_recommendations" ADD CONSTRAINT "shared_recommendations_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "shared_recommendations" ADD CONSTRAINT "shared_recommendations_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "finance_cases"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "specialist_tasks" ADD CONSTRAINT "specialist_tasks_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "specialist_tasks" ADD CONSTRAINT "specialist_tasks_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "finance_cases"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_dependencies" ADD CONSTRAINT "task_dependencies_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_history" ADD CONSTRAINT "task_history_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collaboration_timeline" ADD CONSTRAINT "collaboration_timeline_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_queues" ADD CONSTRAINT "work_queues_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "specialist_workloads" ADD CONSTRAINT "specialist_workloads_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enterprise_memory" ADD CONSTRAINT "enterprise_memory_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "decision_registry" ADD CONSTRAINT "decision_registry_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
