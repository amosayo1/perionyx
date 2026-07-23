import type { EnterpriseRoleDefinition, EnterpriseRoleId, GranularPermission } from "./types";
import { PermissionRegistry } from "./permissions";

const ROLE_DEFINITIONS: EnterpriseRoleDefinition[] = [
  {
    id: "system_administrator",
    name: "System Administrator",
    description: "Full system access across all companies. Manages infrastructure, security, and global settings.",
    category: "administration",
    permissions: PermissionRegistry.getAllNames(),
    inherits: [],
    mfaRequired: true,
    maxSessionLifetimeHours: 8,
    sandboxRestricted: false,
  },
  {
    id: "enterprise_administrator",
    name: "Enterprise Administrator",
    description: "Company-level administration with full access to settings, users, roles, billing, and integrations.",
    category: "administration",
    permissions: [
      ...PermissionRegistry.getAllNames().filter(
        (p) =>
          !p.startsWith("security.encryption") &&
          !p.startsWith("admin.delete_company"),
      ),
    ],
    inherits: [],
    mfaRequired: true,
    maxSessionLifetimeHours: 12,
    sandboxRestricted: true,
  },
  {
    id: "compliance_officer",
    name: "Compliance Officer",
    description: "Oversees compliance, audit, and risk management. Can view all transactions and configure governance.",
    category: "compliance",
    permissions: [
      "treasury.read",
      "approvals.view",
      "audit.read",
      "audit.export",
      "risk.read",
      "risk.manage",
      "risk.configure",
      "reporting.read",
      "reporting.create",
      "approvals.approve",
      "approvals.reject",
    ],
    inherits: [],
    mfaRequired: true,
    maxSessionLifetimeHours: 12,
    sandboxRestricted: false,
  },
  {
    id: "security_officer",
    name: "Security Officer",
    description: "Manages security policies, MFA enforcement, SSO configuration, session policies, and encryption.",
    category: "security",
    permissions: [
      "security.policies",
      "security.mfa",
      "security.encryption",
      "security.sso",
      "security.session",
      "audit.read",
      "audit.export",
      "admin.security",
      "admin.users",
      "admin.roles",
      "risk.read",
    ],
    inherits: [],
    mfaRequired: true,
    maxSessionLifetimeHours: 8,
    sandboxRestricted: false,
  },
  {
    id: "treasury_manager",
    name: "Treasury Manager",
    description: "Full treasury operations including transfers, wallet management, reconciliations, and approval authority.",
    category: "treasury",
    permissions: [
      "treasury.read",
      "treasury.transfer",
      "treasury.credit",
      "treasury.debit",
      "treasury.reverse",
      "treasury.manage",
      "wallets.read",
      "wallets.manage",
      "approvals.approve",
      "approvals.reject",
      "approvals.escalate",
      "approvals.configure",
      "approvals.view",
      "reconciliation.execute",
      "reconciliation.view",
      "analytics.read",
      "reporting.read",
      "reporting.create",
    ],
    inherits: [],
    mfaRequired: true,
    maxSessionLifetimeHours: 12,
    sandboxRestricted: false,
  },
  {
    id: "treasury_analyst",
    name: "Treasury Analyst",
    description: "View-only treasury access with ability to prepare transfers and view reconciliations.",
    category: "treasury",
    permissions: [
      "treasury.read",
      "treasury.transfer",
      "wallets.read",
      "approvals.view",
      "reconciliation.view",
      "analytics.read",
      "reporting.read",
    ],
    inherits: [],
    mfaRequired: false,
    maxSessionLifetimeHours: 24,
    sandboxRestricted: false,
  },
  {
    id: "approval_authority",
    name: "Approval Authority",
    description: "Dedicated approver role with approval, rejection, and escalation capabilities across wallets and transactions.",
    category: "compliance",
    permissions: [
      "treasury.read",
      "approvals.approve",
      "approvals.reject",
      "approvals.escalate",
      "approvals.view",
      "audit.read",
      "risk.read",
      "reporting.read",
    ],
    inherits: [],
    mfaRequired: true,
    maxSessionLifetimeHours: 12,
    sandboxRestricted: false,
  },
  {
    id: "financial_controller",
    name: "Financial Controller",
    description: "Senior finance role with full treasury access, approval configuration, and reporting.",
    category: "treasury",
    permissions: [
      "treasury.read",
      "treasury.transfer",
      "treasury.credit",
      "treasury.debit",
      "treasury.reverse",
      "treasury.manage",
      "wallets.read",
      "wallets.manage",
      "approvals.approve",
      "approvals.reject",
      "approvals.escalate",
      "approvals.configure",
      "approvals.view",
      "reconciliation.execute",
      "reconciliation.view",
      "audit.read",
      "risk.read",
      "analytics.read",
      "analytics.export",
      "reporting.read",
      "reporting.create",
      "reporting.schedule",
    ],
    inherits: [],
    mfaRequired: true,
    maxSessionLifetimeHours: 12,
    sandboxRestricted: false,
  },
  {
    id: "auditor",
    name: "Auditor",
    description: "Read-only access to audit logs, transactions, risk data, and reports for compliance verification.",
    category: "compliance",
    permissions: [
      "audit.read",
      "audit.export",
      "treasury.read",
      "approvals.view",
      "wallets.read",
      "risk.read",
      "analytics.read",
      "reporting.read",
      "reconciliation.view",
      "connectors.read",
    ],
    inherits: [],
    mfaRequired: true,
    maxSessionLifetimeHours: 24,
    sandboxRestricted: false,
  },
  {
    id: "operations_manager",
    name: "Operations Manager",
    description: "Manages day-to-day operations including connectors, reconciliation, and workflow monitoring.",
    category: "operations",
    permissions: [
      "connectors.read",
      "connectors.manage",
      "connectors.connect",
      "connectors.sync",
      "reconciliation.execute",
      "reconciliation.view",
      "workflow.read",
      "workflow.execute",
      "automation.read",
      "automation.manage",
      "analytics.read",
      "reporting.read",
      "risk.read",
      "onboarding.read",
      "onboarding.manage",
    ],
    inherits: [],
    mfaRequired: false,
    maxSessionLifetimeHours: 24,
    sandboxRestricted: false,
  },
  {
    id: "connector_manager",
    name: "Connector Manager",
    description: "Specialized role for managing financial and business system connectors, credentials, and sync operations.",
    category: "operations",
    permissions: [
      "connectors.read",
      "connectors.manage",
      "connectors.connect",
      "connectors.sync",
      "connectors.credentials",
      "reconciliation.view",
      "audit.read",
      "reporting.read",
    ],
    inherits: [],
    mfaRequired: true,
    maxSessionLifetimeHours: 12,
    sandboxRestricted: false,
  },
  {
    id: "workflow_developer",
    name: "Workflow Developer",
    description: "Designs, builds, and manages automation workflows and business rules.",
    category: "operations",
    permissions: [
      "workflow.read",
      "workflow.create",
      "workflow.update",
      "workflow.delete",
      "workflow.execute",
      "workflow.activate",
      "workflow.import",
      "workflow.export",
      "automation.read",
      "automation.manage",
      "automation.schedule",
      "connectors.read",
      "connectors.sync",
      "reporting.read",
    ],
    inherits: [],
    mfaRequired: false,
    maxSessionLifetimeHours: 24,
    sandboxRestricted: false,
  },
  {
    id: "risk_manager",
    name: "Risk Manager",
    description: "Manages risk assessments, configures risk thresholds, and oversees risk mitigation strategies.",
    category: "security",
    permissions: [
      "risk.read",
      "risk.manage",
      "risk.configure",
      "treasury.read",
      "audit.read",
      "audit.export",
      "reporting.read",
      "reporting.create",
      "analytics.read",
      "approvals.view",
      "reconciliation.view",
    ],
    inherits: [],
    mfaRequired: true,
    maxSessionLifetimeHours: 12,
    sandboxRestricted: false,
  },
  {
    id: "read_only_executive",
    name: "Read-only Executive",
    description: "Executive read-only access across all domains for oversight and review.",
    category: "read_only",
    permissions: [
      "treasury.read",
      "wallets.read",
      "approvals.view",
      "audit.read",
      "risk.read",
      "analytics.read",
      "reporting.read",
      "reconciliation.view",
      "connectors.read",
      "workflow.read",
      "automation.read",
      "onboarding.read",
    ],
    inherits: [],
    mfaRequired: false,
    maxSessionLifetimeHours: 48,
    sandboxRestricted: false,
  },
  {
    id: "api_access",
    name: "API Access",
    description: "Programmatic access for API integrations with scoped permissions.",
    category: "operations",
    permissions: [
      "treasury.read",
      "treasury.transfer",
      "wallets.read",
      "connectors.read",
      "connectors.sync",
      "reconciliation.view",
      "reporting.read",
      "workflow.read",
      "workflow.execute",
    ],
    inherits: [],
    mfaRequired: true,
    maxSessionLifetimeHours: 720,
    sandboxRestricted: false,
  },
  {
    id: "support_agent",
    name: "Support Agent",
    description: "Customer support with read access to user accounts, onboarding status, and basic troubleshooting.",
    category: "operations",
    permissions: [
      "onboarding.read",
      "onboarding.manage",
      "analytics.read",
      "reporting.read",
      "connectors.read",
      "treasury.read",
      "wallets.read",
      "audit.read",
    ],
    inherits: [],
    mfaRequired: false,
    maxSessionLifetimeHours: 24,
    sandboxRestricted: false,
  },
  {
    id: "department_manager",
    name: "Department Manager",
    description: "Department-level oversight with scoped read and reporting access.",
    category: "administration",
    permissions: [
      "treasury.read",
      "approvals.view",
      "analytics.read",
      "analytics.export",
      "reporting.read",
      "reporting.create",
      "reporting.schedule",
      "audit.read",
      "risk.read",
      "onboarding.read",
      "workflow.read",
      "automation.read",
    ],
    inherits: ["read_only_executive"],
    mfaRequired: false,
    maxSessionLifetimeHours: 24,
    sandboxRestricted: false,
  },
];

