import { recordAudit, type DbClient } from "@/modules/audit";
import { AuditSeverity } from "@prisma/client";
import type { Prisma } from "@prisma/client";

export const IAMAuditEvent = {
  LOGIN_SUCCESS: "iam.login.success",
  LOGIN_FAILED: "iam.login.failed",
  LOGOUT: "iam.logout",
  SESSION_CREATED: "iam.session.created",
  SESSION_EXPIRED: "iam.session.expired",
  SESSION_REVOKED: "iam.session.revoked",
  PASSWORD_CHANGED: "iam.password.changed",
  PASSWORD_RESET_REQUESTED: "iam.password.reset_requested",
  PASSWORD_RESET_COMPLETED: "iam.password.reset_completed",
  MFA_ENROLLED: "iam.mfa.enrolled",
  MFA_DISABLED: "iam.mfa.disabled",
  MFA_VERIFIED: "iam.mfa.verified",
  MFA_FAILED: "iam.mfa.failed",
  MFA_RECOVERY_USED: "iam.mfa.recovery_used",
  ROLE_ASSIGNED: "iam.role.assigned",
  ROLE_REVOKED: "iam.role.revoked",
  ROLE_CREATED: "iam.role.created",
  ROLE_UPDATED: "iam.role.updated",
  ROLE_DELETED: "iam.role.deleted",
  PERMISSION_GRANTED: "iam.permission.granted",
  PERMISSION_REVOKED: "iam.permission.revoked",
  USER_INVITED: "iam.user.invited",
  USER_ACTIVATED: "iam.user.activated",
  USER_DEACTIVATED: "iam.user.deactivated",
  USER_DELETED: "iam.user.deleted",
  API_KEY_CREATED: "iam.api_key.created",
  API_KEY_REVOKED: "iam.api_key.revoked",
  API_KEY_ROTATED: "iam.api_key.rotated",
  SSO_PROVIDER_CONFIGURED: "iam.sso.provider_configured",
  SSO_PROVIDER_DISABLED: "iam.sso.provider_disabled",
  ABAC_POLICY_CREATED: "iam.abac.policy_created",
  ABAC_POLICY_UPDATED: "iam.abac.policy_updated",
  ABAC_POLICY_DELETED: "iam.abac.policy_deleted",
  AUDIT_CONFIG_CHANGED: "iam.audit.config_changed",
  SESSION_POLICY_CHANGED: "iam.session.policy_changed",
  IDENTITY_PROVIDER_SYNC: "iam.identity_provider.sync",
  IDENTITY_PROVIDER_ERROR: "iam.identity_provider.error",
  TENANT_SETTINGS_CHANGED: "iam.tenant.settings_changed",
} as const;

export type IAMAuditEvent = (typeof IAMAuditEvent)[keyof typeof IAMAuditEvent];

interface IAMAuditParams {
  db?: DbClient;
  prisma?: DbClient;
  companyId?: string | null;
  actorUserId?: string | null;
  event: IAMAuditEvent;
  resourceType: string;
  resourceId?: string | null;
  severity?: AuditSeverity;
  metadata?: Record<string, unknown>;
  requestId?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}

export async function recordIAMAudit(params: IAMAuditParams) {
  const db = params.db ?? params.prisma ?? (await import("@/server/db/prisma")).prisma;
  return recordAudit(db as DbClient, {
    companyId: params.companyId,
    actorUserId: params.actorUserId,
    action: params.event,
    resourceType: params.resourceType,
    resourceId: params.resourceId,
    severity: params.severity ?? AuditSeverity.INFO,
    metadata: (params.metadata as Prisma.InputJsonValue | undefined) ?? undefined,
    requestId: params.requestId,
    ipAddress: params.ipAddress,
    userAgent: params.userAgent,
  });
}

export function isIAMAuditEvent(action: string): action is IAMAuditEvent {
  return Object.values(IAMAuditEvent).includes(action as IAMAuditEvent);
}
