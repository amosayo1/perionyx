import 'dotenv/config';
import { processPendingDeliveries } from '@/modules/integrations/webhook-worker';

async function main() {
  const processed = await processPendingDeliveries(200);
  console.log('Processed deliveries:', processed);
  process.exit(0);
}

main().catch((e)=>{ console.error(e); process.exit(1); });
