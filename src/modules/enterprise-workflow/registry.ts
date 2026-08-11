/**
 * Phase 23 — Enterprise Workflow Engine: Registry
 *
 * Registry-based extensibility. Modules register workflow definitions,
 * assignment strategies, escalation policies, notification channels and
 * dynamic routing resolvers without modifying the engine. New domains
 * (AP, Treasury, Procurement, Reconciliation, Audit, Compliance) register
 * their own definitions and policies.
 */

import type {
  EscalationPolicy,
  WorkflowDefinition,
  WorkflowPriority,
} from "./types";
import { AssignmentEngine, RuleStrategy } from "./assignment";
import { EscalationEngine } from "./escalation";
import { NotificationDispatcher } from "./notification";
import { RoutingEngine, type RoutingContext } from "./routing";

export interface RegisteredWorkflow {
  definition: WorkflowDefinition;
  registeredAt: string;
}

export interface WorkflowRegistryOptions {
  defaultPriority?: WorkflowPriority;
}

export class WorkflowRegistry {
  private readonly definitions = new Map<string, RegisteredWorkflow>();
  private readonly escalations = new Map<string, EscalationPolicy>();
  private readonly routers = new Map<string, (ctx: RoutingContext) => string[]>();
  private readonly notifier = new NotificationDispatcher();

  readonly assignment = new AssignmentEngine();
  readonly routing = new RoutingEngine();
  readonly escalation = new EscalationEngine();

  constructor(private readonly options: WorkflowRegistryOptions = {}) {}

  registerDefinition(definition: WorkflowDefinition, at?: string): void {
    const existing = this.definitions.get(definition.id);
    if (existing) {
      if (existing.definition.version >= definition.version) {
        throw new Error(
          `Workflow ${definition.id} already registered at version ${existing.definition.version}`,
        );
      }
    }
    this.definitions.set(definition.id, {
      definition,
      registeredAt: at ?? new Date().toISOString(),
    });
  }

  getDefinition(id: string): WorkflowDefinition | undefined {
    return this.definitions.get(id)?.definition;
  }

  listDefinitions(): RegisteredWorkflow[] {
    return [...this.definitions.values()].sort((a, b) =>
      a.definition.id.localeCompare(b.definition.id),
    );
  }

  registerEscalationPolicy(policy: EscalationPolicy): void {
    this.escalation.register(policy);
    this.escalations.set(policy.id, policy);
  }

  getEscalationPolicy(id: string): EscalationPolicy | undefined {
    return this.escalation.getPolicy(id);
  }

  registerRouter(id: string, resolve: (ctx: RoutingContext) => string[]): void {
    this.routers.set(id, resolve);
  }

  getRouter(id: string): ((ctx: RoutingContext) => string[]) | undefined {
    return this.routers.get(id);
  }

  listRouterIds(): string[] {
    return [...this.routers.keys()];
  }

  registerNotificationChannel(id: string, deliver: (n: import("./types").WorkflowNotification) => Promise<void> | void): void {
    this.notifier.register({ id, deliver });
  }

  get notifierDispatcher(): NotificationDispatcher {
    return this.notifier;
  }

  defineAssignmentRule(ruleId: string, result: import("./types").AssignmentResult): void {
    const strategy = this.assignment.getStrategy("rule");
    if (strategy instanceof RuleStrategy) {
      strategy.defineRule(ruleId, result);
      return;
    }
    throw new Error("Rule strategy is not available");
  }

  defaultPriority(): WorkflowPriority {
    return this.options.defaultPriority ?? "medium";
  }
}
