import type { Entity } from "../domain/persistence-types";
import type { PersistenceConfig, PersistenceProvider } from "../domain/persistence-types";
import type { IRepository } from "../domain/repository";
import type { RepositoryAdapter } from "../repositories/generic-repository";
import { GenericRepository } from "../repositories/generic-repository";
import { MemoryRepositoryAdapter } from "../adapters/memory/memory-repository";
import { PostgresRepositoryAdapter } from "../adapters/postgres/postgres-repository";
import { MySQLRepositoryAdapter } from "../adapters/mysql/mysql-repository";
import { SQLiteRepositoryAdapter } from "../adapters/sqlite/sqlite-repository";
import { RepositoryError } from "../domain/persistence-errors";

export class RepositoryFactory {
  private static config: PersistenceConfig = { provider: "memory" };

  static configure(config: PersistenceConfig): void {
    RepositoryFactory.config = config;
  }

  static getConfig(): PersistenceConfig {
    return { ...RepositoryFactory.config };
  }

  static getProvider(): PersistenceProvider {
    return RepositoryFactory.config.provider;
  }

  static create<T extends Entity<TId>, TId = string>(
    name: string,
  ): IRepository<T, TId> {
    const adapter = RepositoryFactory.createAdapter<T, TId>();
    return new GenericRepository<T, TId>(name, adapter);
  }

  static createAdapter<T extends Entity<TId>, TId = string>(): RepositoryAdapter<T, TId> {
    const provider = RepositoryFactory.config.provider;
    switch (provider) {
      case "memory":
        return new MemoryRepositoryAdapter<T, TId>();
      case "postgres":
        return new PostgresRepositoryAdapter<T, TId>(
          RepositoryFactory.config.connection,
        );
      case "mysql":
        return new MySQLRepositoryAdapter<T, TId>(
          RepositoryFactory.config.connection,
        );
      case "sqlite":
        return new SQLiteRepositoryAdapter<T, TId>(
          RepositoryFactory.config.connection,
        );
      default: {
        const exhaustive: never = provider;
        throw new RepositoryError(
          "RepositoryFactory",
          `Unknown provider: ${exhaustive}`,
        );
      }
    }
  }

  static createWithAdapter<T extends Entity<TId>, TId = string>(
    name: string,
    adapter: RepositoryAdapter<T, TId>,
  ): IRepository<T, TId> {
    return new GenericRepository<T, TId>(name, adapter);
  }
}
