import "dotenv/config";
import { prisma } from "@/server/db/prisma";
import { rbacService, RBACService } from "@/modules/rbac/rbac.service";

async function main() {
  const demoEmail = process.env.SEED_USER_EMAIL ?? "founder@demo.perionyx.local";
  const user = await prisma.user.findUnique({ where: { email: demoEmail } });
  if (!user) throw new Error("Demo user not found; run prisma/seed.ts first");

  const DEMO_COMPANY_SLUG = process.env.SEED_COMPANY_SLUG ?? "demo-company";
  const company = await prisma.company.findUnique({ where: { slug: DEMO_COMPANY_SLUG } });
  if (!company) throw new Error("Demo company not found; run prisma/seed.ts first");

  console.log("Company:", company.slug, company.id);

  const hasTransfer = await rbacService.userHasPermission(user.id, company.id, "transactions.transfer");
  console.log("User has transactions.transfer:", hasTransfer);

  const roles = await rbacService.getUserRoles(user.id, company.id);
  console.log("User roles:", roles.map((r) => r.role.name));

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  prisma.$disconnect();
  process.exit(1);
});
