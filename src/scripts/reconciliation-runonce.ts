import 'dotenv/config';
import { reconcileSettlements } from '@/modules/ledger/reconciliation-engine';
import { prisma } from '@/server/db/prisma';

async function main() {
  console.log('Reconciliation runonce starting');
  // In real setup, fetch bank report via connector or SFTP; here we build a demo report
  const all = await prisma.settlementRecord.findMany({ take: 10 });
  const report = all.map((r) => ({ externalId: r.externalId ?? `ext-${r.id}`, status: r.status }));
  const res = await reconcileSettlements(all[0]?.companyId ?? '', report);
  console.log('Reconciliation results:', res);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
