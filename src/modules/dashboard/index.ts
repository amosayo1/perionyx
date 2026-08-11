export { dashboardService } from "./dashboard-service";
export {
  DashboardV2CompositionService,
  personaFromRole,
  rankAttention,
  pctDelta,
} from "./composition.service";
export type {
  DashboardDataV2,
  DashboardKpi,
  AttentionItem,
  ActivityTimelineItem,
  PersonaId,
  DataMode,
  IDashboardService,
} from "./types";
export type { WorkQueueItem } from "@/modules/work-queue/types";
export type { TodaysWorkResult } from "@/modules/todays-work/types";
export type { Decision } from "@/modules/decision-intelligence/types";
