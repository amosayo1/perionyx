import type { ILock, ILockManager, LockOptions, LockResult } from "./types";
import { LockError } from "./lock-errors";

interface LockEntry {
  lock: ILock;
  acquiredAt: Date;
  retryCount: number;
}

const STORE = new Map<string, LockEntry>();

function generateId(): string {
  return `lock_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

class LockImpl implements ILock {
  public readonly lockId: string;
  public readonly owner: string;
  public readonly expiresAt: number;
  public acquired: boolean;
  private renewalTimer?: ReturnType<typeof setInterval>;

  constructor(
    public readonly name: string,
    owner: string,
    ttlMs: number,
    private readonly onRelease: () => void,
  ) {
    this.lockId = generateId();
    this.owner = owner;
    this.expiresAt = Date.now() + ttlMs;
    this.acquired = true;
  }

  async release(): Promise<void> {
    if (!this.acquired) return;
    this.acquired = false;
    if (this.renewalTimer) clearInterval(this.renewalTimer);
    STORE.delete(this.name);
    this.onRelease();
  }

  async renew(ttlMs?: number): Promise<boolean> {
    if (!this.acquired) return false;
    const entry = STORE.get(this.name);
    if (!entry || entry.lock.lockId !== this.lockId) return false;
    const newExpiry = Date.now() + (ttlMs ?? 30000);
    (this as { expiresAt: number }).expiresAt = newExpiry;
    return true;
  }

  isExpired(): boolean {
    return Date.now() > this.expiresAt;
  }

  isOwnedBy(owner: string): boolean {
    return this.owner === owner;
  }
}

export class RedisDistributedLockManager implements ILockManager {
  private readonly locks = new Map<string, LockEntry>();

  async acquire(name: string, options?: LockOptions): Promise<ILock> {
    const ttlMs = options?.ttlMs ?? 30000;
    const retryCount = options?.retryCount ?? 3;
    const retryDelayMs = options?.retryDelayMs ?? 200;
    const owner = options?.owner ?? `default-${process.pid}`;

    for (let attempt = 0; attempt <= retryCount; attempt++) {
      if (this.locks.has(name)) {
        const existing = this.locks.get(name)!;
        if (existing.lock.isExpired()) {
          this.locks.delete(name);
          await existing.lock.release();
        } else {
          if (attempt < retryCount) {
            await this.sleep(retryDelayMs * Math.pow(2, attempt));
            continue;
          }
          throw new LockError(name, `Failed to acquire lock after ${retryCount} retries`);
        }
      }

      const lock = new LockImpl(name, owner, ttlMs, () => this.locks.delete(name));
      const entry: LockEntry = { lock, acquiredAt: new Date(), retryCount: attempt };

      if (options?.autoRelease ?? true) {
        setTimeout(() => {
          if (lock.acquired) lock.release();
        }, ttlMs + 100);
      }

      if (options?.leaseRenewalIntervalMs) {
        this.startRenewal(lock, options.leaseRenewalIntervalMs, ttlMs);
      }

      this.locks.set(name, entry);
      STORE.set(name, entry);
      return lock;
    }

    throw new LockError(name, "Lock acquisition failed");
  }

  async release(lock: ILock): Promise<void> {
    await lock.release();
  }

  async isLocked(name: string): Promise<boolean> {
    const entry = this.locks.get(name);
    if (!entry) return false;
    if (entry.lock.isExpired()) {
      this.locks.delete(name);
      return false;
    }
    return true;
  }

  async getOwner(name: string): Promise<string | null> {
    const entry = this.locks.get(name);
    if (!entry || entry.lock.isExpired()) return null;
    return entry.lock.owner;
  }

  async getRemainingTtl(name: string): Promise<number> {
    const entry = this.locks.get(name);
    if (!entry) return -2;
    return Math.max(0, entry.lock.expiresAt - Date.now());
  }

  async forceRelease(name: string): Promise<void> {
    const entry = this.locks.get(name);
    if (entry) {
      await entry.lock.release();
    }
  }

  async acquireHierarchical(
    hierarchy: string[],
    options?: LockOptions,
  ): Promise<ILock[]> {
    const acquired: ILock[] = [];
    try {
      for (const name of hierarchy) {
        const lock = await this.acquire(name, options);
        acquired.push(lock);
      }
      return acquired;
    } catch {
      for (const lock of acquired.reverse()) {
        await lock.release();
      }
      throw new LockError(
        hierarchy.join(" > "),
        "Failed to acquire hierarchical lock chain",
      );
    }
  }

  async acquireScoped(
    scope: string,
    name: string,
    options?: LockOptions,
  ): Promise<ILock> {
    return this.acquire(`${scope}:${name}`, options);
  }

  private startRenewal(
    lock: ILock,
    intervalMs: number,
    ttlMs: number,
  ): void {
    const timer = setInterval(async () => {
      if (!lock.acquired || lock.isExpired()) {
        clearInterval(timer);
        return;
      }
      await lock.renew(ttlMs);
    }, intervalMs);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
