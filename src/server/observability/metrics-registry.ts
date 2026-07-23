import { metrics } from "./metrics";

export function registerApplicationMetrics(): void {
  metrics.counter("app.requests.total");
  metrics.counter("app.requests.success");
  metrics.counter("app.requests.error");
  metrics.histogram("app.requests.latency");
  metrics.gauge("app.memory.heap");
  metrics.gauge("app.memory.rss");
  metrics.gauge("app.connections.active");
}

export function registerInfrastructureMetrics(): void {
  metrics.gauge("infra.memory.heapUsed");
  metrics.gauge("infra.memory.heapTotal");
  metrics.gauge("infra.memory.rss");
  metrics.counter("infra.errors.total");
  metrics.histogram("infra.operation.latency");
}

export function registerRepositoryMetrics(): void {
  metrics.counter("repo.read.total");
  metrics.counter("repo.write.total");
  metrics.counter("repo.delete.total");
  metrics.histogram("repo.read.latency");
  metrics.histogram("repo.write.latency");
  metrics.counter("repo.cache.hit");
  metrics.counter("repo.cache.miss");
}

export function registerQueueMetrics(): void {
  metrics.gauge("queue.size");
  metrics.counter("queue.enqueued");
  metrics.counter("queue.processed");
  metrics.counter("queue.failed");
  metrics.counter("queue.deadLetter");
  metrics.histogram("queue.processing.latency");
}

export function registerCacheMetrics(): void {
  metrics.gauge("cache.size");
  metrics.counter("cache.hits");
  metrics.counter("cache.misses");
  metrics.counter("cache.evictions");
  metrics.histogram("cache.get.latency");
  metrics.histogram("cache.set.latency");
}

export function registerTreasuryMetrics(): void {
  metrics.gauge("treasury.cashPosition");
  metrics.gauge("treasury.liquidity");
  metrics.gauge("treasury.fxExposure");
  metrics.counter("treasury.transfers.total");
  metrics.counter("treasury.transfers.pending");
  metrics.counter("treasury.transfers.completed");
  metrics.histogram("treasury.forecast.error");
}

export function registerBankingMetrics(): void {
  metrics.gauge("banking.balance");
  metrics.counter("banking.transactions.total");
  metrics.counter("banking.reconciliation.pending");
  metrics.counter("banking.reconciliation.completed");
  metrics.histogram("banking.sync.duration");
}

export function registerPerformanceMetrics(): void {
  metrics.histogram("perf.cpu.usage");
  metrics.histogram("perf.eventLoop.lag");
  metrics.gauge("perf.handles.active");
  metrics.gauge("perf.requests.active");
  metrics.histogram("perf.gc.duration");
}

export function registerAllMetrics(): void {
  registerApplicationMetrics();
  registerInfrastructureMetrics();
  registerRepositoryMetrics();
  registerQueueMetrics();
  registerCacheMetrics();
  registerTreasuryMetrics();
  registerBankingMetrics();
  registerPerformanceMetrics();
}
