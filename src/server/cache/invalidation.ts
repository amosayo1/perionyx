// ---------------------------------------------------------------------------
// Enterprise Cache Invalidation Strategies
// ---------------------------------------------------------------------------
// Every mutation must declare what cache keys it invalidates.
// Never allow stale financial truth.
//
// Mutation → Invalidation pattern:
//   Workflow updated  → invalidate workflow caches
//   Approval changed  → invalidate approval dashboard + notification caches
//   Tx posted        → invalidate treasury KPIs + dashboard
//   Settings changed → invalidate configuration cache
//   Analytics regen  → refresh analytics cache

import { invalidatePattern, invalidateKey } from "./cache-service";
import { CacheDomains, tenantKey, globalKey } from "./keys";
import { logger } from "@/lib/logger";

export interface InvalidationEvent {
  tenantId: string;
  domain: string;
  subdomain?: string;
  scope?: "tenant" | "global";
  qualifier?: string;
}

// ---------------------------------------------------------------------------
// Invalidation Actions — one per logical mutation category
// ---------------------------------------------------------------------------

/** Dashboard metrics changed (workflow completed, new approval, transaction) */
export async function invalidateDashboard(tenantId: string): Promise<void> {
  await invalidatePattern(tenantKey(tenantId, CacheDomains.DASHBOARD, "*"));
}

/** Analytics computed or data changed */
export async function invalidateAnalytics(tenantId: string): Promise<void> {
  await invalidatePattern(tenantKey(tenantId, CacheDomains.ANALYTICS, "*"));
}

/** Workflow CRUD */
export async function invalidateWorkflow(tenantId: string): Promise<void> {
  await invalidatePattern(tenantKey(tenantId, CacheDomains.WORKFLOW, "*"));
}

/** Approval changes — dashboard, notifications */
export async function invalidateApproval(tenantId: string): Promise<void> {
  await invalidatePattern(tenantKey(tenantId, CacheDomains.APPROVAL, "*"));
  await invalidatePattern(tenantKey(tenantId, CacheDomains.NOTIFICATION, "*"));
}

/** Treasury transaction posted */
export async function invalidateTreasury(tenantId: string): Promise<void> {
  await invalidatePattern(tenantKey(tenantId, CacheDomains.TREASURY, "*"));
  await invalidatePattern(tenantKey(tenantId, CacheDomains.DASHBOARD, "*"));
}

/** User/role/permission mutation */
export async function invalidatePermission(tenantId: string): Promise<void> {
  await invalidatePattern(tenantKey(tenantId, CacheDomains.PERMISSION, "*"));
}

/** AI model/provider changes */
export async function invalidateAi(tenantId: string): Promise<void> {
  await invalidatePattern(tenantKey(tenantId, CacheDomains.AI, "*"));
}

/** Automation Studio — rules, schedules, matrix */
export async function invalidateAutomation(tenantId: string): Promise<void> {
  await invalidatePattern(tenantKey(tenantId, CacheDomains.AUTOMATION, "*"));
}

/** Connector metadata changed */
export async function invalidateConnector(tenantId: string): Promise<void> {
  await invalidatePattern(tenantKey(tenantId, CacheDomains.CONNECTOR, "*"));
}

/** Organization structure changed */
export async function invalidateOrgHierarchy(tenantId: string): Promise<void> {
  await invalidatePattern(tenantKey(tenantId, CacheDomains.METADATA, "org", "*"));
}

/** Company/settings changed — permanent cache */
export async function invalidateConfig(tenantId: string): Promise<void> {
  await invalidateKey(tenantKey(tenantId, CacheDomains.CONFIG, "company"));
}

/** Feature flags changed — global permanent cache */
export async function invalidateFeatureFlags(): Promise<void> {
  await invalidateKey(globalKey(CacheDomains.FEATURE_FLAG));
}

/** Customer Discovery data changed */
export async function invalidateCustomerDiscovery(tenantId: string): Promise<void> {
  await invalidatePattern(tenantKey(tenantId, CacheDomains.CUSTOMER_DISCOVERY, "*"));
}

/** Analytics report regenerated */
export async function invalidateReports(tenantId: string): Promise<void> {
  await invalidatePattern(tenantKey(tenantId, CacheDomains.REPORT, "*"));
}

/** Readiness score recalculated */
export async function invalidateReadiness(tenantId: string): Promise<void> {
  await invalidatePattern(tenantKey(tenantId, CacheDomains.READINESS, "*"));
}

/** Notification caches when user reads them */
export async function invalidateNotifications(tenantId: string): Promise<void> {
  await invalidatePattern(tenantKey(tenantId, CacheDomains.NOTIFICATION, "*"));
}

/** Refresh metadata (currencies, countries, languages) — does not expire often */
export async function invalidateMetadata(tenantId?: string): Promise<void> {
  if (tenantId) {
    await invalidatePattern(tenantKey(tenantId, CacheDomains.METADATA, "*"));
  }
  await invalidatePattern(globalKey(CacheDomains.METADATA, "*"));
}

// ---------------------------------------------------------------------------
// Generic invalidation dispatcher
// ---------------------------------------------------------------------------
export async function handleInvalidationEvent(
  event: InvalidationEvent,
): Promise<void> {
  const { tenantId, domain, scope } = event;
  const pattern =
    scope === "global"
      ? globalKey(domain, "*")
      : tenantKey(tenantId, domain, "*");

  logger.info({ event, pattern }, "[Invalidation] Dispatching");

  try {
    await invalidatePattern(pattern);
  } catch (err) {
    logger.error(
      { err, event, pattern },
      "[Invalidation] Failed to invalidate",
    );
  }
}
