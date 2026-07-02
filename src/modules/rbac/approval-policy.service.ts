/** Manages approval rules with CRUD, ordering, and validation. */

import { Prisma } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import { ValidationError, ForbiddenError, ConflictError } from "@/lib/errors/app-error";
import { rbacService, RBACService } from "./rbac.service";

export interface CreateRuleInput {
  name: string;
  description?: string;
  priority: number;
  scope: string;
  scopeId?: string;
  minAmount: number;
  maxAmount?: number;
  applicableTransactionTypes: string[];
  applicableConnectorTypes?: string[];
  requiredApprovalsCount: number;
  sequentialApproval?: boolean;
  dualApprovalRequired?: boolean;
  escalationTimeoutHours?: number;
  autoEscalateAfterHours?: number;
  requiresComplianceReview?: boolean;
  expiresAt?: Date;
  conditions?: Array<{
    fieldName: string;
    operator: string;
    value: string;
  }>;
  approvalSteps?: Array<{
    stepNumber: number;
    roleRequired: string;
    approvalCount: number;
    timeoutHours?: number;
  }>;
}

export interface UpdateRuleInput extends Partial<CreateRuleInput> {
  id: string;
}

export class ApprovalPolicyService {
  /**
   * Create a new approval rule with validation and audit logging.
   */
  static async createRule(
    companyId: string,
    userId: string,
    input: CreateRuleInput
  ) {
    await rbacService.ensurePermission(userId, companyId, "admin.manage_authorities");

    const existing = await prisma.approvalRule.findUnique({
      where: { companyId_name: { companyId, name: input.name } },
    });

    if (existing) {
      throw new ConflictError(`Rule "${input.name}" already exists in this company`);
    }

    if (input.approvalSteps && input.approvalSteps.length === 0) {
      throw new ValidationError("At least one approval step is required");
    }

    const rule = await prisma.approvalRule.create({
      data: {
        companyId,
        name: input.name,
        description: input.description,
        priority: input.priority,
        scope: input.scope as any,
        scopeId: input.scopeId,
        minAmount: new Prisma.Decimal(input.minAmount),
        maxAmount: input.maxAmount ? new Prisma.Decimal(input.maxAmount) : null,
        applicableTransactionTypes: input.applicableTransactionTypes,
        applicableConnectorTypes: input.applicableConnectorTypes || [],
        requiredApprovalsCount: input.requiredApprovalsCount,
        sequentialApproval: input.sequentialApproval ?? false,
        dualApprovalRequired: input.dualApprovalRequired ?? false,
        escalationTimeoutHours: input.escalationTimeoutHours,
        autoEscalateAfterHours: input.autoEscalateAfterHours,
        requiresComplianceReview: input.requiresComplianceReview ?? false,
        expiresAt: input.expiresAt,
        createdByUserId: userId,
        updatedByUserId: userId,

        // Create nested conditions
        conditions: input.conditions
          ? {
              createMany: {
                data: input.conditions.map((cond) => ({
                  fieldName: cond.fieldName,
                  operator: cond.operator as any,
                  value: cond.value,
                })),
              },
            }
          : undefined,

        // Create nested approval steps
        approvalSteps: input.approvalSteps
          ? {
              createMany: {
                data: input.approvalSteps,
              },
            }
          : undefined,
      },
      include: {
        conditions: true,
        approvalSteps: true,
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        companyId,
        actorUserId: userId,
        action: "RULE_CREATED",
        resourceType: "ApprovalRule",
        resourceId: rule.id,
        severity: "INFO",
        metadata: { ruleName: rule.name, priority: rule.priority },
      },
    });

    return rule;
  }

