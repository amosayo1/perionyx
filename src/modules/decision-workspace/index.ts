/**
 * Phase 22.3 — Decision Workspace module
 *
 * The canonical Perionyx financial decision surface. Server-side composition
 * (DecisionWorkspaceService) projects canonical AP repository data into an
 * evidence-first, auditable workspace. Client components must import types
 * only — the service is server-only.
 */

export { DecisionWorkspaceService, decisionWorkspaceService } from "./workspace-service";
export { buildEvidencePackage } from "./evidence";
export { deriveRecommendation, bandFromScore } from "./recommendation";
export { formatCurrency, formatDate, formatDateTime, formatNumber, formatCompact, formatPercent, formatBytes, ageDays } from "./format";

export type {
  EvidenceItem,
  EvidenceGroup,
  EvidenceStatus,
  EvidenceConfidence,
  Recommendation,
  RecommendationCategory,
  RiskFactor,
  DecisionSummary,
  TimelineEntry,
  TimelineAction,
  AvailableAction,
  ActionContext,
  DecisionWorkspaceData,
  WorkspaceEvidenceInput,
} from "./types";
