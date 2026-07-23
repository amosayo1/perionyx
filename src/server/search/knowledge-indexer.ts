import { prisma } from "@/server/db/prisma";
import type { SearchDocument, SearchSourceType } from "./types";
import { searchIndexManager } from "./search-index-manager";

export type IndexProgress = {
  source: SearchSourceType;
  indexed: number;
  total: number;
  errors: number;
};

export type IndexResult = {
  totalDocuments: number;
  sourcesIndexed: number;
  durationMs: number;
  progress: IndexProgress[];
};

export class KnowledgeIndexer {
  private readonly sources: SearchSourceType[] = [
    "TREASURY", "PAYMENT", "INVOICE", "VENDOR", "CUSTOMER",
    "WORKFLOW", "WORKFLOW_INSTANCE",
    "APPROVAL", "POLICY", "BUSINESS_RULE",
    "RISK", "COMPLIANCE",
    "REPORT", "DASHBOARD",
    "AUDIT_LOG", "NOTIFICATION",
    "AUTOMATION_STUDIO",
    "USER", "ORGANIZATION",
    "KNOWLEDGE_BASE", "DOCUMENT",
  ];

  async indexAll(companyId: string): Promise<IndexResult> {
    const startTime = Date.now();
    let totalDocuments = 0;
    let sourcesIndexed = 0;
    const progress: IndexProgress[] = [];

    for (const source of this.sources) {
      const result = await this.indexSource(source, companyId);
      progress.push(result);
      totalDocuments += result.indexed;
      if (result.indexed > 0) sourcesIndexed++;
    }

    return {
      totalDocuments,
      sourcesIndexed,
      durationMs: Date.now() - startTime,
      progress,
    };
  }

  async indexSource(source: SearchSourceType, companyId: string): Promise<IndexProgress> {
    const handler = this.getIndexer(source);
    if (!handler) {
      return { source, indexed: 0, total: 0, errors: 0 };
    }

    try {
      const docs = await handler(companyId);
      let indexed = 0;
      let errors = 0;

      for (const doc of docs) {
        try {
          searchIndexManager.addDocument(doc);
          indexed++;
        } catch {
          errors++;
        }
      }

      return { source, indexed, total: docs.length, errors };
    } catch {
      return { source, indexed: 0, total: 0, errors: 1 };
    }
  }

