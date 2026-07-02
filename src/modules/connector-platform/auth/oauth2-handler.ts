import type { ConnectorAuthMethod } from "../types";
import type { IAuthHandler, AuthCredentials, AuthResult } from "./handler";

export class OAuth2AuthHandler implements IAuthHandler {
  readonly method: ConnectorAuthMethod = "oauth2";

  async validate(credentials: AuthCredentials): Promise<string[]> {
    const errors: string[] = [];
    if (!credentials.clientId) errors.push("Client ID is required");
    if (!credentials.clientSecret) errors.push("Client secret is required");
    if (!credentials.tokenUrl) errors.push("Token URL is required");
    return errors;
  }

  async authenticate(credentials: AuthCredentials): Promise<AuthResult> {
    const errors = await this.validate(credentials);
    if (errors.length > 0) return { ok: false, message: errors.join("; ") };

    try {
      const body = new URLSearchParams({
        grant_type: "client_credentials",
        client_id: credentials.clientId!,
        client_secret: credentials.clientSecret!,
        scope: credentials.scopes?.join(" ") ?? "",
      });

      const response = await fetch(credentials.tokenUrl!, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body.toString(),
      });

      if (!response.ok) {
        const text = await response.text().catch(() => "");
        return { ok: false, message: `OAuth token exchange failed: ${response.status} ${text}` };
      }

      const data = await response.json();
      const expiresIn = data.expires_in ? data.expires_in * 1000 : 3600 * 1000;

      return {
        ok: true,
        message: "OAuth2 authentication successful",
        expiresAt: new Date(Date.now() + expiresIn).toISOString(),
      };
    } catch (err: any) {
      return { ok: false, message: `OAuth2 authentication error: ${err?.message ?? String(err)}` };
    }
  }

  async refresh(credentials: AuthCredentials): Promise<AuthResult> {
    if (!credentials.refreshToken) {
      return { ok: false, message: "Refresh token is required" };
    }

    try {
      const body = new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: credentials.refreshToken,
        client_id: credentials.clientId ?? "",
        client_secret: credentials.clientSecret ?? "",
      });

      const response = await fetch(credentials.tokenUrl ?? "", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body.toString(),
      });

      if (!response.ok) {
        return { ok: false, message: `Token refresh failed: ${response.status}` };
      }

      const data = await response.json();
      const expiresIn = data.expires_in ? data.expires_in * 1000 : 3600 * 1000;

      return {
        ok: true,
        message: "Token refreshed successfully",
        expiresAt: new Date(Date.now() + expiresIn).toISOString(),
      };
    } catch (err: any) {
      return { ok: false, message: `Token refresh error: ${err?.message ?? String(err)}` };
    }
  }

  applyHeaders(credentials: AuthCredentials): Record<string, string> {
    return {
      Authorization: `Bearer ${credentials.accessToken ?? ""}`,
    };
  }
}
