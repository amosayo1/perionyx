import { prisma } from "@/server/db/prisma";
import { ConflictError } from "@/lib/errors/app-error";

export interface ErpConnectionState {
  realmId?: string;
  organizationName?: string;
  accessToken?: string;
  refreshToken?: string;
  tokenExpiresAt?: string;
  connectedAt?: string;
  lastSyncAt?: string;
}

export class ErpService {
  async getConnectionState(companyId: string, connectorId: string): Promise<ErpConnectionState | null> {
    const record = await prisma.connectorConfig.findFirst({
      where: { id: connectorId, companyId },
    });
    if (!record) return null;
    const cfg = record.config as Record<string, unknown> | null;
    if (!cfg?.erpConnection) return null;
    return cfg.erpConnection as ErpConnectionState;
  }

  async updateConnectionState(
    companyId: string,
    connectorId: string,
    state: Partial<ErpConnectionState>,
  ): Promise<void> {
    const record = await prisma.connectorConfig.findFirst({
      where: { id: connectorId, companyId },
    });
    if (!record) return;

    const cfg = (record.config as Record<string, any>) ?? {};
    cfg.erpConnection = { ...(cfg.erpConnection ?? {}), ...state };

    const erpResult = await prisma.connectorConfig.updateMany({
      where: { id: connectorId, version: (record as any).version },
      data: { config: cfg as any, version: { increment: 1 } },
    });
    if (erpResult.count === 0) {
      throw new ConflictError("Concurrent modification detected — ERP connection state update conflicted.");
    }
  }

  async deleteConnectionState(companyId: string, connectorId: string): Promise<void> {
    const record = await prisma.connectorConfig.findFirst({
      where: { id: connectorId, companyId },
    });
    if (!record) return;

    const cfg = (record.config as Record<string, any>) ?? {};
    delete cfg.erpConnection;

    const erpResult = await prisma.connectorConfig.updateMany({
      where: { id: connectorId, version: (record as any).version },
      data: { config: cfg as any, version: { increment: 1 } },
    });
    if (erpResult.count === 0) {
      throw new ConflictError("Concurrent modification detected — ERP connection state delete conflicted.");
    }
  }

  async listActiveConnections(companyId: string): Promise<{ connectorId: string; provider: string; state: ErpConnectionState }[]> {
    const records = await prisma.connectorConfig.findMany({
      where: {
        companyId,
        type: { in: ["dynamics365", "netsuite", "sap"] },
        active: true,
      },
    });

    return records
      .filter((r) => {
        const cfg = r.config as Record<string, unknown> | null;
        return cfg?.erpConnection != null;
      })
      .map((r) => ({
        connectorId: r.id,
        provider: r.type,
        state: ((r.config as Record<string, any>)?.erpConnection ?? {}) as ErpConnectionState,
      }));
  }
}
