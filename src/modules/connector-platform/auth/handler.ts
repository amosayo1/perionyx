import type { ConnectorAuthMethod } from "../types";

export interface AuthCredentials {
  apiKey?: string;
  username?: string;
  password?: string;
  clientId?: string;
  clientSecret?: string;
  accessToken?: string;
  refreshToken?: string;
  tokenUrl?: string;
  scopes?: string[];
}

export interface AuthResult {
  ok: boolean;
  message?: string;
  expiresAt?: string;
}

export interface IAuthHandler {
  readonly method: ConnectorAuthMethod;

  validate(credentials: AuthCredentials): Promise<string[]>;

  authenticate(credentials: AuthCredentials): Promise<AuthResult>;

  refresh(credentials: AuthCredentials): Promise<AuthResult>;

  applyHeaders(credentials: AuthCredentials): Record<string, string>;
}

export class ApiKeyAuthHandler implements IAuthHandler {
  readonly method: ConnectorAuthMethod = "api-key";

  async validate(credentials: AuthCredentials): Promise<string[]> {
    const errors: string[] = [];
    if (!credentials.apiKey) errors.push("API key is required");
    return errors;
  }

  async authenticate(credentials: AuthCredentials): Promise<AuthResult> {
    const errors = await this.validate(credentials);
    if (errors.length > 0) return { ok: false, message: errors.join("; ") };
    return { ok: true };
  }

  async refresh(_credentials: AuthCredentials): Promise<AuthResult> {
    return { ok: false, message: "API key auth does not support refresh" };
  }

  applyHeaders(credentials: AuthCredentials): Record<string, string> {
    return { Authorization: `Bearer ${credentials.apiKey ?? ""}` };
  }
}

export class BasicAuthHandler implements IAuthHandler {
  readonly method: ConnectorAuthMethod = "basic";

  async validate(credentials: AuthCredentials): Promise<string[]> {
    const errors: string[] = [];
    if (!credentials.username) errors.push("Username is required");
    if (!credentials.password) errors.push("Password is required");
    return errors;
  }

  async authenticate(credentials: AuthCredentials): Promise<AuthResult> {
    const errors = await this.validate(credentials);
    if (errors.length > 0) return { ok: false, message: errors.join("; ") };
    return { ok: true };
  }

  async refresh(_credentials: AuthCredentials): Promise<AuthResult> {
    return { ok: false, message: "Basic auth does not support refresh" };
  }

  applyHeaders(credentials: AuthCredentials): Record<string, string> {
    const encoded = Buffer.from(`${credentials.username}:${credentials.password}`).toString("base64");
    return { Authorization: `Basic ${encoded}` };
  }
}

export class BearerAuthHandler implements IAuthHandler {
  readonly method: ConnectorAuthMethod = "bearer";

  async validate(credentials: AuthCredentials): Promise<string[]> {
    const errors: string[] = [];
    if (!credentials.accessToken) errors.push("Access token is required");
    return errors;
  }

  async authenticate(credentials: AuthCredentials): Promise<AuthResult> {
    const errors = await this.validate(credentials);
    if (errors.length > 0) return { ok: false, message: errors.join("; ") };
    return { ok: true };
  }

  async refresh(_credentials: AuthCredentials): Promise<AuthResult> {
    return { ok: false, message: "Bearer auth does not support refresh" };
  }

  applyHeaders(credentials: AuthCredentials): Record<string, string> {
    return { Authorization: `Bearer ${credentials.accessToken ?? ""}` };
  }
}

import { OAuth2AuthHandler } from "./oauth2-handler";
export { OAuth2AuthHandler } from "./oauth2-handler";

export function getAuthHandler(method: ConnectorAuthMethod): IAuthHandler {
  switch (method) {
    case "api-key": return new ApiKeyAuthHandler();
    case "basic": return new BasicAuthHandler();
    case "bearer": return new BearerAuthHandler();
    case "oauth2": return new OAuth2AuthHandler();
    default:
      throw new Error(`Unsupported auth method: ${method}`);
  }
}
