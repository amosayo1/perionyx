import type { DiscoveredAccountInfo, DiscoveryResult, DiscoveredAccountType } from "../types";
import { bankingAccountService } from "../account-service";

export const DISCOVERABLE_ACCOUNT_TYPES: { type: DiscoveredAccountType; indicators: string[]; keywords: string[] }[] = [
  { type: "CHECKING", indicators: ["checking", "current"], keywords: ["check", "current", "everyday", "transaction"] },
  { type: "SAVINGS", indicators: ["savings", "deposit"], keywords: ["savings", "deposit", "money market"] },
  { type: "OPERATING", indicators: ["operating", "operations", "opex"], keywords: ["operating", "operations", "opex", "working capital"] },
  { type: "PAYROLL", indicators: ["payroll", "salary", "wages"], keywords: ["payroll", "salary", "wages", "employee", "compensation"] },
  { type: "TREASURY", indicators: ["treasury", "reserve", "liquidity"], keywords: ["treasury", "reserve", "liquidity", "cash reserve"] },
  { type: "INVESTMENT", indicators: ["investment", "portfolio", "brokerage"], keywords: ["investment", "portfolio", "brokerage", "securities"] },
  { type: "LOAN", indicators: ["loan", "credit facility", "borrowing"], keywords: ["loan", "credit facility", "borrowing", "finance"] },
  { type: "CREDIT", indicators: ["credit card", "line of credit"], keywords: ["credit", "card", "line of credit", "revolving"] },
  { type: "ESCROW", indicators: ["escrow", "trust", "holding"], keywords: ["escrow", "trust", "holding", "settlement"] },
  { type: "VIRTUAL", indicators: ["virtual", "sub-account", "multi-currency"], keywords: ["virtual", "sub-account", "multi-currency"] },
  { type: "MERCHANT", indicators: ["merchant", "payment gateway"], keywords: ["merchant", "payment", "gateway", "processing"] },
  { type: "CUSTODY", indicators: ["custody", "safekeeping"], keywords: ["custody", "safekeeping", "depository"] },
  { type: "PETTY_CASH", indicators: ["petty cash", "cash on hand"], keywords: ["petty", "cash", "imprest"] },
  { type: "SUSPENSE", indicators: ["suspense", "clearing", "pending"], keywords: ["suspense", "clearing", "pending", "unallocated"] },
];

export class AccountDiscoveryEngine {
  async discover(connectionId: string, providerKind: string, rawAccounts: DiscoveredAccountInfo[]): Promise<DiscoveryResult> {
    const existingIds = new Set(
      bankingAccountService.getAccountsByConnection(connectionId).map((a) => a.externalId),
    );

    const discovered: DiscoveredAccountInfo[] = [];
    const duplicates: DiscoveredAccountInfo[] = [];
    const warnings: string[] = [];

    for (const raw of rawAccounts) {
      if (existingIds.has(raw.externalId)) {
        duplicates.push(raw);
        continue;
      }

      const typed = this.autoDetectType(raw);
      discovered.push(typed);
    }

    for (const acc of discovered) {
      bankingAccountService.createAccount({
        connectionId,
        externalId: acc.externalId,
        companyId: "",
        name: acc.name,
        officialName: acc.officialName,
        type: acc.type,
        subtype: acc.subtype,
        currency: acc.currency,
        accountNumber: acc.accountNumber,
        iban: acc.iban,
        bic: acc.bic,
        routingNumber: acc.routingNumber,
        mask: acc.mask,
        ownerName: acc.ownerName,
        ownerEmail: acc.ownerEmail,
        currentBalance: acc.balance.current,
        availableBalance: acc.balance.available,
        limit: acc.balance.limit,
        metadata: acc.metadata,
      });
    }

    const provider = providerKind;
    const discoveredAt = new Date().toISOString();

    return {
      accounts: discovered,
      provider,
      connectionId,
      discoveredAt,
      totalFound: rawAccounts.length,
      newAccounts: discovered.length,
      duplicatesFound: duplicates.length,
      warnings,
    };
  }

  autoDetectType(account: DiscoveredAccountInfo): DiscoveredAccountInfo {
    const name = account.name.toLowerCase();
    const officialName = account.officialName?.toLowerCase() ?? "";
    const searchText = `${name} ${officialName}`;

    for (const rule of DISCOVERABLE_ACCOUNT_TYPES) {
      const matchesKeyword = rule.keywords.some((kw) => searchText.includes(kw));
      const matchesIndicator = rule.indicators.some((ind) => searchText.includes(ind));
      if (matchesKeyword || matchesIndicator) {
        return { ...account, type: rule.type as any };
      }
    }

    return { ...account, type: "CHECKING" as any };
  }

  getAccountType(keyword: string): DiscoveredAccountType | null {
    const lower = keyword.toLowerCase();
    for (const rule of DISCOVERABLE_ACCOUNT_TYPES) {
      if (rule.indicators.some((i) => lower.includes(i)) || rule.keywords.some((k) => lower.includes(k))) {
        return rule.type;
      }
    }
    return null;
  }

  getAllDiscoverableTypes(): DiscoveredAccountType[] {
    return DISCOVERABLE_ACCOUNT_TYPES.map((r) => r.type);
  }
}

export const accountDiscoveryEngine = new AccountDiscoveryEngine();