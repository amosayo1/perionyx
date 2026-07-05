import { z } from "zod";

const conditionOperator = z.enum(["eq", "neq", "gt", "gte", "lt", "lte", "in", "contains", "matches"]);

export const ruleCondition = z.object({
  variable: z.string().min(1, "Variable is required"),
  operator: conditionOperator,
  value: z.unknown(),
});

export const conditionGroup: z.ZodType<any> = z.lazy(() =>
  z.object({
    logic: z.enum(["AND", "OR"]),
    conditions: z.array(z.union([conditionGroup, ruleCondition])),
  }),
);

export const ruleAction = z.object({
  type: z.enum(["require_approval", "notify", "block", "retry", "escalate", "set_variable", "route"]),
  config: z.record(z.string(), z.unknown()).default({}),
});

export const approvalCondition = z.object({
  field: z.string().min(1, "Field is required"),
  operator: conditionOperator,
  value: z.unknown(),
});

// ── Business Rules ────────────────────────────────────────────────────

export const createBusinessRuleSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  description: z.string().max(1000).default(""),
  category: z.string().min(1, "Category is required"),
  ruleType: z.enum(["policy", "threshold", "validation", "routing"]),
  config: z.record(z.string(), z.string()).default({}),
  priority: z.number().int().min(1).max(100).default(50),
  isActive: z.boolean().default(true),
});

export const updateBusinessRuleSchema = createBusinessRuleSchema.partial().extend({
  id: z.string(),
  name: z.string().min(1).max(200).optional(),
});

export const idParam = z.object({
  id: z.string().min(1, "ID is required"),
});

// ── Approval Matrix ───────────────────────────────────────────────────

const approvalMode = z.enum(["sequential", "parallel"]);

export const createApprovalMatrixSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  description: z.string().max(1000).default(""),
  priority: z.number().int().min(1).max(100).default(50),
  conditions: z.array(approvalCondition).default([]),
  requiredApprovers: z.number().int().min(1).max(100).default(1),
  approverRoles: z.array(z.string().min(1)).min(1, "At least one role is required"),
  approvalMode: approvalMode.default("sequential"),
  timeoutMinutes: z.number().int().min(1).default(1440),
  escalationEnabled: z.boolean().default(false),
  escalationDelayMinutes: z.number().int().min(1).optional(),
  escalationRoles: z.array(z.string()).default([]),
  delegationEnabled: z.boolean().default(false),
  delegationRoles: z.array(z.string()).default([]),
  departmentScope: z.string().optional(),
  thresholdField: z.string().optional(),
  thresholdOperator: conditionOperator.optional(),
  thresholdValue: z.number().optional(),
  isActive: z.boolean().default(true),
});

export const updateApprovalMatrixSchema = createApprovalMatrixSchema.partial().extend({
  id: z.string(),
});

// ── Schedules ─────────────────────────────────────────────────────────

const scheduleTriggerType = z.enum([
  "immediate", "scheduled", "recurring", "cron", "webhook", "manual",
  "connector_event", "bank_event", "erp_event", "approval_event",
  "governance_event", "decision_event",
]);

export const createScheduleSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  templateId: z.string().optional(),
  blueprintId: z.string().optional(),
  triggerType: scheduleTriggerType,
  cronExpression: z.string().optional(),
  startAt: z.string().optional(),
  eventSource: z.string().optional(),
  eventType: z.string().optional(),
  input: z.record(z.string(), z.string()).default({}),
  enabled: z.boolean().default(true),
});

export const updateScheduleSchema = createScheduleSchema.partial().extend({
  id: z.string(),
});

// ── API Response Helpers ──────────────────────────────────────────────

import { NextResponse } from "next/server";

export function validationError(error: z.ZodError) {
  const details: { path: string; message: string }[] = [];
  for (const issue of error.issues) {
    details.push({
      path: (issue.path as (string | number)[]).join("."),
      message: issue.message,
    });
  }
  return NextResponse.json(
    { error: "Validation failed", details },
    { status: 422 },
  );
}

export function notFoundError(resource: string) {
  return NextResponse.json(
    { error: `${resource} not found` },
    { status: 404 },
  );
}

export function serverError(err: unknown) {
  const message = err instanceof Error ? err.message : "Internal server error";
  return NextResponse.json({ error: message }, { status: 500 });
}