  /**
   * Update an existing approval rule.
   */
  static async updateRule(
    companyId: string,
    userId: string,
    input: UpdateRuleInput
  ) {
    // Permission check
    await rbacService.ensurePermission(userId, companyId, "admin.manage_authorities");

    const { id, ...updateData } = input;

    // Fetch current rule
    const currentRule = await prisma.approvalRule.findUnique({
      where: { id },
    });

    if (!currentRule || currentRule.companyId !== companyId) {
      throw new ForbiddenError("Rule not found or access denied");
    }

    // Check for name conflicts
    if (updateData.name && updateData.name !== currentRule.name) {
      const existing = await prisma.approvalRule.findUnique({
        where: { companyId_name: { companyId, name: updateData.name } },
      });

      if (existing) {
        throw new ConflictError(`Rule "${updateData.name}" already exists`);
      }
    }

    // Build update data with decimal conversion
    const updatePayload: any = {
      name: updateData.name,
      description: updateData.description,
      priority: updateData.priority,
      scope: updateData.scope,
      scopeId: updateData.scopeId,
      minAmount: updateData.minAmount ? new Prisma.Decimal(updateData.minAmount) : undefined,
      maxAmount: updateData.maxAmount ? new Prisma.Decimal(updateData.maxAmount) : null,
      applicableTransactionTypes: updateData.applicableTransactionTypes,
      applicableConnectorTypes: updateData.applicableConnectorTypes,
      requiredApprovalsCount: updateData.requiredApprovalsCount,
      sequentialApproval: updateData.sequentialApproval,
      dualApprovalRequired: updateData.dualApprovalRequired,
      escalationTimeoutHours: updateData.escalationTimeoutHours,
      autoEscalateAfterHours: updateData.autoEscalateAfterHours,
      requiresComplianceReview: updateData.requiresComplianceReview,
      expiresAt: updateData.expiresAt,
      updatedByUserId: userId,
    };

    // Remove undefined values
    Object.keys(updatePayload).forEach(
      (key) => updatePayload[key] === undefined && delete updatePayload[key]
    );

    // Update conditions if provided
    if (updateData.conditions !== undefined) {
      await prisma.approvalCondition.deleteMany({ where: { ruleId: id } });
      if (updateData.conditions.length > 0) {
        await prisma.approvalCondition.createMany({
          data: updateData.conditions.map((cond) => ({
            ruleId: id,
            fieldName: cond.fieldName,
            operator: cond.operator as any,
            value: cond.value,
          })),
        });
      }
    }

    // Update approval steps if provided
    if (updateData.approvalSteps !== undefined) {
      await prisma.approvalStep.deleteMany({ where: { ruleId: id } });
      if (updateData.approvalSteps.length > 0) {
        await prisma.approvalStep.createMany({
          data: updateData.approvalSteps.map((step) => ({
            ruleId: id,
            stepNumber: step.stepNumber,
            roleRequired: step.roleRequired,
            approvalCount: step.approvalCount,
            timeoutHours: step.timeoutHours,
          })),
        });
      }
    }

    // Update rule
    const updatedRule = await prisma.approvalRule.update({
      where: { id },
      data: updatePayload,
      include: {
        conditions: true,
        approvalSteps: true,
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        companyId,
        actorUserId: userId,
        action: "RULE_UPDATED",
        resourceType: "ApprovalRule",
        resourceId: id,
        severity: "INFO",
        metadata: {
          ruleName: updatedRule.name,
          changes: Object.keys(updatePayload),
        },
      },
    });

    return updatedRule;
  }

  /**
   * Delete an approval rule.
   */
  static async deleteRule(
    companyId: string,
    userId: string,
    ruleId: string
  ) {
    // Permission check
    await rbacService.ensurePermission(userId, companyId, "admin.manage_authorities");

    const rule = await prisma.approvalRule.findUnique({
      where: { id: ruleId },
    });

    if (!rule || rule.companyId !== companyId) {
      throw new ForbiddenError("Rule not found or access denied");
    }

    // Delete rule (cascade deletes conditions and steps)
    await prisma.approvalRule.delete({
      where: { id: ruleId },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        companyId,
        actorUserId: userId,
        action: "RULE_DELETED",
        resourceType: "ApprovalRule",
        resourceId: ruleId,
        severity: "WARNING",
        metadata: { ruleName: rule.name },
      },
    });
  }

  /**
   * Get all approval rules for a company.
   */
  static async getRulesForCompany(companyId: string) {
    return prisma.approvalRule.findMany({
      where: { companyId },
      include: {
        conditions: true,
        approvalSteps: {
          orderBy: { stepNumber: "asc" },
        },
        createdBy: { select: { id: true, email: true, name: true } },
        updatedBy: { select: { id: true, email: true, name: true } },
      },
      orderBy: [{ priority: "asc" }, { createdAt: "desc" }],
    });
  }

  /**
   * Get a single rule by ID.
   */
  static async getRuleById(companyId: string, ruleId: string) {
    const rule = await prisma.approvalRule.findUnique({
      where: { id: ruleId },
      include: {
        conditions: true,
        approvalSteps: {
          orderBy: { stepNumber: "asc" },
        },
        createdBy: { select: { id: true, email: true, name: true } },
        updatedBy: { select: { id: true, email: true, name: true } },
      },
    });

    if (!rule || rule.companyId !== companyId) {
      throw new ForbiddenError("Rule not found or access denied");
    }

    return rule;
  }

  /**
   * Toggle rule enabled/disabled status.
   */
  static async toggleRuleStatus(
    companyId: string,
    userId: string,
    ruleId: string,
    enabled: boolean
  ) {
    // Permission check
    await rbacService.ensurePermission(userId, companyId, "admin.manage_authorities");

    const rule = await prisma.approvalRule.findUnique({
      where: { id: ruleId },
    });

    if (!rule || rule.companyId !== companyId) {
      throw new ForbiddenError("Rule not found or access denied");
    }

    const updated = await prisma.approvalRule.update({
      where: { id: ruleId },
      data: {
        enabled,
        updatedByUserId: userId,
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        companyId,
        actorUserId: userId,
        action: enabled ? "RULE_ENABLED" : "RULE_DISABLED",
        resourceType: "ApprovalRule",
        resourceId: ruleId,
        severity: "INFO",
        metadata: { ruleName: rule.name },
      },
    });

    return updated;
  }

  /**
   * Get rule audit history.
   */
  static async getRuleAuditHistory(companyId: string, ruleId: string) {
    return prisma.auditLog.findMany({
      where: {
        companyId,
        resourceType: "ApprovalRule",
        resourceId: ruleId,
      },
      include: {
        actor: { select: { id: true, email: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
  }
}
