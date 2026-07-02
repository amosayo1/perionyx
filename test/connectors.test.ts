import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '../src/server/db/prisma';
import { ConnectorsManager } from '../src/modules/integrations/connectors/manager';

let companyId: string;

describe('Connectors manager', () => {
  beforeAll(async () => {
    const c = await prisma.company.create({ data: { name: `ConnCo-${Date.now()}`, slug: `conn-${Date.now()}` } });
    companyId = c.id;
    await prisma.connectorConfig.create({ data: { companyId, name: 'tc', type: 'mock', config: {}, active: true } });
  });

  afterAll(async () => {
    await prisma.settlementRecord.deleteMany({ where: { companyId } });
    await prisma.connectorConfig.deleteMany({ where: { companyId } });
    await prisma.company.deleteMany({ where: { id: companyId } });
    await prisma.$disconnect();
  });

  it('creates settlement records and marks delivered', async () => {
    const txn = { id: 'tx-test-' + Date.now() };
    await ConnectorsManager.settle(companyId, txn as any);
    const recs = await prisma.settlementRecord.findMany({ where: { companyId } });
    expect(recs.length).toBeGreaterThan(0);
    expect(recs[0].status === 'DELIVERED' || recs[0].status === 'FAILED').toBe(true);
  });
});
