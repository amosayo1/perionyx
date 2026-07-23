import { metrics } from "./metrics";
import { metricsExporter } from "./metrics-exporter";
import { logger } from "@/lib/logger";

export interface OTelSpan {
  traceId: string;
  spanId: string;
  parentSpanId?: string;
  name: string;
  kind: "internal" | "server" | "client" | "producer" | "consumer";
  startTime: number;
  endTime?: number;
  duration?: number;
  status: "ok" | "error";
  attributes: Record<string, string | number | boolean>;
  resource?: Record<string, string>;
}

export interface OTelTrace {
  traceId: string;
  spans: OTelSpan[];
  startTime: number;
  endTime?: number;
  duration?: number;
  status: "ok" | "error";
  serviceName: string;
}

let spanCounter = 0;

function generateId(): string {
  spanCounter++;
  return `${Date.now().toString(36)}_${spanCounter}_${Math.random().toString(36).slice(2, 8)}`;
}

function generateTraceId(): string {
  return `trace_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

const activeTraces = new Map<string, OTelTrace>();
const completedTraces: OTelTrace[] = [];
const MAX_COMPLETED_TRACES = 100;

export class OTelTracer {
  private readonly spans: OTelSpan[] = [];
  private currentSpan?: OTelSpan;
  private _traceId: string;

  constructor(traceId?: string) {
    this._traceId = traceId ?? generateTraceId();
    const trace: OTelTrace = {
      traceId: this._traceId,
      spans: this.spans,
      startTime: Date.now(),
      status: "ok",
      serviceName: process.env.OTEL_SERVICE_NAME ?? "perionyx",
    };
    activeTraces.set(this._traceId, trace);
  }

  get traceId(): string {
    return this._traceId;
  }

  startSpan(
    name: string,
    kind: OTelSpan["kind"] = "internal",
    attributes?: Record<string, string | number | boolean>,
  ): OTelSpan {
    const span: OTelSpan = {
      traceId: this._traceId,
      spanId: generateId(),
      parentSpanId: this.currentSpan?.spanId,
      name,
      kind,
      startTime: performance.now(),
      status: "ok",
      attributes: attributes ?? {},
      resource: {
        "service.name": process.env.OTEL_SERVICE_NAME ?? "perionyx",
        "host.name": process.env.HOSTNAME ?? "localhost",
      },
    };
    this.currentSpan = span;
    this.spans.push(span);
    return span;
  }

  endSpan(span: OTelSpan, error?: string): void {
    span.endTime = performance.now();
    span.duration = span.endTime - span.startTime;
    if (error) {
      span.status = "error";
      span.attributes["error"] = error;
    }
    metrics.histogram("otel.span.duration").observe(span.duration);

    if (this.currentSpan?.spanId === span.spanId) {
      this.currentSpan = undefined;
    }
  }

  async trace<T>(
    name: string,
    fn: () => Promise<T>,
    kind: OTelSpan["kind"] = "internal",
    attributes?: Record<string, string | number | boolean>,
  ): Promise<T> {
    const span = this.startSpan(name, kind, attributes);
    try {
      const result = await fn();
      this.endSpan(span);
      return result;
    } catch (err) {
      this.endSpan(span, err instanceof Error ? err.message : String(err));
      throw err;
    }
  }

  getSpans(): OTelSpan[] {
    return [...this.spans];
  }

  getTrace(): OTelTrace | undefined {
    return activeTraces.get(this._traceId);
  }

  endTrace(error?: string): void {
    const trace = activeTraces.get(this._traceId);
    if (!trace) return;
    trace.endTime = Date.now();
    trace.duration = trace.endTime - trace.startTime;
    if (error) {
      trace.status = "error";
    }
    activeTraces.delete(this._traceId);
    completedTraces.push(trace);
    if (completedTraces.length > MAX_COMPLETED_TRACES) completedTraces.shift();
  }

  addAttribute(key: string, value: string | number | boolean): void {
    if (this.currentSpan) {
      this.currentSpan.attributes[key] = value;
    }
  }
}

export function createTracer(traceId?: string): OTelTracer {
  return new OTelTracer(traceId);
}

export function getActiveTraces(): OTelTrace[] {
  return [...activeTraces.values()];
}

export function getCompletedTraces(limit = 50): OTelTrace[] {
  return completedTraces.slice(-limit);
}

export function getTraceById(traceId: string): OTelTrace | undefined {
  return activeTraces.get(traceId) ?? completedTraces.find((t) => t.traceId === traceId);
}

export async function exportTraces(): Promise<string> {
  const all = [...activeTraces.values(), ...completedTraces];
  return JSON.stringify(all, null, 2);
}

export async function exportOtelMetrics(): Promise<string> {
  return metricsExporter.exportPrometheus();
}

export function initializeOtel(): void {
  logger.info({
    serviceName: process.env.OTEL_SERVICE_NAME ?? "perionyx",
    exporter: process.env.OTEL_EXPORTER ?? "console",
  }, "OpenTelemetry initialized");
}
