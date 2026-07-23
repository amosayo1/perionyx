import { prisma } from "@/server/db/prisma";
import type { TenantContext } from "@/server/context/tenant-context";
import type { ConnectorDefinition, IntegrationInstanceData, ConnectorProvider, ConnectorCategory, AuthMethod, ConnectionStatus, AuditAction } from "./types";
import { IntegrationAuditService } from "./integration-audit.service";

const SEED_DEFINITIONS: Array<{
  provider: ConnectorProvider;
  name: string;
  description: string;
  category: ConnectorCategory;
  authTypes: AuthMethod[];
  modules: string[];
  capabilities: string[];
  version: string;
}> = [
  { provider: "sap-s4hana", name: "SAP S/4HANA", description: "Enterprise resource planning for large organizations", category: "erp", authTypes: ["oauth2", "basic"], modules: ["finance", "accounting", "procurement", "sales"], capabilities: ["data-import", "data-export", "scheduled-sync", "health-check", "gl-sync"], version: "1.0" },
  { provider: "dynamics-365", name: "Microsoft Dynamics 365", description: "Cloud ERP and CRM platform", category: "erp", authTypes: ["oauth2"], modules: ["finance", "accounting", "sales", "operations"], capabilities: ["data-import", "data-export", "scheduled-sync", "health-check", "gl-sync"], version: "1.0" },
  { provider: "oracle-erp", name: "Oracle ERP Cloud", description: "Cloud-based enterprise resource planning", category: "erp", authTypes: ["oauth2", "basic"], modules: ["finance", "accounting", "procurement"], capabilities: ["data-import", "data-export", "scheduled-sync", "health-check"], version: "1.0" },
  { provider: "netsuite", name: "Oracle NetSuite", description: "Cloud business management suite", category: "erp", authTypes: ["oauth2", "bearer"], modules: ["finance", "accounting", "inventory", "crm"], capabilities: ["data-import", "data-export", "scheduled-sync", "health-check", "gl-sync"], version: "1.0" },
  { provider: "sage-intacct", name: "Sage Intacct", description: "Cloud financial management", category: "erp", authTypes: ["oauth2"], modules: ["finance", "accounting", "projects"], capabilities: ["data-import", "data-export", "scheduled-sync", "health-check"], version: "1.0" },
  { provider: "odoo", name: "Odoo", description: "Open-source ERP platform", category: "erp", authTypes: ["api-key"], modules: ["finance", "accounting", "sales", "inventory"], capabilities: ["data-import", "data-export", "manual-sync", "health-check"], version: "1.0" },
  { provider: "quickbooks-enterprise", name: "QuickBooks Enterprise", description: "Desktop accounting for mid-market", category: "erp", authTypes: ["oauth2", "basic"], modules: ["finance", "accounting", "payroll"], capabilities: ["data-import", "data-export", "scheduled-sync", "health-check", "gl-sync"], version: "1.0" },
  { provider: "xero", name: "Xero", description: "Cloud-based accounting platform", category: "erp", authTypes: ["oauth2"], modules: ["finance", "accounting", "projects"], capabilities: ["data-import", "data-export", "scheduled-sync", "health-check"], version: "1.0" },
  { provider: "stripe", name: "Stripe", description: "Payment processing platform", category: "payment", authTypes: ["api-key"], modules: ["payments", "subscriptions", "billing"], capabilities: ["data-import", "data-export", "manual-sync", "health-check"], version: "1.0" },
  { provider: "paypal", name: "PayPal", description: "Online payment system", category: "payment", authTypes: ["oauth2"], modules: ["payments", "billing"], capabilities: ["data-import", "manual-sync", "health-check"], version: "1.0" },
  { provider: "open-banking", name: "Open Banking", description: "Open banking API connectivity", category: "banking", authTypes: ["oauth2"], modules: ["accounts", "payments", "transactions"], capabilities: ["data-import", "real-time-events", "scheduled-sync", "health-check"], version: "1.0" },
  { provider: "swift", name: "SWIFT", description: "Global financial messaging network", category: "banking", authTypes: ["mutual-tls"], modules: ["payments", "messaging"], capabilities: ["data-import", "data-export", "health-check"], version: "1.0" },
  { provider: "mt940", name: "MT940", description: "SWIFT bank statement format", category: "banking", authTypes: ["basic", "mutual-tls"], modules: ["statements", "balances"], capabilities: ["file-import", "data-import", "scheduled-sync"], version: "1.0" },
  { provider: "camt-053", name: "CAMT.053", description: "ISO bank statement XML format", category: "banking", authTypes: ["basic", "mutual-tls"], modules: ["statements", "balances"], capabilities: ["file-import", "data-import", "scheduled-sync"], version: "1.0" },
  { provider: "iso20022", name: "ISO 20022", description: "Universal financial messaging standard", category: "banking", authTypes: ["mutual-tls", "basic"], modules: ["payments", "statements"], capabilities: ["file-import", "data-import", "data-export", "scheduled-sync"], version: "1.0" },
  { provider: "salesforce", name: "Salesforce", description: "Cloud CRM platform", category: "crm", authTypes: ["oauth2"], modules: ["sales", "marketing", "service"], capabilities: ["data-import", "data-export", "scheduled-sync", "health-check"], version: "1.0" },
  { provider: "hubspot", name: "HubSpot", description: "CRM and marketing platform", category: "crm", authTypes: ["oauth2", "api-key"], modules: ["marketing", "sales", "service"], capabilities: ["data-import", "data-export", "manual-sync", "health-check"], version: "1.0" },
  { provider: "bamboo-hr", name: "BambooHR", description: "HR management platform", category: "hr", authTypes: ["api-key"], modules: ["hr", "employee", "time-off"], capabilities: ["data-import", "manual-sync", "health-check"], version: "1.0" },
  { provider: "workday", name: "Workday", description: "Cloud HR and finance platform", category: "hr", authTypes: ["oauth2"], modules: ["hr", "payroll", "finance"], capabilities: ["data-import", "data-export", "scheduled-sync", "health-check"], version: "1.0" },
  { provider: "adp", name: "ADP", description: "Payroll and HR services", category: "payroll", authTypes: ["oauth2", "basic"], modules: ["payroll", "hr", "tax"], capabilities: ["data-import", "data-export", "scheduled-sync", "health-check"], version: "1.0" },
  { provider: "custom-rest", name: "Custom REST API", description: "Generic REST API connector", category: "custom", authTypes: ["bearer", "api-key"], modules: ["custom"], capabilities: ["data-import", "data-export", "manual-sync", "health-check"], version: "1.0" },
  { provider: "sftp", name: "SFTP", description: "Secure file transfer protocol", category: "file", authTypes: ["basic", "mutual-tls"], modules: ["file-transfer"], capabilities: ["file-import", "file-export", "scheduled-sync", "health-check"], version: "1.0" },
];

