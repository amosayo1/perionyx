import type { BankAccount, AccountOwner, AccountOwnerType } from "../domain/types";

export interface AccountRecord {
  connectionId: string;
  externalId: string;
  companyId: string;
  legalEntityId?: string;
  name: string;
  officialName?: string;
  type: string;
  subtype: string | null;
  currency: string;
  accountNumber?: string;
  iban?: string;
  bic?: string;
  routingNumber?: string;
  mask: string | null;
  ownerName?: string;
  ownerEmail?: string;
  currentBalance: number;
  availableBalance: number | null;
  limit: number | null;
  metadata?: Record<string, unknown>;
}

export class BankingAccountService {
  private accounts = new Map<string, BankAccount>();
  private owners = new Map<string, AccountOwner[]>();

  createAccount(record: AccountRecord): BankAccount {
    const now = new Date().toISOString();
    const account: BankAccount = {
      id: crypto.randomUUID(),
      connectionId: record.connectionId,
      externalId: record.externalId,
      companyId: record.companyId,
      legalEntityId: record.legalEntityId,
      name: record.name,
      officialName: record.officialName,
      type: record.type as BankAccount["type"],
      subtype: record.subtype,
      currency: record.currency,
      accountNumber: record.accountNumber,
      iban: record.iban,
      bic: record.bic,
      routingNumber: record.routingNumber,
      mask: record.mask,
      ownerName: record.ownerName,
      ownerEmail: record.ownerEmail,
      openedAt: now,
      closedAt: null,
      isActive: true,
      isLinkedToTreasury: false,
      balance: {
        current: record.currentBalance.toFixed(2),
        available: record.availableBalance?.toFixed(2) ?? null,
        limit: record.limit?.toFixed(2) ?? null,
        currency: record.currency,
        recordedAt: now,
        isStale: false,
      },
      metadata: record.metadata ?? {},
      version: 1,
      createdAt: now,
      updatedAt: now,
    };

    this.accounts.set(account.id, account);
    return account;
  }

  updateAccount(accountId: string, updates: Partial<BankAccount>): BankAccount | null {
    const account = this.accounts.get(accountId);
    if (!account) return null;

    Object.assign(account, updates, {
      updatedAt: new Date().toISOString(),
      version: account.version + 1,
    });

    this.accounts.set(accountId, account);
    return account;
  }

  linkToTreasury(accountId: string, treasuryAccountId: string): BankAccount | null {
    const account = this.accounts.get(accountId);
    if (!account) return null;

    account.isLinkedToTreasury = true;
    account.treasuryAccountId = treasuryAccountId;
    account.updatedAt = new Date().toISOString();
    account.version++;

    this.accounts.set(accountId, account);
    return account;
  }

  unlinkFromTreasury(accountId: string): BankAccount | null {
    const account = this.accounts.get(accountId);
    if (!account) return null;

    account.isLinkedToTreasury = false;
    account.treasuryAccountId = undefined;
    account.updatedAt = new Date().toISOString();
    account.version++;

    this.accounts.set(accountId, account);
    return account;
  }

  getAccount(accountId: string): BankAccount | undefined {
    return this.accounts.get(accountId);
  }

  getAccountsByConnection(connectionId: string): BankAccount[] {
    return Array.from(this.accounts.values()).filter(
      (a) => a.connectionId === connectionId,
    );
  }

  getAccountsByCompany(companyId: string): BankAccount[] {
    return Array.from(this.accounts.values()).filter(
      (a) => a.companyId === companyId,
    );
  }

  getAccountsByLegalEntity(companyId: string, entityId: string): BankAccount[] {
    return Array.from(this.accounts.values()).filter(
      (a) => a.companyId === companyId && a.legalEntityId === entityId,
    );
  }

  getAccountsByCurrency(companyId: string, currency: string): BankAccount[] {
    return Array.from(this.accounts.values()).filter(
      (a) => a.companyId === companyId && a.currency === currency,
    );
  }

  getLinkedAccounts(companyId: string): BankAccount[] {
    return Array.from(this.accounts.values()).filter(
      (a) => a.companyId === companyId && a.isLinkedToTreasury,
    );
  }

  getUnlinkedAccounts(companyId: string): BankAccount[] {
    return Array.from(this.accounts.values()).filter(
      (a) => a.companyId === companyId && !a.isLinkedToTreasury,
    );
  }

  updateBalance(accountId: string, balance: BankAccount["balance"]): BankAccount | null {
    const account = this.accounts.get(accountId);
    if (!account) return null;

    account.balance = {
      ...balance,
      recordedAt: new Date().toISOString(),
      isStale: false,
    };
    account.updatedAt = new Date().toISOString();
    account.version++;

    this.accounts.set(accountId, account);
    return account;
  }

  closeAccount(accountId: string): boolean {
    const account = this.accounts.get(accountId);
    if (!account) return false;

    account.isActive = false;
    account.closedAt = new Date().toISOString();
    account.updatedAt = account.closedAt;
    account.version++;

    this.accounts.set(accountId, account);
    return true;
  }

  addOwner(accountId: string, owner: Omit<AccountOwner, "id">): AccountOwner | null {
    if (!this.accounts.has(accountId)) return null;

    const ownerRecord: AccountOwner = {
      ...owner,
      id: crypto.randomUUID(),
    };

    if (!this.owners.has(accountId)) {
      this.owners.set(accountId, []);
    }
    this.owners.get(accountId)!.push(ownerRecord);
    return ownerRecord;
  }

  getOwners(accountId: string): AccountOwner[] {
    return this.owners.get(accountId) ?? [];
  }
}

export const bankingAccountService = new BankingAccountService();