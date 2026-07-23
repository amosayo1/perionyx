import type { BankProviderKind, BankingRegion, ConnectionProtocol } from "../../domain/types";

export interface RegionalOverride {
  region: BankingRegion;
  countryCode?: string;
  forceProvider?: BankProviderKind;
  disabledProviders?: BankProviderKind[];
  preferredOrder?: BankProviderKind[];
}

export interface EnterpriseProviderConfig {
  tenantId: string;
  forceProvider?: BankProviderKind;
  disabledProviders?: BankProviderKind[];
  preferredOrder?: BankProviderKind[];
  blacklistedProviders?: BankProviderKind[];
  regionalOverrides?: RegionalOverride[];
  defaultProtocol?: ConnectionProtocol;
}

export class EnterpriseProviderConfigManager {
  private configs = new Map<string, EnterpriseProviderConfig>();

  setConfig(config: EnterpriseProviderConfig): void {
    this.configs.set(config.tenantId, config);
  }

  getConfig(tenantId: string): EnterpriseProviderConfig | null {
    return this.configs.get(tenantId) ?? null;
  }

  removeConfig(tenantId: string): void {
    this.configs.delete(tenantId);
  }

  clearConfigs(): void {
    this.configs.clear();
  }

  isProviderDisabledForTenant(tenantId: string, provider: BankProviderKind): boolean {
    const config = this.configs.get(tenantId);
    if (!config) return false;
    if (config.disabledProviders?.includes(provider)) return true;
    if (config.blacklistedProviders?.includes(provider)) return true;
    return false;
  }

  isProviderForcedForTenant(tenantId: string, provider: BankProviderKind): boolean {
    const config = this.configs.get(tenantId);
    if (!config) return false;
    return config.forceProvider === provider;
  }

  getPreferredOrder(tenantId: string): BankProviderKind[] | null {
    return this.configs.get(tenantId)?.preferredOrder ?? null;
  }

  getRegionalOverride(
    tenantId: string,
    region: BankingRegion,
    countryCode?: string,
  ): RegionalOverride | null {
    const config = this.configs.get(tenantId);
    if (!config?.regionalOverrides) return null;

    const exactMatch = config.regionalOverrides.find(
      (o) => o.region === region && o.countryCode === countryCode,
    );
    if (exactMatch) return exactMatch;

    const regionMatch = config.regionalOverrides.find(
      (o) => o.region === region && !o.countryCode,
    );
    return regionMatch ?? null;
  }

  getAllConfigs(): EnterpriseProviderConfig[] {
    return Array.from(this.configs.values());
  }

  get count(): number {
    return this.configs.size;
  }
}

export const enterpriseProviderConfig = new EnterpriseProviderConfigManager();
