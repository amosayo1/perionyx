import type { Entity } from "../domain/persistence-types";
import type { IRepository } from "../domain/repository";
import type { Filter } from "../domain/filters";
import type { SortCriteria } from "../domain/sorting";
import type { PaginationRequest, PaginationResult } from "../domain/pagination";
import type {
  CreateEntity,
  UpdateEntity,
} from "../domain/persistence-types";
import type {
  Projection,
  AggregateQuery,
  AggregateResult,
  SearchQuery,
} from "../domain/repository";
import {
  RepositoryError,
  EntityNotFoundError,
  DuplicateEntityError,
} from "../domain/persistence-errors";

export abstract class BaseRepository<T extends Entity<TId>, TId = string>
  implements IRepository<T, TId>
{
  public abstract readonly name: string;

  abstract create(data: CreateEntity<T>): Promise<T>;
  abstract createMany(data: CreateEntity<T>[]): Promise<T[]>;

  abstract update(id: TId, data: UpdateEntity<T>): Promise<T>;
  abstract updateMany(filter: Filter, data: UpdateEntity<T>): Promise<number>;

  abstract delete(id: TId): Promise<boolean>;
  abstract deleteMany(filter: Filter): Promise<number>;

  abstract softDelete(id: TId): Promise<T>;
  abstract restore(id: TId): Promise<T>;

  abstract findById(id: TId): Promise<T | null>;
  abstract findOne(filter: Filter): Promise<T | null>;

  abstract findMany(
    filter?: Filter,
    sort?: SortCriteria,
    pagination?: PaginationRequest,
    projection?: Projection,
  ): Promise<T[]>;

  abstract exists(filter: Filter): Promise<boolean>;
  abstract count(filter?: Filter): Promise<number>;

  abstract paginate(
    pagination: PaginationRequest,
    filter?: Filter,
    sort?: SortCriteria,
    projection?: Projection,
  ): Promise<PaginationResult<T>>;

  abstract query(
    filter: Filter,
    sort?: SortCriteria,
    pagination?: PaginationRequest,
    projection?: Projection,
  ): Promise<PaginationResult<T>>;

  abstract aggregate(query: AggregateQuery): Promise<AggregateResult[]>;

  abstract batchInsert(
    data: CreateEntity<T>[],
    batchSize?: number,
  ): Promise<T[]>;

  abstract batchUpdate(
    updates: { id: TId; data: UpdateEntity<T> }[],
    batchSize?: number,
  ): Promise<T[]>;

  abstract batchDelete(ids: TId[], batchSize?: number): Promise<number>;

  abstract search(query: SearchQuery): Promise<PaginationResult<T>>;

  protected throwIfNotFound(id: TId, entity?: T | null): asserts entity is T {
    if (!entity) {
      throw new EntityNotFoundError(String(id), this.name);
    }
  }

  protected throwIfDuplicate(id: TId, entity?: T | null): void {
    if (entity) {
      throw new DuplicateEntityError(String(id), this.name);
    }
  }

  protected throwRepositoryError(
    operation: string,
    detail?: string,
  ): never {
    throw new RepositoryError(
      this.name,
      `Failed to ${operation}`,
      detail,
    );
  }
}
