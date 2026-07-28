import { NextResponse } from "next/server";
import { withRuntimeContext } from "@/server/http/init-runtime-context";
import type { TenantContext } from "@/server/context/tenant-context";
import { rbacService } from "@/modules/rbac";
import { logger } from "@/lib/logger";
import type { CommandContext } from "../application/types";
import { apErrorResponse } from "./errors";
import {
  idempotencyKey,
  getCachedResponse,
  storeIdempotentResponse,
} from "./idempotency";

export interface APRequestContext {
  tenant: TenantContext;
  correlationId: string;
}

function generateCorrelationId(): string {
  return `ap-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
}

/**
 * Authenticate an AP request.
 *
 * Wraps withRuntimeContext internally — the canonical execution path.
 * AP routes call apAuth(req) which sets up RuntimeContext and returns
 * the AP-specific context with correlation ID.
 */
export async function apAuth(
  request: Request,
): Promise<{ ctx: APRequestContext } | NextResponse> {
  const correlationId =
    request.headers.get("x-correlation-id") ?? request.headers.get("x-request-id") ?? generateCorrelationId();

  try {
    const result = await withRuntimeContext(request, async (ctx) => {
      logger.info(
        { correlationId, userId: ctx.tenant.userId, companyId: ctx.tenant.companyId, method: request.method, url: request.url },
        "ap.request",
      );

      return { ctx: { tenant: ctx.tenant, correlationId } };
    });

    return result;
  } catch (error) {
    return apErrorResponse(error instanceof Error ? error : new Error(String(error)), correlationId);
  }
}

export async function apRequirePermission(
  tenant: TenantContext,
  permission: string,
): Promise<void> {
  await rbacService.ensurePermission(tenant.userId, tenant.companyId, permission);
}

export function toCommandContext(tenant: TenantContext, correlationId: string): CommandContext {
  return {
    companyId: tenant.companyId,
    userId: tenant.userId,
    correlationId,
    timestamp: new Date(),
  };
}

export function handleIdempotentRequest(
  request: Request,
  key: string | null,
  companyId: string,
): NextResponse | null {
  if (!key) return null;
  return getCachedResponse(key, companyId);
}

export async function cacheIdempotentResponse(
  request: Request,
  key: string | null,
  companyId: string,
  response: NextResponse,
): Promise<void> {
  if (!key) return;
  const statusCode = response.status;
  const cloned = response.clone();
  const bodyText = await cloned.text();
  const headers: Record<string, string> = {};
  cloned.headers.forEach((v, k) => { headers[k] = v; });
  storeIdempotentResponse(key, companyId, bodyText, statusCode, headers);
}

export function applyCommonHeaders(
  response: NextResponse,
  correlationId: string,
): NextResponse {
  response.headers.set("x-correlation-id", correlationId);
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}
