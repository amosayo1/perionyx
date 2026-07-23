import type { Entity } from "../domain/persistence-types";
import type { IRepository } from "../domain/repository";
import { RepositoryNotFoundError } from "../domain/persistence-errors";

export class RepositoryRegistry {
  private static instance: RepositoryRegistry;
  private readonly repositories = new Map<string, IRepository<Entity>>();

  private constructor() {}

  static getInstance(): RepositoryRegistry {
    if (!RepositoryRegistry.instance) {
      RepositoryRegistry.instance = new RepositoryRegistry();
    }
    return RepositoryRegistry.instance;
  }

  register<T extends Entity<TId>, TId = string>(
    name: string,
    repository: IRepository<T, TId>,
  ): void {
    this.repositories.set(name, repository as IRepository<Entity>);
  }

  resolve<T extends Entity<TId>, TId = string>(
    name: string,
  ): IRepository<T, TId> {
    const repository = this.repositories.get(name);
    if (!repository) {
      throw new RepositoryNotFoundError(name);
    }
    return repository as IRepository<T, TId>;
  }

  has(name: string): boolean {
    return this.repositories.has(name);
  }

  getAll(): Map<string, IRepository<Entity>> {
    return new Map(this.repositories);
  }

  getNames(): string[] {
    return [...this.repositories.keys()];
  }

  count(): number {
    return this.repositories.size;
  }

  unregister(name: string): boolean {
    return this.repositories.delete(name);
  }

  clear(): void {
    this.repositories.clear();
  }
}

const registry = RepositoryRegistry.getInstance();

export function registerRepository<T extends Entity<TId>, TId = string>(
  name: string,
  repository: IRepository<T, TId>,
): void {
  registry.register(name, repository);
}

export function resolveRepository<T extends Entity<TId>, TId = string>(
  name: string,
): IRepository<T, TId> {
  return registry.resolve(name);
}
