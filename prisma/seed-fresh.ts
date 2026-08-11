import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const DEMO_EMAIL = process.env.SEED_USER_EMAIL ?? "founder@demo.perionyx.local";
const DEMO_PASSWORD = process.env.SEED_USER_PASSWORD ?? "password12345";
const DEMO_COMPANY_SLUG = process.env.SEED_COMPANY_SLUG ?? "demo-company";

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL not set");

  const adapter = new PrismaPg({ connectionString });
  const prisma = new PrismaClient({ adapter });
  await prisma.$connect();

  console.log("Connected to database");

  // 1. Create user
  let user = await prisma.user.findUnique({ where: { email: DEMO_EMAIL } });
  if (!user) {
    // bcrypt hash of "password12345" with cost 12
    const bcrypt = await import("bcryptjs");
    const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12);
    user = await prisma.user.create({
      data: {
        email: DEMO_EMAIL,
        name: "Demo Founder",
        passwordHash,
      },
    });
    console.log(`Created user: ${user.email} (${user.id})`);
  } else {
    console.log(`User already exists: ${user.email}`);
  }

  // 2. Create company
  let company = await prisma.company.findUnique({ where: { slug: DEMO_COMPANY_SLUG } });
  if (!company) {
    company = await prisma.company.create({
      data: {
        name: "Demo Company",
        slug: DEMO_COMPANY_SLUG,
      },
    });
    console.log(`Created company: ${company.name} (${company.id})`);

    // Create membership
    await prisma.companyMembership.create({
      data: {
        userId: user.id,
        companyId: company.id,
        role: "OWNER",
      },
    });

    // Create SYSTEM_CLEARING wallet
    await prisma.wallet.create({
      data: {
        companyId: company.id,
        name: "System Clearing",
        currency: "USD",
        kind: "SYSTEM_CLEARING",
      },
    });

    // Create permissions
    const perms = [
      "transactions.transfer", "transactions.credit", "transactions.debit", "transactions.reverse",
      "approvals.approve", "approvals.reject", "approvals.escalate",
      "admin.manage_roles", "webhooks.manage", "reconciliation.run", "treasury.manage",
      "policies.manage", "risk.manage", "connectors.manage",
      "ap.vendors.create", "ap.vendors.view", "ap.vendors.manage", "ap.vendors.approve", "ap.vendors.delete",
      "ap.invoices.create", "ap.invoices.view", "ap.invoices.manage", "ap.invoices.approve", "ap.invoices.delete", "ap.invoices.match",
      "ap.exceptions.view", "ap.exceptions.manage", "ap.exceptions.assign", "ap.exceptions.resolve",
      "ap.approvals.view", "ap.approvals.approve", "ap.approvals.reject", "ap.approvals.delegate", "ap.approvals.escalate",
      "ap.payments.view", "ap.payments.create", "ap.payments.execute", "ap.payments.approve", "ap.payments.reverse",
      "ap.reconciliation.view", "ap.reconciliation.execute", "ap.reconciliation.adjust",
      "ap.credits.view", "ap.credits.create", "ap.credits.apply", "ap.credits.void",
      "ap.reports.view", "ap.reports.export", "ap.admin.manage",
    ];

    for (const p of perms) {
      await prisma.permission.upsert({
        where: { name: p },
        create: { name: p },
        update: {},
      });
    }

    // Create roles
    const ownerRole = await prisma.role.create({
      data: { companyId: company.id, name: "OWNER", description: "Company owner" },
    });
    const adminRole = await prisma.role.create({
      data: { companyId: company.id, name: "ADMIN", description: "Admin" },
    });
    const treasurerRole = await prisma.role.create({
      data: { companyId: company.id, name: "TREASURER", description: "Treasurer" },
    });

    // Attach permissions to OWNER
    const allPerms = await prisma.permission.findMany({ where: { name: { in: perms } } });
    for (const perm of allPerms) {
      await prisma.rolePermission.create({
        data: { roleId: ownerRole.id, permissionId: perm.id },
      });
    }

    // ADMIN: most perms except admin.manage_roles
    const adminPerms = allPerms.filter(p => p.name !== "admin.manage_roles");
    for (const perm of adminPerms) {
      await prisma.rolePermission.create({
        data: { roleId: adminRole.id, permissionId: perm.id },
      });
    }

    // TREASURER: transaction perms only
    const treasPerms = allPerms.filter(p =>
      ["transactions.transfer", "transactions.credit", "transactions.debit", "approvals.approve", "approvals.reject"].includes(p.name)
    );
    for (const perm of treasPerms) {
      await prisma.rolePermission.create({
        data: { roleId: treasurerRole.id, permissionId: perm.id },
      });
    }

    // Assign OWNER role to user
    await prisma.userRole.create({
      data: { userId: user.id, roleId: ownerRole.id, companyId: company.id },
    });

    // Create default approval rule
    await prisma.approvalMatrixRule.create({
      data: {
        companyId: company.id,
        name: "Default Approval",
        description: "All transactions require CFO approval",
        priority: 100,
        conditions: JSON.stringify([]),
        requiredApprovers: 1,
        approverRoles: ["ADMIN", "TREASURER"],
        approvalMode: "sequential",
        thresholdField: "amount",
        thresholdOperator: "gte",
        thresholdValue: 0,
        createdByUserId: user.id,
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        companyId: company.id,
        actorUserId: user.id,
        action: "COMPANY_CREATED",
        resourceType: "Company",
        resourceId: company.id,
        metadata: { name: company.name, slug: company.slug },
      },
    });

    console.log(`Seeded company with ${allPerms.length} permissions, 3 roles, wallet, approval rule`);
  } else {
    console.log(`Company already exists: ${company.name}`);
  }

  // Check users count
  const userCount = await prisma.user.count();
  const companyCount = await prisma.company.count();
  console.log(`\nDatabase: ${userCount} users, ${companyCount} companies`);
  console.log(`\nReady! Sign in with:`);
  console.log(`  Email: ${DEMO_EMAIL}`);
  console.log(`  Password: ${DEMO_PASSWORD}`);

  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error("Seed failed:", e);
  process.exit(1);
});
