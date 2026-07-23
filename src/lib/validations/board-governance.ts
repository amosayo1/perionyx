// ─────────────────────────────────────────────────────────────
// Enterprise Board Governance — Zod Validation Schemas
// ─────────────────────────────────────────────────────────────

import { z } from "zod";

// ─── Enum Schemas ─────────────────────────────────────────

const boardStatus = z.enum(["active", "inactive", "dissolved", "pending_formation", "under_review"]);
const memberRole = z.enum(["chairman", "vice_chairman", "director", "observer", "secretary"]);
const committeeType = z.enum(["audit", "risk", "finance", "strategy", "compensation", "nomination", "governance", "technology", "other"]);
const meetingType = z.enum(["regular", "special", "annual", "emergency", "committee"]);
const meetingStatus = z.enum(["scheduled", "in_progress", "completed", "cancelled", "postponed"]);
const agendaItemCategory = z.enum(["financial", "strategic", "operational", "governance", "personnel", "legal", "compliance", "risk", "other"]);
const resolutionType = z.enum(["policy", "financial", "strategic", "personnel", "governance", "compliance", "other"]);
const resolutionStatus = z.enum(["proposed", "voting", "approved", "rejected", "defeated", "withdrawn"]);
const voteValue = z.enum(["for", "against", "abstain", "conflict_of_interest"]);
const actionStatus = z.enum(["pending", "in_progress", "completed", "overdue", "cancelled"]);
const actionPriority = z.enum(["low", "medium", "high", "urgent"]);
const briefingType = z.enum(["upcoming_meeting", "agenda_preview", "regular", "ad_hoc"]);

// ─── Board Schemas ────────────────────────────────────────

export const createBoardSchema = z.object({
  boardName: z.string().min(1, "Name is required").max(200),
  description: z.string().max(2000).optional(),
  formationDate: z.coerce.date().optional(),
  chairmanId: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).default({}),
});

