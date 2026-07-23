export interface ApiKeyConfig {
  apiKey: string;
  headerName?: string;
}

export function buildAuthHeader(config: ApiKeyConfig): Record<string, string> {
  return {
    [config.headerName ?? "X-API-Key"]: config.apiKey,
  };
}

export function validateApiKey(providedKey: string, expectedKey: string): boolean {
  if (!providedKey || !expectedKey) return false;
  if (providedKey.length !== expectedKey.length) return false;
  let result = 0;
  for (let i = 0; i < providedKey.length; i++) {
    result |= providedKey.charCodeAt(i) ^ expectedKey.charCodeAt(i);
  }
  return result === 0;
}

export function maskApiKey(key: string): string {
  if (key.length <= 8) return "****";
  return `${key.slice(0, 4)}****${key.slice(-4)}`;
}
