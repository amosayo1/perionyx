import 'dotenv/config';
import { getMetrics } from '@/modules/metrics/metrics';

async function queryPrometheus(promUrl: string, query: string, token?: string): Promise<number> {
  const url = `${promUrl.replace(/\/$/, '')}/api/v1/query?query=${encodeURIComponent(query)}`;
  const headers: Record<string,string> = { 'Accept': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`Prometheus query failed: ${res.status}`);
  const json = await res.json();
  if (json.status !== 'success') throw new Error('Prometheus returned non-success');
  const val = json.data?.result?.[0]?.value?.[1];
  return val ? Number(val) : 0;
}

/**
 * Resolve a metric either by querying an external Prometheus (if PROMETHEUS_URL set)
 * or by reading the in-process metrics export.
 */
async function resolveMetric(metricExpr: string): Promise<number> {
  const prom = process.env.PROMETHEUS_URL;
  const token = process.env.PROMETHEUS_BEARER_TOKEN;
  if (prom) {
    return await queryPrometheus(prom, metricExpr, token);
  }
  const metrics = await getMetrics();
  // simple parse: look for a line starting with metric name (no labels)
  const lines = metrics.split('\n');
  const name = metricExpr.replace(/\{.*\}/, '').split('(').join('').split(')').join('').trim();
  for (const l of lines) {
    if (l.startsWith(name + ' ')) {
      const v = parseFloat(l.split(' ').pop() || '0');
      return isNaN(v) ? 0 : v;
    }
  }
  return 0;
}

async function main() {
  const maxFailedDeliveries = Number(process.env.METRICS_GATE_MAX_FAILED_DELIVERIES ?? '0');
  const maxFailedSettlements = Number(process.env.METRICS_GATE_MAX_FAILED_SETTLEMENTS ?? '0');

  // Use increase(...) queries for recent windows when using Prometheus
  const failedDeliveriesExpr = process.env.PROMETHEUS_URL ? 'increase(perionyx_webhook_deliveries_total{status="FAILED"}[5m])' : 'perionyx_webhook_deliveries_total{status="FAILED"}';
  const failedSettlementsExpr = process.env.PROMETHEUS_URL ? 'increase(perionyx_settlement_records_total{status="FAILED"}[5m])' : 'perionyx_settlement_records_total{status="FAILED"}';

  const failedDeliveries = await resolveMetric(failedDeliveriesExpr);
  const failedSettlements = await resolveMetric(failedSettlementsExpr);

  console.log('Metrics gate thresholds:', { maxFailedDeliveries, maxFailedSettlements });
  console.log('Observed:', { failedDeliveries, failedSettlements });

  let failed = false;
  if (failedDeliveries > maxFailedDeliveries) {
    console.error(`Failed deliveries ${failedDeliveries} > allowed ${maxFailedDeliveries}`);
    failed = true;
  }
  if (failedSettlements > maxFailedSettlements) {
    console.error(`Failed settlements ${failedSettlements} > allowed ${maxFailedSettlements}`);
    failed = true;
  }

  if (failed) process.exit(2);
  console.log('Metrics gate passed');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
