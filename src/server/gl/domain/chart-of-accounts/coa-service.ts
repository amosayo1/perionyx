import type { Account, AccountCategory, AccountType } from "../../types";

export class ChartOfAccountsService {
  private accounts = new Map<string, Account>();

  addAccount(account: Account): Account {
    this.accounts.set(account.id, account);
    return account;
  }

  getAccount(id: string): Account | undefined {
    return this.accounts.get(id);
  }

  getAllAccounts(): Account[] {
    return Array.from(this.accounts.values());
  }

  updateAccount(id: string, update: Partial<Account>): Account | undefined {
    const existing = this.accounts.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...update, updatedAt: new Date() };
    this.accounts.set(id, updated);
    return updated;
  }

  deleteAccount(id: string): boolean {
    return this.accounts.delete(id);
  }

  getByCategory(category: AccountCategory): Account[] {
    return this.getAllAccounts().filter(a => a.category === category);
  }

  getByType(type: AccountType): Account[] {
    return this.getAllAccounts().filter(a => a.type === type);
  }

  getActiveAccounts(): Account[] {
    return this.getAllAccounts().filter(a => a.isActive);
  }

  getNaturalAccounts(): Account[] {
    return this.getAllAccounts().filter(a => !a.isControlAccount && !a.isSummaryAccount);
  }

  getControlAccounts(): Account[] {
    return this.getAllAccounts().filter(a => a.isControlAccount);
  }

  getSummaryAccounts(): Account[] {
    return this.getAllAccounts().filter(a => a.isSummaryAccount);
  }

  getTree(parentId?: string): Account[] {
    return this.getAllAccounts().filter(a => a.parentId === parentId);
  }

  getChildren(accountId: string): Account[] {
    return this.getAllAccounts().filter(a => a.parentId === accountId);
  }

  getDescendants(accountId: string): Account[] {
    const result: Account[] = [];
    const children = this.getChildren(accountId);
    for (const child of children) {
      result.push(child);
      result.push(...this.getDescendants(child.id));
    }
    return result;
  }

  search(query: string): Account[] {
    const q = query.toLowerCase();
    return this.getAllAccounts().filter(a =>
      a.name.toLowerCase().includes(q) ||
      a.accountNumber.toLowerCase().includes(q) ||
      a.description.toLowerCase().includes(q)
    );
  }

  count(): number {
    return this.accounts.size;
  }
}
