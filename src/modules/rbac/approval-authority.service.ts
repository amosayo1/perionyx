/** Manages approver role assignments and scoping. */

import { prisma } from "@/server/db/prisma";
import { Prisma } from "@prisma/client";
import { ValidationError, ForbiddenError } from "@/lib/errors/app-error";
import { rbacService, RBACService } from "./rbac.service";

export interface ApprovalAuthorityConfig {
  companyId: string;
  roleId: string;
  name: string;
  description?: string;
  scopeType: "GLOBAL" | "WALLET" | "TRANSACTION_TYPE";
  scopeId?: string;
  minAmount?: Prisma.Decimal;
  maxAmount?: Prisma.Decimal;
  requiresDualApproval?: boolean;
  enabled?: boolean;
}

export class ApprovalAuthorityService {
  /**
   * Assign an approver role with optional scope and thresholds.
   */
  static async assignApproverRole(config: ApprovalAuthorityConfig) {
    const role = await prisma.role.findUnique({ where: { id: config.roleId } });
    if (!role || role.companyId !== config.companyId) {
      throw new ValidationError("Role not found for company");
    }

    await rbacService.addPermissionToRole(config.roleId, "transaction.approve");

    return prisma.approvalAuthority.upsert({
      where: {
        companyId_roleId_scopeType_scopeId: {
          companyId: config.companyId,
          roleId: config.roleId,
          scopeType: config.scopeType,
          scopeId: config.scopeId ?? null,
        },
      } as any,
      update: {
        name: config.name,
        description: config.description,
        minAmount: config.minAmount,
        maxAmount: config.maxAmount,
        requiresDualApproval: config.requiresDualApproval ?? false,
        enabled: config.enabled ?? true,
      },
      create: {
        companyId: config.companyId,
        roleId: config.roleId,
        name: config.name,
        description: config.description,
        scopeType: config.scopeType,
        scopeId: config.scopeId ?? null,
        minAmount: config.minAmount,
        maxAmount: config.maxAmount,
        requiresDualApproval: config.requiresDualApproval ?? false,
        enabled: config.enabled ?? true,
      },
      include: { role: true },
    });
  }

  /**
   * Get all approval authorities for a company.
   */
  static async getAuthoritiesForCompany(companyId: string) {
    return prisma.approvalAuthority.findMany({
      where: { companyId, enabled: true },
      include: { role: true },
      orderBy: [{ scopeType: "asc" }, { minAmount: "asc" }],
    });
  }

  /**
   * Get approval authorities for a specific scope (e.g., wallet, transaction type).
   */
  static async getAuthoritiesForScope(
    companyId: string,
    scopeType: "GLOBAL" | "WALLET" | "TRANSACTION_TYPE",
    scopeId?: string,
  ) {
    return prisma.approvalAuthority.findMany({
      where: {
        companyId,
        enabled: true,
        scopeType: { in: ["GLOBAL", scopeType] },
        OR: [{ scopeId: null }, { scopeId: scopeId }],
      },
      include: { role: { include: { userRoles: true } } },
      orderBy: { minAmount: "asc" },
    });
  }

  /**
   * Check if a user has approval authority for a specific action.
   */
  static async userHasApprovalAuthority(
    userId: string,
    companyId: string,
    amount: Prisma.Decimal,
    transactionType?: string,
    walletId?: string,
  ): Promise<boolean> {
    // Get user's roles
    const userRoles = await prisma.userRole.findMany({
      where: { userId, companyId },
      include: { role: { include: { approvalAuthorities: true } } },
    });

    const userRoleIds = userRoles.map((ur) => ur.roleId);

    // Find applicable authorities
    const applicableAuthorities = await prisma.approvalAuthority.findMany({
      where: {
        companyId,
        enabled: true,
        roleId: { in: userRoleIds },
        AND: [
          {
            OR: [
              { minAmount: null },
              { minAmount: { lte: amount } },
            ],
          },
          {
            OR: [
              { maxAmount: null },
              { maxAmount: { gte: amount } },
            ],
          },
        ],
      },
    });

    if (applicableAuthorities.length === 0) return false;

    // Check scope matching
    for (const authority of applicableAuthorities) {
      if (authority.scopeType === "GLOBAL") return true;

      if (authority.scopeType === "WALLET" && walletId && authority.scopeId === walletId) {
        return true;
      }

      if (authority.scopeType === "TRANSACTION_TYPE" && transactionType && authority.scopeId === transactionType) {
        return true;
      }
    }

    return false;
  }

  /**
   * Get the list of users who can approve a transaction.
   */
  static async getApproversForTransaction(
    companyId: string,
    amount: Prisma.Decimal,
    transactionType?: string,
    walletId?: string,
  ) {
    const authorities = await this.getAuthoritiesForScope(companyId, "TRANSACTION_TYPE", transactionType);

    const approverUserIds = new Set<string>();

    for (const authority of authorities) {
      if (authority.minAmount && amount.lessThan(authority.minAmount)) continue;
      if (authority.maxAmount && amount.greaterThan(authority.maxAmount)) continue;

      if (authority.scopeType === "GLOBAL" || authority.scopeType === "TRANSACTION_TYPE") {
        for (const ur of authority.role.userRoles) {
          approverUserIds.add(ur.userId);
        }
      }
    }

    // Wallet-scoped authorities
    if (walletId) {
      const walletAuthorities = await prisma.approvalAuthority.findMany({
        where: {
          companyId,
          enabled: true,
          scopeType: "WALLET",
          scopeId: walletId,
        },
        include: { role: { include: { userRoles: true } } },
      });

      for (const authority of walletAuthorities) {
        if (authority.minAmount && amount.lessThan(authority.minAmount)) continue;
        if (authority.maxAmount && amount.greaterThan(authority.maxAmount)) continue;

        for (const ur of authority.role.userRoles) {
          approverUserIds.add(ur.userId);
        }
      }
    }

    // Fetch user details
    return prisma.user.findMany({
      where: { id: { in: Array.from(approverUserIds) } },
      select: { id: true, email: true, name: true },
    });
  }

  /**
   * Disable an approval authority.
   */
  static async disableApprovalAuthority(companyId: string, authorityId: string) {
    const authority = await prisma.approvalAuthority.findUnique({ where: { id: authorityId } });
    if (!authority || authority.companyId !== companyId) {
      throw new ValidationError("Approval authority not found");
    }

    return prisma.approvalAuthority.update({
      where: { id: authorityId },
      data: { enabled: false },
    });
  }

  /**
   * Get dual-approval requirements for a transaction.
   */
  static async getDualApprovalRequirement(
    companyId: string,
    amount: Prisma.Decimal,
    transactionType?: string,
  ) {
    const authorities = await prisma.approvalAuthority.findMany({
      where: {
        companyId,
        enabled: true,
        requiresDualApproval: true,
        AND: [
          { OR: [{ minAmount: null }, { minAmount: { lte: amount } }] },
          { OR: [{ maxAmount: null }, { maxAmount: { gte: amount } }] },
        ],
      },
    });

    return authorities.length > 0;
  }
}

export default ApprovalAuthorityService;
