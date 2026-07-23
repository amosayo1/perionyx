import { metrics } from "./metrics";
import { createTracer, getRecentTraces } from "./tracing";
import { healthRegistry } from "./health";
import { metricsExporter } from "./metrics-exporter";
import { registerAllMetrics } from "./metrics-registry";

export function initializeObservability(): void {
  registerAllMetrics();
}

export { metrics, createTracer, getRecentTraces, healthRegistry, metricsExporter };

export interface OpenTelemetrySpan {
  name: string;
  traceId: string;
  spanId: string;
  parentSpanId?: string;
  startTime: number;
  endTime?: number;
  attributes: Record<string, string | number | boolean>;
}

export function createOpenTelemetrySpan(name: string, traceId: string): OpenTelemetrySpan {
  return {
    name,
    traceId,
    spanId: `span_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    startTime: performance.now(),
    attributes: {},
  };
}
