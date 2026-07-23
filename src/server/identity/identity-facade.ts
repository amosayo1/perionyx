import { IdentityProviderManager, identityProviderManager } from "./identity-provider"
import { AuthenticationService, authenticationService } from "./authentication"
import { SessionManager, sessionManager } from "./session-manager"
import { UserProvisioningService, userProvisioningService } from "./user-provisioning"
import { GroupManager, groupManager } from "./group-manager"
import { RoleManager, roleManager } from "./role-manager"
import { PermissionManager, permissionManager } from "./permission-manager"
import { PolicyEngine, policyEngine } from "./policy-engine"
import { AuditService, auditService } from "./audit-service"
import { SSOHandler, ssoHandler } from "./sso-handler"

export interface UserIdentitySummary {
  userId: string
  email: string
  roles: string[]
  permissions: string[]
  groups: string[]
  mfaEnabled: boolean
  activeSessions: number
  identityProviders: string[]
  lastLogin: Date | null
  securityScore: number
}

export interface CompanyIdentityStatus {
  totalUsers: number
  provisionedUsers: number
  activeSessions: number
  identityProviders: number
  securityPolicies: number
  auditLogCount: number
  ssoEnabled: boolean
  mfaCompliance: number
  overallSecurityScore: number
}

export class IdentityFacade {
  providers: IdentityProviderManager
  auth: AuthenticationService
  sessions: SessionManager
  provisioning: UserProvisioningService
  groups: GroupManager
  roles: RoleManager
  permissions: PermissionManager
  policies: PolicyEngine
  audit: AuditService
  sso: SSOHandler

  constructor() {
    this.providers = identityProviderManager
    this.auth = authenticationService
    this.sessions = sessionManager
    this.provisioning = userProvisioningService
    this.groups = groupManager
    this.roles = roleManager
    this.permissions = permissionManager
    this.policies = policyEngine
    this.audit = auditService
    this.sso = ssoHandler
  }

  getUserIdentitySummary(userId: string, companyId: string): UserIdentitySummary {
    const auditLogs = this.audit.getAuditLogsByUser(userId)
    const lastLoginEvent = auditLogs
      .filter((r) => r.eventType === "login.success")
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0]
    const activeSessions = this.sessions.getActiveSessions(userId)
    const userRoles = this.roles.getUserRoles(userId, companyId)
    const userPermissions = this.permissions.getUserPermissions(userId, companyId)
    const userGroups = this.groups.getGroupsForUser(userId)
    const connections = this.providers.getConnectionsByUser(userId)
    const mfaEvents = auditLogs.filter((r) => r.eventType.startsWith("mfa."))
    const mfaEnabled = mfaEvents.some((r) => r.eventType === "mfa.enrolled" || r.eventType === "mfa.verified")

    let securityScore = 50
    if (mfaEnabled) securityScore += 25
    if (activeSessions.length <= 3) securityScore += 10
    if (connections.length > 0) securityScore += 15

    return {
      userId,
      email: activeSessions[0]?.email ?? "",
      roles: userRoles,
      permissions: userPermissions,
      groups: userGroups.map((g) => g.name),
      mfaEnabled,
      activeSessions: activeSessions.length,
      identityProviders: connections.map((c) => c.providerId),
      lastLogin: lastLoginEvent?.timestamp ?? null,
      securityScore,
    }
  }

  getCompanyIdentityStatus(companyId: string): CompanyIdentityStatus {
    const provisionedUsers = this.provisioning.getProvisionedUsersByCompany(companyId)
    const companyPolicies = this.policies.getPoliciesByCompany(companyId)
    const companyProviders = this.providers.getProvidersByCompany(companyId)
    const auditLogs = this.audit.getAuditLogsByCompany(companyId)
    const allSessions = this.sessions.getAllActiveSessions()
    const companySessions = allSessions.filter((s) => s.companyId === companyId)
    const ssoEnabled = companyProviders.some((p) => p.enabled && (p.type === "saml" || p.type === "oidc" || p.type === "oauth2"))
    const mfaPolicies = companyPolicies.filter((p) => p.category === "mfa" && p.enabled)
    const mfaCompliance = mfaPolicies.length > 0 ? Math.min(100, mfaPolicies.length * 25) : 0

    let overallSecurityScore = 30
    if (ssoEnabled) overallSecurityScore += 20
    if (mfaCompliance >= 50) overallSecurityScore += 20
    if (companyPolicies.length >= 3) overallSecurityScore += 15
    if (companyProviders.length > 0) overallSecurityScore += 15

    return {
      totalUsers: provisionedUsers.length,
      provisionedUsers: provisionedUsers.length,
      activeSessions: companySessions.length,
      identityProviders: companyProviders.length,
      securityPolicies: companyPolicies.length,
      auditLogCount: auditLogs.length,
      ssoEnabled,
      mfaCompliance,
      overallSecurityScore,
    }
  }

  health(): { status: string; providerCount: number; userCount: number; sessionCount: number; auditCount: number } {
    return {
      status: "operational",
      providerCount: this.providers.countProviders(),
      userCount: this.provisioning.count(),
      sessionCount: this.sessions.countActiveSessions(),
      auditCount: this.audit.count(),
    }
  }
}

export const identityFacade = new IdentityFacade()