export const updateBoardSchema = z.object({
  boardName: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional(),
  status: boardStatus.optional(),
  chairmanId: z.string().optional(),
  formationDate: z.coerce.date().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const boardListQuerySchema = z.object({
  status: boardStatus.optional(),
  search: z.string().max(200).optional(),
  page: z.string().transform((v) => Math.max(1, parseInt(v, 10) || 1)).optional(),
  limit: z.string().transform((v) => Math.min(100, Math.max(1, parseInt(v, 10) || 20))).optional(),
});

// ─── Member Schemas ───────────────────────────────────────

export const createMemberSchema = z.object({
  boardId: z.string().min(1, "Board ID is required"),
  memberName: z.string().min(1, "Name is required").max(200),
  title: z.string().min(1, "Title is required").max(200),
  email: z.string().email().optional(),
  appointmentDate: z.coerce.date({ message: "Valid appointment date is required" }),
  termEndDate: z.coerce.date().optional(),
  votingRights: z.boolean().default(true),
  committees: z.array(z.string()).default([]),
  metadata: z.record(z.string(), z.unknown()).default({}),
});

// ─── Committee Schemas ────────────────────────────────────

export const createCommitteeSchema = z.object({
  boardId: z.string().min(1, "Board ID is required"),
  committeeType,
  committeeName: z.string().min(1, "Name is required").max(200),
  description: z.string().max(2000).optional(),
  charter: z.record(z.string(), z.unknown()).optional(),
  chairId: z.string().optional(),
  meetingFrequency: z.string().max(100).default("monthly"),
  metadata: z.record(z.string(), z.unknown()).default({}),
});

export const addCommitteeMemberSchema = z.object({
  committeeId: z.string().min(1, "Committee ID is required"),
  boardMemberId: z.string().min(1, "Member ID is required"),
  role: z.string().max(50).default("member"),
  appointedDate: z.string().datetime().optional(),
});

export const committeeListQuerySchema = z.object({
  boardId: z.string().optional(),
  committeeType: committeeType.optional(),
  status: z.enum(["active", "inactive"]).optional(),
  search: z.string().max(200).optional(),
  page: z.string().transform((v) => Math.max(1, parseInt(v, 10) || 1)).optional(),
  limit: z.string().transform((v) => Math.min(100, Math.max(1, parseInt(v, 10) || 20))).optional(),
});

// ─── Meeting Schemas ──────────────────────────────────────

export const createMeetingSchema = z.object({
  boardId: z.string().min(1, "Board ID is required"),
  committeeId: z.string().optional(),
  meetingNumber: z.number().int().min(1),
  title: z.string().min(1, "Title is required").max(300),
  meetingType,
  scheduledDate: z.coerce.date({ message: "Valid scheduled date is required" }),
  duration: z.number().int().min(1).max(1440).optional(),
  location: z.string().max(500).optional(),
  metadata: z.record(z.string(), z.unknown()).default({}),
});

export const updateMeetingStatusSchema = z.object({
  status: meetingStatus,
  quorumMet: z.boolean().optional(),
  attendees: z.array(z.unknown()).optional(),
});

export const meetingListQuerySchema = z.object({
  boardId: z.string().optional(),
  meetingType: meetingType.optional(),
  status: meetingStatus.optional(),
  fromDate: z.string().optional(),
  toDate: z.string().optional(),
  search: z.string().max(200).optional(),
  page: z.string().transform((v) => Math.max(1, parseInt(v, 10) || 1)).optional(),
  limit: z.string().transform((v) => Math.min(100, Math.max(1, parseInt(v, 10) || 20))).optional(),
});

// ─── Agenda Schemas ───────────────────────────────────────

export const addAgendaItemSchema = z.object({
  agendaId: z.string().min(1, "Agenda ID is required"),
  title: z.string().min(1, "Title is required").max(300),
  description: z.string().max(2000).optional(),
  category: agendaItemCategory.default("other"),
  presenter: z.string().max(200).optional(),
  durationMinutes: z.number().int().min(1).max(480).optional(),
  requiresVote: z.boolean().default(false),
  requiresApproval: z.boolean().default(false),
});

// ─── Minutes Schemas ──────────────────────────────────────

export const submitMinutesSchema = z.object({
  content: z.record(z.string(), z.unknown()),
});

// ─── Resolution Schemas ───────────────────────────────────

export const createResolutionSchema = z.object({
  meetingId: z.string().optional(),
  resolutionType,
  title: z.string().min(1, "Title is required").max(500),
  description: z.string().max(5000).optional(),
  requiredVotes: z.number().int().min(1),
  effectiveDate: z.coerce.date().optional(),
  expiryDate: z.coerce.date().optional(),
  owner: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).default({}),
});

export const castVoteSchema = z.object({
  meetingId: z.string().min(1, "Meeting ID is required"),
  boardMemberId: z.string().min(1, "Member ID is required"),
  vote: voteValue,
  rationale: z.string().max(2000).optional(),
});

export const resolutionListQuerySchema = z.object({
  meetingId: z.string().optional(),
  resolutionType: resolutionType.optional(),
  status: resolutionStatus.optional(),
  search: z.string().max(200).optional(),
  page: z.string().transform((v) => Math.max(1, parseInt(v, 10) || 1)).optional(),
  limit: z.string().transform((v) => Math.min(100, Math.max(1, parseInt(v, 10) || 20))).optional(),
});

// ─── Board Pack Schemas ───────────────────────────────────

export const createBoardPackSchema = z.object({
  meetingId: z.string().min(1, "Meeting ID is required"),
  packTitle: z.string().min(1, "Title is required").max(300),
  packType: z.string().max(100).default("regular"),
  sections: z.array(z.unknown()).default([]),
  metadata: z.record(z.string(), z.unknown()).default({}),
});

// ─── Action Item Schemas ──────────────────────────────────

export const createActionItemSchema = z.object({
  meetingId: z.string().optional(),
  resolutionId: z.string().optional(),
  actionTitle: z.string().min(1, "Title is required").max(300),
  description: z.string().max(2000).optional(),
  assignedTo: z.string().min(1, "Assignee is required"),
  assignedToType: z.string().max(50).default("human"),
  priority: actionPriority.default("medium"),
  dueDate: z.coerce.date({ message: "Valid due date is required" }),
  metadata: z.record(z.string(), z.unknown()).default({}),
});

export const updateActionItemSchema = z.object({
  status: actionStatus.optional(),
  progress: z.number().min(0).max(100).optional(),
  completedAt: z.coerce.date().optional(),
  priority: actionPriority.optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const actionListQuerySchema = z.object({
  meetingId: z.string().optional(),
  status: actionStatus.optional(),
  priority: actionPriority.optional(),
  assignedTo: z.string().optional(),
  search: z.string().max(200).optional(),
  page: z.string().transform((v) => Math.max(1, parseInt(v, 10) || 1)).optional(),
  limit: z.string().transform((v) => Math.min(100, Math.max(1, parseInt(v, 10) || 20))).optional(),
});

// ─── Briefing Schemas ─────────────────────────────────────

export const generateBriefingSchema = z.object({
  briefingType,
  metadata: z.record(z.string(), z.unknown()).default({}),
});

export const briefingListQuerySchema = z.object({
  briefingType: briefingType.optional(),
  page: z.string().transform((v) => Math.max(1, parseInt(v, 10) || 1)).optional(),
  limit: z.string().transform((v) => Math.min(100, Math.max(1, parseInt(v, 10) || 20))).optional(),
});

// ─── Dashboard Schema ─────────────────────────────────────

export const boardDashboardQuerySchema = z.object({
  boardId: z.string().optional(),
});
