import { logger } from "@/lib/logger";
import type { Connector, ConnectorResult } from './connector.interface';

export class MockConnector implements Connector {
  name = 'mock-connector';

  async settleTransaction(companyId: string, transaction: unknown): Promise<ConnectorResult> {
    logger.info({ companyId, transactionId: (transaction as any)?.id }, "[MockConnector] settleTransaction");
    return { success: true, externalId: `mock-${Date.now()}` };
  }
}

export default MockConnector;
