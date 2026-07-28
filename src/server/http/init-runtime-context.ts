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
import { UnauthorizedError, ForbiddenError } from '@/lib/errors/app-error';
import { withRuntimeContext as _withRuntimeContext } from '@/runtime/context';

export type { TenantContext } from '@/server/context/tenant-context';

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
 * Validate and narrow a raw tenant object to TenantContext.
 *
 * Replicates the guards from requireTenantContext():
 * - Throws UnauthorizedError if userId is missing
 * - Throws ForbiddenError if companyId or role is missing
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
