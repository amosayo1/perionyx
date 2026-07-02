const ALLOWED_ORIGINS = new Set<string>();

function getAllowedOrigins(): Set<string> {
  if (ALLOWED_ORIGINS.size === 0) {
    const url = process.env.NEXTAUTH_URL ?? process.env.AUTH_URL ?? "http://localhost:3000";
    try {
      const parsed = new URL(url);
      ALLOWED_ORIGINS.add(parsed.origin);
      ALLOWED_ORIGINS.add("http://localhost:3000");
    } catch {
      ALLOWED_ORIGINS.add("http://localhost:3000");
    }
  }
  return ALLOWED_ORIGINS;
}

export function validateOrigin(request: Request): { ok: boolean; reason?: string } {
  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");

  const allowed = getAllowedOrigins();

  if (origin && !allowed.has(origin)) {
    return { ok: false, reason: `Origin "${origin}" not allowed` };
  }

  if (!origin && referer) {
    try {
      const refOrigin = new URL(referer).origin;
      if (!allowed.has(refOrigin)) {
        return { ok: false, reason: `Referer origin "${refOrigin}" not allowed` };
      }
    } catch {
      return { ok: false, reason: "Invalid Referer header" };
    }
  }

  return { ok: true };
}