export class IntegrationRegistry {
  static async getAllDefinitions(): Promise<ConnectorDefinition[]> {
    let defs = await prisma.integrationConnectorDef.findMany({ where: { isActive: true } });
    if (defs.length === 0) {
      await this.seedDefinitions();
      defs = await prisma.integrationConnectorDef.findMany({ where: { isActive: true } });
    }
    return defs.map(d => ({ ...d, provider: d.provider as ConnectorProvider, category: d.category as ConnectorCategory, authTypes: d.authTypes as any as AuthMethod[], supportedModules: d.supportedModules as string[], capabilities: d.capabilities as string[], configSchema: d.configSchema as any as Record<string, unknown> | undefined, iconUrl: d.iconUrl ?? undefined, docsUrl: d.docsUrl ?? undefined }));
  }

  static async seedDefinitions(): Promise<void> {
    for (const def of SEED_DEFINITIONS) {
      await prisma.integrationConnectorDef.upsert({
        where: { provider: def.provider },
        update: {},
        create: { provider: def.provider, name: def.name, description: def.description, category: def.category, authTypes: def.authTypes, supportedModules: def.modules, capabilities: def.capabilities, version: def.version },
      });
    }
  }

  static async getDefinition(provider: ConnectorProvider): Promise<ConnectorDefinition | null> {
    const d = await prisma.integrationConnectorDef.findUnique({ where: { provider } });
    if (!d) return null;
    return { ...d, provider: d.provider as ConnectorProvider, category: d.category as ConnectorCategory, authTypes: d.authTypes as any as AuthMethod[], supportedModules: d.supportedModules as string[], capabilities: d.capabilities as string[], configSchema: d.configSchema as any as Record<string, unknown> | undefined, iconUrl: d.iconUrl ?? undefined, docsUrl: d.docsUrl ?? undefined };
  }

  static async getDefinitionById(id: string): Promise<ConnectorDefinition | null> {
    const d = await prisma.integrationConnectorDef.findUnique({ where: { id } });
    if (!d) return null;
    return { ...d, provider: d.provider as ConnectorProvider, category: d.category as ConnectorCategory, authTypes: d.authTypes as any as AuthMethod[], supportedModules: d.supportedModules as string[], capabilities: d.capabilities as string[], configSchema: d.configSchema as any as Record<string, unknown> | undefined, iconUrl: d.iconUrl ?? undefined, docsUrl: d.docsUrl ?? undefined };
  }

