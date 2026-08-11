import { prisma } from '@/server/db/prisma';

/**
 * Reconciliation engine: given a bank report (list of externalIds and statuses),
 * match settlement records and update their status to RECONCILED when matched.
 */
export async function reconcileSettlements(companyId: string, report: Array<{ externalId: string; status: string }>) {
  const results: Array<{ externalId: string; matched: boolean }> = [];

  if (report.length === 0) return results;

  // Batch read: single query for all externalIds (Phase 28.1 F-04)
  const externalIds = report.map((item) => item.externalId);
  const recs = await prisma.settlementRecord.findMany({
    where: { companyId, externalId: { in: externalIds } },
    select: { id: true, externalId: true, status: true },
  });
  const byExternalId = new Map(recs.map((r) => [r.externalId, r]));

  const toReconcile = recs
    .filter((r) => r.status === 'DELIVERED' || r.status === 'PENDING')
    .map((r) => r.id);
  if (toReconcile.length > 0) {
    await prisma.settlementRecord.updateMany({
      where: { id: { in: toReconcile } },
      data: { status: 'RECONCILED', updatedAt: new Date() },
    });
  }

  for (const item of report) {
    results.push({ externalId: item.externalId, matched: byExternalId.has(item.externalId) });
  }

  return results;
}

export default reconcileSettlements;
/**
 * RECONCILIATION ENGINE
 * 
 * Verify financial consistency and detect anomalies.
 * 
 * Key reconciliations:
 * 1. Ledger balance = Wallet balance (derived vs. stored)
 * 2. Transaction posting balance (debits == credits)
 * 3. Wallet currency consistency
 * 4. Ledger entry integrity (no orphans, sequence integrity)
 * 5. Company-wide balance sheet (debits == credits)
 */

import { Prisma } from "@prisma/client";
import { postingEngine } from "./posting-engine";

export interface ReconciliationReport {
  companyId: string;
  reportedAt: Date;
  issues: ReconciliationIssue[];
  summary: {
    totalWallets: number;
    walletsChecked: number;
    issuesFound: number;
    isHealthy: boolean;
  };
}

export interface ReconciliationIssue {
  type: "BALANCE_MISMATCH" | "TRANSACTION_UNBALANCED" | "LEDGER_ORPHAN" | "CURRENCY_MISMATCH";
  severity: "ERROR" | "WARNING";
  resourceId: string;
  resourceType: "Wallet" | "Transaction" | "LedgerEntry";
  message: string;
  details?: Record<string, any>;
}

export class ReconciliationEngine {
  /**
   * Run full company reconciliation.
   * 
   * Checks all wallets and transactions for consistency.
   */
  static async reconcileCompany(companyId: string): Promise<ReconciliationReport> {
    const issues: ReconciliationIssue[] = [];
    const startTime = new Date();

    // Get all wallets
    const wallets = await prisma.wallet.findMany({
      where: { companyId },
      select: { id: true, balance: true, currency: true },
    });

    // Check each wallet
    for (const wallet of wallets) {
      const walletIssues = await this.reconcileWallet(companyId, wallet.id);
      issues.push(...walletIssues);
    }

    // Check all transactions
    const transactions = await prisma.transaction.findMany({
      where: { companyId },
      select: { id: true },
    });

    for (const transaction of transactions) {
      const txIssues = await this.reconcileTransaction(transaction.id);
      issues.push(...txIssues);
    }

    // Check orphan ledger entries
    const orphanIssues = await this.checkOrphanLedgerEntries(companyId);
    issues.push(...orphanIssues);

    // Company-wide balance sheet
    const balanceSheetIssues = await this.reconcileCompanyBalanceSheet(companyId);
    issues.push(...balanceSheetIssues);

    return {
      companyId,
      reportedAt: new Date(),
      issues,
      summary: {
        totalWallets: wallets.length,
        walletsChecked: wallets.length,
        issuesFound: issues.length,
        isHealthy: issues.length === 0,
      },
    };
  }

