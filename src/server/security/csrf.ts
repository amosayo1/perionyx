const ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "http://localhost:3001",
  "https://app.perionyx.com",
  "https://staging.perionyx.com",
];

/**
 * Validate the Origin (or Referer) header against the allowlist.
 *
 * @param request          The incoming HTTP request.
 * @param rejectMissingOrigin  When true, requests with neither Origin nor
 *                             Referer are rejected.  Set this for
 *                             session-authenticated browser endpoints where
 *                             the absence of both headers indicates a
 *                             non-browser or programmatic caller that should
 *                             not be performing state-changing actions.
 *                             When false (legacy), missing Origin is allowed
 *                             through — used only by API-key endpoints and
 *                             the NextAuth callback.
 */
export function validateOrigin(
  request: Request,
  rejectMissingOrigin = false,
): { ok: boolean; reason?: string } {
  const origin = request.headers.get("origin");

  if (origin) {
    const isAllowed = ALLOWED_ORIGINS.some(
      (allowed) => allowed === origin || origin.startsWith(allowed + "/"),
    );
    if (isAllowed) return { ok: true };
    return { ok: false, reason: "Origin not allowed" };
  }

  // No Origin header — fall back to Referer (OWASP-recommended pattern).
  const referer = request.headers.get("referer");
  if (referer) {
    try {
      const refererUrl = new URL(referer);
      const refererOrigin = `${refererUrl.protocol}//${refererUrl.host}`;
      const isAllowed = ALLOWED_ORIGINS.some(
        (allowed) => allowed === refererOrigin || refererOrigin.startsWith(allowed + "/"),
      );
      if (isAllowed) return { ok: true };
      return { ok: false, reason: "Referer not allowed" };
    } catch {
      // Malformed Referer — treat as missing.
    }
  }

  // Neither Origin nor Referer is present.
  if (rejectMissingOrigin) {
    return { ok: false, reason: "Missing Origin and Referer headers" };
  }
  return { ok: true };
}
