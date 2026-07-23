export type AssistantMode = "conversation" | "query" | "analyze" | "recommend";
export type AssistantCapability = "summarize" | "explain" | "recommend" | "compare" | "prioritize" | "navigate" | "analyze" | "trace" | "generate" | "surface";
export type CitationSource = "module" | "business_object" | "workflow" | "policy" | "report" | "audit_event" | "prediction" | "business_graph" | "search";
export type SuggestedActionPriority = "high" | "medium" | "low";

export interface UserContext {
  userId: string;
  userName: string;
  email: string;
  roles: string[];
  permissions: Set<string>;
  companyId: string;
  companyName: string;
}

export interface PageContext {
  currentPage: string;
  currentModule: string;
  selectedEntityType?: string;
  selectedEntityId?: string;
}

export interface RecentAction {
  action: string;
  entityType?: string;
  entityId?: string;
  timestamp: string;
  description: string;
}

export interface TimeContext {
  now: string;
  todayStart: string;
  thisWeekStart: string;
  thisMonthStart: string;
  thisQuarterStart: string;
  thisYearStart: string;
}

export interface EntityRef {
  type: string;
  id: string;
  label: string;
  module: string;
}

export interface Citation {
  id: string;
  source: CitationSource;
  module: string;
  entityType?: string;
  entityId?: string;
  snippet: string;
  relevance: number;
}

export interface SuggestedAction {
  id: string;
  label: string;
  action: string;
  entityType?: string;
  entityId?: string;
  url?: string;
  priority: SuggestedActionPriority;
}

export interface AssistantRequest {
  message: string;
  conversationId: string;
  context: {
    userId: string;
    companyId: string;
    currentPage: string;
    selectedEntityType?: string;
    selectedEntityId?: string;
    recentActions?: RecentAction[];
  };
  mode: AssistantMode;
}

export interface AssistantResponse {
  reply: string;
  citations: Citation[];
  suggestedActions: SuggestedAction[];
  context: {
    modulesUsed: string[];
    entitiesReferenced: EntityRef[];
    dataFreshness: string;
  };
  conversationId: string;
  generatedAt: string;
}

export interface AIProviderRequest {
  messages: { role: "system" | "user" | "assistant"; content: string }[];
  temperature?: number;
  maxTokens?: number;
}

export interface AIProviderResponse {
  content: string;
  model: string;
  usage?: { promptTokens: number; completionTokens: number };
}

export interface AIProvider {
  generate(request: AIProviderRequest): Promise<AIProviderResponse>;
  generateStreaming(request: AIProviderRequest): AsyncIterable<AIProviderResponse>;
  isAvailable(): boolean;
  getModelName(): string;
}

export interface ConversationEntry {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
  citations?: Citation[];
  actions?: SuggestedAction[];
}

export interface ConversationSession {
  id: string;
  userId: string;
  companyId: string;
  entries: ConversationEntry[];
  currentPage?: string;
  currentEntityType?: string;
  currentEntityId?: string;
  recentEntityIds: string[];
  startedAt: string;
  lastActivityAt: string;
  metadata: Record<string, unknown>;
}

export interface AIAuditEntry {
  action: "GENERATE" | "STREAM" | "REJECT" | "ERROR";
  conversationId: string;
  userId: string;
  companyId: string;
  message: string;
  responseLength: number;
  citationCount: number;
  actionCount: number;
  latencyMs: number;
  model: string;
  permissionCheck: "PASS" | "BLOCK" | "PARTIAL";
  timestamp: string;
}

export const ROLE_SYSTEM_PROMPTS: Record<string, string> = {
  CFO: "You are a trusted financial advisor to the CFO. Prioritize liquidity, cash flow, risk management, and strategic financial oversight. Answers must be concise, data-driven, and focused on financial health.",
  Treasurer: "You are a treasury advisor. Focus on cash position, liquidity, bank relationships, FX risk, and payment operations. Answers should include specific balances, limits, and statuses.",
  Controller: "You are a controllership advisor. Focus on reconciliations, month-end close, audit readiness, compliance, and financial controls. Answers must emphasize accuracy and completeness.",
  FinanceManager: "You are a finance operations advisor. Focus on workflows, approvals, team productivity, and operational efficiency. Answers should be practical and action-oriented.",
  Auditor: "You are an audit advisor. Focus on audit trails, policy compliance, exception tracking, and tamper-evident records. Answers must cite specific audit events and timestamps.",
  Administrator: "You are a system operations advisor. Focus on configuration, user management, permissions, and system health. Answers should be technical and configuration-aware.",
  Operations: "You are an operations advisor. Focus on workflow efficiency, automation opportunities, and process optimization. Answers should identify bottlenecks and suggest improvements.",
};

export const MODULE_LABELS: Record<string, string> = {
  treasury: "Treasury",
  payments: "Payments",
  approvals: "Approvals",
  workflows: "Workflows",
  policies: "Policies",
  risk: "Risk Management",
  compliance: "Compliance",
  audit: "Audit",
  reports: "Reports",
  analytics: "Analytics",
  search: "Enterprise Search",
  business_graph: "Business Graph",
  predictions: "Predictive Intelligence",
  briefings: "Executive Briefings",
  automation: "Automation Studio",
  notifications: "Notifications",
  users: "User Directory",
  organization: "Organization",
};
