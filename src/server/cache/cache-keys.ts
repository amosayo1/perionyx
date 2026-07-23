import { getCacheConfig } from "./cache-config";

export interface CacheKeyOptions {
  namespace?: string;
  tags?: string[];
  version?: number;
}

export class CacheKeyBuilder {
  private constructor() {}

  static entity(entityType: string, id: string): string {
    return CacheKeyBuilder.build(`entity:${entityType}:${id}`);
  }

  static repository(name: string, method: string, args: string): string {
    return CacheKeyBuilder.build(`repo:${name}:${method}:${args}`);
  }

  static query(repository: string, hash: string): string {
    return CacheKeyBuilder.build(`query:${repository}:${hash}`);
  }

  static aggregation(name: string, params: string): string {
    return CacheKeyBuilder.build(`agg:${name}:${params}`);
  }

  static dashboard(name: string, companyId: string): string {
    return CacheKeyBuilder.build(`dash:${name}:${companyId}`);
  }

  static metrics(name: string, period: string): string {
    return CacheKeyBuilder.build(`metrics:${name}:${period}`);
  }

  static forecast(companyId: string, currency: string): string {
    return CacheKeyBuilder.build(`forecast:${companyId}:${currency}`);
  }

  static permission(companyId: string, userId: string): string {
    return CacheKeyBuilder.build(`perm:${companyId}:${userId}`);
  }

  static configuration(key: string): string {
    return CacheKeyBuilder.build(`config:${key}`);
  }

  static session(sessionId: string): string {
    return CacheKeyBuilder.build(`session:${sessionId}`);
  }

  static lock(name: string): string {
    return CacheKeyBuilder.build(`lock:${name}`);
  }

  static queue(name: string): string {
    return CacheKeyBuilder.build(`queue:${name}`);
  }

  static build(key: string, options?: CacheKeyOptions): string {
    const config = getCacheConfig();
    const ns = options?.namespace ?? config.namespace;
    const version = options?.version ?? 1;
    const fullKey = `${ns}:v${version}:${key}`;
    if (fullKey.length > config.maxKeyLength) {
      return fullKey.slice(0, config.maxKeyLength);
    }
    return fullKey;
  }

  static tagKey(tag: string): string {
    return CacheKeyBuilder.build(`tag:${tag}`);
  }

  static tagPattern(tag: string): string {
    return `${getCacheConfig().namespace}:v*:${tag}:*`;
  }

  static pattern(prefix: string): string {
    return `${getCacheConfig().namespace}:v*:${prefix}*`;
  }
}
