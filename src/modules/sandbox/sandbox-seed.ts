import { prisma } from "@/server/db/prisma";
import { createPasswordUser } from "@/modules/users/users.service";
import { createCompanyWithOwner } from "@/modules/companies/companies.service";
import { rbacService } from "@/modules/rbac/rbac.service";
import { SANDBOX_EMAIL, deriveSandboxPassword, SANDBOX_COMPANY_SLUG, SANDBOX_COMPANY_NAME, clearSandboxCache } from "./sandbox-context";
import { generateEnterpriseData } from "./sandbox-enterprise-seed";

const SANDBOX_PERMISSIONS = [
  "transactions.transfer",
  "transactions.credit",
  "transactions.debit",
  "transactions.reverse",
  "approvals.approve",
  "approvals.reject",
  "approvals.escalate",
  "webhooks.manage",
  "reconciliation.run",
  "treasury.manage",
  "policies.manage",
  "risk.manage",
  "connectors.manage",
];

export async function ensureSandboxTenant(): Promise<{ userId: string; companyId: string }> {
  let user = await prisma.user.findUnique({ where: { email: SANDBOX_EMAIL } });
  if (!user) {
    user = await createPasswordUser({ email: SANDBOX_EMAIL, password: deriveSandboxPassword(), name: "Karim Al-Mansoori" });
  }

  let company = await prisma.company.findUnique({ where: { slug: SANDBOX_COMPANY_SLUG } });
  if (!company) {
    company = await createCompanyWithOwner({ name: SANDBOX_COMPANY_NAME, slug: SANDBOX_COMPANY_SLUG, ownerUserId: user.id });
    await prisma.company.update({ where: { id: company.id }, data: { sandbox: true } });
    await ensureUserMembership(user.id, company.id);
    await generateEnterpriseData(user.id, company.id);
  } else {
    const existingLicense = await prisma.license.findUnique({ where: { companyId: company.id } });
    if (!existingLicense) {
      await prisma.transaction.deleteMany({ where: { companyId: company.id } });
      await generateEnterpriseData(user.id, company.id);
    }
  }

  // Ensure sandbox roles have all current permissions (handles upgrades from older seeds)
  await syncSandboxPermissions(company.id);

  clearSandboxCache(company.id);
  return { userId: user.id, companyId: company.id };
}

async function syncSandboxPermissions(companyId: string) {
  const roles = await prisma.role.findMany({ where: { companyId } });
  for (const role of roles) {
    for (const perm of SANDBOX_PERMISSIONS) {
      await rbacService.addPermissionToRole(role.id, perm, "GLOBAL");
    }
  }
}

async function ensureUserMembership(userId: string, companyId: string): Promise<void> {
  const existing = await prisma.companyMembership.findUnique({
    where: { userId_companyId: { userId, companyId } },
  });
  if (!existing) {
    await prisma.companyMembership.create({
      data: { userId, companyId, role: "ADMIN" },
    });
  }
}
