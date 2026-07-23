import { createHmac, timingSafeEqual } from "crypto";

function base64UrlEncode(data: Buffer): string {
  return data
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function base64UrlDecode(str: string): Buffer {
  const padded = str.padEnd(str.length + ((4 - (str.length % 4)) % 4), "=");
  const base64 = padded.replace(/-/g, "+").replace(/_/g, "/");
  return Buffer.from(base64, "base64");
}

function toBase64Url(obj: Record<string, unknown>): string {
  return base64UrlEncode(Buffer.from(JSON.stringify(obj), "utf-8"));
}

export interface JwtPayload {
  sub?: string;
  iss?: string;
  aud?: string | string[];
  exp?: number;
  iat?: number;
  nbf?: number;
  jti?: string;
  [key: string]: unknown;
}

export interface JwtHeader {
  alg: string;
  typ: string;
  kid?: string;
}

export function sign(
  payload: JwtPayload,
  secret: string,
  expiresIn: string | number = "1h",
): string {
  const header: JwtHeader = {
    alg: "HS256",
    typ: "JWT",
  };

  const iat = Math.floor(Date.now() / 1000);
  const exp = calculateExpiresIn(iat, expiresIn);

  const fullPayload: JwtPayload = {
    ...payload,
    iat,
    exp,
  };

  const headerB64 = toBase64Url(header as unknown as Record<string, unknown>);
  const payloadB64 = toBase64Url(fullPayload as unknown as Record<string, unknown>);
  const signature = createSignature(`${headerB64}.${payloadB64}`, secret);

  return `${headerB64}.${payloadB64}.${signature}`;
}

export function verify(
  token: string,
  secret: string,
): JwtPayload {
  const parts = token.split(".");
  if (parts.length !== 3) {
    throw new Error("Invalid JWT format");
  }

  const [headerB64, payloadB64, signatureB64] = parts;

  const expectedSignature = createSignature(`${headerB64}.${payloadB64}`, secret);

  if (
    !timingSafeEqual(
      Buffer.from(signatureB64),
      Buffer.from(expectedSignature),
    )
  ) {
    throw new Error("Invalid JWT signature");
  }

  let payload: JwtPayload;
  try {
    const decoded = base64UrlDecode(payloadB64).toString("utf-8");
    payload = JSON.parse(decoded) as JwtPayload;
  } catch {
    throw new Error("Invalid JWT payload encoding");
  }

  const now = Math.floor(Date.now() / 1000);

  if (payload.exp && payload.exp < now) {
    throw new Error("JWT has expired");
  }

  if (payload.nbf && payload.nbf > now) {
    throw new Error("JWT is not yet valid");
  }

  return payload;
}

export function decode(token: string): { header: JwtHeader; payload: JwtPayload } | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const [headerB64, payloadB64] = parts;

    const header = JSON.parse(
      base64UrlDecode(headerB64).toString("utf-8"),
    ) as JwtHeader;
    const payload = JSON.parse(
      base64UrlDecode(payloadB64).toString("utf-8"),
    ) as JwtPayload;

    return { header, payload };
  } catch {
    return null;
  }
}

function createSignature(data: string, secret: string): string {
  return base64UrlEncode(
    createHmac("sha256", secret).update(data).digest(),
  );
}

function calculateExpiresIn(iat: number, expiresIn: string | number): number {
  if (typeof expiresIn === "number") {
    return iat + expiresIn;
  }

  const match = expiresIn.match(/^(\d+)([smhdw])$/);
  if (!match) {
    return iat + 3600;
  }

  const value = parseInt(match[1], 10);
  const unit = match[2];

  switch (unit) {
    case "s":
      return iat + value;
    case "m":
      return iat + value * 60;
    case "h":
      return iat + value * 3600;
    case "d":
      return iat + value * 86400;
    case "w":
      return iat + value * 604800;
    default:
      return iat + 3600;
  }
}
