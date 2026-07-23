// ─────────────────────────────────────────────────────────────
// Enterprise Board Governance — Type Definitions
// ─────────────────────────────────────────────────────────────

import { Prisma } from "@prisma/client";

// ─── Board Types ──────────────────────────────────────────

export type BoardStatus = "active" | "inactive" | "dissolved" | "pending_formation" | "under_review";

export type MemberRole = "chairman" | "vice_chairman" | "director" | "observer" | "secretary";

export type MemberStatus = "active" | "inactive" | "resigned" | "retired";

export type CommitteeType =
  | "audit"
  | "risk"
  | "finance"
  | "strategy"
  | "compensation"
  | "nomination"
  | "governance"
  | "technology"
  | "other";

export type MeetingType = "regular" | "special" | "annual" | "emergency" | "committee";

export type MeetingStatus = "scheduled" | "in_progress" | "completed" | "cancelled" | "postponed";

export type AgendaStatus = "draft" | "final" | "archived";

export type AgendaItemCategory =
  | "financial"
  | "strategic"
  | "operational"
  | "governance"
  | "personnel"
  | "legal"
  | "compliance"
  | "risk"
  | "other";

export type ResolutionType = "policy" | "financial" | "strategic" | "personnel" | "governance" | "compliance" | "other";

export type ResolutionStatus = "proposed" | "voting" | "approved" | "rejected" | "defeated" | "withdrawn";

export type VoteValue = "for" | "against" | "abstain" | "conflict_of_interest";

export type MinuteType = "draft" | "final" | "approved";

export type ActionStatus = "pending" | "in_progress" | "completed" | "overdue" | "cancelled";

export type ActionPriority = "low" | "medium" | "high" | "urgent";

export type PackStatus = "assembling" | "complete" | "approved" | "distributed";

export type BriefingType = "upcoming_meeting" | "agenda_preview" | "regular" | "ad_hoc";

// ─── Domain Interfaces ────────────────────────────────────