  static async getDefinitionsByCategory(category: ConnectorCategory): Promise<ConnectorDefinition[]> {
    const defs = await prisma.integrationConnectorDef.findMany({ where: { category, isActive: true } });
    return defs.map(d => ({ ...d, provider: d.provider as ConnectorProvider, category: d.category as ConnectorCategory, authTypes: d.authTypes as any as AuthMethod[], supportedModules: d.supportedModules as string[], capabilities: d.capabilities as string[], configSchema: d.configSchema as any as Record<string, unknown> | undefined, iconUrl: d.iconUrl ?? undefined, docsUrl: d.docsUrl ?? undefined }));
  }

  static async getDefinitionsByCapability(capability: string): Promise<ConnectorDefinition[]> {
    const all = await this.getAllDefinitions();
    return all.filter(d => d.capabilities.includes(capability));
  }

  static async createInstance(ctx: TenantContext, data: { connectorDefId: string; name: string; config: Record<string, unknown>; authMethod: AuthMethod }): Promise<IntegrationInstanceData> {
    const def = await prisma.integrationConnectorDef.findUnique({ where: { id: data.connectorDefId } });
    if (!def) throw new Error("Connector definition not found");
    const instance = await prisma.integrationInstance.create({
      data: { companyId: ctx.companyId, connectorDefId: data.connectorDefId, name: data.name, status: "pending", healthStatus: "unknown", config: data.config as any, authMethod: data.authMethod as any },
    });
    await IntegrationAuditService.record(ctx, { instanceId: instance.id, action: "created", entityType: "integration-instance", entityId: instance.id, metadata: { name: data.name, provider: def.provider } });
    return this.toInstanceData(instance);
  }

  static async getInstance(ctx: TenantContext, instanceId: string): Promise<IntegrationInstanceData | null> {
    const inst = await prisma.integrationInstance.findFirst({ where: { id: instanceId, companyId: ctx.companyId } });
    return inst ? this.toInstanceData(inst) : null;
  }

  static async listInstances(ctx: TenantContext, opts?: { status?: string; category?: string }): Promise<IntegrationInstanceData[]> {
    const where: Record<string, unknown> = { companyId: ctx.companyId, isActive: true };
    if (opts?.status) where.status = opts.status;
    if (opts?.category) where.connectorDef = { category: opts.category };
    const instances = await prisma.integrationInstance.findMany({ where, include: { connectorDef: true }, orderBy: { updatedAt: "desc" } });
    return instances.map(i => this.toInstanceData(i));
  }

  static async updateInstanceStatus(ctx: TenantContext, instanceId: string, status: ConnectionStatus, error?: string): Promise<void> {
    await prisma.integrationInstance.updateMany({ where: { id: instanceId, companyId: ctx.companyId }, data: { status, error, version: { increment: 1 } } });
  }

  static async deleteInstance(ctx: TenantContext, instanceId: string): Promise<void> {
    await prisma.integrationInstance.updateMany({ where: { id: instanceId, companyId: ctx.companyId }, data: { isActive: false, version: { increment: 1 } } });
    await IntegrationAuditService.record(ctx, { instanceId, action: "deleted", entityType: "integration-instance", entityId: instanceId });
  }

  static toCapabilityInfo(def: ConnectorDefinition): { provider: string; connectorDefId: string; name: string; category: string; authTypes: string[]; capabilities: string[]; modules: string[]; status: string } {
    return { provider: def.provider, connectorDefId: def.id, name: def.name, category: def.category, authTypes: def.authTypes, capabilities: def.capabilities, modules: def.supportedModules, status: "available" };
  }

  private static toInstanceData(i: Record<string, unknown>): IntegrationInstanceData {
    return { id: i.id as string, companyId: i.companyId as string, connectorDefId: i.connectorDefId as string, name: i.name as string, status: i.status as ConnectionStatus, healthStatus: i.healthStatus as string as any, config: i.config as Record<string, unknown>, authMethod: i.authMethod as AuthMethod, isActive: i.isActive as boolean, lastSyncAt: (i.lastSyncAt as Date)?.toISOString(), lastHealthCheckAt: (i.lastHealthCheckAt as Date)?.toISOString(), error: i.error as string | undefined, version: i.version as number, metadata: i.metadata as Record<string, unknown> | undefined, createdAt: (i.createdAt as Date).toISOString(), updatedAt: (i.updatedAt as Date).toISOString() };
  }
}
