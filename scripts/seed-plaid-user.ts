import "dotenv/config";
import { createCompanyWithOwner } from "../src/modules/companies/companies.service";
import { createPasswordUser } from "../src/modules/users/users.service";
import { prisma } from "../src/server/db/prisma";
import { generateEnterpriseData } from "../src/modules/sandbox/sandbox-enterprise-seed";

const EMAIL = "karim@plaidtest.com";
const PASSWORD = "TestPlaid1234";
const NAME = "Karim Al-Mansoori";
const COMPANY_NAME = "Plaid Test Corp";
const COMPANY_SLUG = "plaid-test-corp";

async function main() {
  let user = await prisma.user.findUnique({ where: { email: EMAIL } });
  if (!user) {
    user = await createPasswordUser({ email: EMAIL, password: PASSWORD, name: NAME });
    console.log("Created user:", user.email);
  } else {
    console.log("User already exists:", user.email);
  }

  let company = await prisma.company.findUnique({ where: { slug: COMPANY_SLUG } });
  if (!company) {
    company = await createCompanyWithOwner({ name: COMPANY_NAME, slug: COMPANY_SLUG, ownerUserId: user.id });
    await prisma.company.update({ where: { id: company.id }, data: { sandbox: false } });
    console.log("Created company:", company.name, "(sandbox: false)");
  } else {
    console.log("Company already exists:", company.name);
  }

  // Ensure user is a member
  const membership = await prisma.companyMembership.findFirst({
    where: { userId: user.id, companyId: company.id },
  });
  if (!membership) {
    await prisma.companyMembership.create({
      data: { userId: user.id, companyId: company.id, role: "OWNER" },
    });
    console.log("Added membership");
  }

  // Seed enterprise data (accounts, wallets, etc.)
  const existingAccounts = await prisma.treasuryAccount.count({ where: { companyId: company.id } });
  if (existingAccounts === 0) {
    await generateEnterpriseData(user.id, company.id);
    console.log("Seeded enterprise data");
  } else {
    console.log("Enterprise data already exists");
  }

  console.log("\nLogin with:");
  console.log("  Email:", EMAIL);
  console.log("  Password:", PASSWORD);
  console.log("  Company:", COMPANY_NAME);
  console.log("\nPlaid will use real sandbox API (not mock) for this account.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
