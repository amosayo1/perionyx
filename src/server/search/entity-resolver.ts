import { prisma } from "@/server/db/prisma";
import type { SearchDocument, SearchSourceType } from "./types";

export interface ResolvedEntity {
  id: string;
  label: string;
  status?: string;
  url?: string;
  metadata: Record<string, unknown>;
}

export class EntityResolver {
  async resolve(document: SearchDocument): Promise<ResolvedEntity | null> {
    const handler = this.getHandler(document.sourceType);
    if (!handler) return null;
    return handler(document.entityId, document.companyId);
  }

  async resolveBatch(documents: SearchDocument[]): Promise<Map<string, ResolvedEntity>> {
    const results = new Map<string, ResolvedEntity>();
    const batches = new Map<SearchSourceType, { ids: string[]; docs: SearchDocument[] }>();

    for (const doc of documents) {
      const existing = batches.get(doc.sourceType);
      if (existing) {
        existing.ids.push(doc.entityId);
        existing.docs.push(doc);
      } else {
        batches.set(doc.sourceType, { ids: [doc.entityId], docs: [doc] });
      }
    }

    for (const [sourceType, batch] of batches) {
      const handler = this.getBatchHandler(sourceType);
      if (handler) {
        const resolved = await handler(batch.ids);
        for (const [entityId, entity] of resolved) {
          const doc = batch.docs.find((d) => d.entityId === entityId);
          if (doc) results.set(doc.id, entity);
        }
      } else {
        for (const doc of batch.docs) {
          const entity = await this.resolve(doc);
          if (entity) results.set(doc.id, entity);
        }
      }
    }

    return results;
  }