export interface Board {
  id: string;
  companyId: string;
  boardName: string;
  description: string | null;
  status: string;
  formationDate: Date | null;
  chairmanId: string | null;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface BoardMember {
  id: string;
  companyId: string;
  boardId: string;
  memberName: string;
  title: string;
  email: string | null;
  appointmentDate: Date;
  termEndDate: Date | null;
  status: string;
  votingRights: boolean;
  committees: string[];
  attendanceRate: Prisma.Decimal;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface Committee {
  id: string;
  companyId: string;
  boardId: string;
  committeeName: string;
  committeeType: string;
  description: string | null;
  charter: unknown;
  chairId: string | null;
  meetingFrequency: string;
  status: string;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface CommitteeMember {
  id: string;
  companyId: string;
  committeeId: string;
  boardMemberId: string;
  role: string;
  appointedDate: Date;
  leftDate: Date | null;
  status: string;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface BoardMeeting {
  id: string;
  companyId: string;
  boardId: string;
  committeeId: string | null;
  meetingNumber: number;
  title: string;
  meetingType: string;
  scheduledDate: Date;
  duration: number | null;
  location: string | null;
  status: string;
  quorumMet: boolean | null;
  attendees: unknown[];
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface MeetingAgenda {
  id: string;
  companyId: string;
  meetingId: string;
  version: string;
  status: string;
  approvedBy: string | null;
  approvedAt: Date | null;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface AgendaItem {
  id: string;
  companyId: string;
  agendaId: string;
  lineNumber: number;
  title: string;
  description: string | null;
  category: string;
  presenter: string | null;
  durationMinutes: number | null;
  requiresVote: boolean;
  requiresApproval: boolean;
  status: string;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface BoardResolution {
  id: string;
  companyId: string;
  meetingId: string | null;
  resolutionNumber: string;
  title: string;
  description: string | null;
  resolutionType: string;
  status: string;
  requiredVotes: number;
  votesFor: number;
  votesAgainst: number;
  abstentions: number;
  passed: boolean;
  effectiveDate: Date | null;
  expiryDate: Date | null;
  owner: string | null;
  dependencies: string[];
  evidenceIds: string[];
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface BoardVote {
  id: string;
  companyId: string;
  resolutionId: string;
  meetingId: string;
  boardMemberId: string;
  vote: string;
  rationale: string | null;
  votedAt: Date;
  metadata: Record<string, unknown>;
  createdAt: Date;
}

export interface MeetingMinute {
  id: string;
  companyId: string;
  meetingId: string;
  minuteType: string;
  content: unknown;
  approvedBy: string | null;
  approvedAt: Date | null;
  actionItemCount: number;
  resolutionCount: number;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface BoardAction {
  id: string;
  companyId: string;
  meetingId: string | null;
  resolutionId: string | null;
  actionTitle: string;
  description: string | null;
  assignedTo: string;
  assignedToType: string;
  priority: string;
  status: string;
  dueDate: Date;
  completedAt: Date | null;
  progress: Prisma.Decimal;
  evidenceIds: string[];
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface GovernanceBoardPack {
  id: string;
  companyId: string;
  meetingId: string;
  packTitle: string;
  packType: string;
  status: string;
  sections: unknown[];
  assembledBy: string;
  approvedBy: string | null;
  approvedAt: Date | null;
  distributedAt: Date | null;
  evidenceCount: number;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface BoardBriefing {
  id: string;
  companyId: string;
  briefingDate: Date;
  briefingType: string;
  summary: Record<string, unknown>;
  meetingHighlights: Record<string, unknown>;
  actionStatus: Record<string, unknown>;
  riskHighlights: Record<string, unknown>;
  financialHighlights: Record<string, unknown>;
  auditHighlights: Record<string, unknown>;
  complianceHighlights: Record<string, unknown>;
  taxHighlights: Record<string, unknown>;
  strategicHighlights: Record<string, unknown>;
  metadata: Record<string, unknown>;
  createdAt: Date;
}

export interface GovernanceMetric {
  id: string;
  companyId: string;
  metricDate: Date;
  overallScore: Prisma.Decimal;
  meetingEffectiveness: Prisma.Decimal;
  resolutionCompletionRate: Prisma.Decimal;
  actionCompletionRate: Prisma.Decimal;
  committeePerformance: Record<string, unknown>;
  attendanceRate: Prisma.Decimal;
  decisionCycleTimeDays: Prisma.Decimal;
  complianceScore: Prisma.Decimal;
  riskScore: Prisma.Decimal;
  trendData: Record<string, unknown>;
  metadata: Record<string, unknown>;
  createdAt: Date;
}

// ─── Dashboard Interface ──────────────────────────────────

export interface GovernanceDashboardData {
  totalBoards: number;
  activeBoards: number;
  totalMembers: number;
  totalCommittees: number;
  upcomingMeetings: number;
  pendingResolutions: number;
  overdueActions: number;
  governanceScore: Prisma.Decimal;
  meetingAttendanceRate: Prisma.Decimal;
  resolutionPassRate: Prisma.Decimal;
  avgDaysToCompleteActions: Prisma.Decimal;
  recentActions: BoardAction[];
  upcomingMeetingsList: BoardMeeting[];
  complianceAlerts: ComplianceAlert[];
}

export interface ComplianceAlert {
  id: string;
  type: string;
  severity: "low" | "medium" | "high" | "critical";
  title: string;
  description: string;
  dueDate?: Date;
}

export interface GovernanceHealthScore {
  overallScore: Prisma.Decimal;
  meetingEffectiveness: Prisma.Decimal;
  resolutionCompletionRate: Prisma.Decimal;
  actionCompletionRate: Prisma.Decimal;
  attendanceRate: Prisma.Decimal;
  complianceScore: Prisma.Decimal;
  riskScore: Prisma.Decimal;
}

// ─── Input Types ──────────────────────────────────────────

export interface CreateBoardInput {
  boardName: string;
  description?: string;
  formationDate?: Date;
  chairmanId?: string;
  metadata?: Record<string, unknown>;
}

export interface UpdateBoardInput {
  boardName?: string;
  description?: string;
  status?: string;
  chairmanId?: string;
  formationDate?: Date;
  metadata?: Record<string, unknown>;
}

export interface CreateMemberInput {
  boardId: string;
  memberName: string;
  title: string;
  email?: string;
  appointmentDate: Date;
  termEndDate?: Date;
  votingRights?: boolean;
  committees?: string[];
  metadata?: Record<string, unknown>;
}

export interface CreateCommitteeInput {
  boardId: string;
  committeeType: CommitteeType;
  committeeName: string;
  description?: string;
  charter?: Record<string, unknown>;
  chairId?: string;
  meetingFrequency?: string;
  metadata?: Record<string, unknown>;
}

export interface AddCommitteeMemberInput {
  committeeId: string;
  boardMemberId: string;
  role?: string;
  appointedDate?: Date;
}

export interface CreateMeetingInput {
  boardId: string;
  committeeId?: string;
  meetingNumber: number;
  title: string;
  meetingType: MeetingType;
  scheduledDate: Date;
  duration?: number;
  location?: string;
  metadata?: Record<string, unknown>;
}

export interface AddAgendaItemInput {
  agendaId: string;
  title: string;
  description?: string;
  category?: AgendaItemCategory;
  presenter?: string;
  durationMinutes?: number;
  requiresVote?: boolean;
  requiresApproval?: boolean;
}

export interface UpdateMeetingStatusInput {
  status: MeetingStatus;
  quorumMet?: boolean;
  attendees?: unknown[];
}

export interface SubmitMinutesInput {
  content: Record<string, unknown>;
}

export interface CreateResolutionInput {
  meetingId?: string;
  resolutionType: ResolutionType;
  title: string;
  description?: string;
  requiredVotes: number;
  effectiveDate?: Date;
  expiryDate?: Date;
  owner?: string;
  metadata?: Record<string, unknown>;
}

export interface CastVoteInput {
  meetingId: string;
  boardMemberId: string;
  vote: VoteValue;
  rationale?: string;
}

export interface CreateBoardPackInput {
  meetingId: string;
  packTitle: string;
  packType?: string;
  sections?: unknown[];
  metadata?: Record<string, unknown>;
}

export interface CreateActionInput {
  meetingId?: string;
  resolutionId?: string;
  actionTitle: string;
  description?: string;
  assignedTo: string;
  assignedToType?: string;
  priority?: ActionPriority;
  dueDate: Date;
  metadata?: Record<string, unknown>;
}

export interface UpdateActionInput {
  status?: ActionStatus;
  progress?: number;
  completedAt?: Date;
  priority?: ActionPriority;
  metadata?: Record<string, unknown>;
}

export interface GenerateBriefingInput {
  briefingType: BriefingType;
  metadata?: Record<string, unknown>;
}

// ─── Query Types ──────────────────────────────────────────

export interface BoardListQuery {
  status?: BoardStatus;
  search?: string;
  page?: number;
  limit?: number;
}

export interface MeetingListQuery {
  boardId?: string;
  meetingType?: MeetingType;
  status?: MeetingStatus;
  fromDate?: string;
  toDate?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface ResolutionListQuery {
  meetingId?: string;
  resolutionType?: ResolutionType;
  status?: ResolutionStatus;
  search?: string;
  page?: number;
  limit?: number;
}

export interface ActionListQuery {
  meetingId?: string;
  status?: ActionStatus;
  priority?: ActionPriority;
  assignedTo?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface BriefingListQuery {
  briefingType?: BriefingType;
  page?: number;
  limit?: number;
}

export interface BoardDashboardQuery {
  boardId?: string;
}
