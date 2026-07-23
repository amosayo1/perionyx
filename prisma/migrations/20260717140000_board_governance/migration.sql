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
    "committees" TEXT[] DEFAULT ARRAY[]::TEXT[],
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
    "dependencies" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "evidenceIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
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
    "evidenceIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
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
CREATE UNIQUE INDEX "governance_board_packs_companyId_meetingId_key" ON "governance_board_packs"("companyId", "meetingId");

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
