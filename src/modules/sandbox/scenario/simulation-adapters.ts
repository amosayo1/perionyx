import { logger } from "@/lib/logger";
import type { AdapterResult } from "./types";
import { recordAudit } from "@/modules/audit";

const SIM_LABEL = "⚡ Simulation — No external financial institution has been contacted.";

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function genRef(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Simulated bank settlement for wire/ACH/SEPA payments.
 * Returns realistic success/failure responses with banking metadata.
 */
export async function simulateBankSettlement(
  companyId: string,
  amount: number,
  currency: string,
  connectorType: "WIRE" | "ACH" | "SEPA" | "INTERNAL",
  accountNumber: string,
  beneficiary: string,
  simulateFailure = false,
): Promise<AdapterResult<{
  bankReference: string;
  settlementTime: string;
  fee: number;
  estimatedArrival: string;
}>> {
  logger.info({ amount, currency, connectorType, SIM_LABEL }, "[SimBank] Processing settlement");

  // Realistic processing delays
  const processingTime = connectorType === "WIRE" ? 800 : connectorType === "SEPA" ? 600 : connectorType === "ACH" ? 400 : 200;
  await delay(processingTime);

  if (simulateFailure) {
    await recordAudit(prisma, {
      companyId,
      action: "BANK_SETTLEMENT_FAILED",
      resourceType: "SettlementRecord",
      metadata: { amount, currency, connectorType, accountNumber, beneficiary, reason: "Insufficient funds", simulation: true },
    });
    return {
      success: false,
      data: { bankReference: "", settlementTime: "", fee: 0, estimatedArrival: "" },
      duration: processingTime,
      referenceId: genRef("BANK_FAIL"),
      message: `Bank returned: INSUFFICIENT_FUNDS — ${SIM_LABEL}`,
    };
  }

  const bankReference = genRef("BANK_REF");
  const fee = connectorType === "WIRE" ? 35 : connectorType === "SEPA" ? 5 : connectorType === "ACH" ? 1.5 : 0;

  await recordAudit(prisma, {
    companyId,
    action: "BANK_SETTLEMENT_COMPLETED",
    resourceType: "SettlementRecord",
    metadata: { amount, currency, connectorType, bankReference, fee, accountNumber, beneficiary, simulation: true },
  });

  return {
    success: true,
    data: {
      bankReference,
      settlementTime: new Date().toISOString(),
      fee,
      estimatedArrival: connectorType === "WIRE"
        ? new Date(Date.now() + 86400000).toISOString()
        : new Date(Date.now() + 172800000).toISOString(),
    },
    duration: processingTime,
    referenceId: bankReference,
    message: `Settlement ${connectorType} reference ${bankReference} — ${SIM_LABEL}`,
  };
}

import { prisma } from "@/server/db/prisma";

/**
 * Simulated Plaid account sync.
 * Returns realistic account and transaction data.
 */
export async function simulatePlaidSync(
  companyId: string,
  treasuryAccountId: string,
  accountName: string,
  currency: string,
): Promise<AdapterResult<{
  accounts: Array<{ id: string; name: string; balance: number; currency: string }>;
  transactions: Array<{ id: string; amount: number; date: string; description: string }>;
}>> {
  logger.info({ treasuryAccountId, accountName, SIM_LABEL }, "[SimPlaid] Syncing account");
  await delay(600);

  const balance = Math.round(Math.random() * 10000000 * 100) / 100;

  await recordAudit(prisma, {
    companyId,
    action: "PLAID_SYNC_COMPLETED",
    resourceType: "TreasuryAccount",
    resourceId: treasuryAccountId,
    metadata: { accountName, currency, balance, accountsFound: 1, transactionsFound: Math.floor(Math.random() * 20), simulation: true },
  });

  return {
    success: true,
    data: {
      accounts: [{ id: genRef("PLAID_ACCT"), name: accountName, balance, currency }],
      transactions: Array.from({ length: Math.floor(Math.random() * 15) + 3 }, (_, i) => ({
        id: genRef("PLAID_TXN"),
        amount: Math.round(Math.random() * 50000 * 100) / 100,
        date: new Date(Date.now() - i * 86400000).toISOString(),
        description: ["Vendor Payment", "Wire Transfer", "ACH Credit", "Debit Card Purchase", "Direct Deposit"][i % 5],
      })),
    },
    duration: 600,
    referenceId: genRef("PLAID_SYNC"),
    message: `Plaid sync complete for ${accountName} — ${SIM_LABEL}`,
  };
}

/**
 * Simulated email delivery notification.
 */
export async function simulateEmailDelivery(
  to: string,
  subject: string,
): Promise<AdapterResult<{ messageId: string; provider: string }>> {
  await delay(200);
  return {
    success: true,
    data: { messageId: genRef("EMAIL"), provider: "simulated-smtp" },
    duration: 200,
    referenceId: genRef("EMAIL_REF"),
    message: `Email delivered to ${to} via simulated SMTP — ${SIM_LABEL}`,
  };
}

/**
 * Simulated Slack message delivery.
 */
export async function simulateSlackDelivery(
  channel: string,
  text: string,
): Promise<AdapterResult<{ ts: string; channel: string }>> {
  await delay(150);
  return {
    success: true,
    data: { ts: Date.now().toString(), channel },
    duration: 150,
    referenceId: genRef("SLACK"),
    message: `Slack message sent to #${channel} — ${SIM_LABEL}`,
  };
}

/**
 * Simulated QuickBooks sync.
 */
export async function simulateQuickBooksSync(
  companyId: string,
  journalEntries: number,
): Promise<AdapterResult<{ syncId: string; entriesPosted: number }>> {
  await delay(1000);
  await recordAudit(prisma, {
    companyId,
    action: "QUICKBOOKS_SYNC_COMPLETED",
    resourceType: "Company",
    metadata: { journalEntries, simulation: true },
  });
  return {
    success: true,
    data: { syncId: genRef("QB"), entriesPosted: journalEntries },
    duration: 1000,
    referenceId: genRef("QB_REF"),
    message: `QuickBooks sync completed — ${SIM_LABEL}`,
  };
}

/**
 * Simulated FX rate update from market provider.
 */
export async function simulateFxRateUpdate(
  baseCurrency: string,
  quoteCurrency: string,
  currentRate: number,
): Promise<AdapterResult<{ newRate: number; change: number; direction: "up" | "down" | "stable" }>> {
  await delay(300);
  const volatility = (Math.random() - 0.5) * 0.02;
  const newRate = Math.round(currentRate * (1 + volatility) * 100000) / 100000;
  const direction = newRate > currentRate ? "up" : newRate < currentRate ? "down" : "stable";

  return {
    success: true,
    data: { newRate, change: Math.round((newRate - currentRate) * 100000) / 100000, direction },
    duration: 300,
    referenceId: genRef("FX"),
    message: `FX rate updated ${baseCurrency}/${quoteCurrency}: ${currentRate} → ${newRate} (${direction}) — ${SIM_LABEL}`,
  };
}
