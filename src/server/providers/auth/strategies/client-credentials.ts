export interface ClientCredentialsConfig {
  clientId: string;
  clientSecret: string;
  tokenUrl: string;
  scopes: string[];
}

export interface ClientCredentialsToken {
  accessToken: string;
  expiresAt: Date;
}

const tokenStore = new Map<string, ClientCredentialsToken>();

export async function obtainToken(config: ClientCredentialsConfig): Promise<ClientCredentialsToken> {
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
    throw new Error(`Client credentials grant failed: ${response.status}`);
  }

  const data = await response.json();
  return {
    accessToken: data.access_token,
    expiresAt: new Date(Date.now() + (data.expires_in ?? 3600) * 1000),
  };
}

export async function getCachedToken(configId: string): Promise<ClientCredentialsToken | undefined> {
  const token = tokenStore.get(configId);
  if (!token) return undefined;
  if (token.expiresAt <= new Date()) {
    tokenStore.delete(configId);
    return undefined;
  }
  return token;
}

export async function cacheToken(configId: string, token: ClientCredentialsToken): Promise<void> {
  tokenStore.set(configId, token);
}

export function clearCachedToken(configId: string): void {
  tokenStore.delete(configId);
}
