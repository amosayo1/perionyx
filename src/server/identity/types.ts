export type IdentityProviderType = "saml" | "oidc" | "oauth2" | "ldap" | "azure_ad" | "google_workspace" | "okta"
export type IdentityProviderStatus = "active" | "inactive" | "error" | "configuring"
export type AuthenticationMethod = "password" | "passkey" | "mfa_totp" | "mfa_webauthn" | "mfa_email_otp" | "sso_saml" | "sso_oidc" | "sso_oauth2"
export type SessionStatus = "active" | "idle" | "expired" | "revoked"
export type ProvisioningStatus = "pending" | "synced" | "failed" | "orphaned"
export type AuditEventType =
  | "login.success" | "login.failed" | "logout" | "logout.forced"
  | "mfa.enrolled" | "mfa.verified" | "mfa.failed" | "mfa.recovery_used"
  | "password.changed" | "password.reset" | "password.reset_requested"
  | "session.created" | "session.expired" | "session.revoked"
  | "user.created" | "user.updated" | "user.deleted" | "user.suspended" | "user.activated"
  | "role.assigned" | "role.revoked" | "permission.granted" | "permission.revoked"
  | "group.created" | "group.updated" | "group.deleted" | "group.member_added" | "group.member_removed"
  | "identity_provider.created" | "identity_provider.updated" | "identity_provider.deleted"
  | "policy.created" | "policy.updated" | "policy.deleted"
  | "admin.action"

export interface IdentityProviderConfig {
  id: string
  type: IdentityProviderType
  name: string
  description?: string
  status: IdentityProviderStatus
  issuerUrl?: string
  metadataUrl?: string
  clientId?: string
  clientSecret?: string
  authorizationUrl?: string
  tokenUrl?: string
  userInfoUrl?: string
  jwksUrl?: string
  certificate?: string
  privateKey?: string
  attributeMapping: Record<string, string>
  allowedDomains: string[]
  autoProvision: boolean
  defaultRoles: string[]
  enabled: boolean
  companyId: string
  createdAt: Date
  updatedAt: Date
}

export interface IdentityProviderConnection {
  id: string
  providerId: string
  userId: string
  externalId: string
  email: string
  name: string
  attributes: Record<string, unknown>
  lastSyncedAt: Date
  connectedAt: Date
}

export interface AuthenticatedUser {
  id: string
  email: string
  name: string
  roles: string[]
  permissions: string[]
  mfaVerified: boolean
  sessionId: string
  identityProvider?: string
  companyId: string
}

export interface LoginAttempt {
  id: string
  userId?: string
  email: string
  ipAddress: string
  userAgent: string
  success: boolean
  method: AuthenticationMethod
  failureReason?: string
  timestamp: Date
  companyId?: string
}

export interface UserSession {
  id: string
  userId: string
  email: string
  companyId: string
  ipAddress: string
  userAgent: string
  deviceFingerprint?: string
  deviceName?: string
  status: SessionStatus
  authenticationMethod: AuthenticationMethod
  identityProvider?: string
  mfaVerified: boolean
  lastActivityAt: Date
  expiresAt: Date
  createdAt: Date
  revokedAt?: Date
  revocationReason?: string
}

export interface ProvisionedUser {
  id: string
  externalId: string
  email: string
  firstName: string
  lastName: string
  displayName: string
  department?: string
  jobTitle?: string
  phone?: string
  source: IdentityProviderType
  status: ProvisioningStatus
  groups: string[]
  roles: string[]
  lastSyncedAt?: Date
  companyId: string
  createdAt: Date
  updatedAt: Date
}

export interface IdentityGroup {
  id: string
  name: string
  description?: string
  externalId?: string
  source?: IdentityProviderType
  memberCount: number
  roles: string[]
  permissions: string[]
  companyId: string
  createdAt: Date
  updatedAt: Date
}

export interface SecurityPolicy {
  id: string
  name: string
  description: string
  category: "password" | "session" | "mfa" | "login" | "account"
  enabled: boolean
  settings: Record<string, unknown>
  priority: number
  companyId: string
  createdAt: Date
  updatedAt: Date
}

export interface AuditRecord {
  id: string
  eventType: AuditEventType
  userId?: string
  userEmail?: string
  targetId?: string
  targetType?: string
  details: string
  ipAddress?: string
  userAgent?: string
  severity: "info" | "warning" | "error" | "critical"
  companyId?: string
  sessionId?: string
  metadata: Record<string, unknown>
  timestamp: Date
}

export interface AuthToken {
  id: string
  userId: string
  type: "access" | "refresh" | "reset" | "verify"
  value: string
  expiresAt: Date
  revoked: boolean
  createdAt: Date
}

export interface ScimConfig {
  enabled: boolean
  endpoint: string
  token: string
  supportedAttributes: string[]
  autoProvision: boolean
  autoDeactivate: boolean
  groupSync: boolean
  companyId: string
}

export interface OAuthClient {
  id: string
  name: string
  clientId: string
  clientSecret: string
  redirectUris: string[]
  allowedGrantTypes: string[]
  scopes: string[]
  confidential: boolean
  enabled: boolean
  companyId: string
  createdAt: Date
  updatedAt: Date
}
