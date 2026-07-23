// ─────────────────────────────────────────────────────────────
// Enterprise Board Governance — Facade
// ─────────────────────────────────────────────────────────────

import type { TenantContext } from "@/server/context/tenant-context";
import { BoardGovernanceService } from "./board-governance";
import { CommitteeService } from "./committee-service";
import { MeetingManagementService } from "./meeting-management";
import { ResolutionService } from "./resolution-service";
import { BoardPackService } from "./board-pack-service";
import { ActionTrackingService } from "./action-tracking";
import { GovernanceAnalyticsService } from "./governance-analytics";
import { ExecutiveBriefingService } from "./executive-briefing";
import type {
  CreateBoardInput,
  UpdateBoardInput,
  CreateMemberInput,
  CreateCommitteeInput,
  AddCommitteeMemberInput,
  CreateMeetingInput,
  AddAgendaItemInput,
  CreateResolutionInput,
  CastVoteInput,
  CreateBoardPackInput,
  CreateActionInput,
  UpdateActionInput,
  GenerateBriefingInput,
  BoardListQuery,
  MeetingListQuery,
  ResolutionListQuery,
  ActionListQuery,
  BriefingListQuery,
} from "./types";

export class BoardGovernanceFacade {
  // ─── Board ─────────────────────────────────────────────
  static async listBoards(ctx: TenantContext, query: BoardListQuery) {
    return BoardGovernanceService.listBoards(ctx, query);
  }
  static async getBoard(ctx: TenantContext, id: string) {
    return BoardGovernanceService.getBoard(ctx, id);
  }
  static async createBoard(ctx: TenantContext, input: CreateBoardInput) {
    return BoardGovernanceService.createBoard(ctx, input);
  }
  static async updateBoard(ctx: TenantContext, id: string, input: UpdateBoardInput) {
    return BoardGovernanceService.updateBoard(ctx, id, input);
  }
  static async deleteBoard(ctx: TenantContext, id: string) {
    return BoardGovernanceService.deleteBoard(ctx, id);
  }

  // ─── Members ───────────────────────────────────────────
  static async listMembers(ctx: TenantContext, boardId: string, query: { status?: string; search?: string; page?: number; limit?: number }) {
    return BoardGovernanceService.listMembers(ctx, boardId, query);
  }
  static async getMember(ctx: TenantContext, id: string) {
    return BoardGovernanceService.getMember(ctx, id);
  }
  static async addMember(ctx: TenantContext, input: CreateMemberInput) {
    return BoardGovernanceService.addMember(ctx, input);
  }
  static async updateMemberStatus(ctx: TenantContext, id: string, status: string) {
    return BoardGovernanceService.updateMemberStatus(ctx, id, status);
  }

  // ─── Committees ────────────────────────────────────────
  static async listCommittees(ctx: TenantContext, query: { boardId?: string; committeeType?: string; status?: string; search?: string; page?: number; limit?: number }) {
    return CommitteeService.listCommittees(ctx, query);
  }
  static async getCommittee(ctx: TenantContext, id: string) {
    return CommitteeService.getCommittee(ctx, id);
  }
  static async createCommittee(ctx: TenantContext, input: CreateCommitteeInput) {
    return CommitteeService.createCommittee(ctx, input);
  }
  static async addCommitteeMember(ctx: TenantContext, input: AddCommitteeMemberInput) {
    return CommitteeService.addMember(ctx, input);
  }
  static async removeCommitteeMember(ctx: TenantContext, id: string) {
    return CommitteeService.removeMember(ctx, id);
  }
  static async listCommitteeMembers(ctx: TenantContext, committeeId: string) {
    return CommitteeService.listMembers(ctx, committeeId);
  }

