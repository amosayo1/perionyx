import type { OwnerHierarchyNode, AccountOwnership, OwnershipTier } from "../types";

export class OwnershipEngine {
  private hierarchies = new Map<string, OwnerHierarchyNode>();
  private ownerships = new Map<string, AccountOwnership[]>();

  registerHierarchy(root: OwnerHierarchyNode): void {
    this.hierarchies.set(root.id, root);
  }

  getHierarchy(enterpriseId: string): OwnerHierarchyNode | undefined {
    return this.hierarchies.get(enterpriseId);
  }

  assignOwnership(
    accountId: string,
    enterpriseId: string,
    ownerId: string,
    ownershipPercentage: number,
    assignedBy: string,
  ): AccountOwnership {
    const hierarchy = this.hierarchies.get(enterpriseId);
    if (!hierarchy) throw new Error(`No hierarchy found for enterprise: ${enterpriseId}`);

    const ownerPath = this.findPath(hierarchy, ownerId);
    const tier = this.resolveTier(ownerId);

    const ownership: AccountOwnership = {
      accountId,
      ownerPath,
      primaryOwnerId: ownerId,
      ownershipPercentage,
      tier,
      assignedAt: new Date().toISOString(),
      assignedBy,
    };

    const existing = this.ownerships.get(accountId) ?? [];
    existing.push(ownership);
    this.ownerships.set(accountId, existing);

    return ownership;
  }

  getOwnerships(accountId: string): AccountOwnership[] {
    return this.ownerships.get(accountId) ?? [];
  }

  getAccountsByOwner(ownerId: string): AccountOwnership[] {
    const results: AccountOwnership[] = [];
    for (const [, ownerships] of this.ownerships) {
      for (const ownership of ownerships) {
        if (ownership.primaryOwnerId === ownerId || ownership.ownerPath.includes(ownerId)) {
          results.push(ownership);
        }
      }
    }
    return results;
  }

  getAccountsByTier(tier: OwnershipTier): AccountOwnership[] {
    const results: AccountOwnership[] = [];
    for (const [, ownerships] of this.ownerships) {
      for (const ownership of ownerships) {
        if (ownership.tier === tier) {
          results.push(ownership);
        }
      }
    }
    return results;
  }

  removeOwnership(accountId: string, ownerId: string): void {
    const existing = this.ownerships.get(accountId);
    if (!existing) return;
    this.ownerships.set(
      accountId,
      existing.filter((o) => o.primaryOwnerId !== ownerId),
    );
  }

  clearOwnerships(accountId?: string): void {
    if (accountId) {
      this.ownerships.delete(accountId);
    } else {
      this.ownerships.clear();
    }
  }

  private findPath(node: OwnerHierarchyNode, targetId: string, path: string[] = []): string[] {
    const currentPath = [...path, node.id];
    if (node.id === targetId) return currentPath;

    for (const child of node.children) {
      const result = this.findPath(child, targetId, currentPath);
      if (result.length > 0) return result;
    }

    return [];
  }

  private resolveTier(ownerId: string): OwnershipTier {
    for (const [, hierarchy] of this.hierarchies) {
      const path = this.findPath(hierarchy, ownerId);
      if (path.length > 0) {
        const tiers: OwnershipTier[] = [
          "ENTERPRISE",
          "HOLDING_COMPANY",
          "LEGAL_ENTITY",
          "BUSINESS_UNIT",
          "DEPARTMENT",
        ];
        const pathIndex = path.indexOf(ownerId);
        return tiers[Math.min(pathIndex, tiers.length - 1)] ?? "DEPARTMENT";
      }
    }
    return "DEPARTMENT";
  }

  getAllHierarchies(): Map<string, OwnerHierarchyNode> {
    return new Map(this.hierarchies);
  }
}

export const ownershipEngine = new OwnershipEngine();