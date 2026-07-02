import 'dotenv/config';
import { describe, it, expect } from 'vitest';
import { prisma } from '../src/server/db/prisma';
import { reconcileSettlements } from '../src/modules/ledger/reconciliation-engine';

describe('Reconciliation Engine', () => {
  it('matches settlement records by externalId and marks them reconciled', async () => {
    const company = await prisma.company.create({ data: { name: 'Recon Co', slug: `recon-co-${Date.now()}` } });
    // create a settlement record with externalId
    const tx = await prisma.transaction.create({ data: { companyId: company.id, type: 'WALLET_CREDIT', primaryAmount: 10, currency: 'USD', idempotencyKey: `tx-${Date.now()}` } as any });
    const rec = await prisma.settlementRecord.create({ data: { companyId: company.id, transactionId: tx.id, connectorName: 'ach', status: 'DELIVERED', externalId: 'bank-123' } });

    const res = await reconcileSettlements(company.id, [{ externalId: 'bank-123', status: 'COMPLETED' }, { externalId: 'missing-1', status: 'COMPLETED' }]);

    expect(res.find((r) => r.externalId === 'bank-123')?.matched).toBe(true);
    const updated = await prisma.settlementRecord.findUnique({ where: { id: rec.id } });
    expect(updated?.status).toBe('RECONCILED');
  });
});
