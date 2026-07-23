import { z } from "zod";

// ── Briefing ──────────────────────────────────────────────────────────

export const generateBriefingSchema = z.object({
  period: z.enum(["daily", "weekly", "monthly"]).default("daily"),
  briefingDate: z.string().optional(),
});

// ── Scenario ──────────────────────────────────────────────────────────

export const runScenarioSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  description: z.string().max(1000).default(""),
  scenarioType: z.enum([
    "revenue_decline",
    "revenue_growth",
    "payroll_increase",
    "hiring_freeze",
    "customer_default",
    "fx_movement",
    "interest_rate",
    "tax_increase",
    "acquisition",
    "capex",
    "custom",
  ]),
  parameters: z.record(z.string(), z.unknown()).default({}),
});

// ── Chat ──────────────────────────────────────────────────────────────

export const createConversationSchema = z.object({
  title: z.string().max(200).optional(),
});

export const sendMessageSchema = z.object({
  content: z.string().min(1, "Message content is required"),
});

// ── Priority ──────────────────────────────────────────────────────────

export const createPrioritySchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(1000).default(""),
  priorityType: z.string().min(1, "Priority type is required"),
  urgency: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).default("MEDIUM"),
  dueDate: z.string().optional(),
});

// ── Decision ──────────────────────────────────────────────────────────

export const createDecisionSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(1000).default(""),
  decisionType: z.enum(["strategic", "operational", "financial", "risk", "investment"]),
  recommendation: z.string().max(2000).default(""),
  reasoning: z.string().max(2000).default(""),
  riskLevel: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).default("LOW"),
});

// ── Recommendation ────────────────────────────────────────────────────

export const createRecommendationSchema = z.object({
  briefingId: z.string().optional(),
  category: z.enum([
    "cash",
    "liquidity",
    "working_capital",
    "revenue",
    "expense",
    "treasury",
    "compliance",
    "risk",
    "close",
    "strategic",
  ]),
  title: z.string().min(1, "Title is required").max(200),
  executiveSummary: z.string().max(2000).default(""),
  businessReason: z.string().max(2000).default(""),
  financialImpact: z.record(z.string(), z.unknown()).default({}),
  confidence: z.number().min(0).max(1).default(0.5),
  riskLevel: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).default("MEDIUM"),
  priority: z.number().int().min(1).max(100).default(50),
  requiredApprovals: z.array(z.string()).default([]),
  suggestedNextSteps: z.array(z.unknown()).default([]),
  evidenceIds: z.array(z.string()).default([]),
  agentDecisionId: z.string().optional(),
});

export const updateRecommendationStatusSchema = z.object({
  action: z.enum(["acknowledge", "accept", "reject"]),
});

// ── Decision Action ───────────────────────────────────────────────────

export const decideActionSchema = z.object({
  action: z.enum(["approve", "reject", "defer"]),
});

// ── Workspace ─────────────────────────────────────────────────────────

export const updateWorkspaceSchema = z.object({
  layout: z.record(z.string(), z.unknown()).optional(),
  pinnedWidgets: z.array(z.string()).optional(),
  hiddenWidgets: z.array(z.string()).optional(),
  briefingTime: z.string().optional(),
  notificationPrefs: z.record(z.string(), z.unknown()).optional(),
  theme: z.string().optional(),
  config: z.record(z.string(), z.unknown()).optional(),
});
