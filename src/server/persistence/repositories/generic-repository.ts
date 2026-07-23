import type { Entity, CreateEntity, UpdateEntity } from "../domain/persistence-types";
import type { Filter } from "../domain/filters";
import type { SortCriteria } from "../domain/sorting";
import type { PaginationRequest, PaginationResult } from "../domain/pagination";
import type { Projection, AggregateQuery, AggregateResult, SearchQuery } from "../domain/repository";
import { BaseRepository } from "./base-repository";

export interface RepositoryAdapter<T extends Entity<TId>, TId = string> {
  create(data: CreateEntity<T>): Promise<T>;
  createMany(data: CreateEntity<T>[]): Promise<T[]>;
  update(id: TId, data: UpdateEntity<T>): Promise<T>;
  updateMany(filter: Filter, data: UpdateEntity<T>): Promise<number>;
  delete(id: TId): Promise<boolean>;
  deleteMany(filter: Filter): Promise<number>;
  softDelete(id: TId): Promise<T>;
  restore(id: TId): Promise<T>;
  findById(id: TId): Promise<T | null>;
  findOne(filter: Filter): Promise<T | null>;
  findMany(filter?: Filter, sort?: SortCriteria, pagination?: PaginationRequest, projection?: Projection): Promise<T[]>;
  exists(filter: Filter): Promise<boolean>;
  count(filter?: Filter): Promise<number>;
  paginate(pagination: PaginationRequest, filter?: Filter, sort?: SortCriteria, projection?: Projection): Promise<PaginationResult<T>>;
  query(filter: Filter, sort?: SortCriteria, pagination?: PaginationRequest, projection?: Projection): Promise<PaginationResult<T>>;
  aggregate(query: AggregateQuery): Promise<AggregateResult[]>;
  batchInsert(data: CreateEntity<T>[], batchSize?: number): Promise<T[]>;
  batchUpdate(updates: { id: TId; data: UpdateEntity<T> }[], batchSize?: number): Promise<T[]>;
  batchDelete(ids: TId[], batchSize?: number): Promise<number>;
  search(query: SearchQuery): Promise<PaginationResult<T>>;
}

export class GenericRepository<T extends Entity<TId>, TId = string>
  extends BaseRepository<T, TId>
{
  public readonly name: string;

  constructor(
    name: string,
    private readonly adapter: RepositoryAdapter<T, TId>,
  ) {
    super();
    this.name = name;
  }

  create(data: CreateEntity<T>): Promise<T> {
    return this.adapter.create(data);
  }

  createMany(data: CreateEntity<T>[]): Promise<T[]> {
    return this.adapter.createMany(data);
  }

  update(id: TId, data: UpdateEntity<T>): Promise<T> {
    return this.adapter.update(id, data);
  }

  updateMany(filter: Filter, data: UpdateEntity<T>): Promise<number> {
    return this.adapter.updateMany(filter, data);
  }

  delete(id: TId): Promise<boolean> {
    return this.adapter.delete(id);
  }

  deleteMany(filter: Filter): Promise<number> {
    return this.adapter.deleteMany(filter);
  }

  softDelete(id: TId): Promise<T> {
    return this.adapter.softDelete(id);
  }

  restore(id: TId): Promise<T> {
    return this.adapter.restore(id);
  }

  findById(id: TId): Promise<T | null> {
    return this.adapter.findById(id);
  }

  findOne(filter: Filter): Promise<T | null> {
    return this.adapter.findOne(filter);
  }

  findMany(
    filter?: Filter,
    sort?: SortCriteria,
    pagination?: PaginationRequest,
    projection?: Projection,
  ): Promise<T[]> {
    return this.adapter.findMany(filter, sort, pagination, projection);
  }

  exists(filter: Filter): Promise<boolean> {
    return this.adapter.exists(filter);
  }

  count(filter?: Filter): Promise<number> {
    return this.adapter.count(filter);
  }

  paginate(
    pagination: PaginationRequest,
    filter?: Filter,
    sort?: SortCriteria,
    projection?: Projection,
  ): Promise<PaginationResult<T>> {
    return this.adapter.paginate(pagination, filter, sort, projection);
  }

  query(
    filter: Filter,
    sort?: SortCriteria,
    pagination?: PaginationRequest,
    projection?: Projection,
  ): Promise<PaginationResult<T>> {
    return this.adapter.query(filter, sort, pagination, projection);
  }

  aggregate(query: AggregateQuery): Promise<AggregateResult[]> {
    return this.adapter.aggregate(query);
  }

  batchInsert(data: CreateEntity<T>[], batchSize?: number): Promise<T[]> {
    return this.adapter.batchInsert(data, batchSize);
  }

  batchUpdate(
    updates: { id: TId; data: UpdateEntity<T> }[],
    batchSize?: number,
  ): Promise<T[]> {
    return this.adapter.batchUpdate(updates, batchSize);
  }

  batchDelete(ids: TId[], batchSize?: number): Promise<number> {
    return this.adapter.batchDelete(ids, batchSize);
  }

  search(query: SearchQuery): Promise<PaginationResult<T>> {
    return this.adapter.search(query);
  }
}
