import type { ILock, ILockManager, LockOptions } from "./types";
import { RedisDistributedLockManager } from "./redis-lock";
import type { DeadlockDetectionResult } from "./types";
import { DeadlockError } from "./lock-errors";

export class LockManager implements ILockManager {
  private delegate: ILockManager;

  constructor(delegate?: ILockManager) {
    this.delegate = delegate ?? new RedisDistributedLockManager();
  }

  acquire(name: string, options?: LockOptions): Promise<ILock> {
    return this.delegate.acquire(name, options);
  }

  release(lock: ILock): Promise<void> {
    return this.delegate.release(lock);
  }

  isLocked(name: string): Promise<boolean> {
    return this.delegate.isLocked(name);
  }

  getOwner(name: string): Promise<string | null> {
    return this.delegate.getOwner(name);
  }

  getRemainingTtl(name: string): Promise<number> {
    return this.delegate.getRemainingTtl(name);
  }

  forceRelease(name: string): Promise<void> {
    return this.delegate.forceRelease(name);
  }

  acquireHierarchical(
    hierarchy: string[],
    options?: LockOptions,
  ): Promise<ILock[]> {
    return this.delegate.acquireHierarchical(hierarchy, options);
  }

  acquireScoped(
    scope: string,
    name: string,
    options?: LockOptions,
  ): Promise<ILock> {
    return this.delegate.acquireScoped(scope, name, options);
  }

  async withLock<T>(
    name: string,
    fn: () => Promise<T>,
    options?: LockOptions,
  ): Promise<T> {
    const lock = await this.acquire(name, options);
    try {
      return await fn();
    } finally {
      await this.release(lock);
    }
  }

  async detectDeadlocks(): Promise<DeadlockDetectionResult[]> {
    return [];
  }
}

export const lockManager = new LockManager();
