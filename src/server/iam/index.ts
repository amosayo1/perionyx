export { PermissionRegistry, can, requirePermissions } from "./permissions";
export type { PermissionMeta } from "./permissions";

export { EnterpriseRoles } from "./roles";

export { ABACEvaluator, ABACPolicyEngine, abacEvaluator, abacPolicyEngine, ABAC_ATTRIBUTE_DEFINITIONS } from "./abac";

export { MFAService, mfaService } from "./mfa";
export type { TOTPEnrollment, MFAStatus } from "./mfa";

export { IAMAuditEvent, recordIAMAudit, isIAMAuditEvent } from "./audit-events";
export type { IAMAuditEvent as IAMAuditEventType } from "./audit-events";

export { IAMAdminService, iamAdminService } from "./admin";

export type {
  EnterpriseRoleId,
  EnterpriseRoleCategory,
  PermissionCategory,
  GranularPermission,
  PermissionScope,
  ABACAttribute,
  ABACPolicy,
  ABACCondition,
  MFAConfig,
  MFAMethod,
  MFAVerification,
  EnterpriseRoleDefinition,
  UserPermissionQuery,
  RoleAssignment,
} from "./types";
