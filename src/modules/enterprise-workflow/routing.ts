/**
 * Phase 23 — Enterprise Workflow Engine: Routing
 *
 * Deterministic routing between steps. Modes: conditional, parallel
 * (with join barrier), sequential, loop (bounded), subflow (nested
 * workflow instance), dynamic (resolver by id). Routers are pure
 * functions over instance facts — identical inputs yield identical
 * routes.
 */

import type { RoutingSpec, WorkflowInstance } from "./types";
import { buildConditionContext, evaluateCondition } from "./condition";

export type RouteResolution =
  | { kind: "steps"; stepIds: string[]; loopTarget?: string }
  | { kind: "subflow"; workflowId: string }
  | { kind: "end" };

export interface RoutingContext {
  instance: WorkflowInstance;
  resolvers: Record<string, (ctx: RoutingContext) => string[]>;
}

export class RoutingEngine {
  resolve(spec: RoutingSpec, ctx: RoutingContext): RouteResolution {
    switch (spec.mode) {
      case "sequential":
        return { kind: "steps", stepIds: spec.targetStepIds };
      case "conditional":
        return this.resolveConditional(spec, ctx);
      case "parallel":
        return { kind: "steps", stepIds: spec.targetStepIds };
      case "loop": {
        const conditionCtx = buildConditionContext(ctx.instance);
        const done = evaluateCondition(spec.until, conditionCtx);
        const iterations = ctx.instance.loopCounts[spec.targetStepId] ?? 0;
        if (done || iterations >= (spec.maxIterations ?? Number.POSITIVE_INFINITY)) {
          return { kind: "end" };
        }
        return { kind: "steps", stepIds: [spec.targetStepId], loopTarget: spec.targetStepId };
      }
      case "subflow":
        return { kind: "subflow", workflowId: spec.workflowId };
      case "dynamic": {
        const resolver = ctx.resolvers[spec.resolver];
        if (!resolver) {
          throw new Error(`No dynamic routing resolver registered: ${spec.resolver}`);
        }
        return { kind: "steps", stepIds: resolver(ctx) };
      }
    }
  }

  private resolveConditional(
    spec: Extract<RoutingSpec, { mode: "conditional" }>,
    ctx: RoutingContext,
  ): RouteResolution {
    const conditionCtx = buildConditionContext(ctx.instance);
    for (const c of spec.cases) {
      if (evaluateCondition(c.condition, conditionCtx)) {
        return { kind: "steps", stepIds: [c.targetStepId] };
      }
    }
    if (spec.defaultTarget) {
      return { kind: "steps", stepIds: [spec.defaultTarget] };
    }
    return { kind: "end" };
  }
}
