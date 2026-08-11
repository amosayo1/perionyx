/**
 * Runtime Context Initializer — Phase 26.0A
 *
 * Canonical execution path for all production code.
 * Bridges proxy-generated headers (x-user-id, x-company-id, x-company-role,
 * x-request-id) into the AsyncLocalStorage-based RuntimeContext.
 *
 * Uses the LEGACY TenantContext type directly — no duplicate type definitions.
 * Replicates requireTenantContext() guards (auth, company, license enforcement).
 * Falls back to auth() when proxy headers are missing (API-key auth path).
 *
 * Accepts Request | Headers — Server Components use headers() from next/headers.
 *
 * Usage (API route):
 *   export async function GET(request: Request) {
 *     return withRuntimeContext(request, async (ctx) => {
 *       // ctx.tenant is guaranteed non-null
 *     });
 *   }
 *
 * Usage (Server Component):
 *   export default async function Page() {
 *     return withRuntimeContext(await headers(), async (ctx) => {
 *       // ctx.tenant.companyId available
 *     });
 *   }
 */

import type { RuntimeContext } from '@/runtime/context/types';
import type { TenantContext } from '@/server/context/tenant-context';
import type { CompanyRole } from '@prisma/client';
import { UnauthorizedError, ForbiddenError } from '@/lib/errors/app-error';
import { withRuntimeContext as _withRuntimeContext } from '@/runtime/context';

export type { TenantContext } from '@/server/context/tenant-context';

const VALID_ROLES = new Set<CompanyRole>(["OWNER", "ADMIN", "TREASURER", "MEMBER", "VIEWER"]);

/**
 * Normalize Request | Headers to a Headers object.
 */
function toHeaders(input: Request | Headers): Headers {
  if (input instanceof Request) return input.headers;
  return input;
}

/**
 * Extract RuntimeContext from request headers set by the proxy.
 *
 * The proxy (src/proxy.ts) runs at the edge, extracts JWT claims,
 * and sets x-user-id, x-company-id, x-company-role, x-request-id headers.
 * This function reads those headers and creates a RuntimeContext.
 *
 * Returns undefined for tenant when headers are missing (API-key auth path),
 * allowing the caller to fall back to auth().
 */
function extractContextFromHeaders(headers: Headers): RuntimeContext {
  const userId = headers.get('x-user-id') ?? undefined;
  const companyId = headers.get('x-company-id') ?? undefined;
  const role = headers.get('x-company-role') ?? undefined;

  const tenant = (userId && companyId && role)
    ? { userId, companyId, role }
    : undefined;

  const requestId = headers.get('x-request-id') ?? undefined;

  const requestCtx = requestId
    ? { requestId, correlationId: requestId }
    : undefined;

  const locale = headers.get('x-next-intl-locale') ?? 'en';

  return {
    tenant,
    request: requestCtx,
    locale: {
      locale,
      timezone: 'UTC',
      dateFormat: 'YYYY-MM-DD',
      numberFormat: { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 },
    },
  };
}

/**
 * Verify that claimed identity headers are backed by a verifiable credential
 * present in the same request (Phase 28.1 C-01/D-01 — defense in depth).
 *
 * The proxy is the primary identity boundary: it strips client-supplied
 * identity headers and re-derives them from a verified JWT or API key. This
 * function makes the runtime safe even if the proxy is bypassed or
 * misconfigured by requiring one of:
 *
 *   1. A session JWT whose sub/activeCompanyId/companyRole match the claims
 *      (JWT verify only — no DB read), or
 *   2. A Bearer API key that resolves to the claimed company and whose
 *      scope-derived role matches the claimed role (DB read).
 *
 * Returns true when the claims are backed by a credential; false when no
 * credential exists (or none matches). Callers must treat false as
 * unauthenticated — never as "fall through to session".
 */
