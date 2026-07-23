/**
 * P0-5: Session Validation Store
 *
 * Maintains an in-memory cache of recently-revoked user sessions.
 * When the DB is unreachable, the proxy uses this cache to reject
 * sessions that were revoked within the last 30 seconds.
 *
 * Design decisions (per P0_IMPLEMENTATION_PLAN.md):
 * - 30-second TTL handles brief DB outages while bounding staleness
 * - Cache only stores users whose tokenVersion was recently incremented
 * - On DB failure: if user is in cache → reject; if not in cache → allow (fail-open)
 * - On DB success: cache is not consulted (always use DB truth)
 */

const CACHE_TTL_MS = 30_000; // 30 seconds
const CLEANUP_INTERVAL_MS = 60_000; // evict every 60s

interface CacheEntry {
  expiresAt: number;
}

export class SessionValidationStore {
  private static instance: SessionValidationStore | null = null;
  private cache = new Map<string, CacheEntry>();
  private cleanupTimer: ReturnType<typeof setInterval> | null = null;

  static getInstance(): SessionValidationStore {
    if (!SessionValidationStore.instance) {
      SessionValidationStore.instance = new SessionValidationStore();
    }
    return SessionValidationStore.instance;
  }

  private constructor() {
    // Periodic cleanup to prevent memory growth
    this.cleanupTimer = setInterval(() => this.evictExpired(), CLEANUP_INTERVAL_MS);
  }

  /**
   * Record that a user's tokenVersion was incremented (password change,
   * account disable, manual revoke). Called from users.service.ts after
   * a successful tokenVersion increment.
   */
  recordRevocation(userId: string): void {
    this.cache.set(userId, {
      expiresAt: Date.now() + CACHE_TTL_MS,
    });
  }

  /**
   * Check if a user was recently revoked.
   *
   * Used by the proxy on DB failure: if `isRecentlyRevoked(userId)`
   * returns true, the session is rejected. Otherwise, fail-open.
   */
  isRecentlyRevoked(userId: string): boolean {
    const entry = this.cache.get(userId);
    if (!entry) return false;
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(userId);
      return false;
    }
    return true;
  }

  /**
   * Evict expired entries. Called opportunistically to prevent memory growth.
   */
  evictExpired(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Get cache size (for monitoring/logging).
   */
  get size(): number {
    return this.cache.size;
  }

  /**
   * Destroy the singleton (for testing).
   */
  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
    this.cache.clear();
    SessionValidationStore.instance = null;
  }
}

export const sessionValidationStore = SessionValidationStore.getInstance();
