import { NextResponse, NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { sessionTokenName } from "@/server/auth/auth";
import { validateOrigin } from "@/server/security/csrf";
import { rateLimit } from "@/server/security/rate-limit";
import { logger } from "@/lib/logger";

const authSecret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;
if (!authSecret) {
  throw new Error("AUTH_SECRET or NEXTAUTH_SECRET must be set for proxy authentication.");
}

// API key format: "va_" prefix + 64 hex chars
const API_KEY_RE = /^va_[0-9a-f]{64}$/;

function rateLimitResponse(rl: { ok: boolean; remaining: number; resetAt: number }) {
  return new NextResponse(
    JSON.stringify({ error: { code: "TOO_MANY_REQUESTS", message: "Too many requests. Try again later." } }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)),
        "X-RateLimit-Remaining": String(rl.remaining),
        "X-RateLimit-Reset": String(Math.ceil(rl.resetAt / 1000)),
      },
    },
  );
}

const MUTATION_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

export default async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  logger.info({ method: req.method, path: pathname, ip: req.headers.get("x-forwarded-for") ?? "proxy" }, "proxy request");

  // -- Rate limiting for mutation requests (Redis-backed) --
  if (MUTATION_METHODS.has(req.method)) {
    const ip = req.headers.get("x-forwarded-for") ?? "proxy";

    if (pathname.startsWith("/api/auth/")) {
      const rl = await rateLimit(`rl:auth:${ip}`, 10, 60000);
      if (!rl.ok) return rateLimitResponse(rl);
    }

    if (pathname === "/api/demo/bootstrap") {
      const rl = await rateLimit(`rl:demo:${ip}`, 3, 60000);
      if (!rl.ok) return rateLimitResponse(rl);
    }

    if (pathname.startsWith("/api/v1/transactions/") || pathname.startsWith("/api/v1/treasury/")) {
      const rl = await rateLimit(`rl:financial:${ip}`, 60, 60000);
      if (!rl.ok) return rateLimitResponse(rl);
    }

    if (pathname.startsWith("/api/")) {
      const rl = await rateLimit(`rl:api:${ip}`, 120, 60000);
      if (!rl.ok) return rateLimitResponse(rl);
    }
  }

  // -- CSRF check for mutation methods on /api routes --
  if (MUTATION_METHODS.has(req.method) && pathname.startsWith("/api/")) {
    const originCheck = validateOrigin(req);
    if (!originCheck.ok) {
      logger.warn({ path: pathname, reason: originCheck.reason }, "CSRF rejected");
      return NextResponse.json(
        { error: { code: "CSRF_REJECTED", message: originCheck.reason } },
        { status: 403 },
      );
    }
  }

  // -- Auth check --
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
        { status: 401 },
      );
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
    pathname.startsWith("/onboarding");

  // Public API endpoints — no auth required
  const publicApiPaths = ["/api/v1/demo-requests"];

  // API protection
  if (pathname.startsWith("/api/v1") && !publicApiPaths.includes(pathname)) {
    if (!token && !hasApiKey) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (token) {
      const headers = new Headers(req.headers);
      if (token.sub) headers.set("x-user-id", String(token.sub));
      if (token.activeCompanyId) headers.set("x-company-id", String(token.activeCompanyId));
      if (token.companyRole) headers.set("x-company-role", String(token.companyRole));
      return NextResponse.next({ request: { headers } });
    }
    return NextResponse.next();
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

  return NextResponse.next();
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
    "/sign-in",
    "/sign-up",
  ],
};
