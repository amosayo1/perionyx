import { Prisma, TransactionStatus, TransactionType } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import { track } from "./db";

let seq = 0;
function tag(name: string): string {
  seq++;
  return `test-${name}-${Date.now()}-${seq}-${Math.random().toString(36).slice(2, 6)}`;
}

export async function createCompany(overrides?: Partial<{
  name: string;
  slug: string;
  legalName: string;
  entityType: string;
  verificationStatus: string;
}>) {
  const slug = overrides?.slug ?? tag("co");
  const company = await prisma.company.create({
    data: {
      name: overrides?.name ?? `Test Company ${slug}`,
      slug,
      legalName: overrides?.legalName ?? null,
      entityType: overrides?.entityType ?? null,
      verificationStatus: overrides?.verificationStatus ?? "UNVERIFIED",
    },
  });
  track("company", company.id);
  return company;
}

export async function createWallet(
  companyId: string,
  overrides?: Partial<{
    name: string;
    kind: "STANDARD" | "SYSTEM_CLEARING";
    currency: string;
    balance: Prisma.Decimal | number | string;
    version: number;
  }>,
) {
  const name = overrides?.name ?? tag("wallet");
  const wallet = await prisma.wallet.create({
    data: {
      companyId,
      name,
      kind: overrides?.kind ?? "STANDARD",
      currency: overrides?.currency ?? "USD",
      balance: new Prisma.Decimal(overrides?.balance ?? 0),
      version: overrides?.version ?? 0,
    },
  });
  track("wallet", wallet.id);
  return wallet;
}

export async function createTransaction(
  companyId: string,
  overrides?: Partial<{
    type: TransactionType;
    status: TransactionStatus;
    primaryAmount: Prisma.Decimal | number | string;
    currency: string;
    reference: string;
    idempotencyKey: string;
    metadata: Record<string, unknown>;
    createdByUserId: string;
  }>,
) {
  const txn = await prisma.transaction.create({
    data: {
      companyId,
      type: overrides?.type ?? TransactionType.INTERNAL_TRANSFER,
      status: overrides?.status ?? TransactionStatus.COMPLETED,
      primaryAmount: new Prisma.Decimal(overrides?.primaryAmount ?? 100),
      currency: overrides?.currency ?? "USD",
      reference: overrides?.reference ?? null,
      idempotencyKey: overrides?.idempotencyKey ?? null,
      metadata: (overrides?.metadata ?? null) as any,
      createdByUserId: overrides?.createdByUserId ?? null,
    },
  });
  track("transaction", txn.id);
  return txn;
}

export async function createLedgerEntry(
  companyId: string,
  transactionId: string,
  walletId: string,
  overrides?: Partial<{
    side: "DEBIT" | "CREDIT";
    amount: Prisma.Decimal | number | string;
    currency: string;
    sequence: number;
  }>,
) {
  const entry = await prisma.ledgerEntry.create({
    data: {
      companyId,
      transactionId,
      walletId,
      side: overrides?.side ?? "DEBIT",
      amount: new Prisma.Decimal(overrides?.amount ?? 100),
      currency: overrides?.currency ?? "USD",
      sequence: overrides?.sequence ?? 0,
    },
  });
  track("ledgerEntry", entry.id);
  return entry;
}

export async function createClearingWallet(companyId: string, currency = "USD") {
  return createWallet(companyId, {
    name: `${currency} Clearing`,
    kind: "SYSTEM_CLEARING",
    currency,
  });
}

export async function createUser(overrides?: Partial<{
  name: string;
  email: string;
}>) {
  const email = overrides?.email ?? tag("user") + "@test.com";
  const user = await prisma.user.create({
    data: {
      name: overrides?.name ?? `Test User ${email}`,
      email,
    },
  });
  track("user", user.id);
  return user;
}

export async function createMembership(
  userId: string,
  companyId: string,
  role: "OWNER" | "ADMIN" | "TREASURER" | "MEMBER" | "VIEWER" = "OWNER",
) {
  const membership = await prisma.companyMembership.create({
    data: { userId, companyId, role },
  });
  track("companyMembership", membership.id);
  return membership;
}

export async function makeBalancedLedger(
  companyId: string,
  transactionId: string,
  fromWalletId: string,
  toWalletId: string,
  amount: Prisma.Decimal | number | string,
  currency = "USD",
) {
  const d = new Prisma.Decimal(amount);
  return Promise.all([
    createLedgerEntry(companyId, transactionId, fromWalletId, { side: "DEBIT", amount: d, currency, sequence: 0 }),
    createLedgerEntry(companyId, transactionId, toWalletId, { side: "CREDIT", amount: d, currency, sequence: 1 }),
  ]);
}
