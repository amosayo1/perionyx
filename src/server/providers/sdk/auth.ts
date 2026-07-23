import type { AuthMethod } from "@/server/integrations/types";

export function getAuthHeaders(
  authMethod: AuthMethod,
  credentials: Record<string, string>,
): Record<string, string> {
  switch (authMethod) {
    case "api_key":
      return { [credentials.headerName ?? "X-API-Key"]: credentials.apiKey };
    case "bearer_token":
      return { Authorization: `Bearer ${credentials.token}` };
    case "basic_auth":
      return { Authorization: `Basic ${btoa(`${credentials.username}:${credentials.password}`)}` };
    case "jwt":
      return { Authorization: `Bearer ${credentials.token}` };
    case "oauth2":
    case "client_credentials":
      if (credentials.accessToken) {
        return { Authorization: `Bearer ${credentials.accessToken}` };
      }
      return {};
    default:
      return {};
  }
}

export function isTokenExpired(expiresAt: string | number | Date): boolean {
  const expiry = expiresAt instanceof Date ? expiresAt : new Date(expiresAt);
  return expiry <= new Date(Date.now() + 60000);
}

export function maskCredential(value: string): string {
  if (value.length <= 8) return "****";
  return `${value.slice(0, 4)}****${value.slice(-4)}`;
}
