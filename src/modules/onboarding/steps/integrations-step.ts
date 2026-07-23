import { BaseStep } from "./base-step";
import type { OnboardingSession, ValidationResult, StepExecutionResult, StepProgress } from "../types";
import { prisma } from "@/server/db/prisma";
import { connectorPlatformRegistry, ConnectorLifecycle } from "@/modules/connector-platform";

interface ConnectorTestResult {
  id: string;
  name: string;
  type: string;
  status: string;
  credentialsValid: boolean;
  connectionOk: boolean;
  healthStatus: string;
  lastHealthCheckAt: string | null;
  lastSyncAt: string | null;
  errorMessage: string | null;
  active: boolean;
}

function getTenantContext(session: OnboardingSession) {
  return { companyId: session.companyId, userId: session.metadata.adminEmail as string ?? "system", role: "OWNER" as const };
}

export class IntegrationsStep extends BaseStep {
  readonly stepId = "integrations" as const;

  async validate(session: OnboardingSession): Promise<ValidationResult> {
    const errors: Array<{ field: string; message: string; code: string }> = [];
    const warnings: string[] = [];

    const connectors = await prisma.connectorConfig.findMany({
      where: { companyId: session.companyId },
    });

    if (connectors.length === 0) {
      errors.push({ field: "connectors", message: "Configure at least one integration", code: "MISSING_CONNECTORS" });
      return { valid: false, errors, warnings };
    }

    const bankingTypes = ["plaid", "lean", "tarabut"];
    const hasBanking = connectors.some((c) => bankingTypes.includes(c.type));
    if (!hasBanking) {
      errors.push({ field: "bankingConnector", message: "Connect at least one bank integration (Plaid, Lean, or Tarabut)", code: "MISSING_BANKING" });
    }

    const erpTypes = ["sap", "netsuite", "dynamics365"];
    const accountingTypes = ["quickbooks", "xero"];

    for (const connector of connectors) {
      if (!connector.active) {
        warnings.push(`Connector "${connector.name}" is disabled`);
      }
      const cfg = connector.config as Record<string, any> | null;
      const healthStatus = cfg?.healthStatus;
      if (healthStatus === "CRITICAL" || healthStatus === "UNKNOWN") {
        warnings.push(`Connector "${connector.name}" health is ${healthStatus}`);
      }
    }

    const hasErp = connectors.some((c) => erpTypes.includes(c.type));
    const hasAccounting = connectors.some((c) => accountingTypes.includes(c.type));

    if (!hasErp && !hasAccounting) {
      warnings.push("No ERP or accounting integrations configured — consider adding SAP, NetSuite, Dynamics, QuickBooks, or Xero");
    }

    return { valid: errors.length === 0, errors, warnings };
  }

  async execute(session: OnboardingSession): Promise<StepExecutionResult> {
    const ctx = getTenantContext(session);
    const connectors = await prisma.connectorConfig.findMany({
      where: { companyId: session.companyId },
    });

    const testResults: ConnectorTestResult[] = [];

    for (const connector of connectors) {
      let credentialsValid = false;
      let connectionOk = false;
      let healthStatus = "UNKNOWN";
      let errorMessage: string | null = null;

      try {
        const instance = connectorPlatformRegistry.getInstance(connector.id);
        if (instance) {
          const validateResult = await ConnectorLifecycle.validate(ctx, connector.id);
          credentialsValid = validateResult.ok;

          if (validateResult.ok) {
            const health = await ConnectorLifecycle.healthCheck(ctx, connector.id);
            healthStatus = health.status;
            connectionOk = health.status === "GOOD" || health.status === "WARNING";
            errorMessage = health.message ?? null;
          } else {
            errorMessage = validateResult.errors.join("; ");
          }
        } else {
          const initialized = connectorPlatformRegistry.createInstance(connector.type as any);
          if (initialized) {
            initialized.initialize({
              id: connector.id,
              companyId: session.companyId,
              name: connector.name,
              kind: connector.type as any,
              status: "configuring",
              authMethod: "api-key",
              capabilities: [],
              config: (connector.config as Record<string, any>) ?? {},
              active: connector.active,
              createdAt: connector.createdAt.toISOString(),
              updatedAt: connector.updatedAt.toISOString(),
            });
            connectorPlatformRegistry.registerInstance(connector.id, initialized);
            const validateResult = await ConnectorLifecycle.validate(ctx, connector.id);
            credentialsValid = validateResult.ok;
            if (validateResult.ok) {
              const health = await ConnectorLifecycle.healthCheck(ctx, connector.id);
              healthStatus = health.status;
              connectionOk = health.status === "GOOD" || health.status === "WARNING";
              errorMessage = health.message ?? null;
            } else {
              errorMessage = validateResult.errors.join("; ");
            }
          }
        }
      } catch (err: any) {
        credentialsValid = false;
        connectionOk = false;
        healthStatus = "UNKNOWN";
        errorMessage = err?.message ?? "Connection test failed";
      }

      testResults.push({
        id: connector.id,
        name: connector.name,
        type: connector.type,
        status: connector.active ? "active" : "disabled",
        credentialsValid,
        connectionOk,
        healthStatus,
        lastHealthCheckAt: null,
        lastSyncAt: null,
        errorMessage,
        active: connector.active,
      });
    }

    const bankingTypes = ["plaid", "lean", "tarabut"];
    const erpTypes = ["sap", "netsuite", "dynamics365"];
    const accountingTypes = ["quickbooks", "xero"];

    const categorized = {
      banking: testResults.filter((c) => bankingTypes.includes(c.type)),
      erp: testResults.filter((c) => erpTypes.includes(c.type)),
      accounting: testResults.filter((c) => accountingTypes.includes(c.type)),
      csv: testResults.filter((c) => c.type === "csv"),
      other: testResults.filter((c) => ![...bankingTypes, ...erpTypes, ...accountingTypes, "csv"].includes(c.type)),
    };

    return this.successResult({
      connectors: testResults,
      categorized,
      allCredentialsValid: testResults.every((c) => c.credentialsValid),
      allConnectionsOk: testResults.every((c) => c.connectionOk),
      anyCritical: testResults.some((c) => c.healthStatus === "CRITICAL"),
      completedAt: new Date().toISOString(),
    });
  }

  getProgress(session: OnboardingSession): StepProgress {
    const completed = session.steps.find((s) => s.stepId === "integrations")?.status === "COMPLETED" ? 1 : 0;
    return { stepId: "integrations", completed, total: 1, label: "Integration setup" };
  }
}
