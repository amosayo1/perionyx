import { NextResponse, NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { sessionTokenName } from "@/server/auth/auth";
import { validateOrigin } from "@/server/security/csrf";
import { sessionValidationStore } from "@/server/security/session-validation-store";
import { rateLimit } from "@/server/security/rate-limit";
import { logger } from "@/lib/logger";
import { prisma } from "@/server/db/prisma";

const authSecret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;
if (!authSecret) {
  throw new Error("AUTH_SECRET or NEXTAUTH_SECRET must be set for proxy authentication.");
}

// API key format: "va_" prefix + 64 hex chars
const API_KEY_RE = /^va_[0-9a-f]{64}$/;

function generateId(): string {
  return crypto.randomUUID();
}

function rateLimitResponse(rl: { ok: boolean; remaining: number; resetAt: number }, requestId: string) {
  return new NextResponse(
    JSON.stringify({ error: { code: "TOO_MANY_REQUESTS", message: "Too many requests. Try again later." } }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)),
        "X-RateLimit-Remaining": String(rl.remaining),
        "X-RateLimit-Reset": String(Math.ceil(rl.resetAt / 1000)),
        "x-request-id": requestId,
      },
    },
  );
}

const MUTATION_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

const SUPPORTED_LOCALES = ["en", "ar"];
const DEFAULT_LOCALE = "en";

function detectLocale(req: NextRequest): string {
  const cookieLocale = req.cookies.get("NEXT_LOCALE")?.value;
  if (cookieLocale && SUPPORTED_LOCALES.includes(cookieLocale)) return cookieLocale;

  const acceptLanguage = req.headers.get("accept-language");
  if (acceptLanguage) {
    const preferred = acceptLanguage
      .split(",")
      .map((l) => {
        const [locale, q = "q=1"] = l.trim().split(";");
        const quality = parseFloat(q.split("=")[1] ?? "1");
        return { locale: locale.split("-")[0], quality };
      })
      .sort((a, b) => b.quality - a.quality);
    for (const p of preferred) {
      if (SUPPORTED_LOCALES.includes(p.locale)) return p.locale;
    }
  }

  return DEFAULT_LOCALE;
}

