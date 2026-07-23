import type { Account, AccountType, AccountStatus, AccountIdentifier } from "../types";

export class ChartOfAccountsService {
  private accounts = new Map<AccountIdentifier, Account>();

  addAccount(account: Account): void {
    this.accounts.set(account.id, account);
  }

  getAccount(id: AccountIdentifier): Account | undefined {
    return this.accounts.get(id);
  }

  getAllAccounts(): Account[] {
    return [...this.accounts.values()];
  }

  getAccountsByType(type: AccountType): Account[] {
    return this.getAllAccounts().filter((a) => a.type === type);
  }

  getAccountsByStatus(status: AccountStatus): Account[] {
    return this.getAllAccounts().filter((a) => a.status === status);
  }

  getAccountsByCompany(companyId: string): Account[] {
    return this.getAllAccounts().filter((a) => a.companyId === companyId);
  }

  getActiveAccounts(): Account[] {
    return this.getAccountsByStatus("active");
  }

  getByCode(code: string): Account | undefined {
    return this.getAllAccounts().find((a) => a.code === code);
  }

  getChildren(parentId: AccountIdentifier): Account[] {
    return this.getAllAccounts().filter((a) => a.parentId === parentId);
  }

  getTree(parentId?: AccountIdentifier, level = 0): AccountTreeNode[] {
    const children = this.getAllAccounts().filter(
      (a) => (parentId ? a.parentId === parentId : !a.parentId) && a.level === level,
    );
    return children.map((a) => ({
      account: a,
      children: this.getTree(a.id, level + 1),
    }));
  }

  search(query: string): Account[] {
    const q = query.toLowerCase();
    return this.getAllAccounts().filter(
      (a) =>
        a.code.toLowerCase().includes(q) ||
        a.name.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q),
    );
  }

  count(): number {
    return this.accounts.size;
  }
}

export interface AccountTreeNode {
  account: Account;
  children: AccountTreeNode[];
}
