import type { LegalEntity, AccountGroup, BankAccount, AccountOwner } from "../domain/types";
import { AccountGroupType } from "../domain/types";

export interface EnterpriseHierarchy {
  companyId: string;
  legalEntities: LegalEntity[];
  groups: AccountGroup[];
  accounts: BankAccount[];
}

export interface HierarchyNode {
  id: string;
  type: "enterprise" | "legal_entity" | "business_unit" | "bank" | "account" | "group";
  name: string;
  children: HierarchyNode[];
  metadata?: Record<string, unknown>;
}

export class AccountHierarchyBuilder {
  buildEnterpriseTree(hierarchy: EnterpriseHierarchy): HierarchyNode {
    const root: HierarchyNode = {
      id: hierarchy.companyId,
      type: "enterprise",
      name: "Enterprise",
      children: [],
    };

    for (const entity of hierarchy.legalEntities) {
      const entityNode = this.buildEntityNode(entity, hierarchy);
      root.children.push(entityNode);
    }

    const unassignedAccounts = hierarchy.accounts.filter(
      (a) => !hierarchy.legalEntities.some(
        (e) => e.id === a.legalEntityId,
      ),
    );
    if (unassignedAccounts.length > 0) {
      root.children.push({
        id: "unassigned",
        type: "legal_entity",
        name: "Unassigned Accounts",
        children: unassignedAccounts.map((a) => this.accountToNode(a)),
        metadata: { count: unassignedAccounts.length },
      });
    }

    return root;
  }

  private buildEntityNode(entity: LegalEntity, hierarchy: EnterpriseHierarchy): HierarchyNode {
    const entityAccounts = hierarchy.accounts.filter((a) => a.legalEntityId === entity.id);
    const entityGroups = hierarchy.groups.filter((g) => g.legalEntityId === entity.id);

    const node: HierarchyNode = {
      id: entity.id,
      type: "legal_entity",
      name: entity.name,
      children: [],
      metadata: {
        legalName: entity.legalName,
        taxId: entity.taxId,
        country: entity.country,
        currency: entity.currency,
        hierarchyLevel: entity.hierarchyLevel,
      },
    };

    for (const group of entityGroups) {
      const groupAccounts = entityAccounts.filter((a) => group.accountIds.includes(a.id));
      node.children.push({
        id: group.id,
        type: "group",
        name: group.name,
        children: groupAccounts.map((a) => this.accountToNode(a)),
        metadata: { groupType: group.type, description: group.description },
      });
    }

    const groupedIds = new Set(entityGroups.flatMap((g) => g.accountIds));
    const ungroupedAccounts = entityAccounts.filter((a) => !groupedIds.has(a.id));

    for (const account of ungroupedAccounts) {
      node.children.push(this.accountToNode(account));
    }

    if (entity.children.length > 0) {
      for (const childId of entity.children) {
        const childEntity = hierarchy.legalEntities.find((e) => e.id === childId);
        if (childEntity) {
          node.children.push(this.buildEntityNode(childEntity, hierarchy));
        }
      }
    }

    return node;
  }

  private accountToNode(account: BankAccount): HierarchyNode {
    return {
      id: account.id,
      type: "account",
      name: `${account.name} (${account.currency})`,
      children: [],
      metadata: {
        type: account.type,
        currency: account.currency,
        mask: account.mask,
        balance: account.balance.current,
        isActive: account.isActive,
      },
    };
  }

  getAccountsByLegalEntity(accounts: BankAccount[], entityId: string): BankAccount[] {
    return accounts.filter((a) => a.legalEntityId === entityId);
  }

  getAccountsByGroup(accounts: BankAccount[], groups: AccountGroup[], groupId: string): BankAccount[] {
    const group = groups.find((g) => g.id === groupId);
    if (!group) return [];
    return accounts.filter((a) => group.accountIds.includes(a.id));
  }

  getAccountsByCurrency(accounts: BankAccount[], currency: string): BankAccount[] {
    return accounts.filter((a) => a.currency === currency);
  }

  getRootEntities(entities: LegalEntity[]): LegalEntity[] {
    return entities.filter((e) => !e.parentId || e.isHeadOffice);
  }

  getChildEntities(entities: LegalEntity[], parentId: string): LegalEntity[] {
    return entities.filter((e) => e.parentId === parentId);
  }
}

export const accountHierarchyBuilder = new AccountHierarchyBuilder();