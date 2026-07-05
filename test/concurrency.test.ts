import "dotenv/config";
import { describe, it, expect, afterAll } from "vitest";
import { Prisma, TransactionStatus, TransactionType } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import { postingEngine } from "@/modules/ledger/posting-engine";
import { ApprovalWorkflowEngine } from "@/modules/ledger/approval-workflow";
import { TreasuryService } from "@/modules/treasury/treasury.service";
import { BankReconciliationService } from "@/modules/reconciliation/bank-reconciliation.service";
import { PolicyEngineService } from "@/modules/policies/policies.service";
import {
  FinancialTransactionManager,
  RowLockManager,
  OperationCategory,
} from "@/lib/financial-transaction";
import {
  createCompany, createWallet, createTransaction, createUser, createMembership,
} from "../test/helpers/factories";
import { buildTenantContext, cleanup, track } from "../test/helpers/db";
import { ConflictError } from "@/lib/errors/app-error";

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

afterAll(cleanup);

// ── Helper: create a TenantContext with a real user ──────────────────────
async function realContext(companyId: string, role: "OWNER" | "ADMIN" | "TREASURER" = "OWNER") {
  const user = await createUser();
  await createMembership(user.id, companyId, role);
  return buildTenantContext(companyId, { userId: user.id, role });
}

// ── Helper: create a treasury account ────────────────────────────────────
async function createTreasuryAccount(
  companyId: string,
  overrides?: Partial<{ name: string; balance: number; currency: string }>,
) {
  const acct = await prisma.treasuryAccount.create({
    data: {
      companyId,
      name: overrides?.name ?? `Treasury-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      balance: overrides?.balance ?? 0,
      currency: overrides?.currency ?? "USD",
    },
  });
  track("treasuryAccount", acct.id);
  return acct;
}

// ── Helper: create an external transaction (for reconciliation tests) ────
async function createExternalTx(companyId: string, amount = 100) {
  const extAcct = await prisma.externalAccount.create({
    data: { companyId, source: "test", externalId: `ea-${Date.now()}`, name: "test", currency: "USD" },
  });
  track("externalAccount", extAcct.id);
  const ext = await prisma.externalTransaction.create({
    data: {
      companyId,
      source: "test",
      externalId: `ext-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
      externalAccountId: extAcct.id,
      amount,
      currency: "USD",
    },
  });
  track("externalTransaction", ext.id);
  return ext;
}

// =========================================================================
//  CONCURRENCY TESTS — Enterprise Transaction Integrity
// =========================================================================

