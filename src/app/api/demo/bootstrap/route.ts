import crypto from "crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/server/db/prisma";
import { createPasswordUser } from "@/modules/users/users.service";
import { createCompanyWithOwner } from "@/modules/companies/companies.service";
import { TreasuryService } from "@/modules/treasury";
import { PolicyEngineService } from "@/modules/policies";
import { riskService, RiskService } from "@/modules/risk";
import { CalendarService } from "@/modules/calendar";
import { ConnectorRunService } from "@/modules/connectors";
import { notificationService, NotificationService } from "@/modules/notifications";
import { rateLimit, rateLimitKey } from "@/server/security/rate-limit";
import { logger } from "@/lib/logger";

const DEMO_EMAIL = "demo@perionyx.dev";

function generateSecurePassword(): string {
  const bytes = crypto.randomBytes(24);
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%";
  let password = "";
  for (let i = 0; i < 24; i++) {
    password += chars[bytes[i] % chars.length];
  }
  return password;
}

async function seedDemoData(userId: string, companyId: string) {
  // Create wallets
  const opsWallet = await prisma.wallet.create({
    data: { companyId, name: "Operations", currency: "USD", balance: 250000, kind: "STANDARD" },
  });
  const reserveWallet = await prisma.wallet.create({
    data: { companyId, name: "Reserve", currency: "USD", balance: 500000, kind: "STANDARD" },
  });
  const payrollWallet = await prisma.wallet.create({
    data: { companyId, name: "Payroll", currency: "USD", balance: 75000, kind: "STANDARD" },
  });
  const eurWallet = await prisma.wallet.create({
    data: { companyId, name: "EUR Operations", currency: "EUR", balance: 100000, kind: "STANDARD" },
  });
  const clearingWallet = await prisma.wallet.findFirst({
    where: { companyId, kind: "SYSTEM_CLEARING" },
  });

  // Create completed transactions
  for (let i = 0; i < 12; i++) {
    const date = new Date(Date.now() - (i * 86400000 * 2));
    const amount = Math.round(Math.random() * 50000 * 100) / 100;
    try {
      await prisma.transaction.create({
        data: {
          companyId, type: "WALLET_CREDIT", status: "COMPLETED",
          primaryAmount: amount, currency: "USD",
          reference: `Inbound wire #${1000 + i}`,
          metadata: { source: `Client Payment ${i + 1}` },
          createdByUserId: userId,
          createdAt: date,
        },
      });
      // Create ledger entries for this transaction
      const tx = await prisma.transaction.findFirst({
        where: { companyId, reference: `Inbound wire #${1000 + i}` },
        orderBy: { createdAt: "desc" },
      });
      if (tx && clearingWallet) {
        await prisma.ledgerEntry.createMany({
          data: [
            { companyId, transactionId: tx.id, walletId: clearingWallet.id, side: "DEBIT", amount, currency: "USD", sequence: 0 },
            { companyId, transactionId: tx.id, walletId: opsWallet.id, side: "CREDIT", amount, currency: "USD", sequence: 1 },
          ],
        });
      }
    } catch { /* skip duplicates */ }
  }

  // Create a few completed transfers
  await Promise.all([
    prisma.transaction.create({
      data: {
        companyId, type: "INTERNAL_TRANSFER", status: "COMPLETED",
        primaryAmount: 50000, currency: "USD",
        reference: "Monthly reserve allocation",
        createdByUserId: userId,
      },
    }),
    prisma.transaction.create({
      data: {
        companyId, type: "INTERNAL_TRANSFER", status: "COMPLETED",
        primaryAmount: 25000, currency: "USD",
        reference: "Payroll funding",
        createdByUserId: userId,
      },
    }),
    prisma.transaction.create({
      data: {
        companyId, type: "INTERNAL_TRANSFER", status: "PENDING",
        primaryAmount: 100000, currency: "USD",
        reference: "Pending investment transfer",
        createdByUserId: userId,
      },
    }),
  ]);

  const internalTxns = await prisma.transaction.findMany({
    where: { companyId, type: "INTERNAL_TRANSFER" },
    orderBy: { createdAt: "desc" },
    take: 3,
  });
  for (const tx of internalTxns) {
    await prisma.ledgerEntry.createMany({
      data: [
        { companyId, transactionId: tx.id, walletId: opsWallet.id, side: "DEBIT", amount: tx.primaryAmount, currency: "USD", sequence: 0 },
        { companyId, transactionId: tx.id, walletId: reserveWallet.id, side: "CREDIT", amount: tx.primaryAmount, currency: "USD", sequence: 1 },
      ],
    });
  }

  // Create treasury accounts
  const checkingAcct = await TreasuryService.createAccount({ userId, companyId, role: "OWNER" as any }, {
    name: "Chase Business Checking", currency: "USD",
    description: "Main operating account", accountNumber: "****1234",
  });
  const savingsAcct = await TreasuryService.createAccount({ userId, companyId, role: "OWNER" as any }, {
    name: "Chase Business Savings", currency: "USD",
    description: "Reserve account", accountNumber: "****5678",
  });
  const eurAcct = await TreasuryService.createAccount({ userId, companyId, role: "OWNER" as any }, {
    name: "HSBC EUR Account", currency: "EUR",
    description: "European operations", accountNumber: "****9012",
  });

  // Deposit into treasury accounts
  await TreasuryService.deposit({ userId, companyId, role: "OWNER" as any }, { accountId: checkingAcct.id, amount: 350000, reference: "Beginning balance" });
  await TreasuryService.deposit({ userId, companyId, role: "OWNER" as any }, { accountId: savingsAcct.id, amount: 500000, reference: "Reserve fund" });
  await TreasuryService.deposit({ userId, companyId, role: "OWNER" as any }, { accountId: eurAcct.id, amount: 100000, currency: "EUR", reference: "Initial deposit" });

  // Transfer between treasury accounts
  await TreasuryService.transfer({ userId, companyId, role: "OWNER" as any }, {
    fromAccountId: checkingAcct.id, toAccountId: savingsAcct.id, amount: 50000, reference: "Monthly savings transfer",
  });

  // Mark treasury accounts as Plaid-linked (for demo)
  await prisma.treasuryAccount.update({
    where: { id: checkingAcct.id },
    data: {
      plaidAccessToken: "mock-access-token-checking",
      plaidAccountId: "plaid-acc-chase-checking",
      plaidItemId: "plaid-item-chase",
      lastSyncedAt: new Date(),
    },
  });
  await prisma.treasuryAccount.update({
    where: { id: savingsAcct.id },
    data: {
      plaidAccessToken: "mock-access-token-savings",
      plaidAccountId: "plaid-acc-chase-savings",
      plaidItemId: "plaid-item-chase",
      lastSyncedAt: new Date(),
    },
  });
  await prisma.treasuryAccount.update({
    where: { id: eurAcct.id },
    data: {
      plaidAccessToken: "mock-access-token-hsbc",
      plaidAccountId: "plaid-acc-hsbc-eur",
      plaidItemId: "plaid-item-hsbc",
      lastSyncedAt: new Date(Date.now() - 86400000 * 2),
    },
  });

  // Create policies
  const transferLimitRule = await PolicyEngineService.createPolicy({ userId, companyId, role: "OWNER" as any }, {
    name: "Transfer Limit > $100k", type: "APPROVAL", priority: 1,
    actionType: "REQUIRE_APPROVAL", minAmount: 100000,
    appliesToTransactionTypes: ["INTERNAL_TRANSFER", "WALLET_DEBIT"],
    rules: [{ field: "amount", operator: "GREATER_THAN", value: "100000" }],
  });

  await PolicyEngineService.createPolicy({ userId, companyId, role: "OWNER" as any }, {
    name: "International Transfer Compliance", type: "COMPLIANCE", priority: 2,
    actionType: "REQUIRE_APPROVAL",
    appliesToCurrencies: ["EUR", "GBP"],
    rules: [
      { field: "currency", operator: "IN", value: "EUR,GBP" },
      { field: "amount", operator: "GREATER_THAN", value: "10000" },
    ],
  });

  // Create risk alerts
  await riskService.createAlert({ userId, companyId, role: "OWNER" as any }, {
    category: "BALANCE_ANOMALY", severity: "HIGH",
    title: "Unusual balance decrease detected on Operations wallet",
    description: "Balance dropped by 45% in 24 hours", source: "LedgerSystem",
    resourceType: "Wallet", resourceId: opsWallet.id,
  });
  await riskService.createAlert({ userId, companyId, role: "OWNER" as any }, {
    category: "FAILED_RECONCILIATION", severity: "MEDIUM",
    title: "Reconciliation exception on Transaction #1024",
    description: "Ledger entry references non-existent wallet", source: "ReconciliationEngine",
    resourceType: "Transaction",
  });
  await riskService.createAlert({ userId, companyId, role: "OWNER" as any }, {
    category: "CONNECTOR_FAILURE", severity: "CRITICAL",
    title: "Bank connector failed to sync", source: "ConnectorFramework",
    resourceType: "ConnectorConfig",
  });

  // Create reconciliation runs
  const successfulRun = await prisma.reconciliationRun.create({
    data: {
      companyId, status: "COMPLETED", type: "FULL",
      summary: { walletsChecked: 4, transactionsChecked: 15, issuesFound: 1, isHealthy: false },
      startedAt: new Date(Date.now() - 86400000), completedAt: new Date(),
    },
  });
  await prisma.reconciliationReport.create({
    data: {
      runId: successfulRun.id, companyId, title: "Daily Reconciliation Report",
      data: { summary: { totalWallets: 4, walletsChecked: 4, issuesFound: 1, isHealthy: false } },
      totalIssues: 1,
    },
  });
  await prisma.reconciliationException.create({
    data: {
      runId: successfulRun.id, companyId, type: "BALANCE_MISMATCH", severity: "ERROR",
      resourceType: "Wallet", resourceId: opsWallet.id,
      message: "Balance mismatch: stored 250000 vs derived 249850",
      details: { difference: "150" },
    },
  });

  const healthyRun = await prisma.reconciliationRun.create({
    data: {
      companyId, status: "COMPLETED", type: "FULL",
      summary: { walletsChecked: 4, transactionsChecked: 12, issuesFound: 0, isHealthy: true },
      startedAt: new Date(Date.now() - 604800000), completedAt: new Date(Date.now() - 604800000 + 30000),
    },
  });
  await prisma.reconciliationReport.create({
    data: {
      runId: healthyRun.id, companyId, title: "Weekly Reconciliation Report",
      data: { summary: { totalWallets: 4, walletsChecked: 4, issuesFound: 0, isHealthy: true } },
      totalIssues: 0,
    },
  });

  // Create calendar events
  await CalendarService.createEvent({ userId, companyId, role: "OWNER" as any }, {
    title: "Weekly Reconciliation", type: "RECONCILIATION",
    startDate: new Date(Date.now() + 86400000 * 2).toISOString(),
  });
  await CalendarService.createEvent({ userId, companyId, role: "OWNER" as any }, {
    title: "Approval rule expires: Transfer Limit > $100k", type: "APPROVAL_DEADLINE",
    startDate: new Date(Date.now() + 86400000 * 30).toISOString(),
    referenceType: "Policy", referenceId: transferLimitRule.id ?? "",
  });
  await CalendarService.createEvent({ userId, companyId, role: "OWNER" as any }, {
    title: "Monthly settlement review", type: "SETTLEMENT",
    startDate: new Date(Date.now() + 86400000 * 14).toISOString(),
  });
  await CalendarService.createEvent({ userId, companyId, role: "OWNER" as any }, {
    title: "Quarterly audit", type: "AUDIT",
    startDate: new Date(Date.now() + 86400000 * 60).toISOString(),
    endDate: new Date(Date.now() + 86400000 * 63).toISOString(),
    allDay: false,
  });

  // Create a connector run with events
  const connector = await prisma.connectorConfig.findFirst({ where: { companyId } });
  if (connector) {
    const run = await ConnectorRunService.createRun({ userId, companyId, role: "OWNER" as any }, connector.id, "SYNC", {});
    if (run) {
      await ConnectorRunService.addEvent({ userId, companyId, role: "OWNER" as any }, run.id, {
        type: "INFO", message: "Connector sync started",
      });
      await ConnectorRunService.addEvent({ userId, companyId, role: "OWNER" as any }, run.id, {
        type: "INFO", message: "Fetched 150 transactions",
      });
      await ConnectorRunService.completeRun({ userId, companyId, role: "OWNER" as any }, run.id, { syncedTransactions: 150 });
    }

    // Seed demo notifications
    await notificationService.broadcast({
      companyId, eventType: "RISK_ALERT_CREATED",
      title: "Risk alert: Unusual balance decrease detected on Operations wallet",
      message: "Balance dropped by 45% in 24 hours",
      link: "/risk", metadata: { severity: "HIGH", category: "BALANCE_ANOMALY" },
    });
    await notificationService.broadcast({
      companyId, eventType: "RECONCILIATION_COMPLETED",
      title: "Daily reconciliation completed with 1 exception",
      message: "1 issue found: balance mismatch on Operations wallet",
      link: "/reconciliation",
    });
    await notificationService.broadcast({
      companyId, eventType: "PLAID_ACCOUNT_LINKED",
      title: "Bank account linked: Chase Business Checking",
      link: "/accounts",
    });

    const failedRun = await ConnectorRunService.createRun({ userId, companyId, role: "OWNER" as any }, connector.id, "SYNC", {});
    if (failedRun) {
      await ConnectorRunService.addEvent({ userId, companyId, role: "OWNER" as any }, failedRun.id, {
        type: "ERROR", message: "Connection timeout: Bank API unreachable",
      });
      await ConnectorRunService.failRun({ userId, companyId, role: "OWNER" as any }, failedRun.id, "Connection timeout after 30s");
    }
  }

  // Company KYC
  await prisma.company.update({
    where: { id: companyId },
    data: {
      legalName: "Demo Company Inc.",
      ein: "12-3456789",
      jurisdiction: "Delaware, USA",
      entityType: "Corporation",
      incorporationDate: new Date(Date.now() - 5 * 365 * 24 * 60 * 60 * 1000),
      address: "100 Market Street, Wilmington, DE 19801",
      verificationStatus: "VERIFIED",
      verifiedAt: new Date(),
    },
  });

  // Account controls
  await prisma.accountControl.create({
    data: {
      accountId: checkingAcct.id,
      companyId,
      type: "SPENDING_LIMIT",
      scope: "PER_TRANSACTION",
      value: 50000,
      description: "Max per transaction",
    },
  });
  await prisma.accountControl.create({
    data: {
      accountId: checkingAcct.id,
      companyId,
      type: "VELOCITY_LIMIT",
      scope: "DAILY",
      value: 100000,
      description: "Daily spending cap",
    },
  });

  // Transaction approvals
  const pendingTx1 = await prisma.transaction.create({
    data: {
      companyId,
      type: "INTERNAL_TRANSFER",
      status: "PENDING",
      primaryAmount: 150000,
      currency: "USD",
      reference: "Large transfer requiring approval",
      createdByUserId: userId,
    },
  });
  const pendingTx2 = await prisma.transaction.create({
    data: {
      companyId,
      type: "INTERNAL_TRANSFER",
      status: "PENDING",
      primaryAmount: 50000,
      currency: "USD",
      reference: "Medium transfer requiring approval",
      createdByUserId: userId,
    },
  });
  await prisma.transactionApproval.create({
    data: {
      transactionId: pendingTx1.id,
      companyId,
      status: "PENDING",
      level: 1,
      sequenceNumber: 1,
    },
  });
  await prisma.transactionApproval.create({
    data: {
      transactionId: pendingTx2.id,
      companyId,
      status: "PENDING",
      level: 1,
      sequenceNumber: 1,
    },
  });

  const demoKey = "va_demo_" + Math.random().toString(36).substring(2, 15);
  const { encrypt } = await import("@/server/security/encryption");
  await prisma.apiKey.create({
    data: {
      companyId,
      name: "Demo API Key",
      key: encrypt(demoKey),
      keyHash: crypto.createHash("sha256").update(demoKey).digest("hex"),
      prefix: "va_demo",
      lastChars: "demo",
      scopes: ["read:accounts", "read:transactions", "write:transfers"],
      active: true,
    },
  });

  // Notification channel
  await prisma.notificationChannel.create({
    data: {
      companyId,
      type: "IN_APP",
      name: "In-App Notifications",
      config: {},
      isActive: true,
    },
  });

  // Audit logs
  const firstAlert = await prisma.riskAlert.findFirst({
    where: { companyId },
    orderBy: { createdAt: "asc" },
  });
  await prisma.auditLog.create({
    data: {
      companyId,
      actorUserId: userId,
      action: "company.create",
      resourceType: "Company",
      resourceId: companyId,
      metadata: { name: "Demo Company", slug: "demo-company" },
    },
  });
  await prisma.auditLog.create({
    data: {
      companyId,
      actorUserId: userId,
      action: "wallet.create",
      resourceType: "Wallet",
      resourceId: opsWallet.id,
    },
  });
  await prisma.auditLog.create({
    data: {
      companyId,
      actorUserId: userId,
      action: "risk.alert_created",
      resourceType: "RiskAlert",
      resourceId: firstAlert?.id ?? "",
    },
  });

  await prisma.$disconnect();
}

