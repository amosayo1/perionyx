import { BaseStep } from "./base-step";
import type { OnboardingSession, ValidationResult, StepExecutionResult, StepProgress } from "../types";
import type { TenantContext } from "@/server/context/tenant-context";
import { prisma } from "@/server/db/prisma";
import { TreasuryService } from "@/modules/treasury/treasury.service";

function getTenantContext(session: OnboardingSession): TenantContext {
  return { userId: (session.metadata.adminUserId as string) ?? "system", companyId: session.companyId, role: "ADMIN" };
}

interface TreasuryAccountInput {
  name: string;
  currency?: string;
  description?: string;
}

const DEFAULT_ACCOUNTS: TreasuryAccountInput[] = [
  { name: "Operating Account", currency: "USD", description: "Primary operating account" },
  { name: "Reserve Account", currency: "USD", description: "Reserve funds account" },
];

export class TreasurySetupStep extends BaseStep {
  readonly stepId = "treasury-setup" as const;

  async validate(session: OnboardingSession): Promise<ValidationResult> {
    const errors: Array<{ field: string; message: string; code: string }> = [];

    const accountCount = await prisma.treasuryAccount.count({
      where: { companyId: session.companyId },
    });
    if (accountCount === 0) {
      errors.push({ field: "treasuryAccounts", message: "At least one treasury account required", code: "MISSING_TREASURY_ACCOUNTS" });
    }

    const walletCount = await prisma.wallet.count({
      where: { companyId: session.companyId, kind: "STANDARD" },
    });
    if (walletCount === 0) {
      errors.push({ field: "wallets", message: "At least one internal wallet required", code: "MISSING_WALLETS" });
    }

    const hasSpendingLimit = await prisma.accountControl.findFirst({
      where: { companyId: session.companyId, type: "SPENDING_LIMIT" },
    });
    if (!hasSpendingLimit && accountCount > 0) {
      errors.push({ field: "approvalLimits", message: "Configure at least one spending limit", code: "MISSING_SPENDING_LIMIT" });
    }

    return { valid: errors.length === 0, errors, warnings: [] };
  }

  async execute(session: OnboardingSession): Promise<StepExecutionResult> {
    const ctx = getTenantContext(session);
    const metadata = session.metadata;
    const accountsInput = (metadata.treasuryInput as TreasuryAccountInput[]) ?? DEFAULT_ACCOUNTS;

    const createdAccounts: Array<{ id: string; name: string; currency: string }> = [];
    const errors: Array<{ name: string; error: string }> = [];

    for (const acct of accountsInput) {
      try {
        const result = await TreasuryService.createAccount(ctx, {
          name: acct.name,
          currency: acct.currency,
          description: acct.description,
        });
        createdAccounts.push({ id: result.id, name: result.name, currency: result.currency });
      } catch (err: any) {
        errors.push({ name: acct.name, error: err?.message ?? "Account creation failed" });
      }
    }

    const accounts = await prisma.treasuryAccount.findMany({
      where: { companyId: session.companyId },
      orderBy: { createdAt: "asc" },
    });

    const wallets = await prisma.wallet.findMany({
      where: { companyId: session.companyId },
      orderBy: { createdAt: "asc" },
    });

    const controls = await prisma.accountControl.findMany({
      where: { companyId: session.companyId },
    });

    let liquiditySummary = null;
    try {
      liquiditySummary = await TreasuryService.getLiquiditySummary(ctx);
    } catch {
      // liquidity summary may fail if no external accounts linked
    }

    return this.successResult({
      accountsCreated: createdAccounts.length,
      accountErrors: errors,
      accounts: accounts.map((a) => ({
        id: a.id, name: a.name, currency: a.currency, balance: a.balance.toString(), isActive: a.isActive,
      })),
      wallets: wallets.map((w) => ({
        id: w.id, name: w.name, currency: w.currency, balance: w.balance.toString(), kind: w.kind,
      })),
      controls: controls.map((c) => ({
        id: c.id, type: c.type, scope: c.scope, value: c.value.toString(), description: c.description,
      })),
      liquiditySummary,
      appliedDefaults: !metadata.treasuryInput,
      completedAt: new Date().toISOString(),
    });
  }

  getProgress(session: OnboardingSession): StepProgress {
    const completed = session.steps.find((s) => s.stepId === "treasury-setup")?.status === "COMPLETED" ? 1 : 0;
    return { stepId: "treasury-setup", completed, total: 1, label: "Treasury setup" };
  }
}
