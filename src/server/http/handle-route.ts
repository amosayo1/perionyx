import { NextResponse } from "next/server";
import { z } from "zod";
import { AppError } from "@/lib/errors/app-error";
import { logger } from "@/lib/logger";

export function handleRouteError(error: unknown, request?: Request): NextResponse {
  if (error instanceof AppError) {
    return NextResponse.json(
      { error: { code: error.code, message: error.message } },
      {
        status: error.statusCode,
        headers: request ? { "x-request-id": request.headers.get("x-request-id") ?? "" } : undefined,
      },
    );
  }
  logger.error(error);
  return NextResponse.json(
    { error: { code: "INTERNAL", message: "Internal server error" } },
    {
      status: 500,
      headers: request ? { "x-request-id": request.headers.get("x-request-id") ?? "" } : undefined,
    },
  );
}

export function zodErrorResponse(error: z.ZodError, request?: Request) {
  const message = error.issues
    .map((issue) => issue.message)
    .filter(Boolean)
    .join("; ");
  return NextResponse.json(
    { error: { code: "VALIDATION", message: message || "Validation failed", issues: error.issues } },
    {
      status: 400,
      headers: request ? { "x-request-id": request.headers.get("x-request-id") ?? "" } : undefined,
    },
  );
}

const DEFAULT_BODY_SIZE_LIMIT = 1 * 1024 * 1024; // 1 MB
const MAX_BODY_SIZE_LIMIT = 10 * 1024 * 1024; // 10 MB — hard cap

export async function parseJsonBody<T>(
  request: Request,
  maxBytes = DEFAULT_BODY_SIZE_LIMIT,
): Promise<T> {
  const contentLength = request.headers.get("content-length");
  if (contentLength) {
    const size = parseInt(contentLength, 10);
    if (!isNaN(size) && size > Math.min(maxBytes, MAX_BODY_SIZE_LIMIT)) {
      throw new AppError("Request body too large", "PAYLOAD_TOO_LARGE", 413);
    }
  }
  try {
    return (await request.json()) as T;
  } catch {
    throw new AppError("Invalid JSON body", "INVALID_JSON", 400);
  }
}

export function cacheHeaders(ttlSeconds = 60): Record<string, string> {
  return {
    // Private (browser-only) caching: authenticated payloads must never be
    // stored in a shared/CDN cache. `no-store` previously overrode the TTL
    // directives, silently disabling all caching; `s-maxage` risked
    // cross-tenant leakage if a CDN were introduced.
    "Cache-Control": `private, max-age=${ttlSeconds}`,
    "Vary": "Accept-Encoding",
  };
}

export function noCacheHeaders(): Record<string, string> {
  return {
    "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
    "Pragma": "no-cache",
    "Expires": "0",
  };
}