  /**
   * Reconcile single wallet.
   * 
   * Verifies:
   * - Stored balance == derived balance from ledger
   */
  static async reconcileWallet(
    companyId: string,
    walletId: string
  ): Promise<ReconciliationIssue[]> {
    const issues: ReconciliationIssue[] = [];

    const wallet = await prisma.wallet.findUnique({
      where: { id: walletId },
      select: { id: true, balance: true, currency: true, companyId: true },
    });

    if (!wallet) {
      issues.push({
        type: "BALANCE_MISMATCH",
        severity: "ERROR",
        resourceId: walletId,
        resourceType: "Wallet",
        message: `Wallet not found`,
      });
      return issues;
    }

    if (wallet.companyId !== companyId) {
      issues.push({
        type: "BALANCE_MISMATCH",
        severity: "ERROR",
        resourceId: walletId,
        resourceType: "Wallet",
        message: `Wallet belongs to different company`,
        details: { expectedCompanyId: companyId, actualCompanyId: wallet.companyId },
      });
      return issues;
    }

    // Derive balance from ledger
    const derivedBalance = await postingEngine.computeWalletBalance(walletId, companyId);

    if (!wallet.balance.equals(derivedBalance)) {
      issues.push({
        type: "BALANCE_MISMATCH",
        severity: "ERROR",
        resourceId: walletId,
        resourceType: "Wallet",
        message: `Balance mismatch for wallet ${walletId}`,
        details: {
          storedBalance: wallet.balance.toString(),
          derivedBalance: derivedBalance.toString(),
          difference: wallet.balance.sub(derivedBalance).toString(),
        },
      });
    }

    return issues;
  }

