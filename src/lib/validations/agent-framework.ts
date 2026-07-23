import { z } from "zod";

const agentRole = z.enum([
  "cfo_advisor",
  "treasury_specialist",
  "controller",
  "audit",
  "compliance",
  "fp_and_a",
  "custom",
]);

const agentStatus = z.enum(["DRAFT", "ACTIVE", "PAUSED", "DISABLED", "ERROR"]);

const capabilityType = z.enum([
  "analysis",
  "recommendation",
  "execution",
  "monitoring",
  "reporting",
  "investigation",
]);

const riskLevel = z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]);

const taskType = z.enum([
  "analysis",
  "recommendation",
  "execution",
  "monitoring",
  "reporting",
  "investigation",
  "collaboration",
]);

const taskStatus = z.enum([
  "PENDING",
  "RUNNING",
  "COMPLETED",
  "FAILED",
  "CANCELLED",
  "AWAITING_APPROVAL",
]);

const decisionStatus = z.enum([
  "PENDING",
  "APPROVED",
  "REJECTED",
  "EXECUTED",
  "EXPIRED",
  "CANCELLED",
]);

const memoryType = z.enum([
  "short_term",
  "long_term",
  "user_preference",
  "conversation",
  "recommendation",
]);

const evidenceSourceType = z.enum([
  "ledger",
  "treasury",
  "report",
  "document",
  "policy",
  "audit",
  "integration",
  "intelligence",
]);

const delegationType = z.enum([
  "full_delegation",
  "partial_delegation",
  "consultation",
  "escalation",
]);

const conversationRole = z.enum(["agent", "user", "system"]);

const conversationContentType = z.enum([
  "text",
  "evidence",
  "decision",
  "question",
  "clarification",
]);

export const createAgentDefinitionSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  description: z.string().max(1000).default(""),
  role: agentRole,
  version: z.string().max(50).default("1.0.0"),
  owner: z.string().optional(),
  enabled: z.boolean().default(true),
  config: z.record(z.string(), z.unknown()).default({}),
  metadata: z.record(z.string(), z.unknown()).default({}),
  capabilities: z
    .array(
      z.object({
        name: z.string().min(1, "Capability name is required").max(200),
        description: z.string().max(1000).default(""),
        capabilityType,
        inputSchema: z.record(z.string(), z.unknown()).default({}),
        outputSchema: z.record(z.string(), z.unknown()).default({}),
        requiredPermissions: z.array(z.string()).default([]),
        requiredEvidence: z.array(z.string()).default([]),
        confidence: z.number().min(0).max(1).default(0.8),
        riskLevel: riskLevel.default("MEDIUM"),
        requiresApproval: z.boolean().default(false),
        enabled: z.boolean().default(true),
        config: z.record(z.string(), z.unknown()).default({}),
      }),
    )
    .default([]),
});

export const updateAgentDefinitionSchema = createAgentDefinitionSchema
  .partial()
  .extend({
    id: z.string().min(1, "ID is required"),
    name: z.string().min(1).max(200).optional(),
    role: agentRole.optional(),
  });

export const createAgentCapabilitySchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  description: z.string().max(1000).default(""),
  capabilityType,
  inputSchema: z.record(z.string(), z.unknown()).default({}),
  outputSchema: z.record(z.string(), z.unknown()).default({}),
  requiredPermissions: z.array(z.string()).default([]),
  requiredEvidence: z.array(z.string()).default([]),
  confidence: z.number().min(0).max(1).default(0.8),
  riskLevel: riskLevel.default("MEDIUM"),
  requiresApproval: z.boolean().default(false),
});

export const createAgentTaskSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  description: z.string().max(1000).default(""),
  taskType,
  priority: z.number().int().min(0).max(100).default(50),
  input: z.record(z.string(), z.unknown()).default({}),
  maxRetries: z.number().int().min(0).max(10).default(3),
  config: z.record(z.string(), z.unknown()).default({}),
});

export const createAgentDecisionSchema = z.object({
  title: z.string().min(1, "Title is required").max(500),
  recommendation: z.string().min(1, "Recommendation is required").max(2000),
  reason: z.string().max(2000).default(""),
  confidence: z.number().min(0).max(1).default(0.5),
  impact: riskLevel.default("LOW"),
  risk: riskLevel.default("LOW"),
  alternatives: z.array(z.unknown()).default([]),
  requiredApprovals: z.array(z.string()).default([]),
  evidence: z.array(z.unknown()).default([]),
  metadata: z.record(z.string(), z.unknown()).default({}),
});

export const createAgentEvidenceSchema = z.object({
  sourceType: evidenceSourceType,
  sourceId: z.string().optional(),
  sourceSystem: z.string().min(1, "Source system is required").max(200),
  description: z.string().max(1000).default(""),
  data: z.record(z.string(), z.unknown()).default({}),
  confidence: z.number().min(0).max(1).default(0.5),
  relevance: z.number().min(0).max(1).default(0.5),
});

export const createAgentMemorySchema = z.object({
  memoryType,
  category: z.string().max(100).default("general"),
  key: z.string().min(1, "Key is required").max(500),
  value: z.unknown(),
  importance: z.number().min(0).max(1).default(0.5),
  expiresAt: z.string().datetime().optional(),
  metadata: z.record(z.string(), z.unknown()).default({}),
});

export const createAgentDelegationSchema = z.object({
  toAgentId: z.string().min(1, "Target agent ID is required"),
  taskId: z.string().optional(),
  delegationType,
  reason: z.string().max(1000).default(""),
  context: z.record(z.string(), z.unknown()).default({}),
  traceId: z.string().optional(),
});

export const createAgentConversationSchema = z.object({
  role: conversationRole,
  content: z.string().min(1, "Content is required").max(10000),
  contentType: conversationContentType.default("text"),
  metadata: z.record(z.string(), z.unknown()).default({}),
});

export const agentListQuerySchema = z.object({
  status: agentStatus.optional(),
  role: agentRole.optional(),
  enabled: z
    .string()
    .transform((v) => v === "true")
    .optional(),
  search: z.string().max(200).optional(),
  page: z
    .string()
    .transform((v) => Math.max(1, parseInt(v, 10) || 1))
    .optional(),
  limit: z
    .string()
    .transform((v) => Math.min(100, Math.max(1, parseInt(v, 10) || 20)))
    .optional(),
});

export const agentTaskListQuerySchema = z.object({
  agentId: z.string().optional(),
  status: taskStatus.optional(),
  taskType: taskType.optional(),
  sessionId: z.string().optional(),
  page: z
    .string()
    .transform((v) => Math.max(1, parseInt(v, 10) || 1))
    .optional(),
  limit: z
    .string()
    .transform((v) => Math.min(100, Math.max(1, parseInt(v, 10) || 20)))
    .optional(),
});

export const agentDecisionListQuerySchema = z.object({
  agentId: z.string().optional(),
  status: decisionStatus.optional(),
  impact: riskLevel.optional(),
  risk: riskLevel.optional(),
  page: z
    .string()
    .transform((v) => Math.max(1, parseInt(v, 10) || 1))
    .optional(),
  limit: z
    .string()
    .transform((v) => Math.min(100, Math.max(1, parseInt(v, 10) || 20)))
    .optional(),
});
