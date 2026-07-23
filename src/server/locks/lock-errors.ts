export class LockError extends Error {
  public readonly lockName: string;

  constructor(lockName: string, message: string) {
    super(`[Lock:${lockName}] ${message}`);
    this.name = "LockError";
    this.lockName = lockName;
  }
}

export class DeadlockError extends LockError {
  constructor(lockName: string, message?: string) {
    super(lockName, message ?? `Deadlock detected for lock: ${lockName}`);
    this.name = "DeadlockError";
  }
}

export class LeaseExpiredError extends LockError {
  constructor(lockName: string) {
    super(lockName, `Lease expired for lock: ${lockName}`);
    this.name = "LeaseExpiredError";
  }
}

export class OwnershipError extends LockError {
  public readonly expectedOwner: string;
  public readonly actualOwner: string | null;

  constructor(lockName: string, expectedOwner: string, actualOwner: string | null) {
    super(
      lockName,
      `Ownership mismatch for lock ${lockName}: expected ${expectedOwner}, got ${actualOwner}`,
    );
    this.name = "OwnershipError";
    this.expectedOwner = expectedOwner;
    this.actualOwner = actualOwner;
  }
}
