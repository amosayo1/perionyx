export type OptimizationCategory =
  | "workflow"
  | "treasury"
  | "cash_flow"
  | "approvals"
  | "reporting"
  | "compliance"
  | "risk"
  | "automation"
  | "permissions"
  | "dashboards"
  | "notifications"
  | "business_rules"
  | "resource_usage"
  | "system_performance";

export type OptimizationPriority = "critical" | "high" | "medium" | "low" | "opportunity";

export type RecommendationLifecycle =
  | "detected"
  | "reviewed"
  | "accepted"
  | "rejected"
  | "implemented"
  | "measured"
  | "archived";

export type OptimizationSource =
  | "workflow_analyzer"
  | "treasury_analyzer"
  | "reporting_analyzer"
  | "approval_analyzer"
  | "policy_analyzer"
  | "efficiency_analyzer"
  | "system_analyzer"
  | "manual";

export interface OptimizationEvidence {
  id: string;
  type: string;
  source: OptimizationSource;
  description: string;
  value: number | string | boolean;
  metric: string;
  module: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface OptimizationRecommendation {
  id: string;
  title: string;
  description: string;
  businessProblem: string;
  businessImpact: string;
  category: OptimizationCategory;
  priority: OptimizationPriority;
  confidenceScore: number;
  estimatedHoursSaved: number;
  estimatedRiskReduction: number;
  estimatedCostReduction: number;
  estimatedProductivityGain: number;
  approvalTimeReduction: number;
  monthEndTimeReduction: number;
  complianceImprovement: number;
  treasuryVisibilityImprovement: number;
  forecastAccuracyImprovement: number;
  operationalComplexityReduction: number;
  evidence: OptimizationEvidence[];
  affectedModules: string[];
  relatedUsers: string[];
  supportingAnalytics: Record<string, unknown>;
  suggestedActions: string[];
  lifecycle: RecommendationLifecycle;
  source: OptimizationSource;
  createdAt: string;
  updatedAt: string;
  reviewedBy?: string;
  implementedBy?: string;
  measuredAt?: string;
  measuredResult?: string;
  companyId: string;
  tenantId: string;
  metadata?: Record<string, unknown>;
}

export interface OptimizationSummary {
  total: number;
  byPriority: Record<OptimizationPriority, number>;
  byCategory: Record<OptimizationCategory, number>;
  byLifecycle: Record<RecommendationLifecycle, number>;
  totalEstimatedHoursSaved: number;
  totalEstimatedCostReduction: number;
  totalEstimatedRiskReduction: number;
  topOpportunities: OptimizationRecommendation[];
  quickWins: OptimizationRecommendation[];
  largestBottlenecks: OptimizationRecommendation[];
  highestRisks: OptimizationRecommendation[];
  longTermImprovements: OptimizationRecommendation[];
  potentialROI: number;
  generatedAt: string;
}

export interface AnalyzerResult {
  source: OptimizationSource;
  category: OptimizationCategory;
  recommendations: OptimizationRecommendation[];
  evidence: OptimizationEvidence[];
}

export interface OptimizationConfig {
  enabled: boolean;
  runIntervalMs: number;
  maxRecommendationsPerRun: number;
  analyzers: {
    workflow: boolean;
    treasury: boolean;
    reporting: boolean;
    approval: boolean;
    policy: boolean;
    efficiency: boolean;
    system: boolean;
  };
  minimumConfidenceScore: number;
}

export const DEFAULT_OPTIMIZATION_CONFIG: OptimizationConfig = {
  enabled: true,
  runIntervalMs: 3_600_000,
  maxRecommendationsPerRun: 20,
  analyzers: {
    workflow: true,
    treasury: true,
    reporting: true,
    approval: true,
    policy: true,
    efficiency: true,
    system: true,
  },
  minimumConfidenceScore: 0.3,
};

export const OPTIMIZATION_CATEGORY_LABELS: Record<OptimizationCategory, string> = {
  workflow: "Workflow Efficiency",
  treasury: "Treasury Operations",
  cash_flow: "Cash Flow Management",
  approvals: "Approval Processes",
  reporting: "Reporting & Analytics",
  compliance: "Compliance & Governance",
  risk: "Risk Management",
  automation: "Automation Opportunities",
  permissions: "Permissions & Access Control",
  dashboards: "Dashboard Usage",
  notifications: "Notification Strategy",
  business_rules: "Business Rules",
  resource_usage: "Resource Utilization",
  system_performance: "System Performance",
};