  private getIndexer(
    source: SearchSourceType,
  ): ((companyId: string) => Promise<SearchDocument[]>) | null {
    const indexers: Record<string, (companyId: string) => Promise<SearchDocument[]>> = {
      TREASURY: async (companyId) => {
        const accounts = await prisma.treasuryAccount.findMany({ where: { companyId } });
        return accounts.map((a) => this.makeDoc({
          id: `treasury-${a.id}`,
          sourceType: "TREASURY",
          title: a.name,
          description: a.description ?? `${a.currency} account`,
          content: `${a.name} ${a.currency} ${a.accountNumber ?? ""} ${a.description ?? ""}`,
          entityId: a.id,
          entityType: "TREASURY_ACCOUNT",
          companyId,
          tags: ["treasury", "account", a.currency.toLowerCase()],
          metadata: { currency: a.currency, balance: a.balance.toString(), isActive: a.isActive },
          requiredPermissions: ["read:treasury"],
          businessImportance: 0.9,
          createdAt: new Date().toISOString(),
          updatedAt: (a.lastSyncedAt ?? new Date()).toISOString(),
          score: 0,
          pinned: false,
        }));
      },

      PAYMENT: async (companyId) => {
        const txs = await prisma.transaction.findMany({
          where: { companyId },
          orderBy: { createdAt: "desc" },
          take: 10_000,
        });
        return txs.map((t) => this.makeDoc({
          id: `payment-${t.id}`,
          sourceType: "PAYMENT",
          title: t.reference ?? `Payment ${t.id.slice(0, 8)}`,
          description: `${t.type} payment of ${t.primaryAmount} ${t.currency}`,
          content: `${t.reference ?? ""} ${t.type} ${t.primaryAmount} ${t.currency} ${t.status} ${t.id}`,
          entityId: t.id,
          entityType: "PAYMENT",
          companyId,
          tags: ["payment", t.type.toLowerCase(), t.status.toLowerCase()],
          metadata: { amount: t.primaryAmount.toString(), currency: t.currency, type: t.type, status: t.status },
          requiredPermissions: ["read:transactions"],
          businessImportance: 1.0,
          createdAt: t.createdAt.toISOString(),
          updatedAt: t.createdAt.toISOString(),
          score: 0,
          pinned: false,
        }));
      },

      INVOICE: async (companyId) => {
        const invoices = await prisma.accountingInvoice.findMany({
          where: { companyId },
          take: 5_000,
        });
        return invoices.map((i) => this.makeDoc({
          id: `invoice-${i.id}`,
          sourceType: "INVOICE",
          title: i.docNumber ?? `Invoice ${i.id.slice(0, 8)}`,
          description: `${i.customerName ?? "Unknown"} - ${i.totalAmount} ${i.currency} (${i.status})`,
          content: `${i.docNumber ?? ""} ${i.customerName ?? ""} ${i.totalAmount} ${i.currency} ${i.status}`,
          entityId: i.id,
          entityType: "INVOICE",
          companyId,
          tags: ["invoice", i.status.toLowerCase()],
          metadata: { amount: i.totalAmount.toString(), currency: i.currency, status: i.status, dueDate: i.dueDate?.toISOString() },
          requiredPermissions: ["read:accounting"],
          businessImportance: 0.8,
          createdAt: (i.dueDate ?? new Date()).toISOString(),
          updatedAt: (i.transactionDate ?? new Date()).toISOString(),
          score: 0,
          pinned: false,
        }));
      },

      VENDOR: async (companyId) => {
        const vendors = await prisma.accountingVendor.findMany({ where: { companyId } });
        return vendors.map((v) => this.makeDoc({
          id: `vendor-${v.id}`,
          sourceType: "VENDOR",
          title: v.displayName,
          description: v.companyName ?? v.displayName,
          content: `${v.displayName} ${v.companyName ?? ""} ${v.email ?? ""} ${v.phone ?? ""}`,
          entityId: v.id,
          entityType: "VENDOR",
          companyId,
          tags: ["vendor", v.active ? "active" : "inactive"],
          metadata: { email: v.email, active: v.active },
          requiredPermissions: ["read:accounting"],
          businessImportance: 0.7,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          score: 0,
          pinned: false,
        }));
      },

      CUSTOMER: async (companyId) => {
        const customers = await prisma.accountingCustomer.findMany({ where: { companyId } });
        return customers.map((c) => this.makeDoc({
          id: `customer-${c.id}`,
          sourceType: "CUSTOMER",
          title: c.displayName,
          description: c.companyName ?? c.displayName,
          content: `${c.displayName} ${c.companyName ?? ""} ${c.email ?? ""} ${c.phone ?? ""}`,
          entityId: c.id,
          entityType: "CUSTOMER",
          companyId,
          tags: ["customer", c.active ? "active" : "inactive"],
          metadata: { email: c.email, active: c.active },
          requiredPermissions: ["read:accounting"],
          businessImportance: 0.7,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          score: 0,
          pinned: false,
        }));
      },

      WORKFLOW: async (companyId) => {
        const wfs = await prisma.workflowDefinition.findMany({ where: { companyId } });
        return wfs.map((w) => this.makeDoc({
          id: `workflow-${w.id}`,
          sourceType: "WORKFLOW",
          title: w.name,
          description: w.description ?? `${w.category} workflow`,
          content: `${w.name} ${w.description ?? ""} ${w.category} ${w.status}`,
          entityId: w.id,
          entityType: "WORKFLOW",
          companyId,
          tags: ["workflow", w.category, w.status.toLowerCase()],
          metadata: { category: w.category, status: w.status, version: w.version },
          requiredPermissions: ["read:workflows"],
          businessImportance: 0.8,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          score: 0,
          pinned: false,
        }));
      },

      WORKFLOW_INSTANCE: async (companyId) => {
        const instances = await prisma.workflowInstance.findMany({
          where: { companyId },
          orderBy: { createdAt: "desc" },
          take: 10_000,
        });
        return instances.map((inst) => this.makeDoc({
          id: `wf-instance-${inst.id}`,
          sourceType: "WORKFLOW_INSTANCE",
          title: `Workflow Instance ${inst.id.slice(0, 8)}`,
          description: `Status: ${inst.status}${inst.currentStepType ? ` | Current: ${inst.currentStepType}` : ""}`,
          content: `workflow instance ${inst.id} ${inst.status} ${inst.currentStepType ?? ""} ${inst.currentStepId ?? ""}`,
          entityId: inst.id,
          entityType: "WORKFLOW_INSTANCE",
          companyId,
          tags: ["workflow-instance", inst.status.toLowerCase()],
          metadata: { status: inst.status, currentStepType: inst.currentStepType, startedAt: inst.startedAt?.toISOString() },
          requiredPermissions: ["read:workflows"],
          businessImportance: 0.7,
          createdAt: inst.createdAt.toISOString(),
          updatedAt: (inst.completedAt ?? inst.createdAt).toISOString(),
          score: 0,
          pinned: false,
        }));
      },

      APPROVAL: async (companyId) => {
        const approvals = await prisma.transactionApproval.findMany({
          where: { companyId },
          orderBy: { approvedAt: "desc" },
          take: 10_000,
        });
        return approvals.map((a) => this.makeDoc({
          id: `approval-${a.id}`,
          sourceType: "APPROVAL",
          title: `Approval ${a.id.slice(0, 8)}`,
          description: `Level ${a.level} - ${a.status}${a.approvingUserId ? ` by ${a.approvingUserId.slice(0, 8)}` : ""}`,
          content: `approval ${a.id} ${a.status} level ${a.level} transaction ${a.transactionId}`,
          entityId: a.id,
          entityType: "APPROVAL",
          companyId,
          tags: ["approval", a.status.toLowerCase()],
          metadata: { status: a.status, level: a.level, transactionId: a.transactionId },
          requiredPermissions: ["read:approvals"],
          businessImportance: 0.9,
          createdAt: a.createdAt.toISOString(),
          updatedAt: (a.approvedAt ?? a.createdAt).toISOString(),
          score: 0,
          pinned: false,
        }));
      },

      POLICY: async (companyId) => {
        const policies = await prisma.policy.findMany({ where: { companyId } });
        return policies.map((p) => this.makeDoc({
          id: `policy-${p.id}`,
          sourceType: "POLICY",
          title: p.name,
          description: p.description ?? `${p.type} policy`,
          content: `${p.name} ${p.description ?? ""} ${p.type} ${p.actionType} ${p.appliesToTransactionTypes.join(" ")}`,
          entityId: p.id,
          entityType: "POLICY",
          companyId,
          tags: ["policy", p.type.toLowerCase(), p.actionType.toLowerCase()],
          metadata: { type: p.type, actionType: p.actionType, enabled: p.enabled, version: p.version },
          requiredPermissions: ["read:policies"],
          businessImportance: 1.0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          score: 0,
          pinned: false,
        }));
      },

      BUSINESS_RULE: async (companyId) => {
        const rules = await prisma.businessRuleDefinition.findMany({ where: { companyId } });
        return rules.map((r) => this.makeDoc({
          id: `rule-${r.id}`,
          sourceType: "BUSINESS_RULE",
          title: r.name,
          description: r.description + ` (${r.category})`,
          content: `${r.name} ${r.description} ${r.category}`,
          entityId: r.id,
          entityType: "BUSINESS_RULE",
          companyId,
          tags: ["business-rule", r.category],
          metadata: { category: r.category, priority: r.priority, isActive: r.isActive },
          requiredPermissions: ["read:automation"],
          businessImportance: 0.7,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          score: 0,
          pinned: false,
        }));
      },

      RISK: async (companyId) => {
        const alerts = await prisma.riskAlert.findMany({
          where: { companyId },
          orderBy: { createdAt: "desc" },
          take: 5_000,
        });
        return alerts.map((a) => this.makeDoc({
          id: `risk-${a.id}`,
          sourceType: "RISK",
          title: a.title,
          description: a.description ?? `${a.category} risk`,
          content: `${a.title} ${a.description ?? ""} ${a.category} ${a.severity} ${a.status}`,
          entityId: a.id,
          entityType: "RISK",
          companyId,
          tags: ["risk", a.category.toLowerCase(), a.severity.toLowerCase(), a.status.toLowerCase()],
          metadata: { severity: a.severity, category: a.category, status: a.status },
          requiredPermissions: ["read:risk"],
          businessImportance: 1.0,
          createdAt: a.createdAt.toISOString(),
          updatedAt: a.updatedAt.toISOString(),
          score: 0,
          pinned: false,
        }));
      },

      COMPLIANCE: async (companyId) => {
        const violations = await prisma.policyViolation.findMany({
          where: { companyId },
          orderBy: { createdAt: "desc" },
          take: 5_000,
        });
        return violations.map((v) => this.makeDoc({
          id: `compliance-${v.id}`,
          sourceType: "COMPLIANCE",
          title: v.title,
          description: v.description ?? `Policy violation (${v.severity})`,
          content: `${v.title} ${v.description ?? ""} ${v.severity} ${v.status} ${v.entityType ?? ""}`,
          entityId: v.id,
          entityType: "COMPLIANCE_ITEM",
          companyId,
          tags: ["compliance", v.severity.toLowerCase(), v.status.toLowerCase()],
          metadata: { severity: v.severity, status: v.status, policyId: v.policyId },
          requiredPermissions: ["read:compliance"],
          businessImportance: 1.0,
          createdAt: v.createdAt.toISOString(),
          updatedAt: v.updatedAt.toISOString(),
          score: 0,
          pinned: false,
        }));
      },

      REPORT: async (companyId) => {
        const reports = await prisma.readinessReport.findMany({
          where: { companyId },
          orderBy: { createdAt: "desc" },
          take: 1_000,
        });
        return reports.map((r) => this.makeDoc({
          id: `report-${r.id}`,
          sourceType: "REPORT",
          title: `Readiness Report ${r.createdAt.toISOString().slice(0, 10)}`,
          description: `Score: ${r.overallScore}/100 | ${r.passedChecks} passed, ${r.failedChecks} failed`,
          content: `readiness report score ${r.overallScore} passed ${r.passedChecks} failed ${r.failedChecks} ${
            r.suggestions.join(" ")
          }`,
          entityId: r.id,
          entityType: "REPORT",
          companyId,
          tags: ["report", "readiness"],
          metadata: { overallScore: r.overallScore, passedChecks: r.passedChecks, failedChecks: r.failedChecks },
          requiredPermissions: ["read:reports"],
          businessImportance: 0.6,
          createdAt: r.createdAt.toISOString(),
          updatedAt: r.createdAt.toISOString(),
          score: 0,
          pinned: false,
        }));
      },

      DASHBOARD: async (_companyId) => {
        return [];
      },

      AUDIT_LOG: async (companyId) => {
        const logs = await prisma.auditLog.findMany({
          where: { companyId },
          orderBy: { createdAt: "desc" },
          take: 10_000,
        });
        return logs.map((l) => this.makeDoc({
          id: `audit-${l.id}`,
          sourceType: "AUDIT_LOG",
          title: `${l.action} on ${l.resourceType}`,
          description: `${l.action} - ${l.resourceType}${l.resourceId ? `:${l.resourceId.slice(0, 8)}` : ""}`,
          content: `${l.action} ${l.resourceType} ${l.resourceId ?? ""} ${l.severity} ${l.actorUserId ?? ""}`,
          entityId: l.id,
          entityType: "AUDIT_EVENT",
          companyId,
          tags: ["audit", l.action.toLowerCase(), l.severity.toLowerCase()],
          metadata: { action: l.action, resourceType: l.resourceType, severity: l.severity, actorUserId: l.actorUserId },
          requiredPermissions: ["read:audit"],
          businessImportance: 0.5,
          createdAt: l.createdAt.toISOString(),
          updatedAt: l.createdAt.toISOString(),
          score: 0,
          pinned: false,
        }));
      },

      NOTIFICATION: async (companyId) => {
        const notifs = await prisma.notification.findMany({
          where: { companyId },
          orderBy: { createdAt: "desc" },
          take: 5_000,
        });
        return notifs.map((n) => this.makeDoc({
          id: `notif-${n.id}`,
          sourceType: "NOTIFICATION",
          title: n.title,
          description: n.message ?? n.title,
          content: `${n.title} ${n.message ?? ""} ${n.eventType}`,
          entityId: n.id,
          entityType: "NOTIFICATION",
          companyId,
          tags: ["notification", n.eventType.toLowerCase()],
          metadata: { eventType: n.eventType, read: n.read, link: n.link },
          requiredPermissions: ["read:notifications"],
          businessImportance: 0.4,
          createdAt: n.createdAt.toISOString(),
          updatedAt: n.createdAt.toISOString(),
          score: 0,
          pinned: false,
        }));
      },

      AUTOMATION_STUDIO: async (companyId) => {
        const templates = await prisma.automationTemplate.findMany({
          where: { companyId },
          take: 5_000,
        });
        return templates.map((t) => this.makeDoc({
          id: `auto-${t.id}`,
          sourceType: "AUTOMATION_STUDIO",
          title: t.name,
          description: t.description + ` (${t.category})`,
          content: `${t.name} ${t.description} ${t.category} ${t.triggerType} ${t.kind}`,
          entityId: t.id,
          entityType: "AUTOMATION",
          companyId,
          tags: ["automation", t.category, t.triggerType, t.kind],
          metadata: { category: t.category, triggerType: t.triggerType, kind: t.kind, status: t.status },
          requiredPermissions: ["read:automation"],
          businessImportance: 0.7,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          score: 0,
          pinned: false,
        }));
      },

      USER: async (companyId) => {
        const memberships = await prisma.companyMembership.findMany({
          where: { companyId },
          include: { user: { select: { id: true, name: true, email: true } } },
        });
        return memberships.map((m) => this.makeDoc({
          id: `user-${m.user.id}`,
          sourceType: "USER",
          title: m.user.name ?? m.user.email ?? m.user.id,
          description: `${m.role} - ${m.user.email ?? ""}`,
          content: `${m.user.name ?? ""} ${m.user.email ?? ""} ${m.role}`,
          entityId: m.user.id,
          entityType: "USER",
          companyId,
          tags: ["user", m.role.toLowerCase()],
          metadata: { email: m.user.email, role: m.role },
          requiredPermissions: ["read:users"],
          businessImportance: 0.6,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          score: 0,
          pinned: false,
        }));
      },

      ORGANIZATION: async (companyId) => {
        const orgs = await prisma.organizationUnit.findMany({ where: { companyId } });
        return orgs.map((o) => this.makeDoc({
          id: `org-${o.id}`,
          sourceType: "ORGANIZATION",
          title: o.name,
          description: o.parentId ? `Child of ${o.parentId}` : "Root unit",
          content: `${o.name} ${o.code ?? ""} ${o.parentId ?? ""}`,
          entityId: o.id,
          entityType: "ORGANIZATION",
          companyId,
          tags: ["organization", o.type.toLowerCase()],
          metadata: { code: o.code, parentId: o.parentId, type: o.type },
          requiredPermissions: ["read:organization"],
          businessImportance: 0.6,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          score: 0,
          pinned: false,
        }));
      },

      KNOWLEDGE_BASE: async (_companyId) => {
        return [];
      },

      DOCUMENT: async (_companyId) => {
        return [];
      },
    };

    return indexers[source] ?? null;
  }

  private makeDoc(data: SearchDocument): SearchDocument {
    return {
      ...data,
      description: data.description ?? "",
      content: data.content ?? "",
      tags: data.tags ?? [],
      metadata: data.metadata ?? {},
      requiredPermissions: data.requiredPermissions ?? [],
    };
  }
}

export const knowledgeIndexer = new KnowledgeIndexer();
