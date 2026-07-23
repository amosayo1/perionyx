import type { Entity, CreateEntity, UpdateEntity } from "../../domain/persistence-types";
import type { Filter } from "../../domain/filters";
import type { SortCriteria } from "../../domain/sorting";
import type { PaginationRequest, PaginationResult } from "../../domain/pagination";
import type { Projection, AggregateQuery, AggregateResult, SearchQuery } from "../../domain/repository";
import type { RepositoryAdapter } from "../../repositories/generic-repository";
import { RepositoryError } from "../../domain/persistence-errors";

export class MySQLRepositoryAdapter<T extends Entity<TId>, TId = string>
  implements RepositoryAdapter<T, TId>
{
  constructor(private readonly connection: unknown) {}

  get name(): string {
    return "mysql";
  }

  create(_data: CreateEntity<T>): Promise<T> {
    throw new RepositoryError(this.name, "MySQL adapter not implemented");
  }

  createMany(_data: CreateEntity<T>[]): Promise<T[]> {
    throw new RepositoryError(this.name, "MySQL adapter not implemented");
  }

  update(_id: TId, _data: UpdateEntity<T>): Promise<T> {
    throw new RepositoryError(this.name, "MySQL adapter not implemented");
  }

  updateMany(_filter: Filter, _data: UpdateEntity<T>): Promise<number> {
    throw new RepositoryError(this.name, "MySQL adapter not implemented");
  }

  delete(_id: TId): Promise<boolean> {
    throw new RepositoryError(this.name, "MySQL adapter not implemented");
  }

  deleteMany(_filter: Filter): Promise<number> {
    throw new RepositoryError(this.name, "MySQL adapter not implemented");
  }

  softDelete(_id: TId): Promise<T> {
    throw new RepositoryError(this.name, "MySQL adapter not implemented");
  }

  restore(_id: TId): Promise<T> {
    throw new RepositoryError(this.name, "MySQL adapter not implemented");
  }

  findById(_id: TId): Promise<T | null> {
    throw new RepositoryError(this.name, "MySQL adapter not implemented");
  }

  findOne(_filter: Filter): Promise<T | null> {
    throw new RepositoryError(this.name, "MySQL adapter not implemented");
  }

  findMany(_filter?: Filter, _sort?: SortCriteria, _pagination?: PaginationRequest, _projection?: Projection): Promise<T[]> {
    throw new RepositoryError(this.name, "MySQL adapter not implemented");
  }

  exists(_filter: Filter): Promise<boolean> {
    throw new RepositoryError(this.name, "MySQL adapter not implemented");
  }

  count(_filter?: Filter): Promise<number> {
    throw new RepositoryError(this.name, "MySQL adapter not implemented");
  }

  paginate(_pagination: PaginationRequest, _filter?: Filter, _sort?: SortCriteria, _projection?: Projection): Promise<PaginationResult<T>> {
    throw new RepositoryError(this.name, "MySQL adapter not implemented");
  }

  query(_filter: Filter, _sort?: SortCriteria, _pagination?: PaginationRequest, _projection?: Projection): Promise<PaginationResult<T>> {
    throw new RepositoryError(this.name, "MySQL adapter not implemented");
  }

  aggregate(_query: AggregateQuery): Promise<AggregateResult[]> {
    throw new RepositoryError(this.name, "MySQL adapter not implemented");
  }

  batchInsert(_data: CreateEntity<T>[], _batchSize?: number): Promise<T[]> {
    throw new RepositoryError(this.name, "MySQL adapter not implemented");
  }

  batchUpdate(_updates: { id: TId; data: UpdateEntity<T> }[], _batchSize?: number): Promise<T[]> {
    throw new RepositoryError(this.name, "MySQL adapter not implemented");
  }

  batchDelete(_ids: TId[], _batchSize?: number): Promise<number> {
    throw new RepositoryError(this.name, "MySQL adapter not implemented");
  }

  search(_query: SearchQuery): Promise<PaginationResult<T>> {
    throw new RepositoryError(this.name, "MySQL adapter not implemented");
  }
}
