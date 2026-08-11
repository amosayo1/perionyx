/**
 * Phase 23 — Enterprise Workflow Engine: Facade
 *
 * Lazy singleton facade over the registry + orchestration service.
 * Deterministic, in-memory, audit-backed. Modules register their
 * definitions and policies on the registry; operators drive instances
 * through the service.
 */

import { WorkflowRegistry } from "./registry";
import { WorkflowService, type WorkflowServiceOptions } from "./workflow";
import { registerGeneralApprovalWorkflow } from "./providers/general-approval";

export interface EnterpriseWorkflowEngineOptions extends WorkflowServiceOptions {
  registerGeneralApproval?: boolean;
}

export class EnterpriseWorkflowEngine {
  private static instance: EnterpriseWorkflowEngine | null = null;

  readonly registry: WorkflowRegistry;
  readonly service: WorkflowService;

  private constructor(options: EnterpriseWorkflowEngineOptions) {
    this.registry = options.registry ?? new WorkflowRegistry();
    this.service = new WorkflowService({ ...options, registry: this.registry });
    if (options.registerGeneralApproval !== false) {
      registerGeneralApprovalWorkflow(this.registry);
    }
  }

  static getInstance(options?: EnterpriseWorkflowEngineOptions): EnterpriseWorkflowEngine {
    if (!EnterpriseWorkflowEngine.instance) {
      EnterpriseWorkflowEngine.instance = new EnterpriseWorkflowEngine(options ?? {});
    }
    return EnterpriseWorkflowEngine.instance;
  }

  static reset(): void {
    EnterpriseWorkflowEngine.instance = null;
  }
}
