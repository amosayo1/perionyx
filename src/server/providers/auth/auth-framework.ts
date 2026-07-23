import type { ConnectionConfig, AuthMethod } from "@/server/integrations/types";
import { AuthenticationError } from "../errors/provider-errors";
import * as oauth2 from "./strategies/oauth2";
import * as clientCredentials from "./strategies/client-credentials";
import * as authorizationCode from "./strategies/authorization-code";
import * as apiKey from "./strategies/api-key";
import * as bearerToken from "./strategies/bearer-token";
import * as jwt from "./strategies/jwt";
import * as basicAuth from "./strategies/basic-auth";

export type AuthContext = Record<string, unknown>;

export async function authenticate(
  connection: ConnectionConfig,
  context?: AuthContext,
): Promise<Record<string, string>> {
  switch (connection.authMethod) {
    case "oauth2": {
      const oauthConfig = connection.config as { clientId: string; clientSecret: string; tokenUrl: string; scopes: string[] };
      const tokens = await oauth2.authorizeClient({
        clientId: oauthConfig.clientId,
        clientSecret: oauthConfig.clientSecret,
        authorizationUrl: "",
        tokenUrl: oauthConfig.tokenUrl,
        scopes: oauthConfig.scopes ?? [],
        redirectUri: "",
      });
      await oauth2.storeTokens(connection.id, tokens);
      const valid = await oauth2.getValidToken(connection.id, {
        clientId: oauthConfig.clientId,
        clientSecret: oauthConfig.clientSecret,
        authorizationUrl: "",
        tokenUrl: oauthConfig.tokenUrl,
        scopes: oauthConfig.scopes ?? [],
        redirectUri: "",
      });
      return { Authorization: `Bearer ${valid}` };
    }

    case "client_credentials": {
      const ccConfig = connection.config as { clientId: string; clientSecret: string; tokenUrl: string; scopes: string[] };
      let token = await clientCredentials.getCachedToken(connection.id);
      if (!token) {
        token = await clientCredentials.obtainToken({
          clientId: ccConfig.clientId,
          clientSecret: ccConfig.clientSecret,
          tokenUrl: ccConfig.tokenUrl,
          scopes: ccConfig.scopes ?? [],
        });
        await clientCredentials.cacheToken(connection.id, token);
      }
      return { Authorization: `Bearer ${token.accessToken}` };
    }

    case "api_key": {
      const akConfig = connection.config as { apiKey: string; headerName?: string };
      return apiKey.buildAuthHeader({ apiKey: akConfig.apiKey, headerName: akConfig.headerName });
    }

    case "bearer_token": {
      const btConfig = connection.config as { token: string; tokenType?: string };
      return bearerToken.buildAuthHeader({ token: btConfig.token, tokenType: btConfig.tokenType });
    }

    case "basic_auth": {
      const baConfig = connection.config as { username: string; password: string };
      return basicAuth.buildAuthHeader({ username: baConfig.username, password: baConfig.password });
    }

    case "jwt": {
      const jwtConfig = connection.config as { secret: string; issuer?: string; audience?: string; payload: Record<string, unknown> };
      const token = await jwt.sign(jwtConfig.payload ?? {}, {
        secret: jwtConfig.secret,
        issuer: jwtConfig.issuer,
        audience: jwtConfig.audience,
      });
      return { Authorization: `Bearer ${token}` };
    }

    case "mutual_tls":
    case "oidc":
      return {};

    default:
      throw new AuthenticationError(
        `Unsupported auth method: ${connection.authMethod}`,
        connection.providerId,
        connection.id,
      );
  }
}

export async function refreshAuth(
  connection: ConnectionConfig,
): Promise<Record<string, string>> {
  if (connection.authMethod === "oauth2") {
    const oauthConfig = connection.config as { clientId: string; clientSecret: string; tokenUrl: string; scopes: string[] };
    const tokens = await oauth2.getTokens(connection.id);
    if (tokens?.refreshToken) {
      const refreshed = await oauth2.refreshAccessToken({
        clientId: oauthConfig.clientId,
        clientSecret: oauthConfig.clientSecret,
        authorizationUrl: "",
        tokenUrl: oauthConfig.tokenUrl,
        scopes: oauthConfig.scopes ?? [],
        redirectUri: "",
      }, tokens.refreshToken);
      await oauth2.storeTokens(connection.id, refreshed);
      return { Authorization: `Bearer ${refreshed.accessToken}` };
    }
  }

  return authenticate(connection);
}

export async function validateAuth(
  connection: ConnectionConfig,
): Promise<boolean> {
  try {
    await authenticate(connection);
    return true;
  } catch {
    return false;
  }
}

export function clearAuth(connectionId: string): void {
  oauth2.clearTokens(connectionId);
}