  private getHandler(sourceType: SearchSourceType): ((entityId: string, companyId: string) => Promise<ResolvedEntity | null>) | null {
    const handlers: Record<string, (entityId: string, companyId: string) => Promise<ResolvedEntity | null>> = {
      TREASURY: async (id, _c) => {
        const account = await prisma.treasuryAccount.findUnique({ where: { id } });
        if (!account) return null;
        return { id: account.id, label: account.name, status: account.isActive ? "active" : "inactive", metadata: { currency: account.currency, balance: account.balance.toString() } };
      },
      PAYMENT: async (id, _c) => {
        const tx = await prisma.transaction.findUnique({ where: { id } });
        if (!tx) return null;
        return { id: tx.id, label: tx.reference ?? tx.id, status: tx.status, metadata: { amount: tx.primaryAmount.toString(), currency: tx.currency, type: tx.type } };
      },
      INVOICE: async (id, companyId) => {
        const invoice = await prisma.accountingInvoice.findUnique({ where: { id } });
        if (!invoice) return null;
        return { id: invoice.id, label: invoice.docNumber ?? invoice.id, status: invoice.status, metadata: { amount: invoice.totalAmount.toString(), currency: invoice.currency } };
      },
      VENDOR: async (id, companyId) => {
        const vendor = await prisma.accountingVendor.findUnique({ where: { id } });
        if (!vendor) return null;
        return { id: vendor.id, label: vendor.displayName, status: vendor.active ? "active" : "inactive", metadata: { email: vendor.email } };
      },
      CUSTOMER: async (id, companyId) => {
        const customer = await prisma.accountingCustomer.findUnique({ where: { id } });
        if (!customer) return null;
        return { id: customer.id, label: customer.displayName, status: customer.active ? "active" : "inactive", metadata: { email: customer.email } };
      },
      WORKFLOW: async (id, _c) => {
        const wf = await prisma.workflowDefinition.findUnique({ where: { id } });
        if (!wf) return null;
        return { id: wf.id, label: wf.name, status: wf.status, metadata: { category: wf.category, version: wf.version } };
      },
      WORKFLOW_INSTANCE: async (id, _c) => {
        const inst = await prisma.workflowInstance.findUnique({ where: { id } });
        if (!inst) return null;
        return { id: inst.id, label: `Instance ${inst.id.slice(0, 8)}`, status: inst.status, metadata: { startedAt: inst.startedAt?.toISOString() } };
      },
      APPROVAL: async (id, _c) => {
        const approval = await prisma.transactionApproval.findUnique({ where: { id } });
        if (!approval) return null;
        return { id: approval.id, label: `Approval ${approval.id.slice(0, 8)}`, status: approval.status, metadata: { level: approval.level } };
      },
      POLICY: async (id, _c) => {
        const policy = await prisma.policy.findUnique({ where: { id } });
        if (!policy) return null;
        return { id: policy.id, label: policy.name, status: policy.enabled ? "enabled" : "disabled", metadata: { type: policy.type, version: policy.version } };
      },
      BUSINESS_RULE: async (id, _c) => {
        const rule = await prisma.businessRuleDefinition.findUnique({ where: { id } });
        if (!rule) return null;
        return { id: rule.id, label: rule.name, status: rule.isActive ? "active" : "inactive", metadata: { category: rule.category } };
      },
      RISK: async (id, _c) => {
        const alert = await prisma.riskAlert.findUnique({ where: { id } });
        if (!alert) return null;
        return { id: alert.id, label: alert.title, status: alert.status, metadata: { severity: alert.severity, category: alert.category } };
      },
      COMPLIANCE: async (id, _c) => {
        const violation = await prisma.policyViolation.findUnique({ where: { id } });
        if (!violation) return null;
        return { id: violation.id, label: violation.title, status: violation.status, metadata: { severity: violation.severity } };
      },
      USER: async (id, _c) => {
        const user = await prisma.user.findUnique({ where: { id }, select: { id: true, name: true, email: true } });
        if (!user) return null;
        return { id: user.id, label: user.name ?? user.email ?? user.id, metadata: { email: user.email } };
      },
      AUDIT_LOG: async (id, _c) => {
        const log = await prisma.auditLog.findUnique({ where: { id } });
        if (!log) return null;
        return { id: log.id, label: `${log.action} on ${log.resourceType}`, metadata: { action: log.action, resourceType: log.resourceType } };
      },
      NOTIFICATION: async (id, _c) => {
        const notif = await prisma.notification.findUnique({ where: { id } });
        if (!notif) return null;
        return { id: notif.id, label: notif.title, metadata: { eventType: notif.eventType } };
      },
    };

    return handlers[sourceType] ?? null;
  }

  private getBatchHandler(sourceType: SearchSourceType): ((ids: string[]) => Promise<Map<string, ResolvedEntity>>) | null {
    const batchHandlers: Record<string, (ids: string[]) => Promise<Map<string, ResolvedEntity>>> = {
      TREASURY: async (ids) => {
        const accounts = await prisma.treasuryAccount.findMany({ where: { id: { in: ids } } });
        return new Map(accounts.map((a) => [a.id, { id: a.id, label: a.name, status: a.isActive ? "active" : "inactive", metadata: { currency: a.currency } }]));
      },
      PAYMENT: async (ids) => {
        const txs = await prisma.transaction.findMany({ where: { id: { in: ids } } });
        return new Map(txs.map((t) => [t.id, { id: t.id, label: t.reference ?? t.id, status: t.status, metadata: { amount: t.primaryAmount.toString(), currency: t.currency } }]));
      },
      WORKFLOW: async (ids) => {
        const wfs = await prisma.workflowDefinition.findMany({ where: { id: { in: ids } } });
        return new Map(wfs.map((w) => [w.id, { id: w.id, label: w.name, status: w.status, metadata: {} }]));
      },
      POLICY: async (ids) => {
        const policies = await prisma.policy.findMany({ where: { id: { in: ids } } });
        return new Map(policies.map((p) => [p.id, { id: p.id, label: p.name, status: p.enabled ? "enabled" : "disabled", metadata: { type: p.type } }]));
      },
    };

    return batchHandlers[sourceType] ?? null;
  }
}

export const entityResolver = new EntityResolver();
