export interface LockOptions {
  ttlMs: number;
  retryCount?: number;
  retryDelayMs?: number;
  autoRelease?: boolean;
  leaseRenewalIntervalMs?: number;
  owner?: string;
  scope?: string;
}

export interface LockResult {
  acquired: boolean;
  lockId?: string;
  expiresAt?: number;
  owner?: string;
  retryCount?: number;
}

export interface ILock {
  readonly name: string;
  readonly lockId: string;
  readonly owner: string;
  readonly expiresAt: number;
  readonly acquired: boolean;

  release(): Promise<void>;
  renew(ttlMs?: number): Promise<boolean>;
  isExpired(): boolean;
  isOwnedBy(owner: string): boolean;
}

export interface ILockManager {
  acquire(name: string, options?: LockOptions): Promise<ILock>;
  release(lock: ILock): Promise<void>;
  isLocked(name: string): Promise<boolean>;
  getOwner(name: string): Promise<string | null>;
  getRemainingTtl(name: string): Promise<number>;
  forceRelease(name: string): Promise<void>;
  acquireHierarchical(
    hierarchy: string[],
    options?: LockOptions,
  ): Promise<ILock[]>;
  acquireScoped(
    scope: string,
    name: string,
    options?: LockOptions,
  ): Promise<ILock>;
}

export interface DeadlockDetectionResult {
  name: string;
  owner: string;
  acquiredAt: Date;
  exceededTimeout: boolean;
  retryCount: number;
}
