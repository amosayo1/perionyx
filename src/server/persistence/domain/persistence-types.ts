export type PersistenceProvider = "memory" | "postgres" | "mysql" | "sqlite";

export interface PersistenceConfig {
  provider: PersistenceProvider;
  connection?: Record<string, unknown>;
  pool?: {
    min?: number;
    max?: number;
    idleTimeoutMs?: number;
  };
  retry?: {
    maxAttempts?: number;
    baseDelayMs?: number;
    maxDelayMs?: number;
  };
}

export interface Entity<TId = string> {
  id: TId;
  createdAt: Date;
  updatedAt: Date;
}

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends Record<string, unknown>
    ? DeepPartial<T[P]>
    : T[P];
};

export type Mutable<T> = {
  -readonly [P in keyof T]: T[P];
};

export type OmitEntity<T> = Omit<T, "id" | "createdAt" | "updatedAt">;

export type CreateEntity<T> = OmitEntity<T>;

export type UpdateEntity<T> = DeepPartial<CreateEntity<T>>;

export interface VersionedEntity<TId = string> extends Entity<TId> {
  version: number;
}
