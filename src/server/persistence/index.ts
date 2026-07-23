export {
  PersistenceError,
  RepositoryError,
  TransactionError,
  ConcurrencyError,
  MigrationError,
  ValidationError,
  VersionMismatchError,
  RepositoryNotFoundError,
  DuplicateEntityError,
  EntityNotFoundError,
} from "./domain/persistence-errors";

export type {
  PersistenceConfig,
  PersistenceProvider,
  Entity,
  DeepPartial,
  Mutable,
  OmitEntity,
  CreateEntity,
  UpdateEntity,
  VersionedEntity,
} from "./domain/persistence-types";

export type {
  IRepository,
  Projection,
  GroupBy,
  Aggregation,
  AggregateQuery,
  AggregateResult,
  SearchQuery,
} from "./domain/repository";

export type {
  ITransaction,
  TransactionMetadata,
  Savepoint,
  ITransactionManager,
} from "./domain/transaction";

export {
  TransactionStatus,
} from "./domain/transaction";

export type {
  Filter,
  FieldFilter,
  LogicalFilter,
  FilterGroup,
} from "./domain/filters";

export {
  FilterOperator,
  isFieldFilter,
  isLogicalFilter,
  and,
  or,
  eq,
  neq,
  gt,
  gte,
  lt,
  lte,
  between,
  contains,
  startsWith,
  endsWith,
  inList,
  notIn,
  isNull,
  isNotNull,
} from "./domain/filters";

export type {
  SortField,
  SortCriteria,
} from "./domain/sorting";

export {
  SortDirection,
  asc,
  desc,
  by,
} from "./domain/sorting";

export type {
  PaginationRequest,
  OffsetPaginationRequest,
  CursorPaginationRequest,
  PaginationResult,
  OffsetPaginationResult,
  CursorPaginationResult,
  PageMetadata,
  CursorPageMetadata,
} from "./domain/pagination";

export {
  offsetPagination,
  cursorPagination,
} from "./domain/pagination";

export { BaseRepository } from "./repositories/base-repository";
export type { RepositoryAdapter } from "./repositories/generic-repository";
export { GenericRepository } from "./repositories/generic-repository";

export { MemoryRepositoryAdapter } from "./adapters/memory/memory-repository";
export { MemoryTransaction } from "./adapters/memory/memory-transaction";

export { PostgresRepositoryAdapter } from "./adapters/postgres/postgres-repository";
export { PostgresTransaction } from "./adapters/postgres/postgres-transaction";

export { MySQLRepositoryAdapter } from "./adapters/mysql/mysql-repository";
export { MySQLTransaction } from "./adapters/mysql/mysql-transaction";

export { SQLiteRepositoryAdapter } from "./adapters/sqlite/sqlite-repository";
export { SQLiteTransaction } from "./adapters/sqlite/sqlite-transaction";

export {
  RepositoryRegistry,
  registerRepository,
  resolveRepository,
} from "./registry/repository-registry";

export { RepositoryFactory } from "./registry/repository-factory";

export type { IUnitOfWork } from "./unit-of-work/unit-of-work";
export { UnitOfWork } from "./unit-of-work/unit-of-work";

export type {
  ConcurrencyConfig,
  DeadlockConfig,
  RetryPolicy,
  TransactionManagerConfig,
} from "./unit-of-work/transaction-manager";

export { TransactionManager } from "./unit-of-work/transaction-manager";

export type {
  MigrationVersion,
  MigrationDependency,
  MigrationDefinition,
} from "./migrations/migration";

export { Migration } from "./migrations/migration";
export type { MigrationDirection } from "./migrations/migration";

export type {
  MigrationRecord,
  MigrationHistoryEntry,
  IMigrationHistory,
} from "./migrations/migration-history";

export {
  MigrationStatus,
  MigrationHistory,
} from "./migrations/migration-history";

export type { MigrationEngineConfig } from "./migrations/migration-engine";
export { MigrationEngine } from "./migrations/migration-engine";

export type {
  MigrationRunnerConfig,
  MigrationResult,
} from "./migrations/migration-runner";

export { MigrationRunner } from "./migrations/migration-runner";

export type { SchemaVersionConfig } from "./versioning/schema-version";

export {
  SchemaVersion,
  SchemaVersionManager,
} from "./versioning/schema-version";

export type {
  CompatibilityResult,
  CompatibilityIssue,
  CompatibilityMatrix,
} from "./versioning/compatibility";

export {
  CompatibilityChecker,
  checkCompatibility,
} from "./versioning/compatibility";

export type {
  RepositoryHealth,
  TransactionHealth,
  MigrationHealth,
  PersistenceHealthReport,
} from "./health/persistence-health";

export {
  PersistenceHealthMonitor,
  persistenceHealth,
} from "./health/persistence-health";

export type {
  RepositoryStatistics,
  PerformanceSummary,
  MigrationSummary,
  HealthSummary,
  PersistenceDiagnosticsReport,
  DiagnosticsCollectorOptions,
} from "./diagnostics/persistence-diagnostics";

export { PersistenceDiagnostics } from "./diagnostics/persistence-diagnostics";
