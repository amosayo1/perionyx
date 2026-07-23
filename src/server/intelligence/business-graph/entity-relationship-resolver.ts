import { prisma } from "@/server/db/prisma";
import type { GraphRelationship, EntityType, RelationshipType } from "./types";
import { businessRelationshipRegistry } from "./business-relationship-registry";

interface ResolvedRelationship {
  sourceType: EntityType;
  sourceId: string;
  targetType: EntityType;
  targetId: string;
  relationshipType: RelationshipType;
  label: string;
  metadata: Record<string, unknown>;
}

export class EntityRelationshipResolver {
  private static idCounter = 0;

  private nextId(companyId: string): string {
    EntityRelationshipResolver.idCounter++;
    return `rel-${companyId}-${Date.now()}-${EntityRelationshipResolver.idCounter}`;
  }

  private toGraphRelationship(
    resolved: ResolvedRelationship,
    companyId: string,
  ): GraphRelationship {
    const expiresAt = new Date(Date.now() + 86_400_000).toISOString();
    return {
      id: this.nextId(companyId),
      sourceType: resolved.sourceType,
      sourceId: resolved.sourceId,
      targetType: resolved.targetType,
      targetId: resolved.targetId,
      relationshipType: resolved.relationshipType,
      label: resolved.label,
      metadata: resolved.metadata,
      companyId,
      createdAt: new Date().toISOString(),
      expiresAt,
      auditRef: `graph-resolver-${companyId}-${Date.now()}`,
    };
  }

  async resolveForEntity(
    entityType: EntityType,
    entityId: string,
    companyId: string,
  ): Promise<GraphRelationship[]> {
    const rules = businessRelationshipRegistry.getAllRules();
    const results: GraphRelationship[] = [];

    for (const rule of rules) {
      if (rule.sourceType === entityType) {
        const resolved = await this.resolveOutgoing(entityType, entityId, companyId, rule);
        results.push(...resolved.map((r) => this.toGraphRelationship(r, companyId)));
      }
      if (rule.targetType === entityType) {
        const resolved = await this.resolveIncoming(entityType, entityId, companyId, rule);
        results.push(...resolved.map((r) => this.toGraphRelationship(r, companyId)));
      }
    }

    return results;
  }

  private async resolveOutgoing(
    sourceType: EntityType,
    sourceId: string,
    companyId: string,
    rule: { sourceType: EntityType; targetType: EntityType; relationshipType: RelationshipType },
  ): Promise<ResolvedRelationship[]> {
    const { sourceType: st, targetType: tt, relationshipType: rt } = rule;
    if (st !== sourceType) return [];

    const handler = this.getOutgoingHandler(st, tt, rt);
    if (!handler) return [];

    return handler(sourceId, companyId);
  }

  private async resolveIncoming(
    targetType: EntityType,
    targetId: string,
    companyId: string,
    rule: { sourceType: EntityType; targetType: EntityType; relationshipType: RelationshipType },
  ): Promise<ResolvedRelationship[]> {
    const { sourceType: st, targetType: tt, relationshipType: rt } = rule;
    if (tt !== targetType) return [];

    const handler = this.getIncomingHandler(st, tt, rt);
    if (!handler) return [];

    return handler(targetId, companyId);
  }

