export type IdentityProviderKind =
  | "local"
  | "entra-id"
  | "google-workspace"
  | "okta"
  | "saml"
  | "oidc";

export type IdentityProviderStatus = "active" | "disabled" | "configuring" | "error";

export interface IdentityProviderConfig {
  id: string;
  companyId: string;
  kind: IdentityProviderKind;
  status: IdentityProviderStatus;
  label: string;
  domain?: string;
  metadata: Record<string, string>;
  priority: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IdentityProviderCapabilities {
  authentication: boolean;
  provisioning: boolean;
  directorySync: boolean;
  mfa: boolean;
  sso: boolean;
}

export interface AuthRequest {
  email: string;
  password?: string;
  providerKind: IdentityProviderKind;
  idToken?: string;
  code?: string;
  redirectUri?: string;
}

export interface AuthResult {
  userId: string;
  email: string;
  name: string | null;
  providerKind: IdentityProviderKind;
  providerId: string;
  sessionToken?: string;
  mfaRequired: boolean;
}

export interface ProviderUser {
  externalId: string;
  email: string;
  name: string | null;
  groups: string[];
  roles: string[];
  active: boolean;
}

export interface DirectorySyncResult {
  added: number;
  updated: number;
  deactivated: number;
  errors: string[];
}

export interface IdentityProviderStats {
  config: IdentityProviderConfig;
  capabilities: IdentityProviderCapabilities;
  lastSync: Date | null;
  totalUsers: number;
  status: IdentityProviderStatus;
}