  /**
   * Reconcile single transaction.
   * 
   * Verifies:
   * - Transaction postings are balanced (debits == credits)
   * - All ledger entries have valid wallets
   * - Sequence numbers are consistent
   */
  static async reconcileTransaction(
    transactionId: string
  ): Promise<ReconciliationIssue[]> {
    const issues: ReconciliationIssue[] = [];

    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: { ledgerEntries: true },
    });

    if (!transaction) {
      issues.push({
        type: "TRANSACTION_UNBALANCED",
        severity: "ERROR",
        resourceId: transactionId,
        resourceType: "Transaction",
        message: `Transaction not found`,
      });
      return issues;
    }

    if (transaction.ledgerEntries.length === 0) {
      // Pending transactions might not have entries yet
      if (transaction.status === "PENDING") {
        return issues;
      }

      issues.push({
        type: "TRANSACTION_UNBALANCED",
        severity: "ERROR",
        resourceId: transactionId,
        resourceType: "Transaction",
        message: `Transaction has no ledger entries`,
      });
      return issues;
    }

    // Check balance (debits == credits)
    let debits = new Prisma.Decimal(0);
    let credits = new Prisma.Decimal(0);

    for (const entry of transaction.ledgerEntries) {
      if (entry.side === "DEBIT") {
        debits = debits.plus(entry.amount);
      } else {
        credits = credits.plus(entry.amount);
      }
    }

    if (!debits.equals(credits)) {
      issues.push({
        type: "TRANSACTION_UNBALANCED",
        severity: "ERROR",
        resourceId: transactionId,
        resourceType: "Transaction",
        message: `Transaction postings not balanced`,
        details: {
          debits: debits.toString(),
          credits: credits.toString(),
          difference: debits.sub(credits).toString(),
        },
      });
    }

    // Check sequence numbers
    const sequences = transaction.ledgerEntries.map((e) => e.sequence).sort((a, b) => a - b);
    for (let i = 0; i < sequences.length; i++) {
      if (sequences[i] !== i) {
        issues.push({
          type: "TRANSACTION_UNBALANCED",
          severity: "ERROR",
          resourceId: transactionId,
          resourceType: "Transaction",
          message: `Transaction has non-sequential ledger entries`,
          details: { expectedSequence: i, actualSequences: sequences },
        });
        break;
      }
    }

    // Verify all wallets exist
    for (const entry of transaction.ledgerEntries) {
      const wallet = await prisma.wallet.findUnique({
        where: { id: entry.walletId },
        select: { id: true, companyId: true },
      });

      if (!wallet) {
        issues.push({
          type: "LEDGER_ORPHAN",
          severity: "ERROR",
          resourceId: entry.id,
          resourceType: "LedgerEntry",
          message: `Ledger entry references non-existent wallet`,
          details: { walletId: entry.walletId, transactionId },
        });
      } else if (wallet.companyId !== transaction.companyId) {
        issues.push({
          type: "CURRENCY_MISMATCH",
          severity: "ERROR",
          resourceId: entry.id,
          resourceType: "LedgerEntry",
          message: `Ledger entry wallet belongs to different company`,
          details: {
            expectedCompanyId: transaction.companyId,
            actualCompanyId: wallet.companyId,
          },
        });
      }
    }

    return issues;
  }

  /**
   * Check for orphan ledger entries.
   * 
   * Entries that reference deleted transactions or invalid wallets.
   */
  static async checkOrphanLedgerEntries(
    companyId: string
  ): Promise<ReconciliationIssue[]> {
    const issues: ReconciliationIssue[] = [];

    // Find entries whose transactions don't exist
    const orphansByTransaction = await prisma.$queryRaw<
      Array<{ id: string; transactionId: string }>
    >`
      SELECT le.id, le."transactionId"
      FROM "LedgerEntry" le
      LEFT JOIN "Transaction" t ON le."transactionId" = t.id
      WHERE t.id IS NULL
    `;

    for (const entry of orphansByTransaction) {
      issues.push({
        type: "LEDGER_ORPHAN",
        severity: "ERROR",
        resourceId: entry.id,
        resourceType: "LedgerEntry",
        message: `Ledger entry references deleted transaction`,
        details: { transactionId: entry.transactionId },
      });
    }

    // Find entries whose wallets don't exist
    const orphansByWallet = await prisma.$queryRaw<
      Array<{ id: string; walletId: string }>
    >`
      SELECT le.id, le."walletId"
      FROM "LedgerEntry" le
      LEFT JOIN "Wallet" w ON le."walletId" = w.id
      WHERE w.id IS NULL
    `;

    for (const entry of orphansByWallet) {
      issues.push({
        type: "LEDGER_ORPHAN",
        severity: "ERROR",
        resourceId: entry.id,
        resourceType: "LedgerEntry",
        message: `Ledger entry references deleted wallet`,
        details: { walletId: entry.walletId },
      });
    }

    return issues;
  }

  /**
   * Reconcile company-wide balance sheet.
   * 
   * Verifies:
   * - Total debits == total credits across all wallets
   */
  static async reconcileCompanyBalanceSheet(
    companyId: string
  ): Promise<ReconciliationIssue[]> {
    const issues: ReconciliationIssue[] = [];

    // Get all entries for company
    const entries = await prisma.ledgerEntry.findMany({
      where: {
        transaction: {
          companyId,
        },
      },
    });

    let totalDebits = new Prisma.Decimal(0);
    let totalCredits = new Prisma.Decimal(0);

    for (const entry of entries) {
      if (entry.side === "DEBIT") {
        totalDebits = totalDebits.plus(entry.amount);
      } else {
        totalCredits = totalCredits.plus(entry.amount);
      }
    }

    if (!totalDebits.equals(totalCredits)) {
      issues.push({
        type: "TRANSACTION_UNBALANCED",
        severity: "ERROR",
        resourceId: companyId,
        resourceType: "Transaction",
        message: `Company balance sheet is not balanced`,
        details: {
          totalDebits: totalDebits.toString(),
          totalCredits: totalCredits.toString(),
          imbalance: totalDebits.sub(totalCredits).toString(),
        },
      });
    }

    return issues;
  }

  /**
   * Get reconciliation statistics for a company.
   */
  static async getReconciliationStats(companyId: string): Promise<Record<string, any>> {
    const walletCount = await prisma.wallet.count({ where: { companyId } });
    const transactionCount = await prisma.transaction.count({ where: { companyId } });
    const ledgerEntryCount = await prisma.ledgerEntry.count({
      where: { transaction: { companyId } },
    });

    // Get total debits/credits
    const entries = await prisma.ledgerEntry.findMany({
      where: { transaction: { companyId } },
    });

    let totalDebits = new Prisma.Decimal(0);
    let totalCredits = new Prisma.Decimal(0);

    for (const entry of entries) {
      if (entry.side === "DEBIT") {
        totalDebits = totalDebits.plus(entry.amount);
      } else {
        totalCredits = totalCredits.plus(entry.amount);
      }
    }

    return {
      walletCount,
      transactionCount,
      ledgerEntryCount,
      totalDebits: totalDebits.toString(),
      totalCredits: totalCredits.toString(),
      isBalanced: totalDebits.equals(totalCredits),
    };
  }

  /**
   * Generate CSV export of reconciliation report.
   */
  static reportToCSV(report: ReconciliationReport): string {
    const lines: string[] = [
      "Reconciliation Report",
      `Company ID: ${report.companyId}`,
      `Reported At: ${report.reportedAt.toISOString()}`,
      `Status: ${report.summary.isHealthy ? "HEALTHY" : "ISSUES FOUND"}`,
      "",
      "Issue Type,Severity,Resource Type,Resource ID,Message",
    ];

    for (const issue of report.issues) {
      lines.push(
        `"${issue.type}","${issue.severity}","${issue.resourceType}","${issue.resourceId}","${issue.message}"`
      );
    }

    lines.push("", `Summary: ${report.issues.length} issues found in ${report.summary.walletsChecked} wallets checked`);

    return lines.join("\n");
  }
}