  private getOutgoingHandler(
    sourceType: EntityType,
    targetType: EntityType,
    relationshipType: RelationshipType,
  ): ((id: string, companyId: string) => Promise<ResolvedRelationship[]>) | null {
    const key = `${sourceType}:${targetType}:${relationshipType}`;

    const handlers: Record<string, (id: string, companyId: string) => Promise<ResolvedRelationship[]>> = {
      // PAYMENT → APPROVAL (Transaction → TransactionApproval)
      "PAYMENT:APPROVAL:TRIGGERS": async (id, _c) => {
        const approvals = await prisma.transactionApproval.findMany({ where: { transactionId: id } });
        return approvals.map((a) => ({
          sourceType: "PAYMENT" as EntityType, sourceId: id,
          targetType: "APPROVAL" as EntityType, targetId: a.id,
          relationshipType: "TRIGGERS" as RelationshipType,
          label: `Triggers approval (level ${a.level})`,
          metadata: { status: a.status, level: a.level },
        }));
      },
      // APPROVAL → PAYMENT (TransactionApproval → Transaction)
      "APPROVAL:PAYMENT:APPROVES": async (id, _c) => {
        const approval = await prisma.transactionApproval.findUnique({ where: { id } });
        if (!approval) return [];
        return [{
          sourceType: "APPROVAL" as EntityType, sourceId: id,
          targetType: "PAYMENT" as EntityType, targetId: approval.transactionId,
          relationshipType: "APPROVES" as RelationshipType,
          label: `Approves payment`,
          metadata: { status: approval.status, level: approval.level },
        }];
      },
      // PAYMENT → USER (Transaction → createdBy User)
      "PAYMENT:USER:OWNED_BY": async (id, _c) => {
        const tx = await prisma.transaction.findUnique({ where: { id }, select: { createdByUserId: true } });
        if (!tx?.createdByUserId) return [];
        return [{
          sourceType: "PAYMENT" as EntityType, sourceId: id,
          targetType: "USER" as EntityType, targetId: tx.createdByUserId,
          relationshipType: "OWNED_BY" as RelationshipType,
          label: "Owned by user",
          metadata: {},
        }];
      },
      // WORKFLOW_INSTANCE → PAYMENT
      "WORKFLOW_INSTANCE:PAYMENT:REFERENCES": async (id, _c) => {
        const instance = await prisma.workflowInstance.findUnique({ where: { id }, select: { input: true, metadata: true } });
        if (!instance) return [];
        const refs = this.extractEntityRefs(instance.input, instance.metadata, "Transaction", "transactionId");
        return refs.map((ref) => ({
          sourceType: "WORKFLOW_INSTANCE" as EntityType, sourceId: id,
          targetType: "PAYMENT" as EntityType, targetId: ref,
          relationshipType: "REFERENCES" as RelationshipType,
          label: "References payment",
          metadata: {},
        }));
      },
      // WORKFLOW → WORKFLOW_INSTANCE
      "WORKFLOW:WORKFLOW_INSTANCE:GENERATED_BY": async (id, companyId) => {
        const instances = await prisma.workflowInstance.findMany({ where: { definitionId: id, companyId } });
        return instances.map((inst) => ({
          sourceType: "WORKFLOW" as EntityType, sourceId: id,
          targetType: "WORKFLOW_INSTANCE" as EntityType, targetId: inst.id,
          relationshipType: "GENERATED_BY" as RelationshipType,
          label: `Generated instance (${inst.status})`,
          metadata: { status: inst.status, startedAt: inst.startedAt?.toISOString() },
        }));
      },
      // POLICY → PAYMENT (PolicyViolation → entityId where entityType=Transaction)
      "POLICY:PAYMENT:COMPLIES_WITH": async (id, companyId) => {
        const violations = await prisma.policyViolation.findMany({
          where: { policyId: id, companyId, entityType: "Transaction" },
        });
        return violations.map((v) => ({
          sourceType: "POLICY" as EntityType, sourceId: id,
          targetType: "PAYMENT" as EntityType, targetId: v.entityId ?? "unknown",
          relationshipType: "COMPLIES_WITH" as RelationshipType,
          label: `Governs payment (${v.status})`,
          metadata: { severity: v.severity, status: v.status, violationId: v.id },
        }));
      },
      // PAYMENT → POLICY
      "PAYMENT:POLICY:VIOLATES": async (id, companyId) => {
        const violations = await prisma.policyViolation.findMany({
          where: { companyId, entityType: "Transaction", entityId: id },
        });
        return violations.map((v) => ({
          sourceType: "PAYMENT" as EntityType, sourceId: id,
          targetType: "POLICY" as EntityType, targetId: v.policyId ?? "unknown",
          relationshipType: "VIOLATES" as RelationshipType,
          label: `Violates policy (${v.severity})`,
          metadata: { severity: v.severity, status: v.status, violationId: v.id },
        }));
      },
      // RISK → PAYMENT
      "RISK:PAYMENT:RELATED_TO": async (id, companyId) => {
        const alert = await prisma.riskAlert.findUnique({ where: { id } });
        if (!alert) return [];
        if (alert.resourceType === "Transaction" && alert.resourceId) {
          return [{
            sourceType: "RISK" as EntityType, sourceId: id,
            targetType: "PAYMENT" as EntityType, targetId: alert.resourceId,
            relationshipType: "RELATED_TO" as RelationshipType,
            label: `Risk related to payment (${alert.category})`,
            metadata: { severity: alert.severity, category: alert.category },
          }];
        }
        return [];
      },
      // USER → ROLE
      "USER:ROLE:INHERITED_FROM": async (id, companyId) => {
        const userRoles = await prisma.userRole.findMany({
          where: { userId: id, companyId },
          include: { role: { select: { id: true, name: true } } },
        });
        return userRoles.map((ur) => ({
          sourceType: "USER" as EntityType, sourceId: id,
          targetType: "ROLE" as EntityType, targetId: ur.roleId,
          relationshipType: "INHERITED_FROM" as RelationshipType,
          label: `Has role ${ur.role.name}`,
          metadata: { roleName: ur.role.name },
        }));
      },
      // COMPLIANCE_ITEM → POLICY
      "COMPLIANCE_ITEM:POLICY:REFERENCES": async (id, companyId) => {
        const violation = await prisma.policyViolation.findUnique({ where: { id } });
        if (!violation?.policyId) return [];
        return [{
          sourceType: "COMPLIANCE_ITEM" as EntityType, sourceId: id,
          targetType: "POLICY" as EntityType, targetId: violation.policyId,
          relationshipType: "REFERENCES" as RelationshipType,
          label: "References policy",
          metadata: { severity: violation.severity },
        }];
      },
      // APPROVAL → USER (escalates to)
      "APPROVAL:USER:ESCALATES_TO": async (id, _c) => {
        const approval = await prisma.transactionApproval.findUnique({ where: { id } });
        if (!approval?.approvingUserId) return [];
        return [{
          sourceType: "APPROVAL" as EntityType, sourceId: id,
          targetType: "USER" as EntityType, targetId: approval.approvingUserId,
          relationshipType: "ESCALATES_TO" as RelationshipType,
          label: "Escalates to user",
          metadata: { status: approval.status, level: approval.level },
        }];
      },
      // AUDIT_EVENT → PAYMENT
      "AUDIT_EVENT:PAYMENT:REFERENCES": async (id, companyId) => {
        const log = await prisma.auditLog.findUnique({ where: { id } });
        if (!log) return [];
        if (log.resourceType === "Transaction" && log.resourceId) {
          return [{
            sourceType: "AUDIT_EVENT" as EntityType, sourceId: id,
            targetType: "PAYMENT" as EntityType, targetId: log.resourceId,
            relationshipType: "REFERENCES" as RelationshipType,
            label: "Audit references payment",
            metadata: { action: log.action, severity: log.severity },
          }];
        }
        return [];
      },
      // AUDIT_EVENT → USER
      "AUDIT_EVENT:USER:REFERENCES": async (id, _c) => {
        const log = await prisma.auditLog.findUnique({ where: { id } });
        if (!log?.actorUserId) return [];
        return [{
          sourceType: "AUDIT_EVENT" as EntityType, sourceId: id,
          targetType: "USER" as EntityType, targetId: log.actorUserId,
          relationshipType: "REFERENCES" as RelationshipType,
          label: "Audit references user",
          metadata: { action: log.action },
        }];
      },
      // AUDIT_EVENT → WORKFLOW_INSTANCE
      "AUDIT_EVENT:WORKFLOW_INSTANCE:REFERENCES": async (id, _c) => {
        const log = await prisma.auditLog.findUnique({ where: { id } });
        if (!log) return [];
        if (log.resourceType === "WorkflowInstance" && log.resourceId) {
          return [{
            sourceType: "AUDIT_EVENT" as EntityType, sourceId: id,
            targetType: "WORKFLOW_INSTANCE" as EntityType, targetId: log.resourceId,
            relationshipType: "REFERENCES" as RelationshipType,
            label: "Audit references workflow instance",
            metadata: { action: log.action },
          }];
        }
        return [];
      },
      // AUDIT_EVENT → APPROVAL
      "AUDIT_EVENT:APPROVAL:REFERENCES": async (id, _c) => {
        const log = await prisma.auditLog.findUnique({ where: { id } });
        if (!log) return [];
        if (log.resourceType === "TransactionApproval" && log.resourceId) {
          return [{
            sourceType: "AUDIT_EVENT" as EntityType, sourceId: id,
            targetType: "APPROVAL" as EntityType, targetId: log.resourceId,
            relationshipType: "REFERENCES" as RelationshipType,
            label: "Audit references approval",
            metadata: { action: log.action },
          }];
        }
        return [];
      },
      // NOTIFICATION → PAYMENT
      "NOTIFICATION:PAYMENT:RELATED_TO": async (id, companyId) => {
        const notif = await prisma.notification.findUnique({ where: { id } });
        if (!notif?.metadata) return [];
        const meta = notif.metadata as Record<string, unknown> | null;
        const txId = (meta as { transactionId?: string } | null)?.transactionId;
        if (!txId) return [];
        return [{
          sourceType: "NOTIFICATION" as EntityType, sourceId: id,
          targetType: "PAYMENT" as EntityType, targetId: txId,
          relationshipType: "RELATED_TO" as RelationshipType,
          label: "Notification about payment",
          metadata: { eventType: notif.eventType },
        }];
      },
      // NOTIFICATION → APPROVAL
      "NOTIFICATION:APPROVAL:RELATED_TO": async (id, companyId) => {
        const notif = await prisma.notification.findUnique({ where: { id } });
        if (!notif?.metadata) return [];
        const meta = notif.metadata as Record<string, unknown> | null;
        const approvalId = (meta as { approvalId?: string } | null)?.approvalId;
        if (!approvalId) return [];
        return [{
          sourceType: "NOTIFICATION" as EntityType, sourceId: id,
          targetType: "APPROVAL" as EntityType, targetId: approvalId,
          relationshipType: "RELATED_TO" as RelationshipType,
          label: "Notification about approval",
          metadata: { eventType: notif.eventType },
        }];
      },
      // TREASURY_ACCOUNT → PAYMENT
      "TREASURY_ACCOUNT:PAYMENT:REFERENCES": async (id, companyId) => {
        const transfers = await prisma.internalTransfer.findMany({
          where: { OR: [{ fromAccountId: id }, { toAccountId: id }], companyId },
        });
        return transfers.map((t) => ({
          sourceType: "TREASURY_ACCOUNT" as EntityType, sourceId: id,
          targetType: "PAYMENT" as EntityType, targetId: t.id,
          relationshipType: "REFERENCES" as RelationshipType,
          label: t.fromAccountId === id ? "Source of transfer" : "Destination of transfer",
          metadata: { amount: t.amount.toString(), status: t.status, direction: t.fromAccountId === id ? "outgoing" : "incoming" },
        }));
      },
      // PAYMENT → TREASURY_ACCOUNT
      "PAYMENT:TREASURY_ACCOUNT:RELATED_TO": async (id, companyId) => {
        const transfer = await prisma.internalTransfer.findUnique({ where: { id } });
        if (!transfer) return [];
        return [{
          sourceType: "PAYMENT" as EntityType, sourceId: id,
          targetType: "TREASURY_ACCOUNT" as EntityType, targetId: transfer.toAccountId,
          relationshipType: "RELATED_TO" as RelationshipType,
          label: "Payment to account",
          metadata: { amount: transfer.amount.toString(), status: transfer.status },
        }, {
          sourceType: "PAYMENT" as EntityType, sourceId: id,
          targetType: "TREASURY_ACCOUNT" as EntityType, targetId: transfer.fromAccountId,
          relationshipType: "RELATED_TO" as RelationshipType,
          label: "Payment from account",
          metadata: { amount: transfer.amount.toString(), status: transfer.status },
        }];
      },
      // WORKFLOW_INSTANCE → WORKFLOW
      "WORKFLOW_INSTANCE:WORKFLOW:REFERENCES": async (id, _c) => {
        const instance = await prisma.workflowInstance.findUnique({ where: { id }, select: { definitionId: true } });
        if (!instance) return [];
        return [{
          sourceType: "WORKFLOW_INSTANCE" as EntityType, sourceId: id,
          targetType: "WORKFLOW" as EntityType, targetId: instance.definitionId,
          relationshipType: "REFERENCES" as RelationshipType,
          label: "References workflow definition",
          metadata: {},
        }];
      },
      // WORKFLOW_INSTANCE → USER
      "WORKFLOW_INSTANCE:USER:OWNED_BY": async (id, _c) => {
        const instance = await prisma.workflowInstance.findUnique({ where: { id }, select: { initiatedById: true } });
        if (!instance?.initiatedById) return [];
        return [{
          sourceType: "WORKFLOW_INSTANCE" as EntityType, sourceId: id,
          targetType: "USER" as EntityType, targetId: instance.initiatedById,
          relationshipType: "OWNED_BY" as RelationshipType,
          label: "Initiated by user",
          metadata: {},
        }];
      },
      // DASHBOARD → REPORT
      "DASHBOARD:REPORT:REFERENCES": async (_id, _c) => {
        // Dashboards are composed dynamically; no direct Prisma model
        return [];
      },
    };

    return handlers[key] ?? null;
  }

