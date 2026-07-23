import type { IntegrationDomainEvent, IntegrationEventType } from "./types";

export function emitIntegrationDomainEvent(
  _type: IntegrationEventType,
  _data: Record<string, unknown>,
  _correlationId?: string,
): void {
  // No-op: Integrations EventBus was removed in Phase 18.1A (zero subscribers)
}

export function recordIntegrationMetric(
  metricName: string,
  value: number,
  tags?: Record<string, string>,
): void {
  try {
    const { metrics } = require("@/server/observability/metrics");
    if (metrics) {
      const counter = metrics.counter(`integration.${metricName}`, "Integration metric");
      counter.add(value, tags ?? {});
    }
  } catch {
    // metrics registry not available
  }
}

export function recordIntegrationHistogram(
  metricName: string,
  value: number,
  tags?: Record<string, string>,
): void {
  try {
    const { metrics } = require("@/server/observability/metrics");
    if (metrics) {
      const histogram = metrics.histogram(`integration.${metricName}`, "Integration histogram");
      histogram.observe(value, tags ?? {});
    }
  } catch {
    // metrics registry not available
  }
}

export function logIntegrationEvent(
  level: "info" | "warn" | "error",
  message: string,
  data?: Record<string, unknown>,
): void {
  try {
    const { logger } = require("@/lib/logger");
    if (logger) {
      logger[level]({ module: "integrations", ...data }, message);
    }
  } catch {
    // logger not available
  }
}

export function createIntegrationSpan(
  operationName: string,
  tags?: Record<string, string>,
): { finish: () => void } | null {
  try {
    const { createTracer } = require("@/server/observability/tracing");
    if (createTracer) {
      const tracer = createTracer(`integration.${operationName}`);
      return {
        finish: () => {},
      };
    }
  } catch {
    // tracing not available
  }
  return null;
}
