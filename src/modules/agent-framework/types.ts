export type AgentRole =
  | "cfo_advisor"
  | "treasury_specialist"
  | "controller"
  | "audit"
  | "compliance"
  | "fp_and_a"
  | "custom";

export type AgentStatus = "DRAFT" | "ACTIVE" | "PAUSED" | "DISABLED" | "ERROR";

export type CapabilityType =
  | "analysis"
  | "recommendation"
  | "execution"
  | "monitoring"
  | "reporting"
  | "investigation";

export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type TaskType =
  | "analysis"
  | "recommendation"
  | "execution"
  | "monitoring"
  | "reporting"
  | "investigation"
  | "collaboration";

export type TaskStatus =
  | "PENDING"
  | "RUNNING"
  | "COMPLETED"
  | "FAILED"
  | "CANCELLED"
  | "AWAITING_APPROVAL";

export type DecisionStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "EXECUTED"
  | "EXPIRED"
  | "CANCELLED";

export type MemoryType =
  | "short_term"
  | "long_term"
  | "user_preference"
  | "conversation"
  | "recommendation";

export type EvidenceSourceType =
  | "ledger"
  | "treasury"
  | "report"
  | "document"
  | "policy"
  | "audit"
  | "integration"
  | "intelligence";

export type DelegationType =
  | "full_delegation"
  | "partial_delegation"
  | "consultation"
  | "escalation";

export type DelegationStatus =
  | "PENDING"
  | "ACCEPTED"
  | "REJECTED"
  | "COMPLETED"
  | "EXPIRED";

export type ConversationRole = "agent" | "user" | "system";

export type ConversationContentType =
  | "text"
  | "evidence"
  | "decision"
  | "question"
  | "clarification";

export type HealthStatus = "HEALTHY" | "DEGRADED" | "UNHEALTHY" | "UNKNOWN";

export type PermissionEffect = "ALLOW" | "DENY";

export type SessionStatus =
  | "ACTIVE"
  | "PAUSED"
  | "COMPLETED"
  | "FAILED"
  | "TERMINATED";

export type ExecutionStatus =
  | "RUNNING"
  | "COMPLETED"
  | "FAILED"
  | "TIMEOUT"
  | "CANCELLED";

export type HealthCheckType =
  | "heartbeat"
  | "capability_test"
  | "resource_usage"
  | "error_rate"
  | "latency";

export type AuditAction =
  | "agent.registered"
  | "agent.started"
  | "agent.stopped"
  | "task.created"
  | "task.completed"
  | "decision.made"
  | "decision.approved"
  | "decision.rejected"
  | "evidence.collected"
  | "delegation.created"
  | "permission.granted"
  | "permission.revoked"
  | "memory.stored"
  | "memory.accessed"
  | "health.checked";

// ── Domain Interfaces ──────────────────────────────────────────────────

