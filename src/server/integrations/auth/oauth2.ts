import { randomBytes } from "crypto";

export interface OAuth2Config {
  clientId: string;
  clientSecret: string;
  authorizeUrl: string;
  tokenUrl: string;
  scopes: string[];
  redirectUri: string;
  state?: string;
  extraParams?: Record<string, string>;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
  tokenType: string;
  scope?: string;
  raw: Record<string, unknown>;
}

function encodeFormData(params: Record<string, string>): string {
  return Object.entries(params)
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(value)}`,
    )
    .join("&");
}

export function getAuthorizationUrl(config: OAuth2Config): string {
  const state = config.state ?? randomBytes(32).toString("hex");
  const params: Record<string, string> = {
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: "code",
    scope: config.scopes.join(" "),
    state,
  };

  if (config.extraParams) {
    Object.assign(params, config.extraParams);
  }

  const separator = config.authorizeUrl.includes("?") ? "&" : "?";
  return `${config.authorizeUrl}${separator}${encodeFormData(params)}`;
}

export async function exchangeCode(
  config: OAuth2Config,
  code: string,
): Promise<TokenResponse> {
  const body = encodeFormData({
    grant_type: "authorization_code",
    code,
    redirect_uri: config.redirectUri,
    client_id: config.clientId,
    client_secret: config.clientSecret,
  });

  const response = await fetch(config.tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `OAuth2 token exchange failed: HTTP ${response.status} - ${errorText}`,
    );
  }

  const data = (await response.json()) as Record<string, unknown>;

  return {
    accessToken: data.access_token as string,
    refreshToken: data.refresh_token as string | undefined,
    expiresIn: data.expires_in as number | undefined,
    tokenType: (data.token_type as string) ?? "Bearer",
    scope: data.scope as string | undefined,
    raw: data,
  };
}

export async function refreshToken(
  config: OAuth2Config,
  token: string,
): Promise<TokenResponse> {
  const body = encodeFormData({
    grant_type: "refresh_token",
    refresh_token: token,
    client_id: config.clientId,
    client_secret: config.clientSecret,
  });

  const response = await fetch(config.tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `OAuth2 token refresh failed: HTTP ${response.status} - ${errorText}`,
    );
  }

  const data = (await response.json()) as Record<string, unknown>;

  return {
    accessToken: data.access_token as string,
    refreshToken: data.refresh_token as string | undefined,
    expiresIn: data.expires_in as number | undefined,
    tokenType: (data.token_type as string) ?? "Bearer",
    scope: data.scope as string | undefined,
    raw: data,
  };
}

interface JwtPayload {
  sub?: string;
  iss?: string;
  aud?: string | string[];
  exp?: number;
  iat?: number;
  [key: string]: unknown;
}

export function validateToken(token: string): JwtPayload {
  const parts = token.split(".");
  if (parts.length !== 3) {
    throw new Error("Invalid JWT token format");
  }

  try {
    const payload = JSON.parse(
      Buffer.from(parts[1], "base64url").toString("utf-8"),
    ) as JwtPayload;

    if (payload.exp) {
      const now = Math.floor(Date.now() / 1000);
      if (payload.exp < now) {
        throw new Error("Token has expired");
      }
    }

    return payload;
  } catch (error) {
    if (error instanceof Error && error.message === "Token has expired") {
      throw error;
    }
    throw new Error("Failed to decode JWT token");
  }
}
