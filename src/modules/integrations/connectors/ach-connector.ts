import type { Connector, ConnectorResult } from './connector.interface';

export class AchConnector implements Connector {
  name = 'ach-connector';

  constructor(private opts: { accountId?: string; routingNumber?: string } = {}) {}

  async settleTransaction(companyId: string, tx: any): Promise<ConnectorResult> {
    try {
      const externalId = `ach-${String(tx?.id ?? Date.now())}`;
      await new Promise((r) => setTimeout(r, 10));
      return { success: true, externalId, message: 'settled' };
    } catch (e: any) {
      return { success: false, message: String(e?.message ?? e) };
    }
  }
}

export default AchConnector;
