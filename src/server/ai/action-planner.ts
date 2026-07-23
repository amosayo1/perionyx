import type { SuggestedAction, UserContext, EntityRef } from "./types";

export interface ActionPlan {
  id: string;
  summary: string;
  steps: ActionStep[];
  estimatedEffort: "low" | "medium" | "high";
  priority: "immediate" | "today" | "this_week" | "this_month";
}

export interface ActionStep {
  order: number;
  action: string;
  entityType?: string;
  entityId?: string;
  url?: string;
  description: string;
  suggestedActions: SuggestedAction[];
}

export class ActionPlanner {
  planFromResponse(
    reply: string,
    citations: import("./types").Citation[],
    _user: UserContext,
  ): ActionPlan | null {
    const lower = reply.toLowerCase();

    if (lower.includes("approve") || lower.includes("approval") || lower.includes("pending approval")) {
      return this.buildApprovalPlan(citations);
    }

    if (lower.includes("risk") || lower.includes("violation") || lower.includes("compliance") || lower.includes("policy")) {
      return this.buildCompliancePlan(citations);
    }

    if (lower.includes("payment") || lower.includes("transaction") || lower.includes("transfer")) {
      return this.buildPaymentPlan(citations);
    }

    if (lower.includes("workflow") || lower.includes("month-end") || lower.includes("close") || lower.includes("reconciliation")) {
      return this.buildWorkflowPlan(citations);
    }

    return null;
  }

  private buildApprovalPlan(_citations: import("./types").Citation[]): ActionPlan {
    return {
      id: `plan-approval-${Date.now()}`,
      summary: "Review and process pending approvals",
      steps: [
        {
          order: 1,
          action: "navigate",
          url: "/approvals",
          description: "Go to the approvals page to see all pending items",
          suggestedActions: [{ id: "step1", label: "Open approvals", action: "navigate", url: "/approvals", priority: "high" }],
        },
        {
          order: 2,
          action: "review",
          url: "/approvals",
          description: "Review each pending approval for completeness and policy compliance",
          suggestedActions: [],
        },
        {
          order: 3,
          action: "approve",
          description: "Process approvals — approve, reject, or delegate based on your authority",
          suggestedActions: [],
        },
      ],
      estimatedEffort: "medium",
      priority: "today",
    };
  }

  private buildCompliancePlan(_citations: import("./types").Citation[]): ActionPlan {
    return {
      id: `plan-compliance-${Date.now()}`,
      summary: "Investigate and resolve compliance items",
      steps: [
        {
          order: 1,
          action: "navigate",
          url: "/compliance",
          description: "Open the compliance dashboard to review violations and alerts",
          suggestedActions: [{ id: "step1", label: "Open compliance", action: "navigate", url: "/compliance", priority: "high" }],
        },
        {
          order: 2,
          action: "review",
          description: "Categorize each item by severity (critical → investigate first)",
          suggestedActions: [],
        },
        {
          order: 3,
          action: "resolve",
          description: "Resolve or escalate based on policy guidelines",
          suggestedActions: [],
        },
      ],
      estimatedEffort: "high",
      priority: "today",
    };
  }

  private buildPaymentPlan(_citations: import("./types").Citation[]): ActionPlan {
    return {
      id: `plan-payment-${Date.now()}`,
      summary: "Review payment issues and pending transactions",
      steps: [
        {
          order: 1,
          action: "navigate",
          url: "/transactions",
          description: "Check the transactions page for failed or pending payments",
          suggestedActions: [{ id: "step1", label: "View transactions", action: "navigate", url: "/transactions", priority: "high" }],
        },
        {
          order: 2,
          action: "review",
          description: "Identify the cause of failures (insufficient funds, approval blocks, policy violations)",
          suggestedActions: [],
        },
        {
          order: 3,
          action: "resolve",
          description: "Take corrective action — resubmit, adjust, or escalate",
          suggestedActions: [],
        },
      ],
      estimatedEffort: "medium",
      priority: "today",
    };
  }

  private buildWorkflowPlan(_citations: import("./types").Citation[]): ActionPlan {
    return {
      id: `plan-workflow-${Date.now()}`,
      summary: "Address workflow bottlenecks and month-end tasks",
      steps: [
        {
          order: 1,
          action: "navigate",
          url: "/workflows",
          description: "Open workflow monitoring to see running and failed instances",
          suggestedActions: [{ id: "step1", label: "Open workflows", action: "navigate", url: "/workflows", priority: "medium" }],
        },
        {
          order: 2,
          action: "review",
          description: "Identify workflows with high failure rates or long running times",
          suggestedActions: [],
        },
        {
          order: 3,
          action: "resolve",
          description: "Re-run failed workflows, adjust configurations, or escalate blockers",
          suggestedActions: [],
        },
      ],
      estimatedEffort: "medium",
      priority: "this_week",
    };
  }
}

export const actionPlanner = new ActionPlanner();
