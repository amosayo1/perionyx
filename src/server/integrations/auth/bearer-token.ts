import { randomBytes } from "crypto";

export function validateToken(token: string, validTokens: Set<string>): boolean {
  return validTokens.has(token);
}

export function generateToken(byteLength = 32): string {
  return randomBytes(byteLength).toString("hex");
}

function getHeader(
  headers: Record<string, string | string[] | undefined> | Headers,
  name: string,
): string | undefined {
  if (headers instanceof Headers) {
    return headers.get(name) ?? undefined;
  }
  const value = headers[name];
  if (Array.isArray(value)) return value[0];
  return value;
}

export function extractToken(
  request: { headers: Record<string, string | string[] | undefined> | Headers },
): string | null {
  const authHeader = getHeader(request.headers, "authorization");
  if (!authHeader) return null;

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0].toLowerCase() !== "bearer") {
    return null;
  }

  return parts[1];
}
