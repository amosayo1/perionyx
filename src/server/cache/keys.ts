// ---------------------------------------------------------------------------
// Enterprise Cache Key Standards
// ---------------------------------------------------------------------------
// Pattern: tenant:{tenantId}:{domain}:{subdomain}:{qualifier}
// Examples:
//   tenant:acme:dashboard:metrics:summary
//   tenant:acme:analytics:treasury:kpis
//   tenant:acme:workflow:list:recent
//   tenant:acme:permissions:user:{userId}
//
// No collisions — each domain uses its own prefix.
// Tenant isolation — every key scoped to tenantId.
// Predictable naming — consistent hierarchy.

export function tenantKey(tenantId: string, ...parts: string[]): string {
  return `tenant:${tenantId}:${parts.join(":")}`;
}

export function globalKey(...parts: string[]): string {
  return `global:${parts.join(":")}`;
}

// ---------------------------------------------------------------------------
// Domain prefixes
// ---------------------------------------------------------------------------
export const CacheDomains = {
  DASHBOARD: "dashboard",
  ANALYTICS: "analytics",
  WORKFLOW: "workflow",
  APPROVAL: "approval",
  TREASURY: "treasury",
  NOTIFICATION: "notification",
  PERMISSION: "permission",
  USER: "user",
  AI: "ai",
  AUTOMATION: "automation",
  REPORT: "report",
  CUSTOMER_DISCOVERY: "customer-discovery",
  SETTINGS: "settings",
  AUDIT: "audit",
  READINESS: "readiness",
  METADATA: "metadata",
  CONNECTOR: "connector",
  FEATURE_FLAG: "feature-flag",
  CONFIG: "config",
  LOCK: "lock",
} as const;
