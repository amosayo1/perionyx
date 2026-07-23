import type { GranularPermission, PermissionCategory } from "./types";

interface PermissionMeta {
  name: GranularPermission;
  category: PermissionCategory;
  description: string;
  scopes: string[];
  requiresMfa: boolean;
}

const PERMISSION_DEFINITIONS: PermissionMeta[] = [
  {
    name: "workflow.read",
    category: "workflow",
    description: "View workflow definitions and instances",
    scopes: ["global", "company", "workflow"],
    requiresMfa: false,
  },
  {
    name: "workflow.create",
    category: "workflow",
    description: "Create new workflow definitions",
    scopes: ["global", "company"],
    requiresMfa: false,
  },
  {
    name: "workflow.update",
    category: "workflow",
    description: "Modify existing workflow definitions",
    scopes: ["global", "company", "workflow"],
    requiresMfa: false,
  },
  {
    name: "workflow.delete",
    category: "workflow",
    description: "Delete workflow definitions",
    scopes: ["global", "company", "workflow"],
    requiresMfa: true,
  },
  {
    name: "workflow.execute",
    category: "workflow",
    description: "Execute and trigger workflow instances",
    scopes: ["global", "company", "workflow"],
    requiresMfa: true,
  },
  {
    name: "workflow.activate",
    category: "workflow",
    description: "Activate or deactivate workflow definitions",
    scopes: ["global", "company", "workflow"],
    requiresMfa: true,
  },
  {
    name: "workflow.import",
    category: "workflow",
    description: "Import workflow definitions from templates",
    scopes: ["global", "company"],
    requiresMfa: false,
  },
  {
    name: "workflow.export",
    category: "workflow",
    description: "Export workflow definitions as templates",
    scopes: ["global", "company"],
    requiresMfa: false,
  },
  {
    name: "treasury.read",
    category: "treasury",
    description: "View treasury balances and transactions",
    scopes: ["global", "company", "wallet"],
    requiresMfa: false,
  },
  {
    name: "treasury.transfer",
    category: "treasury",
    description: "Initiate fund transfers between wallets",
    scopes: ["global", "company", "wallet"],
    requiresMfa: true,
  },
  {
    name: "treasury.credit",
    category: "treasury",
    description: "Credit funds to wallets",
    scopes: ["global", "company", "wallet"],
    requiresMfa: true,
  },
  {
    name: "treasury.debit",
    category: "treasury",
    description: "Debit funds from wallets",
    scopes: ["global", "company", "wallet"],
    requiresMfa: true,
  },
  {
    name: "treasury.reverse",
    category: "treasury",
    description: "Reverse previous transactions",
    scopes: ["global", "company", "wallet"],
    requiresMfa: true,
  },
  {
    name: "treasury.manage",
    category: "treasury",
    description: "Configure treasury settings and wallets",
    scopes: ["global", "company"],
    requiresMfa: true,
  },
  {
    name: "approvals.approve",
    category: "approvals",
    description: "Approve pending approval requests",
    scopes: ["global", "company", "wallet"],
    requiresMfa: true,
  },
  {
    name: "approvals.reject",
    category: "approvals",
    description: "Reject pending approval requests",
    scopes: ["global", "company", "wallet"],
    requiresMfa: true,
  },
  {
    name: "approvals.escalate",
    category: "approvals",
    description: "Escalate approval requests to higher authorities",
    scopes: ["global", "company"],
    requiresMfa: true,
  },
  {
    name: "approvals.configure",
    category: "approvals",
    description: "Configure approval policies, thresholds, and rules",
    scopes: ["global", "company"],
    requiresMfa: true,
  },
  {
    name: "approvals.view",
    category: "approvals",
    description: "View approval requests and history",
    scopes: ["global", "company", "wallet"],
    requiresMfa: false,
  },
  {
    name: "wallets.read",
    category: "wallets",
    description: "View wallet details and balances",
    scopes: ["global", "company", "wallet"],
    requiresMfa: false,
  },
  {
    name: "wallets.manage",
    category: "wallets",
    description: "Create, configure, and manage wallets",
    scopes: ["global", "company"],
    requiresMfa: true,
  },
  {
    name: "connectors.read",
    category: "connectors",
    description: "View connector configurations and status",
    scopes: ["global", "company", "connector_type"],
    requiresMfa: false,
  },
  {
    name: "connectors.manage",
    category: "connectors",
    description: "Install, configure, and remove connectors",
    scopes: ["global", "company", "connector_type"],
    requiresMfa: true,
  },
  {
    name: "connectors.connect",
    category: "connectors",
    description: "Connect and disconnect connector instances",
    scopes: ["global", "company", "connector_type"],
    requiresMfa: true,
  },
  {
    name: "connectors.sync",
    category: "connectors",
    description: "Trigger manual data synchronization",
    scopes: ["global", "company", "connector_type"],
    requiresMfa: false,
  },
  {
    name: "connectors.credentials",
    category: "connectors",
    description: "Manage connector credentials and secrets",
    scopes: ["global", "company", "connector_type"],
    requiresMfa: true,
  },
  {
    name: "reconciliation.execute",
    category: "reconciliation",
    description: "Run reconciliation workflows",
    scopes: ["global", "company"],
    requiresMfa: true,
  },
  {
    name: "reconciliation.view",
    category: "reconciliation",
    description: "View reconciliation results and history",
    scopes: ["global", "company"],
    requiresMfa: false,
  },
  {
    name: "audit.read",
    category: "audit",
    description: "View audit logs and compliance history",
    scopes: ["global", "company"],
    requiresMfa: false,
  },
  {
    name: "audit.export",
    category: "audit",
    description: "Export audit logs for external review",
    scopes: ["global", "company"],
    requiresMfa: true,
  },
  {
    name: "audit.configure",
    category: "audit",
    description: "Configure audit logging settings and retention",
    scopes: ["global", "company"],
    requiresMfa: true,
  },
  {
    name: "admin.users",
    category: "administration",
    description: "Manage user accounts and assignments",
    scopes: ["global", "company"],
    requiresMfa: true,
  },
  {
    name: "admin.roles",
    category: "administration",
    description: "Manage roles and role assignments",
    scopes: ["global", "company"],
    requiresMfa: true,
  },
  {
    name: "admin.permissions",
    category: "administration",
    description: "Manage permission definitions and assignments",
    scopes: ["global", "company"],
    requiresMfa: true,
  },
  {
    name: "admin.settings",
    category: "administration",
    description: "Manage company-wide settings and preferences",
    scopes: ["global", "company"],
    requiresMfa: true,
  },
  {
    name: "admin.billing",
    category: "administration",
    description: "Manage billing, plans, and subscriptions",
    scopes: ["global", "company"],
    requiresMfa: true,
  },
  {
    name: "admin.api_keys",
    category: "administration",
    description: "Manage API keys and tokens",
    scopes: ["global", "company"],
    requiresMfa: true,
  },
  {
    name: "admin.webhooks",
    category: "administration",
    description: "Manage webhook configurations",
    scopes: ["global", "company"],
    requiresMfa: true,
  },
  {
    name: "admin.integrations",
    category: "administration",
    description: "Manage third-party integrations",
    scopes: ["global", "company"],
    requiresMfa: true,
  },
  {
    name: "admin.security",
    category: "administration",
    description: "Manage security settings and policies",
    scopes: ["global", "company"],
    requiresMfa: true,
  },
  {
    name: "admin.delete_company",
    category: "administration",
    description: "Delete the company and all associated data",
    scopes: ["global", "company"],
    requiresMfa: true,
  },
  {
    name: "admin.export_data",
    category: "administration",
    description: "Export all company data",
    scopes: ["global", "company"],
    requiresMfa: true,
  },
  {
    name: "security.policies",
    category: "security",
    description: "Configure security policies and rules",
    scopes: ["global", "company"],
    requiresMfa: true,
  },
  {
    name: "security.mfa",
    category: "security",
    description: "Configure multi-factor authentication policies",
    scopes: ["global", "company"],
    requiresMfa: true,
  },
  {
    name: "security.encryption",
    category: "security",
    description: "Manage encryption keys and settings",
    scopes: ["global", "company"],
    requiresMfa: true,
  },
  {
    name: "security.sso",
    category: "security",
    description: "Configure single sign-on providers",
    scopes: ["global", "company"],
    requiresMfa: true,
  },
  {
    name: "security.session",
    category: "security",
    description: "Manage session policies and active sessions",
    scopes: ["global", "company"],
    requiresMfa: true,
  },
  {
    name: "risk.read",
    category: "risk",
    description: "View risk assessments and scores",
    scopes: ["global", "company"],
    requiresMfa: false,
  },
  {
    name: "risk.manage",
    category: "risk",
    description: "Manage risk mitigation actions",
    scopes: ["global", "company"],
    requiresMfa: true,
  },
  {
    name: "risk.configure",
    category: "risk",
    description: "Configure risk thresholds and rules",
    scopes: ["global", "company"],
    requiresMfa: true,
  },
  {
    name: "analytics.read",
    category: "analytics",
    description: "View analytics dashboards and reports",
    scopes: ["global", "company", "department"],
    requiresMfa: false,
  },
  {
    name: "analytics.export",
    category: "analytics",
    description: "Export analytics data",
    scopes: ["global", "company", "department"],
    requiresMfa: false,
  },
  {
    name: "reporting.read",
    category: "reporting",
    description: "View generated reports",
    scopes: ["global", "company", "department"],
    requiresMfa: false,
  },
  {
    name: "reporting.create",
    category: "reporting",
    description: "Create new reports",
    scopes: ["global", "company", "department"],
    requiresMfa: false,
  },
  {
    name: "reporting.schedule",
    category: "reporting",
    description: "Schedule automated report generation",
    scopes: ["global", "company"],
    requiresMfa: false,
  },
  {
    name: "automation.read",
    category: "automation",
    description: "View automation rules and schedules",
    scopes: ["global", "company", "workflow"],
    requiresMfa: false,
  },
  {
    name: "automation.manage",
    category: "automation",
    description: "Create and manage automation rules",
    scopes: ["global", "company", "workflow"],
    requiresMfa: true,
  },
  {
    name: "automation.schedule",
    category: "automation",
    description: "Configure automation schedules and triggers",
    scopes: ["global", "company", "workflow"],
    requiresMfa: true,
  },
  {
    name: "onboarding.read",
    category: "onboarding",
    description: "View onboarding progress and status",
    scopes: ["global", "company"],
    requiresMfa: false,
  },
  {
    name: "onboarding.manage",
    category: "onboarding",
    description: "Manage onboarding steps and configuration",
    scopes: ["global", "company"],
    requiresMfa: true,
  },
  {
    name: "approvals.request",
    category: "approvals",
    description: "Request approval for transactions and actions",
    scopes: ["global", "company", "wallet"],
    requiresMfa: false,
  },
  {
    name: "admin.approvals",
    category: "administration",
    description: "Configure approver roles, wallet approvers, and thresholds",
    scopes: ["global", "company"],
    requiresMfa: true,
  },
  {
    name: "admin.authorities",
    category: "administration",
    description: "Manage approval authority and transaction profiles",
    scopes: ["global", "company"],
    requiresMfa: true,
  },
  {
    name: "agents.manage",
    category: "agents",
    description: "Manage agent definitions, tasks, sessions, and configurations",
    scopes: ["global", "company"],
    requiresMfa: true,
  },
  {
    name: "agents.view",
    category: "agents",
    description: "View agent definitions, status, health, and audit history",
    scopes: ["global", "company"],
    requiresMfa: false,
  },
  {
    name: "crm.view",
    category: "crm",
    description: "View CRM contacts, insights, pain points, and relationship data",
    scopes: ["global", "company"],
    requiresMfa: false,
  },
  {
    name: "crm.manage",
    category: "crm",
    description: "Create, update, and manage CRM contacts, insights, and relationships",
    scopes: ["global", "company"],
    requiresMfa: true,
  },
  {
    name: "crm.delete",
    category: "crm",
    description: "Delete CRM contacts and related data",
    scopes: ["global", "company"],
    requiresMfa: true,
  },
  {
    name: "crm.seed",
    category: "crm",
    description: "Seed CRM data for development and testing",
    scopes: ["global", "company"],
    requiresMfa: true,
  },
  // ── AP: Vendors ────────────────────────────────────────────────────────────
  { name: "ap.vendors.create", category: "ap", description: "Create new vendor records", scopes: ["global", "company"], requiresMfa: false },
  { name: "ap.vendors.view", category: "ap", description: "View vendor records and details", scopes: ["global", "company"], requiresMfa: false },
  { name: "ap.vendors.manage", category: "ap", description: "Update vendor records, bank details, and status", scopes: ["global", "company"], requiresMfa: false },
  { name: "ap.vendors.approve", category: "ap", description: "Approve, reject, suspend, or deactivate vendors", scopes: ["global", "company"], requiresMfa: true },
  { name: "ap.vendors.delete", category: "ap", description: "Permanently deactivate vendors", scopes: ["global", "company"], requiresMfa: true },
  // ── AP: Invoices ───────────────────────────────────────────────────────────
  { name: "ap.invoices.create", category: "ap", description: "Receive and capture vendor invoices", scopes: ["global", "company"], requiresMfa: false },
  { name: "ap.invoices.view", category: "ap", description: "View invoice details, line items, and history", scopes: ["global", "company"], requiresMfa: false },
  { name: "ap.invoices.manage", category: "ap", description: "Update, void, block, unblock, dispute, or resolve invoice disputes", scopes: ["global", "company"], requiresMfa: false },
  { name: "ap.invoices.approve", category: "ap", description: "Approve or reject invoices at any approval level", scopes: ["global", "company"], requiresMfa: true },
  { name: "ap.invoices.delete", category: "ap", description: "Void or delete invoices", scopes: ["global", "company"], requiresMfa: true },
  { name: "ap.invoices.match", category: "ap", description: "Run three-way matching and override match results", scopes: ["global", "company"], requiresMfa: false },
  // ── AP: Exceptions ─────────────────────────────────────────────────────────
  { name: "ap.exceptions.view", category: "ap", description: "View the AP exception queue", scopes: ["global", "company"], requiresMfa: false },
  { name: "ap.exceptions.manage", category: "ap", description: "Create, escalate, or bulk-resolve AP exceptions", scopes: ["global", "company"], requiresMfa: false },
  { name: "ap.exceptions.assign", category: "ap", description: "Assign exceptions to team members", scopes: ["global", "company"], requiresMfa: false },
  { name: "ap.exceptions.resolve", category: "ap", description: "Resolve AP exceptions", scopes: ["global", "company"], requiresMfa: false },
  // ── AP: Approvals ──────────────────────────────────────────────────────────
  { name: "ap.approvals.view", category: "ap", description: "View the AP approval queue and approval chains", scopes: ["global", "company"], requiresMfa: false },
  { name: "ap.approvals.approve", category: "ap", description: "Approve invoices at the appropriate level", scopes: ["global", "company"], requiresMfa: true },
  { name: "ap.approvals.reject", category: "ap", description: "Reject invoice approvals", scopes: ["global", "company"], requiresMfa: true },
  { name: "ap.approvals.delegate", category: "ap", description: "Delegate approval authority to another user", scopes: ["global", "company"], requiresMfa: true },
  { name: "ap.approvals.escalate", category: "ap", description: "Escalate approvals to higher authority levels", scopes: ["global", "company"], requiresMfa: false },
  // ── AP: Payments ───────────────────────────────────────────────────────────
  { name: "ap.payments.view", category: "ap", description: "View payment proposals, batches, and payment status", scopes: ["global", "company"], requiresMfa: false },
  { name: "ap.payments.create", category: "ap", description: "Generate payment proposals and create payment batches", scopes: ["global", "company"], requiresMfa: false },
  { name: "ap.payments.execute", category: "ap", description: "Execute and confirm payments", scopes: ["global", "company"], requiresMfa: true },
  { name: "ap.payments.approve", category: "ap", description: "Approve or reject payment proposals", scopes: ["global", "company"], requiresMfa: true },
  { name: "ap.payments.reverse", category: "ap", description: "Reverse completed payments", scopes: ["global", "company"], requiresMfa: true },
  // ── AP: Reconciliation ─────────────────────────────────────────────────────
  { name: "ap.reconciliation.view", category: "ap", description: "View vendor reconciliation records and results", scopes: ["global", "company"], requiresMfa: false },
  { name: "ap.reconciliation.execute", category: "ap", description: "Import vendor statements and run reconciliation", scopes: ["global", "company"], requiresMfa: false },
  { name: "ap.reconciliation.adjust", category: "ap", description: "Create reconciliation adjustments", scopes: ["global", "company"], requiresMfa: false },
  // ── AP: Credits ────────────────────────────────────────────────────────────
  { name: "ap.credits.view", category: "ap", description: "View vendor credit notes", scopes: ["global", "company"], requiresMfa: false },
  { name: "ap.credits.create", category: "ap", description: "Receive and record vendor credit notes", scopes: ["global", "company"], requiresMfa: false },
  { name: "ap.credits.apply", category: "ap", description: "Apply credit notes to invoices", scopes: ["global", "company"], requiresMfa: false },
  { name: "ap.credits.void", category: "ap", description: "Void vendor credit notes", scopes: ["global", "company"], requiresMfa: true },
  // ── AP: Reports & Admin ────────────────────────────────────────────────────
  { name: "ap.reports.view", category: "ap", description: "View AP reports, dashboards, and analytics", scopes: ["global", "company"], requiresMfa: false },
  { name: "ap.reports.export", category: "ap", description: "Export AP reports to CSV or Excel", scopes: ["global", "company"], requiresMfa: false },
  { name: "ap.admin.manage", category: "ap", description: "Configure AP tolerance rules, approval matrix, and system settings", scopes: ["global", "company"], requiresMfa: true },
];

