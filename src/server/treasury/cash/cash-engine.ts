import type {
  CashPosition,
  CashClassification,
  TreasuryAccount,
  WorkingCapital,
  CashPolicy,
} from "../domain/types";
import { AccountStatus } from "../domain/types";

export interface CashSummary {
  totalCash: number;
  availableCash: number;
  restrictedCash: number;
  idleCash: number;
  classificationBreakdown: Record<string, number>;
  currencyBreakdown: Record<string, number>;
  entityBreakdown: Record<string, number>;
}

export class CashEngine {
  classifyCash(account: TreasuryAccount, balance: number): CashPosition[] {
    const positions: CashPosition[] = [];
    const classification = account.classification;

    positions.push({
      id: `cash-${account.id}-${classification}`,
      companyId: account.companyId,
      legalEntityId: account.legalEntityId,
      region: account.region,
      currency: account.currency,
      classification,
      totalBalance: balance,
      availableBalance: balance - (account.minimumBalance ?? 0),
      ledgerBalance: balance,
      floatBalance: 0,
      bankBalance: balance,
      bankAccountId: account.bankAccountId,
      bankConnectionId: "",
      providerKind: "",
      institutionName: account.institutionName,
      lastSyncedAt: new Date().toISOString(),
      recordedAt: new Date().toISOString(),
    });

    return positions;
  }

  computeWorkingCapital(
    currentAssets: number,
    currentLiabilities: number,
    accountsReceivable: number,
    accountsPayable: number,
    inventory: number,
    companyId: string,
    legalEntityId: string,
    currency: string,
  ): WorkingCapital {
    const netWorkingCapital = currentAssets - currentLiabilities;
    return {
      id: `wc-${legalEntityId}-${currency}`,
      companyId,
      legalEntityId,
      currency,
      currentAssets,
      currentLiabilities,
      netWorkingCapital,
      currentRatio: currentLiabilities > 0 ? currentAssets / currentLiabilities : 0,
      quickRatio: currentLiabilities > 0
        ? (currentAssets - inventory) / currentLiabilities
        : 0,
      cashConversionCycleDays: 0,
      accountsReceivable,
      accountsPayable,
      inventory,
      calculatedAt: new Date().toISOString(),
    };
  }

  summarizePositions(positions: CashPosition[]): CashSummary {
    const totalCash = positions.reduce((s, p) => s + p.totalBalance, 0);
    const availableCash = positions.reduce((s, p) => s + p.availableBalance, 0);
    const restrictedCash = positions
      .filter((p) => p.classification === "RESTRICTED" as CashClassification)
      .reduce((s, p) => s + p.totalBalance, 0);
    const operatingCash = positions
      .filter((p) => p.classification === "OPERATING" as CashClassification)
      .reduce((s, p) => s + p.totalBalance, 0);
    const idleCash = totalCash - restrictedCash - operatingCash;

    const classificationBreakdown: Record<string, number> = {};
    const currencyBreakdown: Record<string, number> = {};
    const entityBreakdown: Record<string, number> = {};

    for (const pos of positions) {
      const cls = pos.classification;
      classificationBreakdown[cls] = (classificationBreakdown[cls] ?? 0) + pos.totalBalance;
      currencyBreakdown[pos.currency] = (currencyBreakdown[pos.currency] ?? 0) + pos.totalBalance;
      entityBreakdown[pos.legalEntityId] = (entityBreakdown[pos.legalEntityId] ?? 0) + pos.totalBalance;
    }

    return { totalCash, availableCash, restrictedCash, idleCash, classificationBreakdown, currencyBreakdown, entityBreakdown };
  }

  getAccountsByClassification(
    accounts: TreasuryAccount[],
    classification: CashClassification,
  ): TreasuryAccount[] {
    return accounts.filter((a) => a.classification === classification && a.status === AccountStatus.ACTIVE);
  }

  getAccountsByRole(
    accounts: TreasuryAccount[],
    role: import("../domain/types").TreasuryRole,
  ): TreasuryAccount[] {
    return accounts.filter((a) => a.treasuryRole === role && a.status === AccountStatus.ACTIVE);
  }

  checkPolicyViolations(account: TreasuryAccount, balance: number, policies: CashPolicy[]): string[] {
    const violations: string[] = [];
    for (const policy of policies) {
      if (!policy.enabled) continue;
      if (policy.currency !== account.currency) continue;
      if (policy.legalEntityId && policy.legalEntityId !== account.legalEntityId) continue;

      if (policy.minimumBalance !== null && balance < policy.minimumBalance) {
        violations.push(`Minimum cash breach: ${balance} < ${policy.minimumBalance} (${policy.name})`);
      }
      if (policy.maximumBalance !== null && balance > policy.maximumBalance) {
        violations.push(`Maximum cash breach: ${balance} > ${policy.maximumBalance} (${policy.name})`);
      }
    }
    return violations;
  }
}

export const cashEngine = new CashEngine();
