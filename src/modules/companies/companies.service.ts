import type { CompanyRole } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import { recordAudit } from "@/modules/audit/audit.service";
import { AuditAction } from "@/domain/constants/audit-actions";
import { DEFAULT_LEDGER_CURRENCY } from "@/domain/constants/currencies";
import { rbacService, RBACService } from "@/modules/rbac/rbac.service";

const DEFAULT_PERMISSIONS = [
  "transactions.transfer",
  "transactions.credit",
  "transactions.debit",
  "transactions.reverse",
  "approvals.approve",
  "approvals.reject",
  "approvals.escalate",
  "admin.manage_roles",
  "webhooks.manage",
  "reconciliation.run",
  "treasury.manage",
  "policies.manage",
  "risk.manage",
  "connectors.manage",
];

export async function listCompaniesForUser(userId: string) {
  return prisma.companyMembership.findMany({
    where: { userId },
    include: { company: true },
    orderBy: { company: { name: "asc" } },
  });
}

export async function getCompanyMembershipForUser(companyId: string, userId: string) {
  return prisma.companyMembership.findFirst({
    where: { userId, companyId },
    include: { company: true },
  });
}

async function seedDefaultRoles(tx: any, companyId: string, ownerUserId: string) {
  for (const p of DEFAULT_PERMISSIONS) {
    await tx.permission.upsert({
      where: { name: p },
      create: { name: p, description: `Permission for ${p}` },
      update: {},
    });
  }

  const ownerRole = await tx.role.create({
    data: { companyId, name: "OWNER", description: "Company owner with all permissions" },
  });
  const adminRole = await tx.role.create({
    data: { companyId, name: "ADMIN", description: "Admin role with elevated permissions" },
  });
  const treasurerRole = await tx.role.create({
    data: { companyId, name: "TREASURER", description: "Treasurer role for transaction operations" },
  });

  const allPerms = await tx.permission.findMany({ where: { name: { in: DEFAULT_PERMISSIONS } } });
  const permMap = new Map(allPerms.map((p: any) => [p.name, p.id]));

  for (const [roleId, perms] of [[ownerRole.id, DEFAULT_PERMISSIONS], [adminRole.id, DEFAULT_PERMISSIONS.filter((x) => x !== "admin.manage_roles")], [treasurerRole.id, ["transactions.transfer", "transactions.credit", "transactions.debit", "approvals.approve", "approvals.reject", "reconciliation.run", "treasury.manage"]]] as const) {
    for (const p of perms) {
      const permId = permMap.get(p);
      if (!permId) continue;
      const existing = await tx.rolePermission.findFirst({
        where: { roleId, permissionId: permId, scopeType: "GLOBAL", scopeId: null },
      });
      if (!existing) {
        await tx.rolePermission.create({
          data: { roleId, permissionId: permId, scopeType: "GLOBAL" },
        });
      }
    }
  }

  const existingAssignment = await tx.userRole.findFirst({
    where: { userId: ownerUserId, roleId: ownerRole.id, companyId },
  });
  if (!existingAssignment) {
    await tx.userRole.create({
      data: { userId: ownerUserId, roleId: ownerRole.id, companyId },
    });
  }
}

async function seedDefaultApprovalRule(tx: any, companyId: string, userId: string) {
  const existing = await tx.approvalRule.findFirst({ where: { companyId } });
  if (existing) return;
  await tx.approvalRule.create({
    data: {
      companyId,
      name: "Standard Approval",
      description: "Default rule: all transactions over $1,000 require TREASURER approval",
      priority: 100,
      scope: "GLOBAL",
      minAmount: 1000,
      applicableTransactionTypes: ["WALLET_CREDIT", "WALLET_DEBIT", "INTERNAL_TRANSFER"],
      requiredApprovalsCount: 1,
      sequentialApproval: false,
      dualApprovalRequired: false,
      requiresComplianceReview: false,
      enabled: true,
      createdByUserId: userId,
      updatedByUserId: userId,
      approvalSteps: {
        create: [{ stepNumber: 1, roleRequired: "TREASURER", approvalCount: 1 }],
      },
    },
  });
}

export async function createCompanyWithOwner(input: {
  name: string;
  slug: string;
  ownerUserId: string;
  ownerRole?: CompanyRole;
}) {
  const role = input.ownerRole ?? "OWNER";
  return prisma.$transaction(async (tx) => {
    const company = await tx.company.create({
      data: { name: input.name, slug: input.slug },
    });
    await tx.companyMembership.create({
      data: {
        userId: input.ownerUserId,
        companyId: company.id,
        role,
      },
    });
    const clearing = await tx.wallet.create({
      data: {
        companyId: company.id,
        kind: "SYSTEM_CLEARING",
        name: `System clearing (${DEFAULT_LEDGER_CURRENCY})`,
        currency: DEFAULT_LEDGER_CURRENCY,
      },
    });

    await seedDefaultRoles(tx, company.id, input.ownerUserId);
    await seedDefaultApprovalRule(tx, company.id, input.ownerUserId);

    await recordAudit(tx, {
      companyId: company.id,
      actorUserId: input.ownerUserId,
      action: AuditAction.COMPANY_CREATE,
      resourceType: "Company",
      resourceId: company.id,
      metadata: { name: company.name, slug: company.slug },
    });
    await recordAudit(tx, {
      companyId: company.id,
      actorUserId: input.ownerUserId,
      action: AuditAction.WALLET_CREATE,
      resourceType: "Wallet",
      resourceId: clearing.id,
      metadata: {
        kind: "SYSTEM_CLEARING",
        currency: clearing.currency,
        name: clearing.name,
      },
    });
    return company;
  });
}

export async function getCompanyByIdForUser(companyId: string, userId: string) {
  const row = await getCompanyMembershipForUser(companyId, userId);
  return row?.company ?? null;
}

export async function updateCompany(
  companyId: string,
  userId: string,
  data: {
    legalName?: string | null;
    ein?: string | null;
    jurisdiction?: string | null;
    entityType?: string | null;
    incorporationDate?: string | null;
    address?: string | null;
    industry?: string | null;
    baseCurrency?: string | null;
    fiscalYearStart?: string | null;
    timezone?: string | null;
    logoUrl?: string | null;
    brandColor?: string | null;
    brandName?: string | null;
  },
) {
  const row = await getCompanyMembershipForUser(companyId, userId);
  if (!row) return null;

  return prisma.$transaction(async (tx) => {
    const company = await tx.company.update({
      where: { id: companyId },
      data: {
        legalName: data.legalName ?? undefined,
        ein: data.ein ?? undefined,
        jurisdiction: data.jurisdiction ?? undefined,
        entityType: data.entityType ?? undefined,
        incorporationDate: data.incorporationDate ? new Date(data.incorporationDate) : undefined,
        address: data.address ?? undefined,
        industry: data.industry ?? undefined,
        baseCurrency: data.baseCurrency ?? undefined,
        fiscalYearStart: data.fiscalYearStart ?? undefined,
        timezone: data.timezone ?? undefined,
        logoUrl: data.logoUrl ?? undefined,
        brandColor: data.brandColor ?? undefined,
        brandName: data.brandName ?? undefined,
      },
    });

    await recordAudit(tx, {
      companyId,
      actorUserId: userId,
      action: AuditAction.COMPANY_UPDATE,
      resourceType: "Company",
      resourceId: companyId,
      metadata: data,
    });

    return company;
  });
}
