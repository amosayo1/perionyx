import type { BankConnection } from "../../domain/types";
import { ConnectionStatus } from "../../domain/types";
import type {
  ConnectionHealthStatus,
} from "../types";
import { bankingHealthMonitor } from "../../health/health-monitor";

export interface ConnectionHealthConfig {
  credentialExpiryWarningDays: number;
  maxFailedSyncsBeforeWarning: number;
  reconnectRequiredAfterDays: number;
}

const DEFAULT_CONFIG: ConnectionHealthConfig = {
  credentialExpiryWarningDays: 7,
  maxFailedSyncsBeforeWarning: 3,
  reconnectRequiredAfterDays: 90,
};

export class ConnectionHealthMonitor {
  private config: ConnectionHealthConfig;
  private connectionStates = new Map<string, ConnectionHealthStatus>();

  constructor(config?: Partial<ConnectionHealthConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  assess(connection: BankConnection): ConnectionHealthStatus {
    const existing = this.connectionStates.get(connection.id);

    const credentialExpiresAt = connection.expiresAt;
    const credentialDaysRemaining = credentialExpiresAt
      ? Math.round(
          (new Date(credentialExpiresAt).getTime() - Date.now()) / 86400000,
        )
      : null;

    let permissionStatus: ConnectionHealthStatus["permissionStatus"] = "UNKNOWN";
    if (connection.status === ConnectionStatus.REVOKED) {
      permissionStatus = "REVOKED";
    } else if (connection.status === ConnectionStatus.EXPIRED) {
      permissionStatus = "DEGRADED";
    } else if (
      connection.status === ConnectionStatus.CONNECTED ||
      connection.status === ConnectionStatus.PENDING
    ) {
      permissionStatus = "HEALTHY";
    }

    const failedSyncCount = existing?.failedSyncCount ?? 0;
    const connectionAgeDays = connection.createdAt
      ? Math.round(
          (Date.now() - new Date(connection.createdAt).getTime()) / 86400000,
        )
      : 0;

    const lastFailedSync = existing?.lastFailedSync ?? null;
    const reconnectRequired =
      connectionAgeDays >= this.config.reconnectRequiredAfterDays ||
      connection.status === ConnectionStatus.ERROR;

    let healthScore = 100;
    const warnings: string[] = [];
    const errors: string[] = [];

    if (connection.status === ConnectionStatus.ERROR) {
      healthScore -= 30;
      errors.push("Connection is in error state");
    }
    if (connection.status === ConnectionStatus.REVOKED) {
      healthScore -= 50;
      errors.push("Connection was revoked");
    }
    if (connection.status === ConnectionStatus.EXPIRED) {
      healthScore -= 40;
      errors.push("Connection has expired");
    }
    if (credentialDaysRemaining !== null && credentialDaysRemaining <= 0) {
      healthScore -= 25;
      errors.push("Credential has expired");
    } else if (
      credentialDaysRemaining !== null &&
      credentialDaysRemaining <= this.config.credentialExpiryWarningDays
    ) {
      healthScore -= 10;
      warnings.push(
        `Credential expires in ${credentialDaysRemaining} days`,
      );
    }
    if (failedSyncCount >= this.config.maxFailedSyncsBeforeWarning) {
      healthScore -= 15;
      warnings.push(`${failedSyncCount} consecutive sync failures`);
    }
    if (reconnectRequired) {
      healthScore -= 5;
      warnings.push("Re-authentication recommended");
    }
    if (connection.status === ConnectionStatus.DISCONNECTED) {
      healthScore -= 40;
      errors.push("Connection is disconnected");
    }

    const status: ConnectionHealthStatus = {
      connectionId: connection.id,
      providerKind: connection.providerKind,
      institutionName: connection.institutionName,
      status: connection.status,
      credentialExpiresAt: connection.expiresAt,
      credentialDaysRemaining,
      permissionStatus,
      lastSuccessfulSync: connection.lastSyncAt,
      lastFailedSync,
      failedSyncCount,
      healthScore: Math.max(0, healthScore),
      connectionAgeDays,
      reconnectRequired,
      lastHealthCheckAt: new Date().toISOString(),
      warnings,
      errors,
    };

    this.connectionStates.set(connection.id, status);
    return status;
  }

  get(connectionId: string): ConnectionHealthStatus | null {
    return this.connectionStates.get(connectionId) ?? null;
  }

  getAll(): ConnectionHealthStatus[] {
    return Array.from(this.connectionStates.values());
  }

  getUnhealthy(): ConnectionHealthStatus[] {
    return this.getAll().filter((c) => c.healthScore < 70 || c.errors.length > 0);
  }

  getExpiringCredentials(daysThreshold?: number): ConnectionHealthStatus[] {
    const threshold = daysThreshold ?? this.config.credentialExpiryWarningDays;
    return this.getAll().filter(
      (c) =>
        c.credentialDaysRemaining !== null &&
        c.credentialDaysRemaining <= threshold,
    );
  }

  remove(connectionId: string): void {
    this.connectionStates.delete(connectionId);
  }

  clear(): void {
    this.connectionStates.clear();
  }
}

export const connectionHealthMonitor = new ConnectionHealthMonitor();