import type { ConnectionConfig } from "@/server/integrations/types";

export interface OAuth2Config {
  clientId: string;
  clientSecret: string;
  authorizationUrl: string;
  tokenUrl: string;
  scopes: string[];
  redirectUri: string;
}

export interface OAuth2Tokens {
  accessToken: string;
  refreshToken?: string;
  expiresAt: Date;
  scope?: string;
}

const tokenStore = new Map<string, OAuth2Tokens>();

export async function authorizeClient(config: OAuth2Config): Promise<OAuth2Tokens> {
  const response = await fetch(config.tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: config.clientId,
      client_secret: config.clientSecret,
      scope: config.scopes.join(" "),
    }),
  });

  if (!response.ok) {
    throw new Error(`OAuth2 client credentials grant failed: ${response.status}`);
  }

  const data = await response.json();
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: new Date(Date.now() + data.expires_in * 1000),
    scope: data.scope,
  };
}

export async function authorizeCode(
  config: OAuth2Config,
  code: string,
): Promise<OAuth2Tokens> {
  const response = await fetch(config.tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      client_id: config.clientId,
      client_secret: config.clientSecret,
      code,
      redirect_uri: config.redirectUri,
    }),
  });

  if (!response.ok) {
    throw new Error(`OAuth2 authorization code grant failed: ${response.status}`);
  }

  const data = await response.json();
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: new Date(Date.now() + data.expires_in * 1000),
    scope: data.scope,
  };
}

export async function refreshAccessToken(
  config: OAuth2Config,
  refreshToken: string,
): Promise<OAuth2Tokens> {
  const response = await fetch(config.tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      client_id: config.clientId,
      client_secret: config.clientSecret,
      refresh_token: refreshToken,
    }),
  });

  if (!response.ok) {
    throw new Error(`OAuth2 token refresh failed: ${response.status}`);
  }

  const data = await response.json();
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token ?? refreshToken,
    expiresAt: new Date(Date.now() + data.expires_in * 1000),
    scope: data.scope,
  };
}

export async function storeTokens(
  connectionId: string,
  tokens: OAuth2Tokens,
): Promise<void> {
  tokenStore.set(connectionId, tokens);
}

export async function getTokens(
  connectionId: string,
): Promise<OAuth2Tokens | undefined> {
  return tokenStore.get(connectionId);
}

export async function getValidToken(
  connectionId: string,
  config: OAuth2Config,
): Promise<string> {
  const tokens = tokenStore.get(connectionId);
  if (!tokens) throw new Error("No OAuth2 tokens stored");

  if (tokens.expiresAt <= new Date(Date.now() + 60000)) {
    if (!tokens.refreshToken) throw new Error("Token expired and no refresh token available");
    const refreshed = await refreshAccessToken(config, tokens.refreshToken);
    tokenStore.set(connectionId, refreshed);
    return refreshed.accessToken;
  }

  return tokens.accessToken;
}

export function clearTokens(connectionId: string): void {
  tokenStore.delete(connectionId);
}
