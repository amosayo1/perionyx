/**
 * Canonical system actor ID used by background jobs and cron handlers that run
 * on behalf of the platform rather than a specific user.
 *
 * This is a sentinel: it must NEVER be persisted into a foreign-key column such
 * as AuditLog.actorUserId (no User row exists for it). `recordAudit()` maps it
 * to NULL to represent the platform/system actor. Prefer this constant over
 * inline literals.
 *
 * Keep this module dependency-free — it is imported by low-level modules
 * (e.g. audit.service.ts) as well as queue job modules.
 */
export const SYSTEM_ACTOR_ID = "00000000-0000-0000-0000-000000000000";
