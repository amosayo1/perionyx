import client from 'prom-client';

client.collectDefaultMetrics({ prefix: 'perionyx_' });

const register = client.register;

const webhookDeliveries = new client.Counter({
  name: 'perionyx_webhook_deliveries_total',
  help: 'Total webhook deliveries processed',
  labelNames: ['status'] as const,
});

const webhookDeliveryAttempts = new client.Counter({
  name: 'perionyx_webhook_delivery_attempts_total',
  help: 'Total webhook delivery attempts',
});

const settlementRecords = new client.Counter({
  name: 'perionyx_settlement_records_total',
  help: 'Total settlement records created',
  labelNames: ['status'] as const,
});

const settlementAttempts = new client.Counter({
  name: 'perionyx_settlement_attempts_total',
  help: 'Total settlement attempts',
});

const connectorSyncs = new client.Counter({
  name: 'perionyx_connector_syncs_total',
  help: 'Total connector sync operations',
  labelNames: ['connector_kind', 'status'] as const,
});

const connectorHealthChecks = new client.Counter({
  name: 'perionyx_connector_health_checks_total',
  help: 'Total connector health check operations',
  labelNames: ['connector_kind', 'status'] as const,
});

const connectorOAuthRefreshes = new client.Counter({
  name: 'perionyx_connector_oauth_refreshes_total',
  help: 'Total connector OAuth token refreshes',
  labelNames: ['connector_kind', 'status'] as const,
});

export function incWebhookDelivery(status: string) {
  webhookDeliveries.labels(status).inc();
}

export function incWebhookDeliveryAttempt() {
  webhookDeliveryAttempts.inc();
}

export function incSettlement(status: string) {
  settlementRecords.labels(status).inc();
}

export function incSettlementAttempt() {
  settlementAttempts.inc();
}

export function incConnectorSync(connectorKind: string, status: string) {
  try { connectorSyncs.labels(connectorKind, status).inc(); } catch { /* ignore */ }
}

export function incConnectorHealthCheck(connectorKind: string, status: string) {
  try { connectorHealthChecks.labels(connectorKind, status).inc(); } catch { /* ignore */ }
}

export function incConnectorOAuthRefresh(connectorKind: string, status: string) {
  try { connectorOAuthRefreshes.labels(connectorKind, status).inc(); } catch { /* ignore */ }
}

export async function getMetrics() {
  return await register.metrics();
}

export default { incWebhookDelivery, incWebhookDeliveryAttempt, incSettlement, incSettlementAttempt, incConnectorSync, incConnectorHealthCheck, incConnectorOAuthRefresh, getMetrics };
