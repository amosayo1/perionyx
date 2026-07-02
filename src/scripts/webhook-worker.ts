import 'dotenv/config';
import { processPendingDeliveries } from '@/modules/integrations/webhook-worker';

async function main() {
  console.log('Webhook worker starting');
  while (true) {
    try {
      await processPendingDeliveries();
    } catch (err) {
      console.error('Worker error:', err);
    }
    await new Promise((r) => setTimeout(r, 2000));
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
