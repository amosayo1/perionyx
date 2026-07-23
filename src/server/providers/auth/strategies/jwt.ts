export interface JwtConfig {
  secret: string;
  algorithm?: "HS256" | "HS384" | "HS512" | "RS256";
  issuer?: string;
  audience?: string;
  expiryMs?: number;
}

export interface JwtPayload {
  sub?: string;
  iss?: string;
  aud?: string;
  exp?: number;
  iat?: number;
  [key: string]: unknown;
}

export function encodeBase64Url(data: string): string {
  return btoa(data).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function decodeBase64Url(str: string): string {
  str = str.replace(/-/g, "+").replace(/_/g, "/");
  while (str.length % 4) str += "=";
  return atob(str);
}

export async function sign(payload: JwtPayload, config: JwtConfig): Promise<string> {
  const header = { alg: config.algorithm ?? "HS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const fullPayload: JwtPayload = {
    ...payload,
    iat: payload.iat ?? now,
    exp: payload.exp ?? now + (config.expiryMs ?? 3600000) / 1000,
    iss: payload.iss ?? config.issuer,
    aud: payload.aud ?? config.audience,
  };

  const headerEncoded = encodeBase64Url(JSON.stringify(header));
  const payloadEncoded = encodeBase64Url(JSON.stringify(fullPayload));
  const signatureInput = `${headerEncoded}.${payloadEncoded}`;

  const encoder = new TextEncoder();
  const keyData = encoder.encode(config.secret);
  const key = await crypto.subtle.importKey("raw", keyData, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(signatureInput));
  const signatureEncoded = encodeBase64Url(String.fromCharCode(...new Uint8Array(signature)));

  return `${signatureInput}.${signatureEncoded}`;
}

export async function verify(token: string, config: JwtConfig): Promise<JwtPayload | null> {
  const parts = token.split(".");
  if (parts.length !== 3) return null;

  const [headerEncoded, payloadEncoded, signatureEncoded] = parts;

  let header: { alg: string };
  try {
    header = JSON.parse(decodeBase64Url(headerEncoded));
  } catch {
    return null;
  }

  if (header.alg !== (config.algorithm ?? "HS256")) return null;

  const signatureInput = `${headerEncoded}.${payloadEncoded}`;
  const encoder = new TextEncoder();
  const keyData = encoder.encode(config.secret);
  const key = await crypto.subtle.importKey("raw", keyData, { name: "HMAC", hash: "SHA-256" }, false, ["verify"]);
  const signatureBytes = Uint8Array.from(decodeBase64Url(signatureEncoded), (c) => c.charCodeAt(0));
  const valid = await crypto.subtle.verify("HMAC", key, signatureBytes, encoder.encode(signatureInput));

  if (!valid) return null;

  let payload: JwtPayload;
  try {
    payload = JSON.parse(decodeBase64Url(payloadEncoded));
  } catch {
    return null;
  }

  if (payload.exp && payload.exp * 1000 < Date.now()) return null;

  if (config.issuer && payload.iss !== config.issuer) return null;
  if (config.audience && payload.aud !== config.audience) return null;

  return payload;
}
