import 'dotenv/config';
import { getMetrics } from '@/modules/metrics/metrics';

async function main() {
  const m = await getMetrics();
  console.log(m);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
