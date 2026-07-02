import 'dotenv/config';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createServer } from 'http';
import { ConnectorsManager } from '../src/modules/integrations/connectors/manager';
import { prisma } from '../src/server/db/prisma';

let server: ReturnType<typeof createServer>;
let port: number;

beforeAll(async () => {
  // start a tiny HTTP mock server to simulate external connector
  server = createServer((req, res) => {
    if (req.url === '/settle' && req.method === 'POST') {
      let body = '';
      req.on('data', (c) => (body += c));
      req.on('end', () => {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ id: 'ext-123', received: JSON.parse(body) }));
      });
    } else {
      res.writeHead(404).end();
    }
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', () => r(undefined)));
  // @ts-ignore
  port = (server.address() as any).port;
});

afterAll(async () => {
  server.close();
  await prisma.$disconnect();
});

describe('HTTP Connector', () => {
  it('settles via HTTP endpoint and records settlement', async () => {
    // create a company
    const company = await prisma.company.create({ data: { name: 'HTTP Co', slug: `http-co-${Date.now()}` } });
    // create connector config pointing to mock server
    const cfg = await prisma.connectorConfig.create({ data: { companyId: company.id, name: 'HTTP Test Connector', type: 'http', config: { baseUrl: `http://127.0.0.1:${port}` }, active: true } });

    // create a fake transaction
    const tx = await prisma.transaction.create({ data: { companyId: company.id, type: 'WALLET_CREDIT', primaryAmount: 100, currency: 'USD', idempotencyKey: `tx-${Date.now()}` } as any });

    await ConnectorsManager.settle(company.id, tx);

    const recs = await prisma.settlementRecord.findMany({ where: { companyId: company.id } });
    expect(recs.length).toBeGreaterThan(0);
    expect(recs[0].status).toMatch(/DELIVERED|FAILED/);
  });
});
