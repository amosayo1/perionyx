export interface PersistenceConfig {
  defaultProvider: "memory" | "postgres" | "mysql" | "sqlite";
  providers: {
    memory?: { enabled: boolean };
    postgres?: { url: string; poolMin: number; poolMax: number; ssl?: boolean };
    mysql?: { url: string; poolMin: number; poolMax: number };
    sqlite?: { path: string };
  };
  migrations: {
    enabled: boolean;
    directory: string;
    historyTable: string;
    autoRun: boolean;
  };
  health: {
    enabled: boolean;
    intervalMs: number;
  };
  metrics: {
    enabled: boolean;
    prefix: string;
  };
}

export interface CacheConfig {
  defaultTtlMs: number;
  maxSize: number;
  provider: "memory" | "redis";
  redis?: {
    host: string;
    port: number;
    password?: string;
    keyPrefix: string;
    maxRetries: number;
    retryDelayMs: number;
  };
  metrics: { enabled: boolean };
  health: { enabled: boolean };
}

export interface LockConfig {
  defaultTtlMs: number;
  defaultRetryCount: number;
  defaultRetryDelayMs: number;
  provider: "memory" | "redis";
  health: { enabled: boolean };
}

export interface QueueConfig {
  defaultConcurrency: number;
  defaultMaxRetries: number;
  defaultTimeoutMs: number;
  workerPollMs: number;
  metrics: { enabled: boolean };
  health: { enabled: boolean };
}

export interface InfrastructureConfig {
  persistence: PersistenceConfig;
  cache: CacheConfig;
  locks: LockConfig;
  queues: QueueConfig;
  observability: {
    metrics: { enabled: boolean };
    tracing: { enabled: boolean; maxTraces: number };
    health: { enabled: boolean; intervalMs: number };
  };
}

const defaultConfig: InfrastructureConfig = {
  persistence: {
    defaultProvider: "memory",
    providers: {
      memory: { enabled: true },
      postgres: { url: "", poolMin: 2, poolMax: 10 },
      mysql: { url: "", poolMin: 2, poolMax: 10 },
      sqlite: { path: "./data/persistence.db" },
    },
    migrations: {
      enabled: false,
      directory: "./migrations",
      historyTable: "_migrations",
      autoRun: false,
    },
    health: { enabled: true, intervalMs: 30000 },
    metrics: { enabled: true, prefix: "persistence" },
  },
  cache: {
    defaultTtlMs: 60000,
    maxSize: 10000,
    provider: "memory",
    redis: {
      host: "localhost",
      port: 6379,
      keyPrefix: "cache:",
      maxRetries: 3,
      retryDelayMs: 200,
    },
    metrics: { enabled: true },
    health: { enabled: true },
  },
  locks: {
    defaultTtlMs: 30000,
    defaultRetryCount: 3,
    defaultRetryDelayMs: 200,
    provider: "memory",
    health: { enabled: true },
  },
  queues: {
    defaultConcurrency: 5,
    defaultMaxRetries: 3,
    defaultTimeoutMs: 120000,
    workerPollMs: 100,
    metrics: { enabled: true },
    health: { enabled: true },
  },
  observability: {
    metrics: { enabled: true },
    tracing: { enabled: true, maxTraces: 1000 },
    health: { enabled: true, intervalMs: 30000 },
  },
};

let configInstance: InfrastructureConfig = { ...defaultConfig };

export function getInfrastructureConfig(): InfrastructureConfig {
  return { ...configInstance };
}

export function updateInfrastructureConfig(
  partial: Partial<InfrastructureConfig>,
): InfrastructureConfig {
  configInstance = deepMerge(configInstance, partial);
  return getInfrastructureConfig();
}

export function resetInfrastructureConfig(): void {
  configInstance = { ...defaultConfig };
}

function deepMerge<T>(target: T, source: Partial<T>): T {
  const result = { ...target };
  for (const key of Object.keys(source as object)) {
    const k = key as keyof T;
    if (
      source[k] !== null &&
      typeof source[k] === "object" &&
      !Array.isArray(source[k]) &&
      typeof target[k] === "object" &&
      !Array.isArray(target[k])
    ) {
      result[k] = deepMerge(target[k] as any, source[k] as any);
    } else if (source[k] !== undefined) {
      result[k] = source[k] as T[keyof T];
    }
  }
  return result;
}

export function loadConfigFromEnv(): Partial<InfrastructureConfig> {
  const config: Partial<InfrastructureConfig> = {};
  if (process.env.CACHE_PROVIDER) {
    config.cache = { ...defaultConfig.cache, provider: process.env.CACHE_PROVIDER as "memory" | "redis" };
  }
  if (process.env.REDIS_HOST) {
    config.cache = {
      ...(config.cache ?? defaultConfig.cache),
      redis: {
        ...defaultConfig.cache.redis!,
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT ?? "6379", 10),
        password: process.env.REDIS_PASSWORD,
      },
    };
  }
  if (process.env.LOCK_PROVIDER) {
    config.locks = { ...defaultConfig.locks, provider: process.env.LOCK_PROVIDER as "memory" | "redis" };
  }
  if (process.env.PERSISTENCE_PROVIDER) {
    config.persistence = {
      ...defaultConfig.persistence,
      defaultProvider: process.env.PERSISTENCE_PROVIDER as any,
    };
  }
  return config;
}
