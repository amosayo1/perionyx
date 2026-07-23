import type { BankProviderKind, BankingRegion, ProviderCapability } from "../../domain/types";
import { PROVIDER_DEFINITIONS } from "../definitions/provider-definitions";
import type { CapabilityMatrixEntry, CapabilityMatch, CapabilityQuery } from "./types";

export class CapabilityMatrix {
  private matrix: CapabilityMatrixEntry[];

  constructor() {
    this.matrix = this.buildMatrix();
  }

  private buildMatrix(): CapabilityMatrixEntry[] {
    const entries: CapabilityMatrixEntry[] = [];
    const allCapabilities = [
      "BALANCES", "TRANSACTIONS", "PAYMENTS", "STANDING_ORDERS",
      "BENEFICIARIES", "FX", "STATEMENTS", "IDENTITY", "WEBHOOKS",
      "HISTORICAL_SYNC", "REAL_TIME", "ACCOUNT_DISCOVERY",
      "ACCOUNT_VERIFICATION", "DIRECT_DEBIT", "SCHEDULED_PAYMENTS",
      "BULK_PAYMENTS", "RECONCILIATION", "REPORTING",
    ] as ProviderCapability[];

    for (const def of PROVIDER_DEFINITIONS) {
      for (const cap of allCapabilities) {
        const supported = def.capabilities.includes(cap);
        const regionRestricted = supported && def.regions.length > 0 &&
          !def.regions.some((r) => r.region === "GLOBAL" as any);
        entries.push({
          provider: def.kind,
          capability: cap,
          supported,
          regionRestricted,
          regions: regionRestricted ? def.regions.map((r) => r.region) : undefined,
        });
      }
    }

    return entries;
  }

  getMatrix(): CapabilityMatrixEntry[] {
    return this.matrix;
  }

  getProviderCapabilities(provider: BankProviderKind): ProviderCapability[] {
    const def = PROVIDER_DEFINITIONS.find((d) => d.kind === provider);
    return def?.capabilities ?? [];
  }

  supportsCapability(provider: BankProviderKind, capability: ProviderCapability): boolean {
    return this.matrix.some(
      (e) => e.provider === provider && e.capability === capability && e.supported,
    );
  }

  getProvidersWithCapability(capability: ProviderCapability): BankProviderKind[] {
    return this.matrix
      .filter((e) => e.capability === capability && e.supported)
      .map((e) => e.provider);
  }

  findBestMatch(query: CapabilityQuery): CapabilityMatch[] {
    const matches: CapabilityMatch[] = [];

    for (const def of PROVIDER_DEFINITIONS) {
      const matched = query.requiredCapabilities.filter((cap) =>
        def.capabilities.includes(cap),
      );
      const missing = query.requiredCapabilities.filter(
        (cap) => !def.capabilities.includes(cap),
      );
      const matchRatio = query.requiredCapabilities.length > 0
        ? matched.length / query.requiredCapabilities.length
        : 0;

      if (matchRatio > 0) {
        matches.push({
          provider: def.kind,
          matchedCapabilities: matched,
          missingCapabilities: missing,
          matchRatio,
        });
      }
    }

    return matches.sort((a, b) => b.matchRatio - a.matchRatio);
  }

  getRegionalCoverage(provider: BankProviderKind, region: BankingRegion): boolean {
    const def = PROVIDER_DEFINITIONS.find((d) => d.kind === provider);
    if (!def) return false;
    return def.regions.some((r) => r.region === region);
  }
}

export const capabilityMatrix = new CapabilityMatrix();
