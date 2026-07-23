export class PersistenceError extends Error {
  public readonly code: string;
  public readonly detail?: string;

  constructor(message: string, code = "PERSISTENCE_ERROR", detail?: string) {
    super(message);
    this.name = "PersistenceError";
    this.code = code;
    this.detail = detail;
  }
}

export class RepositoryError extends PersistenceError {
  public readonly repositoryName: string;

  constructor(repositoryName: string, message: string, detail?: string) {
    super(`[${repositoryName}] ${message}`, "REPOSITORY_ERROR", detail);
    this.name = "RepositoryError";
    this.repositoryName = repositoryName;
  }
}

export class TransactionError extends PersistenceError {
  public readonly transactionId?: string;

  constructor(message: string, transactionId?: string, detail?: string) {
    super(message, "TRANSACTION_ERROR", detail);
    this.name = "TransactionError";
    this.transactionId = transactionId;
  }
}

export class ConcurrencyError extends TransactionError {
  public readonly entityId: string;
  public readonly expectedVersion: number;
  public readonly actualVersion: number;

  constructor(
    entityId: string,
    expectedVersion: number,
    actualVersion: number,
    message?: string,
  ) {
    super(
      message ?? `Concurrency conflict for entity ${entityId}: expected version ${expectedVersion}, actual ${actualVersion}`,
      undefined,
      `Entity ${entityId} version mismatch: expected ${expectedVersion}, got ${actualVersion}`,
    );
    this.name = "ConcurrencyError";
    this.entityId = entityId;
    this.expectedVersion = expectedVersion;
    this.actualVersion = actualVersion;
  }
}

export class MigrationError extends PersistenceError {
  public readonly migrationName?: string;

  constructor(message: string, migrationName?: string, detail?: string) {
    super(message, "MIGRATION_ERROR", detail);
    this.name = "MigrationError";
    this.migrationName = migrationName;
  }
}

export class ValidationError extends PersistenceError {
  public readonly field?: string;

  constructor(message: string, field?: string, detail?: string) {
    super(message, "VALIDATION_ERROR", detail);
    this.name = "ValidationError";
    this.field = field;
  }
}

export class VersionMismatchError extends PersistenceError {
  public readonly currentVersion: string;
  public readonly requiredVersion: string;

  constructor(
    currentVersion: string,
    requiredVersion: string,
    message?: string,
  ) {
    super(
      message ?? `Version mismatch: current ${currentVersion}, required ${requiredVersion}`,
      "VERSION_MISMATCH",
    );
    this.name = "VersionMismatchError";
    this.currentVersion = currentVersion;
    this.requiredVersion = requiredVersion;
  }
}

export class RepositoryNotFoundError extends PersistenceError {
  public readonly repositoryName: string;

  constructor(repositoryName: string) {
    super(`Repository not found: ${repositoryName}`, "REPOSITORY_NOT_FOUND");
    this.name = "RepositoryNotFoundError";
    this.repositoryName = repositoryName;
  }
}

export class DuplicateEntityError extends PersistenceError {
  public readonly entityId: string;

  constructor(entityId: string, entityType?: string) {
    super(
      `Duplicate entity${entityType ? ` of type ${entityType}` : ""}: ${entityId}`,
      "DUPLICATE_ENTITY",
    );
    this.name = "DuplicateEntityError";
    this.entityId = entityId;
  }
}

export class EntityNotFoundError extends PersistenceError {
  public readonly entityId: string;

  constructor(entityId: string, entityType?: string) {
    super(
      `Entity not found${entityType ? ` of type ${entityType}` : ""}: ${entityId}`,
      "ENTITY_NOT_FOUND",
    );
    this.name = "EntityNotFoundError";
    this.entityId = entityId;
  }
}
