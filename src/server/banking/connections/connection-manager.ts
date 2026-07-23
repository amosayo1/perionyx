import type { IBankProvider } from "../providers/interface";
import type {
  BankConnection,
  BankProviderKind,
  ConnectionProtocol,
} from "../domain/types";
import { ConnectionStatus } from "../domain/types";
import { bankProviderRegistry } from "../providers/registry/engine";
import { bankingRoutingEngine } from "../architecture/routing-engine";

export interface CreateConnectionRequest {
  providerKind: BankProviderKind;
  companyId: string;
  legalEntityId?: string;
  institutionId?: string;
  institutionName?: string;
  label: string;
  protocol: ConnectionProtocol;
  syncFrequencyMinutes: number;
  metadata?: Record<string, unknown>;
}

export interface ConnectionLinkRequest {
  connectionId: string;
  userId: string;
  institutionId?: string;
  country?: string;
  redirectUri?: string;
  credentials?: Record<string, unknown>;
}

export class ConnectionManager {
  validateProtocolCompatibility(
    providerKind: BankProviderKind,
    protocol: ConnectionProtocol,
  ): boolean {
    const provider = bankProviderRegistry.get(providerKind);
    if (!provider) return false;

    const manifest = provider.getManifest();
    return manifest.protocols.includes(protocol);
  }

  getRecommendedProtocol(providerKind: BankProviderKind): ConnectionProtocol | null {
    const provider = bankProviderRegistry.get(providerKind);
    if (!provider) return null;
    const manifest = provider.getManifest();
    return (manifest.protocols[0] as ConnectionProtocol) ?? null;
  }

  getConnectionHealthScore(connection: BankConnection): number {
    let score = 100;

    if (!connection.lastSyncAt) { score -= 20; }

    if (connection.status === "ERROR") { score -= 30; }
    if (connection.status === "DEGRADED") { score -= 15; }
    if (connection.status === "DISCONNECTED") { score -= 40; }

    if (connection.expiresAt) {
      const daysUntilExpiry = (new Date(connection.expiresAt).getTime() - Date.now()) / 86400000;
      if (daysUntilExpiry <= 0) { score -= 50; }
      else if (daysUntilExpiry <= 7) { score -= 20; }
      else if (daysUntilExpiry <= 30) { score -= 10; }
    }

    return Math.max(0, Math.min(100, score));
  }

  buildConnectionRecord(params: CreateConnectionRequest): BankConnection {
    return {
      id: crypto.randomUUID(),
      providerKind: params.providerKind,
      institutionId: params.institutionId ?? "",
      institutionName: params.institutionName ?? "",
      companyId: params.companyId,
      legalEntityId: params.legalEntityId,
      label: params.label,
      status: "PENDING",
      protocol: params.protocol,
      credentialId: undefined,
      lastAuthAt: null,
      lastSyncAt: null,
      nextSyncAt: null,
      syncFrequencyMinutes: params.syncFrequencyMinutes,
      expiresAt: null,
      version: 1,
      metadata: params.metadata ?? {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as BankConnection;
  }

  async emitConnectionEvent(
    _type: string,
    _connectionId: string,
    _providerKind: BankProviderKind,
    _companyId: string,
    _payload: Record<string, unknown>,
  ): Promise<void> {
    // Event bus removed — no subscribers existed
  }
}

export const connectionManager = new ConnectionManager();