export interface AgentDefinition {
  id: string;
  companyId: string;
  name: string;
  description: string;
  role: AgentRole;
  version: string;
  owner: string | null;
  enabled: boolean;
  status: AgentStatus;
  config: Record<string, unknown>;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface AgentCapability {
  id: string;
  companyId: string;
  agentId: string;
  name: string;
  description: string;
  capabilityType: CapabilityType;
  inputSchema: Record<string, unknown>;
  outputSchema: Record<string, unknown>;
  requiredPermissions: string[];
  requiredEvidence: string[];
  confidence: number;
  riskLevel: RiskLevel;
  requiresApproval: boolean;
  enabled: boolean;
  config: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface AgentSession {
  id: string;
  companyId: string;
  agentId: string;
  userId: string | null;
  status: SessionStatus;
  context: Record<string, unknown>;
  config: Record<string, unknown>;
  startedAt: string;
  endedAt: string | null;
  duration: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface AgentTask {
  id: string;
  companyId: string;
  agentId: string;
  sessionId: string | null;
  capabilityId: string | null;
  name: string;
  description: string;
  taskType: TaskType;
  priority: number;
  status: TaskStatus;
  input: Record<string, unknown>;
  output: Record<string, unknown> | null;
  error: Record<string, unknown> | null;
  startedAt: string | null;
  completedAt: string | null;
  duration: number | null;
  retryCount: number;
  maxRetries: number;
  config: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface AgentExecution {
  id: string;
  companyId: string;
  taskId: string;
  agentId: string;
  capabilityId: string | null;
  status: ExecutionStatus;
  input: Record<string, unknown>;
  output: Record<string, unknown> | null;
  error: Record<string, unknown> | null;
  metrics: Record<string, unknown>;
  startedAt: string;
  completedAt: string | null;
  duration: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface AgentDecision {
  id: string;
  companyId: string;
  agentId: string;
  sessionId: string | null;
  taskId: string | null;
  title: string;
  recommendation: string;
  reason: string;
  confidence: number;
  impact: RiskLevel;
  risk: RiskLevel;
  alternatives: unknown[];
  requiredApprovals: string[];
  status: DecisionStatus;
  approvedBy: string | null;
  approvedAt: string | null;
  executedAt: string | null;
  evidence: unknown[];
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface AgentEvidence {
  id: string;
  companyId: string;
  executionId: string;
  sourceType: EvidenceSourceType;
  sourceId: string | null;
  sourceSystem: string;
  sourceModule: string | null;
  sourceRecordId: string | null;
  description: string;
  data: Record<string, unknown>;
  confidence: number;
  relevance: number;
  verified: boolean;
  verifiedAt: string | null;
  createdAt: string;
}

export interface AgentMemory {
  id: string;
  companyId: string;
  agentId: string;
  userId: string | null;
  memoryType: MemoryType;
  category: string;
  key: string;
  value: unknown;
  importance: number;
  accessCount: number;
  lastAccessedAt: string | null;
  expiresAt: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface AgentHealth {
  id: string;
  companyId: string;
  agentId: string;
  status: HealthStatus;
  checkType: HealthCheckType;
  message: string;
  metrics: Record<string, unknown>;
  checkedAt: string;
  createdAt: string;
}

export interface AgentPermission {
  id: string;
  companyId: string;
  agentId: string;
  permission: string;
  effect: PermissionEffect;
  conditions: Record<string, unknown>;
  reason: string;
  grantedBy: string | null;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AgentConfiguration {
  id: string;
  companyId: string;
  agentId: string;
  maxConcurrentTasks: number;
  taskTimeout: number;
  maxRetries: number;
  rateLimitPerMinute: number;
  allowedActions: string[];
  forbiddenActions: string[];
  escalationRules: Record<string, unknown>;
  safetyPolicies: Record<string, unknown>;
  notificationPrefs: Record<string, unknown>;
  config: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface AgentConversation {
  id: string;
  companyId: string;
  sessionId: string;
  agentId: string;
  decisionId: string | null;
  role: ConversationRole;
  content: string;
  contentType: ConversationContentType;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface AgentDelegation {
  id: string;
  companyId: string;
  fromAgentId: string;
  toAgentId: string;
  taskId: string | null;
  delegationType: DelegationType;
  reason: string;
  status: DelegationStatus;
  context: Record<string, unknown>;
  result: unknown | null;
  traceId: string | null;
  startedAt: string;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AgentAuditEntry {
  id: string;
  companyId: string;
  agentId: string;
  sessionId: string | null;
  action: AuditAction;
  resourceType: string;
  resourceId: string | null;
  actorUserId: string | null;
  actorAgentId: string | null;
  before: unknown | null;
  after: unknown | null;
  metadata: Record<string, unknown>;
  ipAddress: string | null;
  correlationId: string | null;
  createdAt: string;
}

// ── Input Types ────────────────────────────────────────────────────────

export interface CreateAgentDefinitionInput {
  name: string;
  description?: string;
  role: AgentRole;
  version?: string;
  owner?: string;
  enabled?: boolean;
  config?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export interface UpdateAgentDefinitionInput {
  name?: string;
  description?: string;
  role?: AgentRole;
  version?: string;
  owner?: string;
  config?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export interface CreateAgentCapabilityInput {
  name: string;
  description?: string;
  capabilityType: CapabilityType;
  inputSchema?: Record<string, unknown>;
  outputSchema?: Record<string, unknown>;
  requiredPermissions?: string[];
  requiredEvidence?: string[];
  confidence?: number;
  riskLevel?: RiskLevel;
  requiresApproval?: boolean;
  enabled?: boolean;
  config?: Record<string, unknown>;
}

export interface CreateAgentTaskInput {
  sessionId?: string;
  capabilityId?: string;
  name: string;
  description?: string;
  taskType: TaskType;
  priority?: number;
  input?: Record<string, unknown>;
  maxRetries?: number;
  config?: Record<string, unknown>;
}

export interface CreateAgentDecisionInput {
  sessionId?: string;
  taskId?: string;
  title: string;
  recommendation: string;
  reason?: string;
  confidence?: number;
  impact?: RiskLevel;
  risk?: RiskLevel;
  alternatives?: unknown[];
  requiredApprovals?: string[];
  evidence?: unknown[];
  metadata?: Record<string, unknown>;
}

export interface CreateAgentEvidenceInput {
  executionId: string;
  sourceType: EvidenceSourceType;
  sourceId?: string;
  sourceSystem: string;
  sourceModule?: string;
  sourceRecordId?: string;
  description?: string;
  data?: Record<string, unknown>;
  confidence?: number;
  relevance?: number;
}

export interface CreateAgentMemoryInput {
  userId?: string;
  memoryType: MemoryType;
  category?: string;
  key: string;
  value: unknown;
  importance?: number;
  expiresAt?: string;
  metadata?: Record<string, unknown>;
}

export interface CreateAgentConversationInput {
  sessionId: string;
  decisionId?: string;
  role: ConversationRole;
  content: string;
  contentType?: ConversationContentType;
  metadata?: Record<string, unknown>;
}

export interface CreateAgentDelegationInput {
  toAgentId: string;
  taskId?: string;
  delegationType: DelegationType;
  reason?: string;
  context?: Record<string, unknown>;
  traceId?: string;
}

// ── Query / Filter Types ──────────────────────────────────────────────

export interface AgentListQuery {
  status?: AgentStatus;
  role?: AgentRole;
  enabled?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export interface AgentTaskListQuery {
  agentId?: string;
  status?: TaskStatus;
  taskType?: TaskType;
  sessionId?: string;
  page?: number;
  limit?: number;
}

export interface AgentDecisionListQuery {
  agentId?: string;
  status?: DecisionStatus;
  impact?: RiskLevel;
  risk?: RiskLevel;
  page?: number;
  limit?: number;
}

export interface AgentMemoryListQuery {
  agentId?: string;
  memoryType?: MemoryType;
  userId?: string;
  category?: string;
  page?: number;
  limit?: number;
}

// ── Response Types ─────────────────────────────────────────────────────

export interface AgentDefinitionWithRelations extends AgentDefinition {
  capabilities: AgentCapability[];
  configuration: AgentConfiguration | null;
  healthChecks: AgentHealth[];
}

export interface AgentTaskWithRelations extends AgentTask {
  session: AgentSession | null;
  capability: AgentCapability | null;
  execution: AgentExecution | null;
}

export interface AgentDecisionWithRelations extends AgentDecision {
  agent: Pick<AgentDefinition, "id" | "name" | "role" | "status">;
  evidence: AgentEvidence[];
}

export interface AgentSessionWithRelations extends AgentSession {
  agent: Pick<AgentDefinition, "id" | "name" | "role" | "status">;
  tasks: AgentTask[];
  conversations: AgentConversation[];
}

export interface AgentDashboardStats {
  totalAgents: number;
  activeAgents: number;
  tasksPending: number;
  tasksRunning: number;
  tasksCompleted: number;
  tasksFailed: number;
  decisionsPending: number;
  healthSummary: {
    healthy: number;
    degraded: number;
    unhealthy: number;
    unknown: number;
  };
}
