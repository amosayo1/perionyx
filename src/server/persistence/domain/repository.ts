import type { Entity, CreateEntity, UpdateEntity } from "./persistence-types";
import type { Filter } from "./filters";
import type { SortCriteria } from "./sorting";
import type { PaginationRequest, PaginationResult } from "./pagination";

export interface Projection {
  fields?: string[];
}

export interface GroupBy {
  field: string;
  aggregations?: Aggregation[];
}

export interface Aggregation {
  type: "count" | "sum" | "avg" | "min" | "max";
  field?: string;
  alias?: string;
}

export interface AggregateQuery {
  groupBy?: GroupBy[];
  filters?: Filter[];
}

export interface AggregateResult {
  [key: string]: unknown;
}

export interface SearchQuery {
  query: string;
  fields: string[];
  filters?: Filter[];
  limit?: number;
  offset?: number;
}

export interface IRepository<T extends Entity<TId>, TId = string> {
  readonly name: string;

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

  findMany(
    filter?: Filter,
    sort?: SortCriteria,
    pagination?: PaginationRequest,
    projection?: Projection,
  ): Promise<T[]>;

  exists(filter: Filter): Promise<boolean>;

  count(filter?: Filter): Promise<number>;

  paginate(
    pagination: PaginationRequest,
    filter?: Filter,
    sort?: SortCriteria,
    projection?: Projection,
  ): Promise<PaginationResult<T>>;

  query(
    filter: Filter,
    sort?: SortCriteria,
    pagination?: PaginationRequest,
    projection?: Projection,
  ): Promise<PaginationResult<T>>;

  aggregate(query: AggregateQuery): Promise<AggregateResult[]>;

  batchInsert(data: CreateEntity<T>[], batchSize?: number): Promise<T[]>;
  batchUpdate(
    updates: { id: TId; data: UpdateEntity<T> }[],
    batchSize?: number,
  ): Promise<T[]>;
  batchDelete(ids: TId[], batchSize?: number): Promise<number>;

  search(query: SearchQuery): Promise<PaginationResult<T>>;
}