export async function POST(request: Request) {
  try {
    if (process.env.DISABLE_DEMO === "1" || process.env.LICENSE_COMPANY_ID) {
      return NextResponse.json(
        { error: { code: "DISABLED", message: "Demo mode is not available in licensed deployments." } },
        { status: 403 },
      );
    }

    const ip = request.headers.get("x-forwarded-for") ?? "unknown";
    const rl = await rateLimit(rateLimitKey("demo-bootstrap", ip), 3, 60000);
    if (!rl.ok) {
      return NextResponse.json(
        { error: { code: "TOO_MANY_REQUESTS", message: "Too many demo bootstrap attempts. Try again later." } },
        { status: 429, headers: { "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } },
      );
    }

    let user = await prisma.user.findUnique({ where: { email: DEMO_EMAIL } });
    let generatedPassword: string | null = null;
    if (!user) {
      generatedPassword = generateSecurePassword();
      user = await createPasswordUser({ email: DEMO_EMAIL, password: generatedPassword, name: "Demo User" });
    }

    let company = await prisma.company.findUnique({ where: { slug: "demo-company" } });
    if (!company) {
      company = await createCompanyWithOwner({ name: "Demo Company", slug: "demo-company", ownerUserId: user.id });
    }

    const existingData = await prisma.transaction.count({ where: { companyId: company.id } });
    if (existingData === 0) {
      await seedDemoData(user.id, company.id);
    }

    return NextResponse.json({
      success: true,
      user: { id: user.id, email: user.email, name: user.name },
      company: { id: company.id, name: company.name, slug: company.slug },
      ...(generatedPassword ? { password: generatedPassword } : {}),
    });
  } catch (error) {
    logger.error(error, "Demo bootstrap failed");
    return NextResponse.json({ error: "Failed to bootstrap demo" }, { status: 500 });
  }
}
