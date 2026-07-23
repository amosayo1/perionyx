import { logger } from "@/lib/logger";
import { createTracer, type OTelTracer } from "./otel";

const correlationMap = new Map<string, CorrelationContext>();
const requestStore = new Map<string, { startTime: number; tracer: OTelTracer }>();

export interface CorrelationContext {
  traceId: string;
  correlationId: string;
  serviceName: string;
  environment: string;
  version: string;
  userId?: string;
  companyId?: string;
  requestId?: string;
  clientIp?: string;
  userAgent?: string;
  parentCorrelationId?: string;
}

export function generateCorrelationId(): string {
  return `corr_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

export function createCorrelationContext(overrides?: Partial<CorrelationContext>): CorrelationContext {
  return {
    traceId: overrides?.traceId ?? `trace_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`,
    correlationId: overrides?.correlationId ?? generateCorrelationId(),
    serviceName: process.env.OTEL_SERVICE_NAME ?? "perionyx",
    environment: process.env.NODE_ENV ?? "development",
    version: process.env.NEXT_PUBLIC_APP_VERSION ?? "0.0.0",
    ...overrides,
  };
}

export function getCorrelationContext(correlationId: string): CorrelationContext | undefined {
  return correlationMap.get(correlationId);
}

export function setCorrelationContext(context: CorrelationContext): void {
  correlationMap.set(context.correlationId, context);
}

export function deleteCorrelationContext(correlationId: string): void {
  correlationMap.delete(correlationId);
}

export function startRequestSpan(correlationId: string, tracer: OTelTracer): void {
  requestStore.set(correlationId, { startTime: Date.now(), tracer });
}

export function endRequestSpan(correlationId: string): { duration: number; tracer: OTelTracer } | undefined {
  const entry = requestStore.get(correlationId);
  if (!entry) return undefined;
  requestStore.delete(correlationId);
  return { duration: Date.now() - entry.startTime, tracer: entry.tracer };
}

export function logWithCorrelation(
  level: "info" | "warn" | "error" | "debug",
  message: string,
  correlationId?: string,
  data?: Record<string, unknown>,
): void {
  const ctx = correlationId ? correlationMap.get(correlationId) : undefined;
  const entry = {
    message,
    correlationId: correlationId ?? ctx?.correlationId,
    traceId: ctx?.traceId,
    userId: ctx?.userId,
    companyId: ctx?.companyId,
    serviceName: ctx?.serviceName,
    environment: ctx?.environment,
    version: ctx?.version,
    ...data,
  };
  logger[level]({ correlationId: correlationId ?? ctx?.correlationId, traceId: ctx?.traceId, userId: ctx?.userId, companyId: ctx?.companyId, serviceName: ctx?.serviceName, environment: ctx?.environment, version: ctx?.version, ...data }, message);
}

export class CorrelationMiddleware {
  private excludedPaths: Set<string>;

  constructor(excludedPaths: string[] = ["/api/health", "/api/metrics"]) {
    this.excludedPaths = new Set(excludedPaths);
  }

  extractFromHeaders(headers: Headers | Record<string, string>): Partial<CorrelationContext> {
    const get = (name: string): string | undefined => {
      if (typeof (headers as any).get === "function") {
        return (headers as Headers).get(name) ?? undefined;
      }
      return (headers as Record<string, string>)[name];
    };

    return {
      correlationId: get("x-correlation-id") ?? get("x-request-id"),
      traceId: get("x-trace-id") ?? get("x-request-id"),
      userId: get("x-user-id"),
      companyId: get("x-company-id"),
      clientIp: get("x-forwarded-for") ?? get("x-real-ip"),
      userAgent: get("user-agent"),
      parentCorrelationId: get("x-parent-correlation-id"),
    };
  }

  createHandlerContext(headers: Headers | Record<string, string>): CorrelationContext {
    const extracted = this.extractFromHeaders(headers);
    const context = createCorrelationContext(extracted);

    const tracer = createTracer(context.traceId);
    const span = tracer.startSpan("request", "server", {
      "http.method": typeof (headers as any).get === "function"
        ? (headers as Headers).get(":method") ?? ""
        : "",
      "http.target": typeof (headers as any).get === "function"
        ? (headers as Headers).get(":path") ?? ""
        : "",
    });

    setCorrelationContext(context);
    startRequestSpan(context.correlationId, tracer);

    return context;
  }

  finalizeHandlerContext(correlationId: string): void {
    const entry = endRequestSpan(correlationId);
    if (entry) {
      const spans = entry.tracer.getSpans();
      for (const span of spans) {
        entry.tracer.endSpan(span);
      }
    }
    deleteCorrelationContext(correlationId);
  }
}

export const correlationMiddleware = new CorrelationMiddleware();
