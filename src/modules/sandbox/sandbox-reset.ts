import { prisma } from "@/server/db/prisma";
import { isSandboxCompany, clearSandboxCache, SANDBOX_EMAIL } from "./sandbox-context";
import { ensureSandboxTenant } from "./sandbox-seed";

export async function resetSandbox(companyId: string): Promise<boolean> {
  const sandbox = await isSandboxCompany(companyId);
  if (!sandbox) return false;

  // Delete all sandbox-created data (guest transactions, approvals, etc.)
  // but preserve the original seed data by deleting only what guest users created
  await prisma.$transaction(async (tx) => {
    // Find the sandbox guest user
    const guestUser = await tx.user.findUnique({ where: { email: SANDBOX_EMAIL } });
    const guestUserId = guestUser?.id;

    // Delete copilot conversations for this company
    await tx.copilotMessage.deleteMany({
      where: { conversation: { companyId } },
    });
    await tx.copilotConversation.deleteMany({ where: { companyId } });

    // Delete notifications for this company
    await tx.notification.deleteMany({ where: { companyId } });

    // Delete approval comments, participants, threads
    const threads = await tx.approvalThread.findMany({ where: { companyId }, select: { id: true } });
    const threadIds = threads.map((t) => t.id);
    await tx.approvalComment.deleteMany({ where: { threadId: { in: threadIds } } });
    await tx.approvalParticipant.deleteMany({ where: { threadId: { in: threadIds } } });
    await tx.approvalThread.deleteMany({ where: { companyId } });

    // Delete transaction approvals
    await tx.transactionApproval.deleteMany({ where: { companyId } });

    // Delete ledger entries, settlements, transactions created by guest
    const txIds = guestUserId
      ? (await tx.transaction.findMany({ where: { companyId, createdByUserId: guestUserId }, select: { id: true } })).map((t) => t.id)
      : [];

    if (txIds.length > 0) {
      await tx.ledgerEntry.deleteMany({ where: { transactionId: { in: txIds } } });
      await tx.settlementRecord.deleteMany({ where: { transactionId: { in: txIds } } });
      await tx.transaction.deleteMany({ where: { id: { in: txIds } } });
    }

    // Delete connector events and runs
    const runs = await tx.connectorRun.findMany({ where: { companyId }, select: { id: true } });
    const runIds = runs.map((r) => r.id);
    await tx.connectorEvent.deleteMany({ where: { runId: { in: runIds } } });
    await tx.connectorRun.deleteMany({ where: { companyId } });

    // Delete risk alerts, incidents
    await tx.riskAlert.deleteMany({ where: { companyId } });
    await tx.riskIncident.deleteMany({ where: { companyId } });

    // Delete calendar events
    await tx.calendarEvent.deleteMany({ where: { companyId } });

    // Delete reconciliation exceptions, reports, runs
    const recRuns = await tx.reconciliationRun.findMany({ where: { companyId }, select: { id: true } });
    const recRunIds = recRuns.map((r) => r.id);
    await tx.reconciliationException.deleteMany({ where: { runId: { in: recRunIds } } });
    await tx.reconciliationReport.deleteMany({ where: { runId: { in: recRunIds } } });
    await tx.reconciliationRun.deleteMany({ where: { companyId } });

    // Delete audit logs
    await tx.auditLog.deleteMany({ where: { companyId } });

    // Delete internal transfers
    await tx.internalTransfer.deleteMany({ where: { companyId } });

    // Delete account controls
    await tx.accountControl.deleteMany({ where: { companyId } });

    // Delete treasury accounts
    await tx.treasuryAccount.deleteMany({ where: { companyId } });

    // Delete policies and policy test results, rules
    const policies = await tx.policy.findMany({ where: { companyId }, select: { id: true } });
    const policyIds = policies.map((p) => p.id);
    await tx.policyRule.deleteMany({ where: { policyId: { in: policyIds } } });
    await tx.policyTestResult.deleteMany({ where: { policyId: { in: policyIds } } });
    await tx.policy.deleteMany({ where: { companyId } });

    // Delete exchange rates
    await tx.exchangeRate.deleteMany({ where: { companyId } });

    // Delete wallets and ledger entries (ledger entries cascade with transaction, but clean up any orphaned)
    const wallets = await tx.wallet.findMany({ where: { companyId, kind: "STANDARD" }, select: { id: true } });
    const walletIds = wallets.map((w) => w.id);
    await tx.ledgerEntry.deleteMany({ where: { walletId: { in: walletIds } } });
    await tx.wallet.deleteMany({ where: { id: { in: walletIds } } });

    // Delete notification channels
    await tx.notificationChannel.deleteMany({ where: { companyId } });

    // Delete approval rules with conditions and steps
    const rules = await tx.approvalRule.findMany({ where: { companyId }, select: { id: true } });
    const ruleIds = rules.map((r) => r.id);
    await tx.approvalCondition.deleteMany({ where: { ruleId: { in: ruleIds } } });
    await tx.approvalStep.deleteMany({ where: { ruleId: { in: ruleIds } } });
    await tx.approvalRule.deleteMany({ where: { companyId } });

    // Delete approval authorities
    await tx.approvalAuthority.deleteMany({ where: { companyId } });
  });

  clearSandboxCache(companyId);

  // Re-seed the sandbox data
  await ensureSandboxTenant();

  return true;
}
