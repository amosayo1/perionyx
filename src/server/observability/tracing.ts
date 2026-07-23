import { metrics } from "./metrics";

const TRACES: TraceSpan[] = [];
const MAX_TRACES = 1000;

export interface TraceSpan {
  traceId: string;
  parentSpanId?: string;
  spanId: string;
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  status: "ok" | "error";
  error?: string;
  attributes: Record<string, string | number | boolean>;
}

let spanCounter = 0;

function generateId(): string {
  spanCounter++;
  return `span_${Date.now()}_${spanCounter}_${Math.random().toString(36).slice(2, 6)}`;
}

export class Tracer {
  private currentSpan?: TraceSpan;
  private readonly spans: TraceSpan[] = [];

  constructor(public readonly traceId: string) {}

  startSpan(
    name: string,
    attributes?: Record<string, string | number | boolean>,
  ): TraceSpan {
    const span: TraceSpan = {
      traceId: this.traceId,
      parentSpanId: this.currentSpan?.spanId,
      spanId: generateId(),
      name,
      startTime: performance.now(),
      status: "ok",
      attributes: attributes ?? {},
    };
    this.currentSpan = span;
    this.spans.push(span);
    TRACES.push(span);
    if (TRACES.length > MAX_TRACES) TRACES.shift();
    return span;
  }

  endSpan(span: TraceSpan, error?: string): void {
    span.endTime = performance.now();
    span.duration = span.endTime - span.startTime;
    span.status = error ? "error" : "ok";
    if (error) span.error = error;
    metrics.histogram(`trace.span.duration`).observe(span.duration);
    if (this.currentSpan?.spanId === span.spanId) {
      this.currentSpan = undefined;
    }
  }

  async trace<T>(
    name: string,
    fn: () => Promise<T>,
    attributes?: Record<string, string | number | boolean>,
  ): Promise<T> {
    const span = this.startSpan(name, attributes);
    try {
      const result = await fn();
      this.endSpan(span);
      return result;
    } catch (err) {
      this.endSpan(span, err instanceof Error ? err.message : String(err));
      throw err;
    }
  }

  getSpans(): TraceSpan[] {
    return [...this.spans];
  }
}

export function createTracer(traceId?: string): Tracer {
  return new Tracer(traceId ?? generateId());
}

export function getRecentTraces(limit = 100): TraceSpan[] {
  return TRACES.slice(-limit);
}
