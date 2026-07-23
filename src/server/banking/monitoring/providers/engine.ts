import type { BankProviderKind, BankingRegion } from "../../domain/types";
import type { ProviderHealth, ProviderMonitorSnapshot } from "../types";

export interface ProviderMonitorConfig {
  healthyLatencyThresholdMs: number;
  warningLatencyThresholdMs: number;
  criticalLatencyThresholdMs: number;
  checkIntervalMinutes: number;
}

const DEFAULT_CONFIG: ProviderMonitorConfig = {
  healthyLatencyThresholdMs: 1000,
  warningLatencyThresholdMs: 3000,
  criticalLatencyThresholdMs: 5000,
  checkIntervalMinutes: 15,
};

const PROVIDER_LIST: BankProviderKind[] = [
  "plaid", "lean", "tarabut", "yap", "truelayer", "tink",
  "salted", "finicity", "mx", "akoya", "yodlee", "gocardless",
  "direct-api", "swift", "iso20022", "open-banking",
];

export class ProviderMonitor {
  private config: ProviderMonitorConfig;
  private snapshots = new Map<string, ProviderMonitorSnapshot[]>();
  private providerStates = new Map<string, ProviderHealth>();
  private maxHistory = 100;

  constructor(config?: Partial<ProviderMonitorConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  async checkProvider(
    providerKind: BankProviderKind,
    region: BankingRegion = "GLOBAL" as BankingRegion,
  ): Promise<ProviderHealth> {
    const simulatedLatency = this.simulateLatency();
    const available = this.simulateAvailability(providerKind);
    const rateLimitRemaining = Math.floor(Math.random() * 100);
    const rateLimitTotal = 100;
    const capabilitiesAvailable = this.simulateCapabilities(providerKind, region);

    let authStatus: ProviderHealth["authStatus"] = "HEALTHY";
    let error: string | null = null;
    let webhookHealthy = true;
    const capabilitiesMissing: string[] = [];

    if (!available) {
      authStatus = "FAILED";
      error = "Provider is unavailable";
    } else if (simulatedLatency > this.config.criticalLatencyThresholdMs) {
      authStatus = "DEGRADED";
      error = `High latency: ${simulatedLatency}ms`;
    } else if (simulatedLatency > this.config.warningLatencyThresholdMs) {
      authStatus = "DEGRADED";
    }

    if (rateLimitRemaining < 10) {
      webhookHealthy = false;
    }

    const providerHealth: ProviderHealth = {
      providerKind,
      region,
      available,
      latencyMs: simulatedLatency,
      apiVersion: "v2.1",
      authStatus,
      webhookHealthy,
      rateLimitRemaining,
      rateLimitTotal,
      capabilitiesAvailable,
      capabilitiesMissing,
      lastCheckedAt: new Date().toISOString(),
      error,
    };

    this.recordSnapshot({
      providerKind,
      available,
      latencyMs: simulatedLatency,
      checkedAt: new Date().toISOString(),
      error,
    });

    this.providerStates.set(`${providerKind}::${region}`, providerHealth);
    return providerHealth;
  }

  async checkAllProviders(): Promise<ProviderHealth[]> {
    const regions: BankingRegion[] = [
      "NORTH_AMERICA" as BankingRegion,
      "EUROPE" as BankingRegion,
      "UNITED_KINGDOM" as BankingRegion,
      "MIDDLE_EAST" as BankingRegion,
      "ASIA_PACIFIC" as BankingRegion,
      "GLOBAL" as BankingRegion,
    ];

    const results: ProviderHealth[] = [];
    for (const provider of PROVIDER_LIST) {
      for (const region of regions) {
        const result = await this.checkProvider(provider, region);
        results.push(result);
      }
    }
    return results;
  }

  getProviderHealth(
    providerKind: BankProviderKind,
    region?: BankingRegion,
  ): ProviderHealth | null {
    const key = `${providerKind}::${region ?? "GLOBAL"}`;
    return this.providerStates.get(key) ?? null;
  }

  getProviderHistory(
    providerKind: BankProviderKind,
    limit = 20,
  ): ProviderMonitorSnapshot[] {
    const snapshots = this.snapshots.get(providerKind) ?? [];
    return snapshots.slice(-limit);
  }

  getAllProviderStates(): ProviderHealth[] {
    return Array.from(this.providerStates.values());
  }

  getUnhealthyProviders(): ProviderHealth[] {
    return this.getAllProviderStates().filter(
      (p) => !p.available || p.authStatus !== "HEALTHY",
    );
  }

  getProvidersByAvailability(): {
    available: ProviderHealth[];
    degraded: ProviderHealth[];
    unavailable: ProviderHealth[];
  } {
    const all = this.getAllProviderStates();
    return {
      available: all.filter((p) => p.available && p.authStatus === "HEALTHY"),
      degraded: all.filter(
        (p) => p.available && p.authStatus === "DEGRADED",
      ),
      unavailable: all.filter((p) => !p.available || p.authStatus === "FAILED"),
    };
  }

  private recordSnapshot(snapshot: ProviderMonitorSnapshot): void {
    const key = snapshot.providerKind;
    if (!this.snapshots.has(key)) {
      this.snapshots.set(key, []);
    }
    const list = this.snapshots.get(key)!;
    list.push(snapshot);
    if (list.length > this.maxHistory) {
      list.shift();
    }
  }

  private simulateLatency(): number {
    return Math.round(Math.random() * 3000 + 100);
  }

  private simulateAvailability(providerKind: BankProviderKind): boolean {
    const unavailabilityMap: Partial<Record<BankProviderKind, number>> = {
      yodlee: 0.85,
      mx: 0.9,
    };
    const availabilityThreshold = unavailabilityMap[providerKind] ?? 0.98;
    return Math.random() < availabilityThreshold;
  }

  private simulateCapabilities(
    providerKind: BankProviderKind,
    region: BankingRegion,
  ): string[] {
    const base = [
      "BALANCES", "TRANSACTIONS", "IDENTITY",
    ];
    if (region === "NORTH_AMERICA" as BankingRegion) {
      base.push("PAYMENTS", "ACH", "WIRE");
    } else if (region === "EUROPE" as BankingRegion || region === "UNITED_KINGDOM" as BankingRegion) {
      base.push("PAYMENTS", "SEPA", "DIRECT_DEBIT");
    } else if (region === "MIDDLE_EAST" as BankingRegion) {
      base.push("PAYMENTS");
    }
    if (providerKind === "plaid" || providerKind === "truelayer") {
      base.push("WEBHOOKS", "REAL_TIME");
    }
    return base;
  }
}

export const providerMonitor = new ProviderMonitor();