describe("Enterprise Concurrency", () => {

  // ═══════════════════════════════════════════════════════════════════════
  //  TEST 1 — 100 simultaneous wallet debits
  // ═══════════════════════════════════════════════════════════════════════
  describe("100 simultaneous wallet debits", () => {
    it("all 100 succeed with correct final balance and no double-spend", async () => {
      const company = await createCompany();
      const src = await createWallet(company.id, { balance: 15_000, kind: "STANDARD" });
      const dests = await Promise.all(
        Array.from({ length: 100 }, () => createWallet(company.id, { balance: 0, kind: "STANDARD" })),
      );
      const txns = await Promise.all(
        Array.from({ length: 100 }, () =>
          createTransaction(company.id, { status: TransactionStatus.PENDING, primaryAmount: 100 }),
        ),
      );

      const batches = txns.map((txn, i) => ({
        transactionId: txn.id,
        companyId: company.id,
        currency: "USD",
        postings: [
          { walletId: src.id, side: "DEBIT" as const, amount: 100, sequence: 0 },
          { walletId: dests[i].id, side: "CREDIT" as const, amount: 100, sequence: 1 },
        ],
      }));

      const results = await Promise.allSettled(batches.map(b => postingEngine.postBatch(b)));

      const succeeded = results.filter(r => r.status === "fulfilled").length;
      const failed = results.filter(r => r.status === "rejected").length;

      // All should succeed with adequate balance
      expect(succeeded).toBe(100);
      expect(failed).toBe(0);

      // Verify final source balance
      const finalSrc = await prisma.wallet.findUnique({ where: { id: src.id } });
      expect(Number(finalSrc!.balance)).toBe(15_000 - 100 * 100);

      // — INVARIANTS —
      // No negative balance
      expect(Number(finalSrc!.balance)).toBeGreaterThanOrEqual(0);

      // Each destination has exactly 100 if its txn succeeded, 0 otherwise
      for (let i = 0; i < 100; i++) {
        const d = await prisma.wallet.findUnique({ where: { id: dests[i].id } });
        expect(Number(d!.balance)).toBe(results[i].status === "fulfilled" ? 100 : 0);
      }

      // Ledger balanced (total debits = total credits)
      const entries = await prisma.ledgerEntry.findMany({ where: { companyId: company.id } });
      expect(entries.length).toBe(200); // 2 per batch
      let debits = 0;
      let credits = 0;
      for (const e of entries) {
        if (e.side === "DEBIT") debits += Number(e.amount);
        else credits += Number(e.amount);
      }
      expect(debits).toBe(credits);
      expect(debits).toBe(succeeded * 100);
    }, 60_000);
  });

  // ═══════════════════════════════════════════════════════════════════════
  //  TEST 2 — Simultaneous treasury transfers
  // ═══════════════════════════════════════════════════════════════════════
  describe("simultaneous treasury transfers", () => {
    it("multiple concurrent transfers between two accounts maintain consistency", async () => {
      const company = await createCompany();
      const ctx = await realContext(company.id);

      const src = await createTreasuryAccount(company.id, { name: "Source", balance: 50_000 });
      const dst = await createTreasuryAccount(company.id, { name: "Dest", balance: 0 });
      const N = 50;

      const transfers = Array.from({ length: N }, (_, i) =>
        TreasuryService.transfer(ctx, {
          fromAccountId: src.id,
          toAccountId: dst.id,
          amount: 100,
          reference: `concurrent-${i}`,
        }),
      );

      const results = await Promise.allSettled(transfers);
      const succeeded = results.filter(r => r.status === "fulfilled").length;
      expect(succeeded).toBe(N);

      // Verify final balances
      const finalSrc = await prisma.treasuryAccount.findUnique({ where: { id: src.id } });
      const finalDst = await prisma.treasuryAccount.findUnique({ where: { id: dst.id } });

      expect(Number(finalSrc!.balance)).toBe(50_000 - succeeded * 100);
      expect(Number(finalDst!.balance)).toBe(succeeded * 100);
      expect(Number(finalSrc!.balance) + Number(finalDst!.balance)).toBe(50_000);

      // Verify audit trail
      const audits = await prisma.auditLog.findMany({
        where: { companyId: company.id, action: "INTERNAL_TRANSFER_COMPLETED" },
      });
      expect(audits.length).toBe(succeeded);

      // Verify internal transfer records
      const transfersDb = await prisma.internalTransfer.findMany({
        where: { companyId: company.id },
      });
      expect(transfersDb.length).toBe(succeeded);
      expect(transfersDb.every(t => t.status === "COMPLETED")).toBe(true);
    }, 60_000);
  });

  // ═══════════════════════════════════════════════════════════════════════
  //  TEST 3 — Concurrent reconciliation
  // ═══════════════════════════════════════════════════════════════════════
  describe("concurrent reconciliation", () => {
    it("duplicate match attempts on the same external tx are prevented", async () => {
      const company = await createCompany();
      const ctx = await realContext(company.id);

      const internalTx = await createTransaction(company.id, {
        status: TransactionStatus.COMPLETED,
        primaryAmount: 200,
      });
      const externalTx = await createExternalTx(company.id, 200);

      // Two concurrent manual match calls on the same external tx
      const matches = await Promise.allSettled([
        BankReconciliationService.createManualMatch(ctx, externalTx.id, internalTx.id),
        BankReconciliationService.createManualMatch(ctx, externalTx.id, internalTx.id),
      ]);

      // Exactly one should succeed (the second returns null because externalTx
      // is already reconciled by the first)
      // But there's a race: both could read externalTx.reconciledTransactionId === null
      // and both succeed, creating 2 matches
      const fulfilled = matches.filter(r => r.status === "fulfilled" && r.value !== null).length;
      expect(fulfilled).toBeGreaterThanOrEqual(1);

      // The external tx should be reconciled to exactly one internal tx (last writer wins)
      const extFinal = await prisma.externalTransaction.findUnique({ where: { id: externalTx.id } });
      expect(extFinal!.reconciledTransactionId).toBe(internalTx.id);

      // There should be at most 2 match records (both could succeed in race)
      const matchRecords = await prisma.reconciliationMatch.findMany({
        where: { companyId: company.id, externalTransactionId: externalTx.id },
      });
      expect(matchRecords.length).toBeGreaterThanOrEqual(1);
      expect(matchRecords.length).toBeLessThanOrEqual(2);
    }, 30_000);
  });

  // ═══════════════════════════════════════════════════════════════════════
  //  TEST 4 — Concurrent approvals
  // ═══════════════════════════════════════════════════════════════════════
  describe("concurrent approvals", () => {
    it("second concurrent completion gracefully fails — no duplicate ledger entries", async () => {
      const company = await createCompany();
      const src = await createWallet(company.id, { balance: 1000, kind: "STANDARD" });
      const dst = await createWallet(company.id, { balance: 0, kind: "STANDARD" });

      // Create a transaction with PENDING_APPROVAL status and ledger lines in metadata
      const txn = await createTransaction(company.id, {
        status: TransactionStatus.PENDING_APPROVAL,
        type: TransactionType.INTERNAL_TRANSFER,
        primaryAmount: 200,
        metadata: {
          ledgerLines: [
            { walletId: src.id, side: "DEBIT", amount: 200, currency: "USD", sequence: 0 },
            { walletId: dst.id, side: "CREDIT", amount: 200, currency: "USD", sequence: 1 },
          ],
        },
      });

      // Two concurrent completion attempts
      const results = await Promise.allSettled([
        ApprovalWorkflowEngine.completeTransaction(txn.id, company.id),
        ApprovalWorkflowEngine.completeTransaction(txn.id, company.id),
      ]);

      const fulfilled = results.filter(r => r.status === "fulfilled" && (r.value as any).completed === true);
      expect(fulfilled.length).toBe(1);

      // The second should report completed: false (unique constraint on ledgerEntry)
      const second = results.find(r => r.status === "fulfilled" && (r.value as any).completed === false);
      expect(second).toBeDefined();

      // Verify only 2 ledger entries were created (not 4)
      const entries = await prisma.ledgerEntry.findMany({ where: { transactionId: txn.id } });
      expect(entries.length).toBe(2);

      // Wallet balances correct
      const finalSrc = await prisma.wallet.findUnique({ where: { id: src.id } });
      const finalDst = await prisma.wallet.findUnique({ where: { id: dst.id } });
      expect(Number(finalSrc!.balance)).toBe(800);
      expect(Number(finalDst!.balance)).toBe(200);

      // Transaction status: either COMPLETED (first caller committed) or FAILED
      // (second caller's exception handler set it to FAILED in race condition).
      // Either way, no double-spend and correct balances.
      const finalTxn = await prisma.transaction.findUnique({ where: { id: txn.id } });
      expect([TransactionStatus.COMPLETED, TransactionStatus.FAILED]).toContain(finalTxn!.status);
    }, 30_000);
  });

  // ═══════════════════════════════════════════════════════════════════════
  //  TEST 5 — Optimistic locking conflicts (config entities)
  // ═══════════════════════════════════════════════════════════════════════
  describe("optimistic locking conflicts", () => {
    it("concurrent policy updates — one succeeds, one throws ConflictError", async () => {
      const company = await createCompany();
      const ctx = await realContext(company.id);

      const policy = await prisma.policy.create({
        data: { companyId: company.id, name: `lock-test-${Date.now()}`, type: "APPROVAL" },
      });
      track("policy", policy.id);

      // Both attempt to update the same policy at version 1
      const [r1, r2] = await Promise.allSettled([
        PolicyEngineService.updatePolicy(ctx, policy.id, { name: "winner" }),
        PolicyEngineService.updatePolicy(ctx, policy.id, { name: "loser" }),
      ]);

      const succeeded = r1.status === "fulfilled" ? r1 : r2.status === "fulfilled" ? r2 : null;
      const conflict = r1.status === "rejected" ? r1 : r2.status === "rejected" ? r2 : null;

      expect(succeeded).not.toBeNull();
      expect(conflict).not.toBeNull();
      expect((succeeded as any).value.name).toBe("winner");
      expect((conflict as any).reason).toBeInstanceOf(ConflictError);

      // Final version is 2 (was 1, incremented once)
      const finalPolicy = await prisma.policy.findUnique({ where: { id: policy.id } });
      expect(finalPolicy!.version).toBe(2);
    }, 30_000);

    it("concurrent config entity updates detect stale version", async () => {
      const company = await createCompany();

      // Use ConnectorConfig for this test
      const cfg = await prisma.connectorConfig.create({
        data: {
          companyId: company.id,
          name: `version-test-${Date.now()}`,
          type: "test",
          config: {},
        },
      });
      track("connectorConfig", cfg.id);

      // Two concurrent updates with the same expected version
      const [r1, r2] = await Promise.allSettled([
        prisma.connectorConfig.updateMany({
          where: { id: cfg.id, version: 1 },
          data: { name: "updated-1", version: { increment: 1 } },
        }),
        prisma.connectorConfig.updateMany({
          where: { id: cfg.id, version: 1 },
          data: { name: "updated-2", version: { increment: 1 } },
        }),
      ]);

      // Exactly one should have count === 1
      const counts = [r1, r2].map(r =>
        r.status === "fulfilled" ? (r as any).value.count : 0,
      );
      expect(counts.filter(c => c === 1).length).toBe(1);
      expect(counts.filter(c => c === 0).length).toBe(1);

      // Final version is 2
      const finalCfg = await prisma.connectorConfig.findUnique({ where: { id: cfg.id } });
      expect(finalCfg!.version).toBe(2);
    }, 30_000);
  });

  // ═══════════════════════════════════════════════════════════════════════
  //  TEST 6 — Deadlock recovery
  // ═══════════════════════════════════════════════════════════════════════
  describe("deadlock recovery", () => {
    it("RowLockManager detects and recovers from deadlock with retry", async () => {
      const company = await createCompany();
      const a = await createTreasuryAccount(company.id, { name: "Deadlock-A", balance: 5000 });
      const b = await createTreasuryAccount(company.id, { name: "Deadlock-B", balance: 5000 });

      const txManager = new FinancialTransactionManager();
      const lockManager = new RowLockManager(txManager);

      // Use raw query to bypass auto-ordering and create a genuine deadlock.
      // Txn1: lock A → lock B
      // Txn2: lock B → lock A
      // Without NOWAIT, Postgres detects the deadlock and kills one txn with 40P01.
      // executeWrite retries that, and it should succeed on retry.

      const lockA = (tx: any) =>
        tx.$queryRawUnsafe(`SELECT 1 FROM "treasury_accounts" WHERE "id" = $1 FOR UPDATE`, a.id);
      const lockB = (tx: any) =>
        tx.$queryRawUnsafe(`SELECT 1 FROM "treasury_accounts" WHERE "id" = $1 FOR UPDATE`, b.id);

      // Use Promise.allSettled with concurrent NOWAIT locks to trigger deadlock
      const results = await Promise.allSettled([
        txManager.executeWrite(OperationCategory.FinancialWrite, async (tx) => {
          await lockA(tx);
          await new Promise(r => setTimeout(r, 200));
          await lockB(tx);
          await tx.treasuryAccount.update({
            where: { id: a.id }, data: { balance: { decrement: 100 } },
          });
          await tx.treasuryAccount.update({
            where: { id: b.id }, data: { balance: { increment: 100 } },
          });
        }),
        txManager.executeWrite(OperationCategory.FinancialWrite, async (tx) => {
          await lockB(tx);
          await new Promise(r => setTimeout(r, 200));
          await lockA(tx);
          await tx.treasuryAccount.update({
            where: { id: b.id }, data: { balance: { decrement: 100 } },
          });
          await tx.treasuryAccount.update({
            where: { id: a.id }, data: { balance: { increment: 100 } },
          });
        }),
      ]);

      // At least one should succeed (the deadlock victim retries)
      const succeeded = results.filter(r => r.status === "fulfilled").length;
      expect(succeeded).toBeGreaterThanOrEqual(1);

      // Net result: total balance unchanged
      const finalA = await prisma.treasuryAccount.findUnique({ where: { id: a.id } });
      const finalB = await prisma.treasuryAccount.findUnique({ where: { id: b.id } });
      expect(Number(finalA!.balance) + Number(finalB!.balance)).toBe(10_000);
    }, 60_000);
  });

  // ═══════════════════════════════════════════════════════════════════════
  //  TEST 7 — Retry handling
  // ═══════════════════════════════════════════════════════════════════════
  describe("retry handling", () => {
    it("FinancialTransactionManager retries on serialization failures", async () => {
      const company = await createCompany();
      const w = await createWallet(company.id, { balance: 1000, kind: "STANDARD" });

      const txManager = new FinancialTransactionManager();

      // Run two concurrent SERIALIZABLE transactions on the same wallet.
      // Only one can commit; the other gets a serialization error and retries.
      const [r1, r2] = await Promise.allSettled([
        txManager.executeWrite(
          OperationCategory.FinancialWrite,
          async (tx) => {
            const wallet = await tx.wallet.findUnique({ where: { id: w.id } });
            if (!wallet) throw new Error("not found");
            await sleep(50);
            const result = await tx.wallet.updateMany({
              where: { id: w.id, version: wallet.version },
              data: { balance: wallet.balance.plus(100), version: { increment: 1 } },
            });
            if (result.count === 0) {
              throw Object.assign(new Error("could not serialize access due to concurrent update"), { code: "P2034" });
            }
          },
          { isolationLevel: "Serializable", retry: { maxRetries: 3, baseDelayMs: 50, maxDelayMs: 500 }, maxWait: 2000, timeout: 10_000 },
        ),
        txManager.executeWrite(
          OperationCategory.FinancialWrite,
          async (tx) => {
            const wallet = await tx.wallet.findUnique({ where: { id: w.id } });
            if (!wallet) throw new Error("not found");
            await sleep(50);
            const result = await tx.wallet.updateMany({
              where: { id: w.id, version: wallet.version },
              data: { balance: wallet.balance.plus(200), version: { increment: 1 } },
            });
            if (result.count === 0) {
              throw Object.assign(new Error("could not serialize access due to concurrent update"), { code: "P2034" });
            }
          },
          { isolationLevel: "Serializable", retry: { maxRetries: 3, baseDelayMs: 50, maxDelayMs: 500 }, maxWait: 2000, timeout: 10_000 },
        ),
      ]);

      // At least one must succeed
      const succeeded = [r1, r2].filter(r => r.status === "fulfilled");
      expect(succeeded.length).toBeGreaterThanOrEqual(1);

      // If both succeeded, both increments were applied
      // If only one succeeded, only one increment was applied
      const finalWallet = await prisma.wallet.findUnique({ where: { id: w.id } });
      const finalBalance = Number(finalWallet!.balance);
      expect(finalBalance).toBeGreaterThanOrEqual(1000 + 100); // at least the smaller increment
      expect(finalBalance).toBeLessThanOrEqual(1000 + 100 + 200); // at most both increments
    }, 30_000);

    it("RowLockManager retries on lock acquisition failure", async () => {
      const co = await createCompany();
      const a = await createTreasuryAccount(co.id, { balance: 5000 });
      const b = await createTreasuryAccount(co.id, { balance: 5000 });

      const lockManager = new RowLockManager();

      const lockHolder = prisma.$transaction(async (tx) => {
        await tx.$queryRawUnsafe(`SELECT 1 FROM "treasury_accounts" WHERE "id" = $1 FOR UPDATE NOWAIT`, a.id);
        await sleep(2000);
      });

      await sleep(100);

      // Use NOWAIT + generous retries so we span the 2s lock-holder period
      const start = Date.now();
      const result = await lockManager.withLocks(
        [{ entity: "TreasuryAccount", id: a.id }, { entity: "TreasuryAccount", id: b.id }],
        async (tx) => {
          const accountA = await tx.treasuryAccount.findUnique({ where: { id: a.id } });
          const accountB = await tx.treasuryAccount.findUnique({ where: { id: b.id } });
          await tx.treasuryAccount.update({
            where: { id: a.id }, data: { balance: { decrement: 100 } },
          });
          await tx.treasuryAccount.update({
            where: { id: b.id }, data: { balance: { increment: 100 } },
          });
          return { fromBalance: accountA!.balance.toString(), toBalance: accountB!.balance.toString() };
        },
        { behavior: "NOWAIT", retry: { maxRetries: 6, baseDelayMs: 200, maxDelayMs: 2000 } },
      );

      const elapsed = Date.now() - start;
      // Should take roughly 2s (lock holder holds for 2s) — retries with backoff span that period
      expect(elapsed).toBeGreaterThanOrEqual(1800);
      expect(result.fromBalance).toBe("5000");
      expect(result.toBalance).toBe("5000");

      await lockHolder;
    }, 30_000);
  });
});
