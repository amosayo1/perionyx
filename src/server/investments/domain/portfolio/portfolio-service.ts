import type { Portfolio, PortfolioType, AssetAllocation } from "../../types";

export class PortfolioService {
  private portfolios: Map<string, Portfolio> = new Map();

  add(portfolio: Portfolio): void {
    this.portfolios.set(portfolio.id, portfolio);
  }

  getById(id: string): Portfolio | undefined {
    return this.portfolios.get(id);
  }

  getAll(): Portfolio[] {
    return [...this.portfolios.values()];
  }

  getByType(type: PortfolioType): Portfolio[] {
    return this.getAll().filter((p) => p.type === type);
  }

  getByTenant(tenantId: string): Portfolio[] {
    return this.getAll().filter((p) => p.tenantId === tenantId);
  }

  getChildren(parentId: string): Portfolio[] {
    return this.getAll().filter((p) => p.parentId === parentId);
  }

  getTree(rootId: string): PortfolioTreeNode {
    const root = this.getById(rootId);
    if (!root) throw new Error(`Portfolio not found: ${rootId}`);
    return this.buildTree(root);
  }

  getConsolidated(portfolioIds: string[]): Portfolio | null {
    const portfolios = portfolioIds.map((id) => this.getById(id)).filter(Boolean) as Portfolio[];
    if (portfolios.length === 0) return null;
    return {
      id: "consolidated",
      name: "Consolidated Portfolio",
      type: "consolidated",
      currency: "USD",
      region: "global",
      tenantId: portfolios[0].tenantId,
      status: "active",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  private buildTree(portfolio: Portfolio): PortfolioTreeNode {
    const children = this.getChildren(portfolio.id).map((child) => this.buildTree(child));
    return { portfolio, children };
  }
}

export interface PortfolioTreeNode {
  portfolio: Portfolio;
  children: PortfolioTreeNode[];
}
