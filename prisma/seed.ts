import "dotenv/config";
import { createCompanyWithOwner } from "../src/modules/companies/companies.service";
import { createPasswordUser } from "../src/modules/users/users.service";
import { prisma } from "../src/server/db/prisma";
import { rbacService } from "../src/modules/rbac/rbac.service";
import { SecretStoreFactory } from '../src/modules/secrets/secret-store';
import crypto from 'crypto';

const DEMO_EMAIL = process.env.SEED_USER_EMAIL ?? "founder@demo.perionyx.local";
const DEMO_PASSWORD = process.env.SEED_USER_PASSWORD ?? "password12345";
const DEMO_COMPANY_SLUG = process.env.SEED_COMPANY_SLUG ?? "demo-company";

async function main() {
  let user = await prisma.user.findUnique({ where: { email: DEMO_EMAIL } });
  if (!user) {
    user = await createPasswordUser({
      email: DEMO_EMAIL,
      password: DEMO_PASSWORD,
      name: "Demo Founder",
    });
  }

  const existingCompany = await prisma.company.findUnique({
    where: { slug: DEMO_COMPANY_SLUG },
  });
  if (!existingCompany) {
    await createCompanyWithOwner({
      name: "Demo Company",
      slug: DEMO_COMPANY_SLUG,
      ownerUserId: user.id,
    });
  }

  // Seed default roles and permissions for the demo company
  const company = await prisma.company.findUnique({ where: { slug: DEMO_COMPANY_SLUG } });
  if (company) {
    const perms = [
      "transactions.transfer",
      "transactions.credit",
      "transactions.debit",
      "transactions.reverse",
      "approvals.approve",
      "approvals.reject",
      "approvals.escalate",
      "admin.manage_roles",
      "webhooks.manage",
    ];

    for (const p of perms) {
      await rbacService.upsertPermission(p);
    }

    // Create roles
    const ownerRole = await prisma.role.upsert({
      where: { companyId_name: { companyId: company.id, name: "OWNER" } as any },
      create: { companyId: company.id, name: "OWNER", description: "Company owner with all permissions" },
      update: { description: "Company owner with all permissions" },
    });

    const adminRole = await prisma.role.upsert({
      where: { companyId_name: { companyId: company.id, name: "ADMIN" } as any },
      create: { companyId: company.id, name: "ADMIN", description: "Admin role with elevated permissions" },
      update: { description: "Admin role with elevated permissions" },
    });

    const treasurerRole = await prisma.role.upsert({
      where: { companyId_name: { companyId: company.id, name: "TREASURER" } as any },
      create: { companyId: company.id, name: "TREASURER", description: "Treasurer role for transaction operations" },
      update: { description: "Treasurer role for transaction operations" },
    });

    // Attach permissions to roles
    for (const p of perms) {
      await rbacService.addPermissionToRole(ownerRole.id, p);
    }

    // ADMIN: allow most operations except destructive RBAC management
    const adminPerms = perms.filter((x) => x !== "admin.manage_roles");
    for (const p of adminPerms) {
      await rbacService.addPermissionToRole(adminRole.id, p);
    }

    // TREASURER: transaction related permissions
    const treasurerPerms = ["transactions.transfer", "transactions.credit", "transactions.debit", "approvals.approve", "approvals.reject"];
    for (const p of treasurerPerms) {
      await rbacService.addPermissionToRole(treasurerRole.id, p);
    }

    // Assign owner user to OWNER role
    await rbacService.assignRoleToUser(user.id, ownerRole.id, company.id);

    // Create a sample webhook if WEBHOOK_URL is provided
    const webhookUrl = process.env.WEBHOOK_URL;
    if (webhookUrl) {
      await prisma.webhook.upsert({
        where: { companyId_name: { companyId: company.id, name: "Demo Transaction Webhook" } as any },
        create: { companyId: company.id, name: "Demo Transaction Webhook", url: webhookUrl, events: ["transaction.created"], active: true },
        update: { url: webhookUrl, active: true },
      });
      // seed webhook secret into secret store if not provided via env
      try {
        const store = SecretStoreFactory();
        if (!process.env.WEBHOOK_SECRET) {
          const secret = crypto.randomBytes(32).toString('hex');
          await store.setSecret('webhook.secret', secret);
          console.log('Seeded webhook secret into secret store');
        }
      } catch (e) {
        // ignore secret store errors in seed
      }
    }
    // Create a demo connector config (mock)
    await prisma.connectorConfig.upsert({
      where: { companyId_name: { companyId: company.id, name: 'Demo Mock Connector' } as any },
      create: { companyId: company.id, name: 'Demo Mock Connector', type: 'mock', config: {}, active: true },
      update: { config: {}, active: true },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