const ROLE_MAP = new Map<EnterpriseRoleId, EnterpriseRoleDefinition>(
  ROLE_DEFINITIONS.map((r) => [r.id, r]),
);

export class EnterpriseRoles {
  static getAll(): EnterpriseRoleDefinition[] {
    return ROLE_DEFINITIONS;
  }

  static get(roleId: EnterpriseRoleId): EnterpriseRoleDefinition | undefined {
    return ROLE_MAP.get(roleId);
  }

  static getByCategory(category: string): EnterpriseRoleDefinition[] {
    return ROLE_DEFINITIONS.filter((r) => r.category === category);
  }

  static getPermissions(roleId: EnterpriseRoleId): GranularPermission[] {
    const role = ROLE_MAP.get(roleId);
    if (!role) return [];
    const inherited = role.inherits.flatMap((parentId) =>
      EnterpriseRoles.getPermissions(parentId),
    );
    return [...new Set([...role.permissions, ...inherited])];
  }

  static requiresMfa(roleId: EnterpriseRoleId): boolean {
    return ROLE_MAP.get(roleId)?.mfaRequired ?? false;
  }

  static getMaxSessionLifetime(roleId: EnterpriseRoleId): number {
    return ROLE_MAP.get(roleId)?.maxSessionLifetimeHours ?? 24;
  }

  static isSandboxRestricted(roleId: EnterpriseRoleId): boolean {
    return ROLE_MAP.get(roleId)?.sandboxRestricted ?? false;
  }

  static getApprovalLimit(roleId: EnterpriseRoleId): number | undefined {
    return ROLE_MAP.get(roleId)?.approvalLimit;
  }

  static getApproverThreshold(roleId: EnterpriseRoleId): number | undefined {
    return ROLE_MAP.get(roleId)?.approverThreshold;
  }

  static validate(roleId: string): roleId is EnterpriseRoleId {
    return ROLE_MAP.has(roleId as EnterpriseRoleId);
  }
}
