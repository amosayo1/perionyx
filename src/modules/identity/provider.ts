import type {
  AuthRequest,
  AuthResult,
  ProviderUser,
  DirectorySyncResult,
  IdentityProviderConfig,
  IdentityProviderCapabilities,
} from "./types";

export interface IIdentityProvider {
  readonly kind: string;
  readonly label: string;
  readonly capabilities: IdentityProviderCapabilities;

  initialize(config: IdentityProviderConfig): Promise<void>;

  authenticate(request: AuthRequest): Promise<AuthResult>;

  validateToken(token: string): Promise<ProviderUser | null>;

  provisionUser(user: ProviderUser): Promise<string>;

  deprovisionUser(externalId: string): Promise<void>;

  syncDirectory(users: ProviderUser[]): Promise<DirectorySyncResult>;

  getConfig(): IdentityProviderConfig;

  healthCheck(): Promise<{ ok: boolean; message?: string }>;
}
