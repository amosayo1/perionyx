export interface AuthorizationCodeConfig {
  clientId: string;
  clientSecret: string;
  authorizationUrl: string;
  tokenUrl: string;
  redirectUri: string;
  scopes: string[];
}

export function buildAuthorizationUrl(config: AuthorizationCodeConfig, state: string): string {
  const params = new URLSearchParams({
    response_type: "code",
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    scope: config.scopes.join(" "),
    state,
  });
  return `${config.authorizationUrl}?${params.toString()}`;
}

export async function exchangeAuthorizationCode(
  config: AuthorizationCodeConfig,
  code: string,
): Promise<{ accessToken: string; refreshToken?: string; expiresAt: Date }> {
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
    throw new Error(`Authorization code exchange failed: ${response.status}`);
  }

  const data = await response.json();
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: new Date(Date.now() + data.expires_in * 1000),
  };
}