  private getIncomingHandler(
    sourceType: EntityType,
    targetType: EntityType,
    _relationshipType: RelationshipType,
  ): ((id: string, companyId: string) => Promise<ResolvedRelationship[]>) | null {
    const key = `${sourceType}:${targetType}`;

    const handlers: Record<string, (id: string, companyId: string) => Promise<ResolvedRelationship[]>> = {
      // APPROVAL → PAYMENT inverse (PAYMENT → APPROVAL handled via TRIGGERS outgoing + APPROVES incoming)
      "APPROVAL:PAYMENT": async (paymentId, _c) => {
        const approvals = await prisma.transactionApproval.findMany({ where: { transactionId: paymentId } });
        return approvals.map((a) => ({
          sourceType: "PAYMENT" as EntityType, sourceId: paymentId,
          targetType: "APPROVAL" as EntityType, targetId: a.id,
          relationshipType: "APPROVES" as RelationshipType,
          label: `Approves payment (level ${a.level})`,
          metadata: { status: a.status, level: a.level },
        }));
      },
      // USER → PAYMENT (USER creates PAYMENT)
      "USER:PAYMENT": async (userId, companyId) => {
        const transactions = await prisma.transaction.findMany({
          where: { createdByUserId: userId, companyId },
          take: 50,
        });
        return transactions.map((t) => ({
          sourceType: "PAYMENT" as EntityType, sourceId: t.id,
          targetType: "USER" as EntityType, targetId: userId,
          relationshipType: "OWNED_BY" as RelationshipType,
          label: `Payment created by user`,
          metadata: { amount: t.primaryAmount.toString(), status: t.status },
        }));
      },
      // POLICY → PAYMENT inverse (COMPLIES_WITH reverse)
      "POLICY:PAYMENT": async (paymentId, companyId) => {
        // Find policies that this payment violates
        const violations = await prisma.policyViolation.findMany({
          where: { companyId, entityType: "Transaction", entityId: paymentId },
        });
        return violations.map((v) => ({
          sourceType: "PAYMENT" as EntityType, sourceId: paymentId,
          targetType: "POLICY" as EntityType, targetId: v.policyId ?? "unknown",
          relationshipType: "COMPLIES_WITH" as RelationshipType,
          label: "Governed by policy",
          metadata: { severity: v.severity, violationId: v.id },
        }));
      },
      // WORKFLOW_INSTANCE → WORKFLOW inverse (GENERATED_BY reverse)
      "WORKFLOW_INSTANCE:WORKFLOW": async (wfId, companyId) => {
        const definitions = await prisma.workflowDefinition.findMany({
          where: { id: wfId, companyId },
        });
        return definitions.map((d) => ({
          sourceType: "WORKFLOW" as EntityType, sourceId: d.id,
          targetType: "WORKFLOW_INSTANCE" as EntityType, targetId: wfId,
          relationshipType: "GENERATED_BY" as RelationshipType,
          label: `Generated by ${d.name}`,
          metadata: { definitionName: d.name },
        }));
      },
      // ROLE → USER inverse (INHERITED_FROM reverse)
      "ROLE:USER": async (roleId, companyId) => {
        const userRoles = await prisma.userRole.findMany({
          where: { roleId, companyId },
          include: { user: { select: { id: true, name: true } } },
        });
        return userRoles.map((ur) => ({
          sourceType: "ROLE" as EntityType, sourceId: roleId,
          targetType: "USER" as EntityType, targetId: ur.userId,
          relationshipType: "INHERITED_FROM" as RelationshipType,
          label: `Assigned to ${ur.user.name ?? ur.userId}`,
          metadata: { userName: ur.user.name },
        }));
      },
    };

    return handlers[key] ?? null;
  }

  private extractEntityRefs(
    input: unknown,
    metadata: unknown,
    expectedType: string,
    fieldName: string,
  ): string[] {
    const refs: string[] = [];
    const scan = (obj: Record<string, unknown>) => {
      if (obj.resourceType === expectedType && typeof obj.resourceId === "string") {
        refs.push(obj.resourceId);
      }
      if (typeof obj[fieldName] === "string") {
        refs.push(obj[fieldName] as string);
      }
    };
    if (input && typeof input === "object") scan(input as Record<string, unknown>);
    if (metadata && typeof metadata === "object") scan(metadata as Record<string, unknown>);
    return refs;
  }
}

export const entityRelationshipResolver = new EntityRelationshipResolver();