async function verifyHeaderIdentity(
  headers: Headers,
  claimed: { userId: string; companyId: string; role: string },
): Promise<boolean> {
  const { getToken } = await import('next-auth/jwt');
  const { sessionTokenName } = await import('@/server/auth/auth');
  const authSecret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;

  if (authSecret) {
    const token = await getToken({
      req: headers as unknown as Parameters<typeof getToken>[0]['req'],
      secret: authSecret,
      cookieName: sessionTokenName,
    });
    if (token) {
      return (
        token.sub === claimed.userId &&
        String(token.activeCompanyId ?? "") === claimed.companyId &&
        String(token.companyRole ?? "") === claimed.role
      );
    }
  }

  const authHeader = headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const { ApiKeyService, roleFromApiKeyScopes } = await import('@/modules/api-keys/api-keys.service');
    const apiKey = await ApiKeyService.validate(authHeader);
    if (!apiKey) return false;
    return (
      apiKey.companyId === claimed.companyId &&
      roleFromApiKeyScopes(apiKey.scopes) === claimed.role
    );
  }

  return false;
}

/**
 * Validate and narrow a raw tenant object to TenantContext.
 *
 * Replicates the guards from requireTenantContext():
 * - Throws UnauthorizedError if userId is missing
 * - Throws ForbiddenError if companyId or role is missing
 * - Rejects roles outside the CompanyRole enum (Phase 28.1 C-01)
 * - Enforces LICENSE_COMPANY_ID if set
 */
function validateTenantContext(
  raw: { userId?: string; companyId?: string; role?: string } | undefined,
): TenantContext {
  if (!raw?.userId) {
    throw new UnauthorizedError('Authentication required.');
  }
  if (!raw.companyId || !raw.role) {
    throw new ForbiddenError('No active company on the session.');
  }
  if (!VALID_ROLES.has(raw.role as CompanyRole)) {
    throw new ForbiddenError('Invalid role on the session.');
  }

  const licensedCompanyId = process.env.LICENSE_COMPANY_ID;
  if (licensedCompanyId && raw.companyId !== licensedCompanyId) {
    throw new ForbiddenError('This instance is licensed for a different company. Access denied.');
  }

  return {
    userId: raw.userId,
    companyId: raw.companyId,
    role: raw.role as TenantContext['role'],
  };
}

/**
 * Wrap a route handler with RuntimeContext — THE canonical execution path.
 *
 * Reads proxy headers, validates tenant context (auth + company + license),
 * and runs the handler within AsyncLocalStorage.
 *
 * The handler receives a RuntimeContext where ctx.tenant is guaranteed
 * non-null and has the correct TenantContext shape (role as CompanyRole).
 *
 * Accepts Request | Headers. Falls back to auth() when proxy headers
 * are missing (API-key auth path, Server Actions, Server Components).
 */
export async function withRuntimeContext<T>(
  input: Request | Headers,
  handler: (ctx: RuntimeContext & { tenant: TenantContext }) => Promise<T>,
): Promise<T> {
  const headers = toHeaders(input);
  const context = extractContextFromHeaders(headers);

  let tenant: TenantContext;
  if (context.tenant) {
    // Identity headers must be backed by a verifiable credential in the
    // same request (Phase 28.1 C-01/D-01). Unverified claims are rejected,
    // never trusted.
    const verified = await verifyHeaderIdentity(headers, context.tenant);
    if (!verified) {
      throw new UnauthorizedError('Authentication required.');
    }
    tenant = validateTenantContext(context.tenant);
  } else {
    const { auth } = await import('@/server/auth/auth');
    const session = await auth();
    tenant = validateTenantContext({
      userId: session?.user?.id ?? undefined,
      companyId: session?.user?.activeCompanyId ?? undefined,
      role: session?.user?.companyRole ?? undefined,
    });
  }

  const routeContext: RuntimeContext & { tenant: TenantContext } = {
    ...context,
    tenant,
  };

  return _withRuntimeContext(context, () => handler(routeContext));
}
