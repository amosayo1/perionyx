export type SearchSourceType =
  | "TREASURY" | "PAYMENT" | "INVOICE" | "VENDOR" | "CUSTOMER"
  | "WORKFLOW" | "WORKFLOW_INSTANCE"
  | "APPROVAL" | "POLICY" | "BUSINESS_RULE"
  | "RISK" | "COMPLIANCE"
  | "REPORT" | "DASHBOARD"
  | "AUDIT_LOG" | "NOTIFICATION"
  | "AUTOMATION_STUDIO"
  | "USER" | "ORGANIZATION"
  | "CUSTOMER_DISCOVERY"
  | "KNOWLEDGE_BASE" | "DOCUMENT";

export type SearchMode =
  | "KEYWORD" | "NATURAL_LANGUAGE" | "ENTITY"
  | "RELATIONSHIP" | "GLOBAL" | "RECENT" | "SAVED" | "ADVANCED";

export type SearchFilterOperator =
  | "eq" | "neq" | "in" | "gt" | "gte" | "lt" | "lte" | "contains";

export interface SearchDocument {
  id: string;
  sourceType: SearchSourceType;
  title: string;
  description: string;
  content: string;
  entityId: string;
  entityType: string;
  companyId: string;
  tags: string[];
  metadata: Record<string, unknown>;
  requiredPermissions: string[];
  pinned: boolean;
  businessImportance: number;
  createdAt: string;
  updatedAt: string;
  score: number;
}

export interface SearchQuery {
  query: string;
  mode: SearchMode;
  filters?: SearchFilter[];
  companyId: string;
  userId: string;
  limit: number;
  offset: number;
  sortBy?: "relevance" | "date" | "title" | "source";
}

export interface SearchFilter {
  field: string;
  operator: SearchFilterOperator;
  value: unknown;
}

export interface SearchResult {
  document: SearchDocument;
  score: number;
  highlights: SearchHighlight[];
  explanation: string;
}

export interface SearchHighlight {
  field: string;
  snippet: string;
}

export interface SearchSuggestion {
  text: string;
  type: "query" | "entity" | "recent" | "saved";
  score: number;
  sourceType?: SearchSourceType;
}

export interface SearchAnalyticsEvent {
  query: string;
  resultCount: number;
  latencyMs: number;
  mode: SearchMode;
  userId: string;
  companyId: string;
  clickedResultId?: string;
  timestamp: string;
}

export interface SearchAuditEntry {
  action: "SEARCH" | "SUGGEST" | "VIEW_RESULT" | "SAVE_SEARCH" | "DELETE_SEARCH" | "REINDEX";
  query: string;
  mode: SearchMode;
  userId: string;
  companyId: string;
  resultCount: number;
  latencyMs: number;
  timestamp: string;
}

export interface SavedSearch {
  id: string;
  userId: string;
  companyId: string;
  name: string;
  query: string;
  mode: SearchMode;
  filters?: SearchFilter[];
  createdAt: string;
}

export interface RecentSearchEntry {
  userId: string;
  companyId: string;
  query: string;
  mode: SearchMode;
  resultCount: number;
  searchedAt: string;
}

export interface SearchIndexStats {
  totalDocuments: number;
  totalTokens: number;
  documentsBySource: Record<SearchSourceType, number>;
  lastIndexedAt: string | null;
}

export const SEARCH_SOURCE_LABELS: Record<SearchSourceType, string> = {
  TREASURY: "Treasury",
  PAYMENT: "Payments",
  INVOICE: "Invoices",
  VENDOR: "Vendors",
  CUSTOMER: "Customers",
  WORKFLOW: "Workflows",
  WORKFLOW_INSTANCE: "Workflow Instances",
  APPROVAL: "Approvals",
  POLICY: "Policies",
  BUSINESS_RULE: "Business Rules",
  RISK: "Risk",
  COMPLIANCE: "Compliance",
  REPORT: "Reports",
  DASHBOARD: "Dashboards",
  AUDIT_LOG: "Audit Logs",
  NOTIFICATION: "Notifications",
  AUTOMATION_STUDIO: "Automation Studio",
  USER: "Users",
  ORGANIZATION: "Organization",
  CUSTOMER_DISCOVERY: "Customer Discovery",
  KNOWLEDGE_BASE: "Knowledge Base",
  DOCUMENT: "Documents",
};

export const SEARCH_SOURCE_WEIGHTS: Record<SearchSourceType, number> = {
  TREASURY: 1.0,
  PAYMENT: 1.0,
  INVOICE: 0.9,
  VENDOR: 0.9,
  CUSTOMER: 0.9,
  WORKFLOW: 0.8,
  WORKFLOW_INSTANCE: 0.8,
  APPROVAL: 1.0,
  POLICY: 1.0,
  BUSINESS_RULE: 0.8,
  RISK: 1.0,
  COMPLIANCE: 1.0,
  REPORT: 0.7,
  DASHBOARD: 0.6,
  AUDIT_LOG: 0.5,
  NOTIFICATION: 0.4,
  AUTOMATION_STUDIO: 0.7,
  USER: 0.8,
  ORGANIZATION: 0.6,
  CUSTOMER_DISCOVERY: 0.5,
  KNOWLEDGE_BASE: 0.5,
  DOCUMENT: 0.5,
};

export const STOP_WORDS = new Set([
  "a", "an", "the", "and", "or", "but", "in", "on", "at", "to", "for",
  "of", "with", "by", "from", "as", "is", "was", "are", "were", "be",
  "been", "being", "have", "has", "had", "do", "does", "did", "will",
  "would", "could", "should", "may", "might", "shall", "can", "need",
  "all", "any", "each", "every", "no", "not", "only", "own", "same",
  "so", "than", "too", "very", "just", "because", "about", "into",
  "over", "after", "before", "between", "under", "above", "below",
  "this", "that", "these", "those", "it", "its", "you", "your",
  "show", "find", "list", "get", "all", "me", "please", "which",
]);

export const FIELD_WEIGHTS = {
  title: 3.0,
  tags: 2.5,
  description: 2.0,
  content: 1.0,
};
