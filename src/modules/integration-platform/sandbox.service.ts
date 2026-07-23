import { prisma } from "@/server/db/prisma";
import type { TenantContext } from "@/server/context/tenant-context";
import type { SandboxDatasetData, IntegrationInstanceData, ConnectorProvider, AuthMethod, ConnectionStatus } from "./types";
import { IntegrationAuditService } from "./integration-audit.service";

const SANDBOX_DATASETS: Array<{ name: string; description: string; connectorDefId?: string }> = [
  { name: "SAP S/4HANA Sample", description: "Sample ERP data for SAP S/4HANA with GL accounts, journals, and transactions" },
  { name: "QuickBooks Sample", description: "Sample QuickBooks data with chart of accounts, vendors, and invoices" },
  { name: "Xero Sample", description: "Sample Xero data with accounts, contacts, and bank transactions" },
  { name: "MT940 Bank Statements", description: "Sample MT940 bank statement files for testing import" },
  { name: "CAMT.053 Statements", description: "Sample CAMT.053 XML bank statements" },
  { name: "ISO 20022 Payments", description: "Sample ISO 20022 payment messages" },
  { name: "NetSuite Sample", description: "Sample NetSuite ERP data with accounts and transactions" },
  { name: "Salesforce Sample", description: "Sample Salesforce CRM data with accounts and opportunities" },
];

export class SandboxService {
  static async getAvailableDatasets(ctx: TenantContext): Promise<SandboxDatasetData[]> {
    let datasets = await prisma.sandboxDataset.findMany({ where: { companyId: ctx.companyId, isActive: true } });
    if (datasets.length === 0) {
      for (const ds of SANDBOX_DATASETS) {
        const def = ds.connectorDefId ? await prisma.integrationConnectorDef.findUnique({ where: { id: ds.connectorDefId } }) : null;
        await prisma.sandboxDataset.create({
          data: { companyId: ctx.companyId, name: ds.name, description: ds.description, dataset: { sampleData: true, records: [] }, connectorDefId: def?.id },
        });
      }
      datasets = await prisma.sandboxDataset.findMany({ where: { companyId: ctx.companyId, isActive: true } });
    }
    return datasets.map(d => ({ id: d.id, name: d.name, description: d.description ?? undefined, connectorDefId: d.connectorDefId ?? undefined, isActive: d.isActive, expiresAt: d.expiresAt?.toISOString() }));
  }

  static async loadDataset(ctx: TenantContext, datasetId: string): Promise<Record<string, unknown>[]> {
    const ds = await prisma.sandboxDataset.findFirst({ where: { id: datasetId, companyId: ctx.companyId, isActive: true } });
    if (!ds) throw new Error("Dataset not found or expired");
    const data = ds.dataset as { records: Record<string, unknown>[] };
    return data.records ?? [];
  }

  static async createSandboxInstance(ctx: TenantContext, connectorDefId: string, datasetId: string): Promise<IntegrationInstanceData> {
    const ds = await prisma.sandboxDataset.findFirst({ where: { id: datasetId, companyId: ctx.companyId } });
    const def = await prisma.integrationConnectorDef.findUnique({ where: { id: connectorDefId } });
    if (!def) throw new Error("Connector definition not found");
    const instance = await prisma.integrationInstance.create({
      data: { companyId: ctx.companyId, connectorDefId, name: `Sandbox: ${def.name}`, status: "connected", healthStatus: "healthy", config: { sandbox: true, datasetId }, authMethod: "none", metadata: { sandbox: true, datasetId, datasetName: ds?.name } },
    });
    await IntegrationAuditService.record(ctx, { instanceId: instance.id, action: "created", entityType: "sandbox-instance", entityId: instance.id, metadata: { sandbox: true, connector: def.name } });
    return { id: instance.id, companyId: instance.companyId, connectorDefId: instance.connectorDefId, name: instance.name, status: instance.status as ConnectionStatus, healthStatus: instance.healthStatus as any, config: instance.config as Record<string, unknown>, authMethod: instance.authMethod as AuthMethod, isActive: instance.isActive, version: instance.version, createdAt: instance.createdAt.toISOString(), updatedAt: instance.updatedAt.toISOString() };
  }

  static async cleanupExpired(ctx: TenantContext): Promise<number> {
    const result = await prisma.sandboxDataset.updateMany({
      where: { companyId: ctx.companyId, isActive: true, expiresAt: { lte: new Date() } },
      data: { isActive: false },
    });
    return result.count;
  }
}
