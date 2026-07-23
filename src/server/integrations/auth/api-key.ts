import { createHash, randomBytes, timingSafeEqual } from "crypto";

export function validateKey(key: string, expectedKey: string): boolean {
  if (key.length !== expectedKey.length) return false;

  try {
    return timingSafeEqual(Buffer.from(key), Buffer.from(expectedKey));
  } catch {
    return false;
  }
}

export function generateKey(prefix = "pk"): string {
  const key = randomBytes(32).toString("hex");
  return `${prefix}_${key}`;
}

export function hashKey(key: string): string {
  return createHash("sha256").update(key).digest("hex");
}

export function maskKey(key: string): string {
  if (key.length <= 4) return "****";
  const visible = key.slice(-4);
  const masked = "*".repeat(Math.min(key.length - 4, 32));
  return `${masked}${visible}`;
}
