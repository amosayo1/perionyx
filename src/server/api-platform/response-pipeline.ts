import type { ResponseContext, RequestContext } from "./types";

export function createResponseContext(
  ctx: RequestContext,
  statusCode: number,
  body?: unknown,
  extraHeaders?: Record<string, string>,
): ResponseContext {
  const durationMs = Date.now() - ctx.startTime;
  return {
    statusCode,
    headers: {
      "x-request-id": ctx.requestId,
      "x-correlation-id": ctx.correlationId,
      "x-api-version": ctx.version,
      "x-response-time": `${durationMs}ms`,
      ...extraHeaders,
    },
    body,
    durationMs,
    compressed: false,
    cached: false,
  };
}

export function toNextResponse(
  responseCtx: ResponseContext,
): Response {
  const headers = new Headers(responseCtx.headers);
  headers.set("content-type", "application/json");

  if (responseCtx.cached) {
    headers.set("x-cache", "HIT");
  }

  return new Response(
    responseCtx.body ? JSON.stringify(responseCtx.body) : null,
    {
      status: responseCtx.statusCode,
      headers,
    },
  );
}

export function jsonResponse(data: unknown, status = 200, extraHeaders?: Record<string, string>): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json",
      ...extraHeaders,
    },
  });
}

export function paginatedResponse<T>(
  data: T[],
  pagination: { page: number; pageSize: number; total: number; totalPages: number; hasNext: boolean; hasPrev: boolean },
  extraHeaders?: Record<string, string>,
): Response {
  return new Response(
    JSON.stringify({ data, pagination }),
    {
      status: 200,
      headers: {
        "content-type": "application/json",
        "x-total-count": String(pagination.total),
        "x-page": String(pagination.page),
        "x-page-size": String(pagination.pageSize),
        ...extraHeaders,
      },
    },
  );
}

export function errorResponse(
  error: { code: string; message: string; details?: unknown },
  status: number,
  extraHeaders?: Record<string, string>,
): Response {
  return new Response(JSON.stringify({ error }), {
    status,
    headers: {
      "content-type": "application/json",
      ...extraHeaders,
    },
  });
}

export function noContentResponse(extraHeaders?: Record<string, string>): Response {
  return new Response(null, {
    status: 204,
    headers: {
      ...extraHeaders,
    },
  });
}

export function createdResponse(data: unknown, location?: string): Response {
  const headers: Record<string, string> = { "content-type": "application/json" };
  if (location) headers.location = location;
  return new Response(JSON.stringify(data), { status: 201, headers });
}
