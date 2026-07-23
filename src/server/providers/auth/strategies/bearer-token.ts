export interface BearerTokenConfig {
  token: string;
  tokenType?: string;
}

export function buildAuthHeader(config: BearerTokenConfig): Record<string, string> {
  return {
    Authorization: `${config.tokenType ?? "Bearer"} ${config.token}`,
  };
}

export function extractBearerToken(authHeader: string): string | null {
  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  return match ? match[1] : null;
}

export function validateToken(token: string, validTokens: Set<string>): boolean {
  return validTokens.has(token);
}
