import { prisma } from "@/server/db/prisma";
import { notificationService, NotificationService } from "@/modules/notifications";
import { PlaidService } from "@/modules/integrations/plaid";
import { ReconciliationService } from "@/modules/reconciliation/reconciliation.service";

type TickResult = {
  approvalsEscalated: number;
  approvalsRejected: number;
  plaidAccountsSynced: string[];
  reconciliationsTriggered: string[];
  companiesReconciled: string[];
  errors: string[];
};

export class TickService {
  static async run(): Promise<TickResult> {
    const result: TickResult = {
      approvalsEscalated: 0,
      approvalsRejected: 0,
      plaidAccountsSynced: [],
      reconciliationsTriggered: [],
      companiesReconciled: [],
      errors: [],
    };

    const [escalated, rejected] = await Promise.all([
      this.escalateStaleApprovals(result),
      this.rejectExpiredApprovals(result),
    ]);
    result.approvalsEscalated = escalated;
    result.approvalsRejected = rejected;

    await this.syncStalePlaidAccounts(result);
    await this.nightlyReconciliation(result);
    await this.triggerScheduledReconciliations(result);

    return result;
  }

  static async nightlyReconciliation(result: TickResult): Promise<void> {
    const companies = await prisma.company.findMany({
      select: { id: true, name: true },
    });
    for (const company of companies) {
      try {
        const ctx = { userId: "system", companyId: company.id, role: "OWNER" as const };
        await ReconciliationService.initiateRun(ctx, "FULL");
        result.companiesReconciled.push(company.id);
      } catch (err) {
        result.errors.push(`Nightly reconciliation ${company.id}: ${err}`);
      }
    }
  }

  /**
   * Escalate approvals pending > 24 hours.
   * Finds approvals where status = "PENDING" and createdAt > 24h ago,
   * increments their level and notifies the next tier.
   */
  private static async escalateStaleApprovals(result: TickResult): Promise<number> {
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const stale = await prisma.transactionApproval.findMany({
      where: { status: "PENDING", createdAt: { lt: cutoff } },
      include: { transaction: true, company: { select: { id: true, name: true } } },
    });

    let count = 0;
    for (const approval of stale) {
      try {
        await prisma.transactionApproval.update({
          where: { id: approval.id },
          data: { status: "ESCALATED", updatedAt: new Date() },
        });

        await notificationService.broadcast({
          companyId: approval.companyId,
          eventType: "APPROVAL_REQUIRED",
          title: `Approval escalated: ${approval.transaction.reference ?? "Transaction"}`,
          message: `Pending for > 24h, escalated to level ${approval.level + 1}`,
          link: `/transactions?id=${approval.transactionId}`,
          metadata: { approvalId: approval.id, level: approval.level },
        });

        count++;
      } catch (err) {
        result.errors.push(`Escalate approval ${approval.id}: ${err}`);
      }
    }
    return count;
  }

  /**
   * Auto-reject approvals pending > 72 hours.
   */
  private static async rejectExpiredApprovals(result: TickResult): Promise<number> {
    const cutoff = new Date(Date.now() - 72 * 60 * 60 * 1000);
    const expired = await prisma.transactionApproval.findMany({
      where: { status: "PENDING", createdAt: { lt: cutoff } },
      include: { transaction: true, company: { select: { id: true } } },
    });

    let count = 0;
    for (const approval of expired) {
      try {
        await prisma.transactionApproval.update({
          where: { id: approval.id },
          data: { status: "REJECTED", rejectionReason: "Auto-rejected after 72h timeout", updatedAt: new Date() },
        });

        // Cancel the transaction too
        await prisma.transaction.update({
          where: { id: approval.transactionId },
          data: { status: "CANCELLED" },
        });

        await notificationService.broadcast({
          companyId: approval.companyId,
          eventType: "APPROVAL_REJECTED",
          title: `Approval auto-rejected: ${approval.transaction.reference ?? "Transaction"}`,
          message: "No action taken within 72 hours",
          link: `/transactions?id=${approval.transactionId}`,
        });

        count++;
      } catch (err) {
        result.errors.push(`Reject approval ${approval.id}: ${err}`);
      }
    }
    return count;
  }

  /**
   * Sync Plaid accounts where lastSyncedAt > 4 hours ago or never synced.
   */
  private static async syncStalePlaidAccounts(result: TickResult): Promise<void> {
    const cutoff = new Date(Date.now() - 4 * 60 * 60 * 1000);
    const stale = await prisma.treasuryAccount.findMany({
      where: {
        plaidAccessToken: { not: null },
        OR: [
          { lastSyncedAt: null },
          { lastSyncedAt: { lt: cutoff } },
        ],
      },
    });

    for (const account of stale) {
      try {
        const ctx = { userId: "tick", companyId: account.companyId, role: "OWNER" as const };
        await PlaidService.syncBalance(ctx, account.id);
        result.plaidAccountsSynced.push(account.id);
      } catch (err) {
        result.errors.push(`Plaid sync ${account.id}: ${err}`);
      }
    }
  }

  /**
   * Run reconciliations due on the calendar.
   */
  private static async triggerScheduledReconciliations(result: TickResult): Promise<void> {
    const now = new Date();
    const due = await prisma.calendarEvent.findMany({
      where: {
        type: "RECONCILIATION",
        status: "SCHEDULED",
        startDate: { lte: now },
      },
    });

    for (const event of due) {
      try {
        const ctx = { userId: "system", companyId: event.companyId, role: "OWNER" as const };
        await ReconciliationService.initiateRun(ctx, "FULL");

        await prisma.calendarEvent.update({
          where: { id: event.id },
          data: { status: "COMPLETED" },
        });

        await notificationService.broadcast({
          companyId: event.companyId,
          eventType: "RECONCILIATION_COMPLETED",
          title: `Scheduled reconciliation done: ${event.title}`,
          message: "Auto-reconciled by tick engine.",
          link: "/reconciliation",
          metadata: { calendarEventId: event.id },
        });

        result.reconciliationsTriggered.push(event.id);
      } catch (err) {
        result.errors.push(`Reconciliation trigger ${event.id}: ${err}`);
      }
    }
  }
}
