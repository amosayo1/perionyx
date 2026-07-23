export type EnterpriseRoleId =
  | "system_administrator"
  | "enterprise_administrator"
  | "compliance_officer"
  | "security_officer"
  | "treasury_manager"
  | "treasury_analyst"
  | "approval_authority"
  | "financial_controller"
  | "auditor"
  | "operations_manager"
  | "connector_manager"
  | "workflow_developer"
  | "risk_manager"
  | "read_only_executive"
  | "api_access"
  | "support_agent"
  | "department_manager";

export type EnterpriseRoleCategory =
  | "administration"
  | "security"
  | "treasury"
  | "compliance"
  | "operations"
  | "read_only";

export type PermissionCategory =
  | "workflow"
  | "treasury"
  | "approvals"
  | "wallets"
  | "connectors"
  | "reconciliation"
  | "audit"
  | "administration"
  | "security"
  | "risk"
  | "analytics"
  | "reporting"
  | "automation"
  | "onboarding"
  | "agents"
  | "crm"
  | "ap";

export type GranularPermission =
  | "workflow.read"
  | "workflow.create"
  | "workflow.update"
  | "workflow.delete"
  | "workflow.execute"
  | "workflow.activate"
  | "workflow.import"
  | "workflow.export"
  | "treasury.read"
  | "treasury.transfer"
  | "treasury.credit"
  | "treasury.debit"
  | "treasury.reverse"
  | "treasury.manage"
  | "approvals.approve"
  | "approvals.reject"
  | "approvals.escalate"
  | "approvals.configure"
  | "approvals.view"
  | "approvals.request"
  | "wallets.read"
  | "wallets.manage"
  | "connectors.read"
  | "connectors.manage"
  | "connectors.connect"
  | "connectors.sync"
  | "connectors.credentials"
  | "reconciliation.execute"
  | "reconciliation.view"
  | "audit.read"
  | "audit.export"
  | "audit.configure"
  | "admin.users"
  | "admin.roles"
  | "admin.permissions"
  | "admin.settings"
  | "admin.billing"
  | "admin.api_keys"
  | "admin.webhooks"
  | "admin.integrations"
  | "admin.security"
  | "admin.delete_company"
  | "admin.export_data"
  | "admin.approvals"
  | "admin.authorities"
  | "security.policies"
  | "security.mfa"
  | "security.encryption"
  | "security.sso"
  | "security.session"
  | "risk.read"
  | "risk.manage"
  | "risk.configure"
  | "analytics.read"
  | "analytics.export"
  | "reporting.read"
  | "reporting.create"
  | "reporting.schedule"
  | "automation.read"
  | "automation.manage"
  | "automation.schedule"
  | "onboarding.read"
  | "onboarding.manage"
  | "agents.manage"
  | "agents.view"
  | "crm.view"
  | "crm.manage"
  | "crm.delete"
  | "crm.seed"
  | "ap.vendors.create"
  | "ap.vendors.view"
  | "ap.vendors.manage"
  | "ap.vendors.approve"
  | "ap.vendors.delete"
  | "ap.invoices.create"
  | "ap.invoices.view"
  | "ap.invoices.manage"
  | "ap.invoices.approve"
  | "ap.invoices.delete"
  | "ap.invoices.match"
  | "ap.exceptions.view"
  | "ap.exceptions.manage"
  | "ap.exceptions.assign"
  | "ap.exceptions.resolve"
  | "ap.approvals.view"
  | "ap.approvals.approve"
  | "ap.approvals.reject"
  | "ap.approvals.delegate"
  | "ap.approvals.escalate"
  | "ap.payments.view"
  | "ap.payments.create"
  | "ap.payments.execute"
  | "ap.payments.approve"
  | "ap.payments.reverse"
  | "ap.reconciliation.view"
  | "ap.reconciliation.execute"
  | "ap.reconciliation.adjust"
  | "ap.credits.view"
  | "ap.credits.create"
  | "ap.credits.apply"
  | "ap.credits.void"
  | "ap.reports.view"
  | "ap.reports.export"
  | "ap.admin.manage";

export type PermissionScope =
  | "global"
  | "company"
  | "department"
  | "region"
  | "wallet"
  | "workflow"
  | "connector_type";

export interface ABACAttribute {
  department?: string;
  region?: string;
  legalEntity?: string;
  costCenter?: string;
  approvalLimit?: number;
  riskLevel?: "low" | "medium" | "high" | "critical";
  walletId?: string;
  workflowId?: string;
  connectorType?: string;
}

export interface ABACPolicy {
  id: string;
  name: string;
  effect: "allow" | "deny";
  permissions: GranularPermission[];
  conditions: ABACCondition[];
  priority: number;
  description: string;
}

export interface ABACCondition {
  attribute: keyof ABACAttribute;
  operator: "eq" | "neq" | "in" | "nin" | "lt" | "lte" | "gt" | "gte" | "contains";
  value: unknown;
}

export interface MFAConfig {
  methods: MFAMethod[];
  required: boolean;
  enforcementRoles: EnterpriseRoleId[];
  gracePeriodDays: number;
  rememberDeviceDays: number;
}

export type MFAMethod = "totp" | "webauthn" | "email_otp";

export interface MFAVerification {
  userId: string;
  method: MFAMethod;
  verified: boolean;
  verifiedAt: Date;
  expiresAt: Date;
}

export interface SessionConfig {
  idleTimeoutMinutes: number;
  absoluteTimeoutHours: number;
  maxConcurrentSessions: number;
  requireDeviceFingerprint: boolean;
}

export interface SessionInfo {
  sessionId: string;
  userId: string;
  deviceFingerprint: string | null;
  ipAddress: string;
  userAgent: string;
  createdAt: Date;
  lastActivityAt: Date;
  expiresAt: Date;
  revoked: boolean;
}

export interface EnterpriseRoleDefinition {
  id: EnterpriseRoleId;
  name: string;
  description: string;
  category: EnterpriseRoleCategory;
  permissions: GranularPermission[];
  inherits: EnterpriseRoleId[];
  mfaRequired: boolean;
  maxSessionLifetimeHours: number;
  sandboxRestricted: boolean;
  approverThreshold?: number;
  approvalLimit?: number;
}

export interface UserPermissionQuery {
  userId: string;
  companyId: string;
  permission: GranularPermission;
  attributes?: ABACAttribute;
}

export interface RoleAssignment {
  userId: string;
  roleId: EnterpriseRoleId;
  companyId: string;
  assignedBy: string;
  assignedAt: Date;
  expiresAt?: Date;
}

export const PERMISSION_SCOPE_TYPES: PermissionScope[] = [
  "global",
  "company",
  "department",
  "region",
  "wallet",
  "workflow",
  "connector_type",
];

export const MFA_METHODS: MFAMethod[] = ["totp", "webauthn", "email_otp"];
