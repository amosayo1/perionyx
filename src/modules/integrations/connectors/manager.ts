import { prisma } from '@/server/db/prisma';
import { MockConnector } from './mock-connector';
import type { ConnectorResult } from './connector.interface';
import { FileSecretStore } from '@/modules/secrets/secret-store';
import { logger } from "@/lib/logger";
import { incSettlement, incSettlementAttempt } from '@/modules/metrics/metrics';

const secretStore = new FileSecretStore();

export class ConnectorsManager {
  // Map connector type to implementation factory
  static connectorForType(type: string) {
    switch (type) {
      case 'mock':
        return new MockConnector();
      case 'http':
        // HTTP connectors will be constructed per-config (manager will instantiate with config)
        return null;
      case 'ach':
        // ACH connectors are instantiated per-config below
        return null;
      default:
        return null;
    }
  }

  static async settle(companyId: string, txn: any) {
    const configs = await prisma.connectorConfig.findMany({ where: { companyId, active: true } });
    for (const cfg of configs) {
      // resolve secrets from config if present
      if (cfg.config && (cfg.config as any).secretRef) {
        const val = await secretStore.getSecret((cfg.config as any).secretRef);
        if (val) (cfg.config as any).secret = val;
      }

      let connectorImpl = this.connectorForType(cfg.type);
      // for http type, instantiate HttpConnector with config
      if (cfg.type === 'http') {
        const { HttpConnector } = await import('./http-connector');
        const apiKey = (cfg.config as any)?.apiKey ?? null;
        connectorImpl = new HttpConnector({ baseUrl: (cfg.config as any)?.baseUrl ?? '', apiKey });
      }
      if (cfg.type === 'ach') {
        const { AchConnector } = await import('./ach-connector');
        const accountId = (cfg.config as any)?.accountId ?? undefined;
        const routingNumber = (cfg.config as any)?.routingNumber ?? undefined;
        connectorImpl = new AchConnector({ accountId, routingNumber });
      }
      const connector = connectorImpl;
      if (!connector) {
        logger.warn({ type: cfg.type }, "No connector for type");
        continue;
      }

      // determine if transaction exists; only set transactionId if present in DB
      let transactionId: string | null = null;
      if (txn?.id) {
        const existing = await prisma.transaction.findUnique({ where: { id: String(txn.id) } });
        if (existing) transactionId = String(txn.id);
      }

      // create settlement record
      const rec = await prisma.settlementRecord.create({ data: { companyId, transactionId, connectorName: cfg.name, status: 'PENDING' } });
      incSettlement('PENDING');

      try {
        const res: ConnectorResult = await connector.settleTransaction(companyId, txn);
        await prisma.settlementRecord.update({ where: { id: rec.id }, data: { status: res.success ? 'DELIVERED' : 'FAILED', externalId: res.externalId ?? null, response: res as any, attempts: { increment: 1 } } });
        incSettlementAttempt();
        incSettlement(res.success ? 'DELIVERED' : 'FAILED');
      } catch (err: any) {
        await prisma.settlementRecord.update({ where: { id: rec.id }, data: { status: 'FAILED', response: { error: String(err?.message ?? err) } as any, attempts: { increment: 1 } } });
        incSettlementAttempt();
        incSettlement('FAILED');
      }
    }
  }
}

export default ConnectorsManager;