  // ─── Meetings ──────────────────────────────────────────
  static async listMeetings(ctx: TenantContext, query: MeetingListQuery) {
    return MeetingManagementService.listMeetings(ctx, query);
  }
  static async getMeeting(ctx: TenantContext, id: string) {
    return MeetingManagementService.getMeeting(ctx, id);
  }
  static async createMeeting(ctx: TenantContext, input: CreateMeetingInput) {
    return MeetingManagementService.createMeeting(ctx, input);
  }
  static async updateMeetingStatus(ctx: TenantContext, meetingId: string, input: { status: string; quorumMet?: boolean; attendees?: unknown[] }) {
    return MeetingManagementService.updateStatus(ctx, meetingId, input as any);
  }
  static async listAgendaItems(ctx: TenantContext, meetingId: string) {
    return MeetingManagementService.listAgendaItems(ctx, meetingId);
  }
  static async addAgendaItem(ctx: TenantContext, input: AddAgendaItemInput) {
    return MeetingManagementService.addAgendaItem(ctx, input);
  }
  static async getMinutes(ctx: TenantContext, meetingId: string) {
    return MeetingManagementService.getMinutes(ctx, meetingId);
  }
  static async submitMinutes(ctx: TenantContext, meetingId: string, content: Record<string, unknown>) {
    return MeetingManagementService.submitMinutes(ctx, meetingId, { content });
  }
  static async approveMinutes(ctx: TenantContext, meetingId: string) {
    return MeetingManagementService.approveMinutes(ctx, meetingId);
  }

  // ─── Resolutions ───────────────────────────────────────
  static async listResolutions(ctx: TenantContext, query: ResolutionListQuery) {
    return ResolutionService.listResolutions(ctx, query);
  }
  static async getResolution(ctx: TenantContext, id: string) {
    return ResolutionService.getResolution(ctx, id);
  }
  static async createResolution(ctx: TenantContext, input: CreateResolutionInput) {
    return ResolutionService.createResolution(ctx, input);
  }
  static async castVote(ctx: TenantContext, input: CastVoteInput) {
    return ResolutionService.castVote(ctx, input);
  }
  static async closeVoting(ctx: TenantContext, resolutionId: string) {
    return ResolutionService.closeVoting(ctx, resolutionId);
  }
  static async listVotes(ctx: TenantContext, resolutionId: string) {
    return ResolutionService.listVotes(ctx, resolutionId);
  }

  // ─── Board Packs ───────────────────────────────────────
  static async listPacks(ctx: TenantContext, query: { boardId?: string; status?: string; page?: number; limit?: number }) {
    return BoardPackService.listPacks(ctx, query);
  }
  static async getPack(ctx: TenantContext, id: string) {
    return BoardPackService.getPack(ctx, id);
  }
  static async createPack(ctx: TenantContext, input: CreateBoardPackInput) {
    return BoardPackService.createPack(ctx, input);
  }
  static async approvePack(ctx: TenantContext, packId: string) {
    return BoardPackService.approvePack(ctx, packId);
  }
  static async distributePack(ctx: TenantContext, packId: string) {
    return BoardPackService.distributePack(ctx, packId);
  }

  // ─── Action Tracking ───────────────────────────────────
  static async listActions(ctx: TenantContext, query: ActionListQuery) {
    return ActionTrackingService.listActions(ctx, query);
  }
  static async getAction(ctx: TenantContext, id: string) {
    return ActionTrackingService.getAction(ctx, id);
  }
  static async createAction(ctx: TenantContext, input: CreateActionInput) {
    return ActionTrackingService.createAction(ctx, input);
  }
  static async updateAction(ctx: TenantContext, id: string, input: UpdateActionInput) {
    return ActionTrackingService.updateAction(ctx, id, input);
  }
  static async getOverdueActions(ctx: TenantContext) {
    return ActionTrackingService.getOverdueActions(ctx);
  }

  // ─── Analytics ─────────────────────────────────────────
  static async getDashboard(ctx: TenantContext, boardId?: string) {
    return GovernanceAnalyticsService.getDashboard(ctx, boardId);
  }
  static async getHealthScore(ctx: TenantContext) {
    return GovernanceAnalyticsService.getHealthScore(ctx);
  }
  static async getMeetingEffectiveness(ctx: TenantContext) {
    const health = await GovernanceAnalyticsService.getHealthScore(ctx);
    return health.meetingEffectiveness;
  }

  // ─── Briefings ─────────────────────────────────────────
  static async listBriefings(ctx: TenantContext, query: BriefingListQuery) {
    return ExecutiveBriefingService.listBriefings(ctx, query);
  }
  static async getBriefing(ctx: TenantContext, id: string) {
    return ExecutiveBriefingService.getBriefing(ctx, id);
  }
  static async generateBriefing(ctx: TenantContext, input: GenerateBriefingInput) {
    return ExecutiveBriefingService.generateBriefing(ctx, input);
  }
}