const PERMISSION_MAP = new Map<GranularPermission, PermissionMeta>(
  PERMISSION_DEFINITIONS.map((p) => [p.name, p]),
);

export class PermissionRegistry {
  static getAll(): PermissionMeta[] {
    return PERMISSION_DEFINITIONS;
  }

  static get(permission: GranularPermission): PermissionMeta | undefined {
    return PERMISSION_MAP.get(permission);
  }

  static getByCategory(category: PermissionCategory): PermissionMeta[] {
    return PERMISSION_DEFINITIONS.filter((p) => p.category === category);
  }

  static requiresMfa(permission: GranularPermission): boolean {
    return PERMISSION_MAP.get(permission)?.requiresMfa ?? true;
  }

  static validate(permission: string): permission is GranularPermission {
    return PERMISSION_MAP.has(permission as GranularPermission);
  }

  static getAllNames(): GranularPermission[] {
    return Array.from(PERMISSION_MAP.keys());
  }

  static getCategories(): PermissionCategory[] {
    const cats = new Set(PERMISSION_DEFINITIONS.map((p) => p.category));
    return Array.from(cats);
  }
}

export function can(
  userPermissions: Set<string>,
  permission: GranularPermission,
  scope?: string,
): boolean {
  if (userPermissions.has(permission)) return true;
  if (scope && userPermissions.has(`${permission}@${scope}`)) return true;
  return false;
}

export function requirePermissions(
  userPermissions: Set<string>,
  permissions: GranularPermission[],
  mode: "all" | "any" = "all",
  scope?: string,
): boolean {
  if (mode === "all") {
    return permissions.every((p) => can(userPermissions, p, scope));
  }
  return permissions.some((p) => can(userPermissions, p, scope));
}

export type { PermissionMeta };
