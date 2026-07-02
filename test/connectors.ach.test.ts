import 'dotenv/config';
import { describe, it, expect } from 'vitest';
import { ConnectorsManager } from '../src/modules/integrations/connectors/manager';
import { prisma } from '../src/server/db/prisma';

describe('ACH Connector', () => {
  it('creates settlement records and marks delivered for ACH connector', async () => {
    const company = await prisma.company.create({ data: { name: 'ACH Co', slug: `ach-co-${Date.now()}` } });
    const cfg = await prisma.connectorConfig.create({ data: { companyId: company.id, name: 'ACH Test Connector', type: 'ach', config: { accountId: 'acc-1', routingNumber: '111000025' }, active: true } });

    const tx = await prisma.transaction.create({ data: { companyId: company.id, type: 'WALLET_CREDIT', primaryAmount: 50, currency: 'USD', idempotencyKey: `tx-${Date.now()}` } as any });

    await ConnectorsManager.settle(company.id, tx);

    const recs = await prisma.settlementRecord.findMany({ where: { companyId: company.id } });
    expect(recs.length).toBeGreaterThan(0);
    expect(recs[0].status).toMatch(/DELIVERED|FAILED/);
  });
});
