import { connectorOrchestrator } from "@/modules/connector-platform/orchestrator/orchestrator";
import type { WorkflowExecutionContext, StepDefinition, StepResult } from "../types";
import type { StepExecutor } from "../types";

export class ConnectorStepExecutor implements StepExecutor {
  readonly type = "connector_execution" as const;

  async execute(ctx: WorkflowExecutionContext, step: StepDefinition): Promise<StepResult> {
    const config = step.config ?? {};
    const connectorId: string | undefined = config.connectorId as string | undefined;
    const action: string = (config.action as string) ?? "sync";
    const companyId = ctx.companyId;

    if (!connectorId) {
      return { success: false, error: "connectorId is required in step config" };
    }

    try {
      switch (action) {
        case "sync":
          await connectorOrchestrator.executeSync(connectorId, companyId);
          break;
        case "health_check":
          await connectorOrchestrator.executeHealthCheck(connectorId, companyId);
          break;
        case "oauth_refresh":
          await connectorOrchestrator.refreshOAuthToken(connectorId, companyId);
          break;
        default:
          return { success: false, error: `Unknown connector action: ${action}` };
      }

      return { success: true, output: { connectorId, action, executedAt: new Date().toISOString() } };
    } catch (err: any) {
      return { success: false, error: `Connector ${action} failed for ${connectorId}: ${err?.message ?? err}` };
    }
  }
}
