import { BaseStep } from "./base-step";
import type { OnboardingSession, ValidationResult, StepExecutionResult, StepProgress } from "../types";
import type { TenantContext } from "@/server/context/tenant-context";
import { OperationsService } from "@/modules/operations/operations.service";

function getTenantContext(session: OnboardingSession): TenantContext {
  return { userId: (session.metadata.adminUserId as string) ?? "system", companyId: session.companyId, role: "ADMIN" };
}

export class OperationsStep extends BaseStep {
  readonly stepId = "operations" as const;

  async validate(session: OnboardingSession): Promise<ValidationResult> {
    const errors: Array<{ field: string; message: string; code: string }> = [];
    const metadata = session.metadata;
    const opsConfig = metadata.operationsConfig as Record<string, unknown> | undefined;

    if (!opsConfig?.monitoringEnabled) {
      errors.push({ field: "operationsConfig.monitoringEnabled", message: "Monitoring must be enabled", code: "MISSING_MONITORING" });
    }
    if (!opsConfig?.alertEmail) {
      errors.push({ field: "operationsConfig.alertEmail", message: "Alert email must be configured", code: "MISSING_ALERT_EMAIL" });
    }

    return { valid: errors.length === 0, errors, warnings: [] };
  }

  async execute(session: OnboardingSession): Promise<StepExecutionResult> {
    const ctx = getTenantContext(session);
    const metadata = session.metadata;
    const opsConfig = (metadata.operationsConfig ?? {}) as Record<string, unknown>;

    let platformHealth: { services: { name: string; status: string; latencyMs: number }[]; lastUpdated: string } | null = null;
    let queueStatus: Array<{ queueName: string; queued: number; active: number; failed: number; scheduled: number }> = [];

    try {
      platformHealth = await OperationsService.getPlatformHealth();
    } catch {
      // Platform health may fail if observability is not set up
    }

    try {
      queueStatus = await OperationsService.getQueueStatus();
    } catch {
      // Queue status may fail if queue is not running
    }

    const monitoringEnabled = opsConfig.monitoringEnabled === true || opsConfig.monitoringEnabled === "true";

    const connectorHealth = await OperationsService.getConnectorHealth(ctx).catch(() => []);

    return this.successResult({
      completedAt: new Date().toISOString(),
      operationsConfigured: true,
      monitoringEnabled,
      alertEmail: opsConfig.alertEmail ?? null,
      platformHealth,
      queueStatus,
      connectorHealth,
      allServicesHealthy: platformHealth?.services.every((s) => s.status === "healthy") ?? false,
    });
  }

  getProgress(_session: OnboardingSession): StepProgress {
    return { stepId: "operations", completed: 0, total: 1, label: "Operations setup" };
  }
}
