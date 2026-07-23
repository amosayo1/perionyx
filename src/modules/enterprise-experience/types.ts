import type { TenantContext } from "@/server/context/tenant-context";

// ── Enums ──
export type RoleType = "cfo" | "controller" | "treasurer" | "finance-manager" | "ap" | "ar" | "auditor" | "administrator";
export type WorkspaceSlug = "treasury" | "month-end" | "reporting" | "audit" | "procurement" | "cash-management" | "financial-ops";
export type MilestoneCategory = "setup" | "integration" | "configuration" | "validation" | "go-live";
export type MilestoneStatus = "pending" | "in_progress" | "completed" | "skipped" | "blocked";
export type FeatureCategory = "onboarding" | "advanced" | "expert" | "beta";
export type GuidanceTrigger = `page:${string}` | `feature:${string}` | `action:${string}`;
export type AdoptionEventType = "page_view" | "feature_use" | "action" | "export" | "sync" | "approval";
export type AdoptionCategory = "workspace" | "feature" | "integration";
export type ResourceType = "documentation" | "tutorial" | "release_note" | "video" | "guide" | "faq";
export type TicketPriority = "low" | "normal" | "high" | "critical";
export type TicketStatus = "open" | "in_progress" | "waiting" | "resolved" | "closed";
export type FeatureRequestStatus = "submitted" | "under_review" | "planned" | "in_progress" | "shipped" | "declined";

// ── Workspace ──
export interface WorkspaceData {
  id: string; companyId: string; slug: WorkspaceSlug; name: string;
  description?: string; icon?: string; order: number; isDefault: boolean;
  isActive: boolean; config?: Record<string, unknown>;
  createdAt: string; updatedAt: string;
}

// ── Role Dashboard ──
export interface RoleDashboardConfig {
  layout: { widgets: string[]; columns: number };
  kpis: string[]; reports: string[]; quickActions: string[];
  approvals: boolean; notifications: boolean; recommendations: boolean;
}
export interface RoleDashboardData {
  id: string; companyId: string; role: RoleType;
  config: RoleDashboardConfig; isDefault: boolean;
  createdAt: string; updatedAt: string;
}

// ── Morning Briefing ──
export interface FinancialHighlight {
  label: string; value: string; change: number; direction: "up" | "down" | "flat";
}
export interface KpiSnapshot {
  label: string; value: string; target?: string; status: "on_track" | "at_risk" | "critical";
}
export interface RiskAlert {
  id: string; type: string; severity: string; message: string;
}
export interface RecommendedAction {
  id: string; label: string; description: string; url: string; priority: number;
}
export interface MorningBriefingData {
  id: string; companyId: string; date: string;
  title?: string; summary?: string;
  highlights?: FinancialHighlight[]; kpis?: KpiSnapshot[];
  pendingApprovals: number; pendingApprovalAmount?: number | null;
  cashPosition?: number | null; cashChange?: number | null;
  reconciliationStatus?: string;
  risks?: RiskAlert[]; recommendedActions?: RecommendedAction[];
  isRead: boolean; readAt?: string;
  createdAt: string;
}

// ── Implementation ──
export interface ImplementationMilestoneData {
  id: string; companyId: string; slug: string; name: string;
  description?: string; category: MilestoneCategory; order: number;
  isRequired: boolean; estimatedDays?: number; dependsOn?: string;
}
export interface ImplementationProgressData {
  id: string; companyId: string; milestoneId: string;
  status: MilestoneStatus; completedAt?: string; completedBy?: string;
  notes?: string; metadata?: Record<string, unknown>;
}
export interface ImplementationSummary {
  total: number; completed: number; inProgress: number;
  blocked: number; skipped: number; percentComplete: number;
  nextRecommended: string | null; estimatedDaysRemaining: number;
}

// ── Feature Flags ──
export interface FeatureFlagData {
  id: string; companyId: string; slug: string; name: string;
  description?: string; category: FeatureCategory;
  requiredRole?: string; dependsOn?: string;
  isEnabled: boolean; isBeta: boolean; metadata?: Record<string, unknown>;
}

// ── Product Guidance ──
export interface GuidanceStepData {
  id: string; guidanceId: string; order: number;
  title: string; content: string; targetElement?: string;
  placement: string; mediaUrl?: string;
  actionLabel?: string; actionUrl?: string;
}
export interface ProductGuidanceData {
  id: string; companyId: string; slug: string; title: string;
  description?: string; triggerOn?: string; targetRole?: string;
  priority: number; isActive: boolean;
  steps: GuidanceStepData[];
}
export interface UserGuidanceProgressData {
  id: string; userId: string; guidanceId: string;
  stepIndex: number; isCompleted: boolean;
  completedAt?: string; dismissedAt?: string;
}

// ── Adoption ──
export interface AdoptionEventData {
  id: string; companyId: string; userId: string;
  eventType: AdoptionEventType; category: AdoptionCategory;
  key: string; label?: string; metadata?: Record<string, unknown>;
  durationMs?: number; createdAt: string;
}
export interface AdoptionScoreData {
  id: string; companyId: string;
  periodStart: string; periodEnd: string;
  overallScore: number;
  userAdoption?: Record<string, number>;
  featureUsage?: Record<string, number>;
  workspaceEngagement?: Record<string, number>;
  activeUsers: number; totalUsers: number;
  unusedFeatures?: string[];
  recommendations?: string[];
}
export interface UserAdoptionData {
  userId: string; userName: string; email: string;
  lastActive: string; totalEvents: number; workspacesUsed: string[];
  featuresUsed: string[]; score: number;
}

// ── Customer Success ──
export interface CustomerSuccessResourceData {
  id: string; companyId: string; type: ResourceType;
  title: string; description?: string; url?: string;
  content?: string; tags?: string[]; roleTarget?: string;
  isPublished: boolean; order: number;
}
export interface FeatureRequestData {
  id: string; companyId: string; userId: string;
  title: string; description?: string; category?: string;
  status: FeatureRequestStatus; votes: number;
  isPublic: boolean; adminNotes?: string;
  createdAt: string; updatedAt: string;
}
export interface SupportTicketData {
  id: string; companyId: string; userId: string;
  subject: string; description?: string; category?: string;
  priority: TicketPriority; status: TicketStatus;
  assignedTo?: string; resolution?: string;
  createdAt: string; updatedAt: string;
}
