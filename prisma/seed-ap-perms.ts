import "dotenv/config";
import { prisma } from "../src/server/db/prisma";

const AP_PERMISSIONS = [
  "ap.vendors.create", "ap.vendors.view", "ap.vendors.manage", "ap.vendors.approve", "ap.vendors.delete",
  "ap.invoices.create", "ap.invoices.view", "ap.invoices.manage", "ap.invoices.approve", "ap.invoices.delete", "ap.invoices.match",
  "ap.exceptions.view", "ap.exceptions.manage", "ap.exceptions.assign", "ap.exceptions.resolve",
  "ap.approvals.view", "ap.approvals.approve", "ap.approvals.reject", "ap.approvals.delegate", "ap.approvals.escalate",
  "ap.payments.view", "ap.payments.create", "ap.payments.execute", "ap.payments.approve", "ap.payments.reverse",
  "ap.reconciliation.view", "ap.reconciliation.execute", "ap.reconciliation.adjust",
  "ap.credits.view", "ap.credits.create", "ap.credits.apply", "ap.credits.void",
  "ap.reports.view", "ap.reports.export", "ap.admin.manage",
];

async function main() {
  console.log("🔧 Adding AP permissions...");

  const company = await prisma.company.findUnique({ where: { slug: "demo-company" } });
  if (!company) { console.error("No demo company"); process.exit(1); }

  const ownerRole = await prisma.role.findFirst({ where: { companyId: company.id, name: "OWNER" } });
  if (!ownerRole) { console.error("No OWNER role"); process.exit(1); }

  let added = 0;
  for (const permName of AP_PERMISSIONS) {
    // Upsert permission
    const perm = await prisma.permission.upsert({
      where: { name: permName },
      create: { name: permName, description: `AP permission: ${permName}` },
      update: {},
    });

    // Link to OWNER role
    const existing = await prisma.rolePermission.findFirst({
      where: { roleId: ownerRole.id, permissionId: perm.id, scopeType: "GLOBAL" },
    });
    if (!existing) {
      await prisma.rolePermission.create({
        data: { roleId: ownerRole.id, permissionId: perm.id, scopeType: "GLOBAL" },
      });
      added++;
    }
  }
  console.log(`  Added ${added} AP permissions to OWNER role`);
  console.log("✅ Done!");
}

main().catch(console.error);
