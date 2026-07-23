import type { AccountGroupDefinition, GroupFilterCriteria } from "../types";
import type { BankAccount } from "../../domain/types";

export class AccountGroupingEngine {
  private groups = new Map<string, AccountGroupDefinition>();

  createGroup(
    name: string,
    description: string,
    filterCriteria: GroupFilterCriteria,
    dynamic: boolean = false,
  ): AccountGroupDefinition {
    const group: AccountGroupDefinition = {
      id: crypto.randomUUID(),
      name,
      description,
      filterCriteria,
      accountIds: [],
      dynamic,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.groups.set(group.id, group);
    return group;
  }

  addAccountToGroup(groupId: string, accountId: string): void {
    const group = this.groups.get(groupId);
    if (!group) throw new Error(`Group not found: ${groupId}`);
    if (!group.accountIds.includes(accountId)) {
      group.accountIds.push(accountId);
      group.updatedAt = new Date().toISOString();
    }
  }

  removeAccountFromGroup(groupId: string, accountId: string): void {
    const group = this.groups.get(groupId);
    if (!group) return;
    group.accountIds = group.accountIds.filter((id) => id !== accountId);
    group.updatedAt = new Date().toISOString();
  }

  getGroup(groupId: string): AccountGroupDefinition | undefined {
    return this.groups.get(groupId);
  }

  getGroupsByAccount(accountId: string): AccountGroupDefinition[] {
    return Array.from(this.groups.values()).filter((g) =>
      g.accountIds.includes(accountId),
    );
  }

  applyDynamicFilter(accounts: BankAccount[], criteria: GroupFilterCriteria): string[] {
    return accounts
      .filter((a) => {
        if (criteria.countries && criteria.countries.length > 0) return true;
        if (criteria.currencies && !criteria.currencies.includes(a.currency)) return false;
        if (criteria.types && !criteria.types.includes(a.type)) return false;
        if (criteria.legalEntities && a.legalEntityId && !criteria.legalEntities.includes(a.legalEntityId))
          return false;
        if (criteria.balanceRange) {
          const balance = parseFloat(a.balance.current);
          if (balance < criteria.balanceRange.min || balance > criteria.balanceRange.max) return false;
        }
        return true;
      })
      .map((a) => a.id);
  }

  refreshDynamicGroups(accounts: BankAccount[]): void {
    for (const [, group] of this.groups) {
      if (group.dynamic) {
        group.accountIds = this.getDynamicFilter(accounts, group.filterCriteria);
        group.updatedAt = new Date().toISOString();
      }
    }
  }

  private getDynamicFilter(accounts: BankAccount[], criteria: GroupFilterCriteria): string[] {
    return accounts
      .filter((a) => {
        if (criteria.countries && criteria.countries.length > 0 &&
            !criteria.countries.includes(a.metadata.country as string ?? "")) return false;
        if (criteria.currencies && !criteria.currencies.includes(a.currency)) return false;
        if (criteria.types && !criteria.types.includes(a.type)) return false;
        if (criteria.legalEntities && a.legalEntityId &&
            !criteria.legalEntities.includes(a.legalEntityId)) return false;
        if (criteria.balanceRange) {
          const balance = parseFloat(a.balance.current);
          if (balance < criteria.balanceRange.min || balance > criteria.balanceRange.max) return false;
        }
        return true;
      })
      .map((a) => a.id);
  }

  deleteGroup(groupId: string): void {
    this.groups.delete(groupId);
  }

  getAllGroups(): AccountGroupDefinition[] {
    return Array.from(this.groups.values());
  }

  clear(): void {
    this.groups.clear();
  }

  get count(): number {
    return this.groups.size;
  }
}

export const accountGroupingEngine = new AccountGroupingEngine();