export default async function proxy(req: NextRequest) {
  const requestId = generateId();
  const start = Date.now();
  const { pathname } = req.nextUrl;

  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-request-id", requestId);
  requestHeaders.set("x-request-start", String(start));

  // -- Locale detection --
  const locale = detectLocale(req);
  requestHeaders.set("x-next-intl-locale", locale);

  logger.info({ method: req.method, path: pathname, requestId, ip: req.headers.get("x-forwarded-for") ?? "proxy" }, "proxy request");

  // -- Rate limiting for mutation requests (Redis-backed) --
  if (MUTATION_METHODS.has(req.method)) {
    const ip = req.headers.get("x-forwarded-for") ?? "proxy";

    if (pathname.startsWith("/api/auth/")) {
      const rl = await rateLimit(`rl:auth:${ip}`, 10, 60000);
      if (!rl.ok) return rateLimitResponse(rl, requestId);
    }

    if (pathname === "/api/demo/bootstrap") {
      const rl = await rateLimit(`rl:demo:${ip}`, 3, 60000);
      if (!rl.ok) return rateLimitResponse(rl, requestId);
    }

    if (pathname.startsWith("/api/v1/transactions/") || pathname.startsWith("/api/v1/treasury/")) {
      const rl = await rateLimit(`rl:financial:${ip}`, 60, 60000);
      if (!rl.ok) return rateLimitResponse(rl, requestId);
    }

    if (pathname.startsWith("/api/")) {
      const rl = await rateLimit(`rl:api:${ip}`, 120, 60000);
      if (!rl.ok) return rateLimitResponse(rl, requestId);
    }
  }

  // -- Auth check (early extraction — needed by CSRF and session validation) --
  const token = await getToken({
    req,
    secret: authSecret,
    cookieName: sessionTokenName,
  });

  // Fail fast: validate API key format at middleware level
  const authHeader = req.headers.get("authorization");
  const hasApiKey = authHeader?.startsWith("Bearer ");
  if (hasApiKey) {
    const keyValue = authHeader!.slice(7);
    if (!API_KEY_RE.test(keyValue)) {
      return NextResponse.json(
        { error: { code: "INVALID_API_KEY", message: "API key format is invalid" } },
        { status: 401, headers: { "x-request-id": requestId } },
      );
    }
  }

  // -- CSRF check for mutation methods on /api routes --
  // Browser endpoints (session-authenticated) must provide Origin or Referer.
  // API-key requests and the NextAuth callback are exempt.
  if (MUTATION_METHODS.has(req.method) && pathname.startsWith("/api/")) {
    const isNextAuthCallback = pathname.startsWith("/api/auth/[...nextauth]");
    if (!isNextAuthCallback) {
      // Session-authenticated requests: enforce Origin/Referer.
      // API-key requests are authenticated via Bearer token and are not
      // vulnerable to CSRF (they require a secret key in the header).
      const originCheck = validateOrigin(req, !!token);
      if (!originCheck.ok) {
        logger.warn({ path: pathname, reason: originCheck.reason, requestId }, "CSRF rejected");
        return NextResponse.json(
          { error: { code: "CSRF_REJECTED", message: originCheck.reason } },
          { status: 403, headers: { "x-request-id": requestId } },
        );
      }
    }
  }

  // -- Session version validation --
  // When a password changes, account is disabled, or token is revoked,
  // tokenVersion is incremented in the DB. JWTs with a stale version
  // are rejected immediately, even before expiry.
  //
  // P0-5: If tokenVersion is undefined (old tokens minted before the field
  // was added), treat as version 1 and validate against the DB. This
  // prevents silently skipping validation for legacy tokens.
  if (token?.sub) {
    const effectiveVersion = typeof token.tokenVersion === "number" ? token.tokenVersion : 1;
    try {
      const dbUser = await prisma.user.findUnique({
        where: { id: token.sub },
        select: { tokenVersion: true, lockedUntil: true },
      });
      if (!dbUser) {
        logger.warn({ userId: token.sub, requestId }, "Session rejected: user not found");
        return NextResponse.json(
          { error: { code: "SESSION_INVALID", message: "Session is no longer valid." } },
          { status: 401, headers: { "x-request-id": requestId } },
        );
      }
      if (dbUser.tokenVersion !== effectiveVersion) {
        logger.warn({ userId: token.sub, requestId }, "Session rejected: token version mismatch");
        return NextResponse.json(
          { error: { code: "SESSION_REVOKED", message: "Session has been revoked. Please sign in again." } },
          { status: 401, headers: { "x-request-id": requestId } },
        );
      }
      if (dbUser.lockedUntil && dbUser.lockedUntil > new Date()) {
        logger.warn({ userId: token.sub, requestId }, "Session rejected: account locked");
        return NextResponse.json(
          { error: { code: "ACCOUNT_LOCKED", message: "Account is temporarily locked." } },
          { status: 403, headers: { "x-request-id": requestId } },
        );
      }
    } catch (err) {
      // P0-5: On DB failure, check in-memory cache for recently-revoked sessions.
      // If the user was recently revoked (within 30s), reject.
      // Otherwise, fail-open — the 24h JWT expiry provides a natural ceiling.
      if (sessionValidationStore.isRecentlyRevoked(token!.sub!)) {
        logger.warn({ userId: token!.sub, requestId }, "Session rejected: recently revoked (cache hit during DB failure)");
        return NextResponse.json(
          { error: { code: "SESSION_REVOKED", message: "Session has been revoked. Please sign in again." } },
          { status: 401, headers: { "x-request-id": requestId } },
        );
      }
      logger.error({ userId: token!.sub, requestId, err }, "Session version check failed (fail-open)");
    }
  }

  const isProtectedAppRoute =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/wallets") ||
    pathname.startsWith("/transactions") ||
    pathname.startsWith("/reconciliation") ||
    pathname.startsWith("/accounts") ||
    pathname.startsWith("/policies") ||
    pathname.startsWith("/risk") ||
    pathname.startsWith("/connectors") ||
    pathname.startsWith("/calendar") ||
    pathname.startsWith("/audit-logs") ||
    pathname.startsWith("/onboarding") ||
    pathname.startsWith("/automation-studio") ||
    pathname.startsWith("/agents") ||
    pathname.startsWith("/tax") ||
    pathname.startsWith("/compliance") ||
    pathname.startsWith("/fpa") ||
    pathname.startsWith("/board") ||
    pathname.startsWith("/treasury") ||
    pathname.startsWith("/controller") ||
    pathname.startsWith("/cfo") ||
    pathname.startsWith("/audit") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/system") ||
    pathname.startsWith("/intelligence") ||
    pathname.startsWith("/mobile") ||
    pathname.startsWith("/investments") ||
    pathname.startsWith("/fixed-assets") ||
    pathname.startsWith("/general-ledger") ||
    pathname.startsWith("/consolidation") ||
    pathname.startsWith("/accounts-receivable") ||
    pathname.startsWith("/accounts-payable") ||
    pathname.startsWith("/procurement") ||
    pathname.startsWith("/order-to-cash") ||
    pathname.startsWith("/financial-close") ||
    pathname.startsWith("/reports") ||
    pathname.startsWith("/integration-platform") ||
    pathname.startsWith("/developer");

  // Public API endpoints — no auth required
  const publicApiPaths = ["/api/v1/demo-requests"];

  // API protection
  if (pathname.startsWith("/api/v1") && !publicApiPaths.includes(pathname)) {
    if (!token && !hasApiKey) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: { "x-request-id": requestId } });
    }
    if (token) {
      const headers = new Headers(requestHeaders);
      if (token.sub) headers.set("x-user-id", String(token.sub));
      if (token.activeCompanyId) headers.set("x-company-id", String(token.activeCompanyId));
      if (token.companyRole) headers.set("x-company-role", String(token.companyRole));
      const response = NextResponse.next({ request: { headers } });
      const duration = Date.now() - start;
      response.headers.set("x-request-id", requestId);
      response.headers.set("Server-Timing", `total;dur=${duration}`);
      return response;
    }
    const response = NextResponse.next({ request: { headers: requestHeaders } });
    const duration = Date.now() - start;
    response.headers.set("x-request-id", requestId);
    response.headers.set("Server-Timing", `total;dur=${duration}`);
    return response;
  }

  // Protect app routes
  if (isProtectedAppRoute && !token) {
    const signIn = new URL("/sign-in", req.url);
    signIn.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signIn);
  }

  // prevent signed-in users from seeing auth pages
  if ((pathname === "/sign-in" || pathname === "/sign-up") && token) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  const duration = Date.now() - start;
  response.headers.set("x-request-id", requestId);
  response.headers.set("Server-Timing", `total;dur=${duration}`);
  return response;
}

export const config = {
  matcher: [
    "/api/:path*",
    "/dashboard/:path*",
    "/accounts/:path*",
    "/wallets/:path*",
    "/transactions/:path*",
    "/reconciliation/:path*",
    "/policies/:path*",
    "/risk/:path*",
    "/connectors/:path*",
    "/calendar/:path*",
    "/audit-logs/:path*",
    "/onboarding/:path*",
    "/automation-studio/:path*",
    "/agents/:path*",
    "/tax/:path*",
    "/compliance/:path*",
    "/fpa/:path*",
    "/board/:path*",
    "/treasury/:path*",
    "/controller/:path*",
    "/cfo/:path*",
    "/audit/:path*",
    "/admin/:path*",
    "/system/:path*",
    "/intelligence/:path*",
    "/mobile/:path*",
    "/investments/:path*",
    "/fixed-assets/:path*",
    "/general-ledger/:path*",
    "/consolidation/:path*",
    "/accounts-receivable/:path*",
    "/accounts-payable/:path*",
    "/procurement/:path*",
    "/order-to-cash/:path*",
    "/financial-close/:path*",
    "/reports/:path*",
    "/integration-platform/:path*",
    "/developer/:path*",
    "/sign-in",
    "/sign-up",
  ],
};
