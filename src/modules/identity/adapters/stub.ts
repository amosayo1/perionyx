import type { IIdentityProvider } from "../provider";
import type {
  AuthRequest,
  AuthResult,
  ProviderUser,
  DirectorySyncResult,
  IdentityProviderConfig,
  IdentityProviderCapabilities,
} from "../types";

const NOT_IMPLEMENTED = "Provider not yet implemented";

export function createStubProvider(kind: string, label: string): IIdentityProvider {
  return new StubIdentityProvider(kind, label);
}

class StubIdentityProvider implements IIdentityProvider {
  readonly kind: string;
  readonly label: string;
  readonly capabilities: IdentityProviderCapabilities = {
    authentication: true,
    provisioning: true,
    directorySync: true,
    mfa: true,
    sso: true,
  };

  private config: IdentityProviderConfig | null = null;

  constructor(kind: string, label: string) {
    this.kind = kind;
    this.label = label;
  }

  async initialize(config: IdentityProviderConfig): Promise<void> {
    this.config = config;
  }

  async authenticate(_request: AuthRequest): Promise<AuthResult> {
    throw new Error(NOT_IMPLEMENTED);
  }

  async validateToken(_token: string): Promise<ProviderUser | null> {
    throw new Error(NOT_IMPLEMENTED);
  }

  async provisionUser(_user: ProviderUser): Promise<string> {
    throw new Error(NOT_IMPLEMENTED);
  }

  async deprovisionUser(_externalId: string): Promise<void> {
    throw new Error(NOT_IMPLEMENTED);
  }

  async syncDirectory(_users: ProviderUser[]): Promise<DirectorySyncResult> {
    throw new Error(NOT_IMPLEMENTED);
  }

  getConfig(): IdentityProviderConfig {
    if (!this.config) throw new Error("Provider not initialized");
    return this.config;
  }

  async healthCheck(): Promise<{ ok: boolean; message?: string }> {
    return { ok: false, message: NOT_IMPLEMENTED };
  }
}
