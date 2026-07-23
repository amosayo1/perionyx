import type { RequestContext, HttpMethod, ApiVersion, AuthStrategy, RateLimitTier } from "./types";

let counter = 0;

function generateRequestId(): string {
  counter++;
  return `req_${Date.now()}_${counter}_${Math.random().toString(36).slice(2, 8)}`;
}

function generateCorrelationId(): string {
  return `corr_${Date.now()}_${Math.random().toString(36).slice(2, 12)}`;
}

export function createRequestContext(request: Request, version: ApiVersion): RequestContext {
  const url = new URL(request.url);
  const correlationId = request.headers.get("x-correlation-id") ?? generateCorrelationId();

  return {
    requestId: generateRequestId(),
    correlationId,
    version,
    method: request.method as HttpMethod,
    path: url.pathname,
    startTime: Date.now(),
    scopes: [],
    rateLimitTier: "free",
    ip: request.headers.get("x-forwarded-for") ?? request.headers.get("x-real-ip") ?? "unknown",
    userAgent: request.headers.get("user-agent") ?? undefined,
  };
}

export function enrichRequestContext(
  ctx: RequestContext,
  overrides: Partial<RequestContext>,
): RequestContext {
  return { ...ctx, ...overrides };
}

export function getRequestDuration(ctx: RequestContext): number {
  return Date.now() - ctx.startTime;
}

export function extractPaginationParams(url: URL): {
  page?: number;
  pageSize?: number;
  cursor?: string;
} {
  const page = url.searchParams.get("page");
  const pageSize = url.searchParams.get("pageSize");
  const cursor = url.searchParams.get("cursor");

  return {
    page: page ? parseInt(page, 10) : undefined,
    pageSize: pageSize ? parseInt(pageSize, 10) : undefined,
    cursor: cursor ?? undefined,
  };
}

export function extractFilterParams(url: URL): Array<{ field: string; operator: string; value: string }> {
  const filters: Array<{ field: string; operator: string; value: string }> = [];
  for (const [key, value] of url.searchParams) {
    if (key.startsWith("filter[")) {
      const match = key.match(/filter\[(.+?)\]\[(.+?)\]/);
      if (match) {
        filters.push({ field: match[1], operator: match[2], value });
      }
    }
  }
  return filters;
}

export function extractSortParams(url: URL): Array<{ field: string; direction: "asc" | "desc" }> {
  const sorts: Array<{ field: string; direction: "asc" | "desc" }> = [];
  const sortParam = url.searchParams.get("sort");
  if (sortParam) {
    for (const part of sortParam.split(",")) {
      const trimmed = part.trim();
      if (trimmed.startsWith("-")) {
        sorts.push({ field: trimmed.slice(1), direction: "desc" });
      } else if (trimmed.startsWith("+")) {
        sorts.push({ field: trimmed.slice(1), direction: "asc" });
      } else {
        sorts.push({ field: trimmed, direction: "asc" });
      }
    }
  }
  return sorts;
}

export function extractFieldSelection(url: URL): { fields: string[]; include?: string[]; exclude?: string[] } {
  const fields = url.searchParams.get("fields");
  const include = url.searchParams.get("include");
  const exclude = url.searchParams.get("exclude");

  return {
    fields: fields ? fields.split(",").map((f) => f.trim()) : [],
    include: include ? include.split(",").map((f) => f.trim()) : undefined,
    exclude: exclude ? exclude.split(",").map((f) => f.trim()) : undefined,
  };
}

export function applyFieldSelection<T extends Record<string, unknown>>(data: T, selection: { fields: string[] }): Partial<T> {
  if (!selection.fields.length) return data;
  const result: Partial<T> = {};
  for (const field of selection.fields) {
    if (field in data) {
      result[field as keyof T] = data[field as keyof T];
    }
  }
  return result;
}

export function validatePagination(page?: number, pageSize?: number): string | null {
  if (page !== undefined && (page < 1 || !Number.isInteger(page))) {
    return "page must be a positive integer";
  }
  if (pageSize !== undefined && (pageSize < 1 || pageSize > 200 || !Number.isInteger(pageSize))) {
    return "pageSize must be an integer between 1 and 200";
  }
  return null;
}

export function parseVersionFromPath(path: string): string | undefined {
  const match = path.match(/^\/api\/(v\d+)\//);
  return match?.[1];
}

export function parseVersionFromHeader(headers: Headers): string | undefined {
  return headers.get("accept-version") ?? undefined;
}

export function buildResponseHeaders(ctx: RequestContext): Record<string, string> {
  return {
    "x-request-id": ctx.requestId,
    "x-correlation-id": ctx.correlationId,
    "x-api-version": ctx.version,
    "x-response-time": "",
  };
}
