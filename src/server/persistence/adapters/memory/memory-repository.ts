import type { Entity, CreateEntity, UpdateEntity } from "../../domain/persistence-types";
import type { Filter } from "../../domain/filters";
import type { SortCriteria } from "../../domain/sorting";
import type { PaginationRequest, PaginationResult } from "../../domain/pagination";
import type { Projection, AggregateQuery, AggregateResult, SearchQuery } from "../../domain/repository";
import { isFieldFilter, isLogicalFilter } from "../../domain/filters";
import { FilterOperator } from "../../domain/filters";
import { SortDirection } from "../../domain/sorting";
import { offsetPagination } from "../../domain/pagination";
import { EntityNotFoundError, DuplicateEntityError } from "../../domain/persistence-errors";
import type { RepositoryAdapter } from "../../repositories/generic-repository";

export class MemoryRepositoryAdapter<T extends Entity<TId>, TId = string>
  implements RepositoryAdapter<T, TId>
{
  private store = new Map<string, T>();
  private deleted = new Map<string, T>();

  create(data: CreateEntity<T>): Promise<T> {
    const id = crypto.randomUUID() as unknown as TId;
    const now = new Date();
    const entity = {
      ...data,
      id,
      createdAt: now,
      updatedAt: now,
    } as unknown as T;
    this.store.set(String(id), entity);
    return Promise.resolve(entity);
  }

  async createMany(data: CreateEntity<T>[]): Promise<T[]> {
    return Promise.all(data.map((d) => this.create(d)));
  }

  async update(id: TId, data: UpdateEntity<T>): Promise<T> {
    const existing = this.store.get(String(id));
    if (!existing) throw new EntityNotFoundError(String(id));
    const updated = {
      ...existing,
      ...data,
      id: existing.id,
      createdAt: existing.createdAt,
      updatedAt: new Date(),
    } as T;
    this.store.set(String(id), updated);
    return updated;
  }

  async updateMany(filter: Filter, data: UpdateEntity<T>): Promise<number> {
    const items = this.applyFilter([...this.store.values()], filter);
    let count = 0;
    for (const item of items) {
      await this.update(item.id as unknown as TId, data);
      count++;
    }
    return count;
  }

  async delete(id: TId): Promise<boolean> {
    return this.store.delete(String(id));
  }

  async deleteMany(filter: Filter): Promise<number> {
    const items = this.applyFilter([...this.store.values()], filter);
    let count = 0;
    for (const item of items) {
      this.store.delete(String(item.id));
      count++;
    }
    return count;
  }

  async softDelete(id: TId): Promise<T> {
    const existing = this.store.get(String(id));
    if (!existing) throw new EntityNotFoundError(String(id));
    this.store.delete(String(id));
    const deletedEntity = { ...existing, deletedAt: new Date() } as T;
    this.deleted.set(String(id), deletedEntity);
    return deletedEntity;
  }

  async restore(id: TId): Promise<T> {
    const existing = this.deleted.get(String(id));
    if (!existing) throw new EntityNotFoundError(String(id));
    this.deleted.delete(String(id));
    this.store.set(String(id), existing);
    return existing;
  }

  findById(id: TId): Promise<T | null> {
    return Promise.resolve(this.store.get(String(id)) ?? null);
  }

  async findOne(filter: Filter): Promise<T | null> {
    const items = this.applyFilter([...this.store.values()], filter);
    return items[0] ?? null;
  }

  findMany(
    filter?: Filter,
    sort?: SortCriteria,
    pagination?: PaginationRequest,
    _projection?: Projection,
  ): Promise<T[]> {
    let items = [...this.store.values()];
    if (filter) items = this.applyFilter(items, filter);
    if (sort) items = this.applySort(items, sort);
    if (pagination) {
      const start = "page" in pagination
        ? (pagination.page - 1) * pagination.limit
        : 0;
      items = items.slice(start, start + pagination.limit);
    }
    return Promise.resolve(items);
  }

  async exists(filter: Filter): Promise<boolean> {
    const result = await this.findOne(filter);
    return result !== null;
  }

  async count(filter?: Filter): Promise<number> {
    if (!filter) return this.store.size;
    return this.applyFilter([...this.store.values()], filter).length;
  }

  async paginate(
    pagination: PaginationRequest,
    filter?: Filter,
    sort?: SortCriteria,
    projection?: Projection,
  ): Promise<PaginationResult<T>> {
    if (pagination.type === "offset") {
      let items = [...this.store.values()];
      if (filter) items = this.applyFilter(items, filter);
      if (sort) items = this.applySort(items, sort);
      const total = items.length;
      const start = (pagination.page - 1) * pagination.limit;
      const pageItems = items.slice(start, start + pagination.limit);
      return {
        items: projection ? this.applyProjection(pageItems, projection) : pageItems,
        metadata: {
          totalItems: total,
          totalPages: Math.ceil(total / pagination.limit),
          currentPage: pagination.page,
          itemsPerPage: pagination.limit,
          hasNextPage: start + pagination.limit < total,
          hasPreviousPage: pagination.page > 1,
        },
      };
    }
    return this.handleCursorPagination(pagination, filter, sort, projection);
  }

  async query(
    filter: Filter,
    sort?: SortCriteria,
    pagination?: PaginationRequest,
    projection?: Projection,
  ): Promise<PaginationResult<T>> {
    return this.paginate(
      pagination ?? offsetPagination(1, 100),
      filter,
      sort,
      projection,
    );
  }

  async aggregate(query: AggregateQuery): Promise<AggregateResult[]> {
    let items = [...this.store.values()];
    if (query.filters) {
      for (const f of query.filters) {
        items = this.applyFilter(items, f);
      }
    }
    if (!query.groupBy || query.groupBy.length === 0) {
      return [this.computeAggregations(items, query.groupBy?.[0]?.aggregations)];
    }
    const groups = new Map<string, T[]>();
    for (const item of items) {
      for (const gb of query.groupBy) {
        const key = String((item as Record<string, unknown>)[gb.field]);
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key)!.push(item);
      }
    }
    const results: AggregateResult[] = [];
    for (const [key, group] of groups) {
      const result: AggregateResult = { group: key };
      const aggregations = query.groupBy[0]?.aggregations;
      if (aggregations) {
        Object.assign(result, this.computeAggregations(group, aggregations));
      }
      results.push(result);
    }
    return results;
  }

  async batchInsert(data: CreateEntity<T>[], batchSize = 100): Promise<T[]> {
    const results: T[] = [];
    for (let i = 0; i < data.length; i += batchSize) {
      const batch = data.slice(i, i + batchSize);
      const created = await this.createMany(batch);
      results.push(...created);
    }
    return results;
  }

  async batchUpdate(
    updates: { id: TId; data: UpdateEntity<T> }[],
    batchSize = 100,
  ): Promise<T[]> {
    const results: T[] = [];
    for (let i = 0; i < updates.length; i += batchSize) {
      const batch = updates.slice(i, i + batchSize);
      const updated = await Promise.all(
        batch.map((u) => this.update(u.id, u.data)),
      );
      results.push(...updated);
    }
    return results;
  }

  async batchDelete(ids: TId[], batchSize = 100): Promise<number> {
    let count = 0;
    for (let i = 0; i < ids.length; i += batchSize) {
      const batch = ids.slice(i, i + batchSize);
      const results = await Promise.all(batch.map((id) => this.delete(id)));
      count += results.filter(Boolean).length;
    }
    return count;
  }

  async search(query: SearchQuery): Promise<PaginationResult<T>> {
    let items = [...this.store.values()];
    const searchLower = query.query.toLowerCase();
    items = items.filter((item) => {
      const record = item as Record<string, unknown>;
      return query.fields.some((field) => {
        const value = String(record[field] ?? "").toLowerCase();
        return value.includes(searchLower);
      });
    });
    if (query.filters) {
      for (const f of query.filters) {
        items = this.applyFilter(items, f);
      }
    }
    const total = items.length;
    const offset = query.offset ?? 0;
    const limit = query.limit ?? 20;
    const pageItems = items.slice(offset, offset + limit);
    return {
      items: pageItems,
      metadata: {
        totalItems: total,
        totalPages: Math.ceil(total / limit),
        currentPage: Math.floor(offset / limit) + 1,
        itemsPerPage: limit,
        hasNextPage: offset + limit < total,
        hasPreviousPage: offset > 0,
      },
    };
  }

  private applyFilter(items: T[], filter: Filter): T[] {
    if (isFieldFilter(filter)) {
      return items.filter((item) => this.matchesField(item, filter));
    }
    if (isLogicalFilter(filter)) {
      if (filter.type === "and") {
        return filter.filters.reduce(
          (acc, f) => this.applyFilter(acc, f),
          items,
        );
      }
      const results = filter.filters.map((f) => this.applyFilter(items, f));
      return [...new Set(results.flat())];
    }
    return items;
  }

  private matchesField(item: T, filter: import("../../domain/filters").FieldFilter): boolean {
    const value = (item as Record<string, unknown>)[filter.field];
    switch (filter.operator) {
      case FilterOperator.Equals:
        return value === filter.value;
      case FilterOperator.NotEquals:
        return value !== filter.value;
      case FilterOperator.GreaterThan:
        return (value as number) > (filter.value as number);
      case FilterOperator.GreaterOrEqual:
        return (value as number) >= (filter.value as number);
      case FilterOperator.LessThan:
        return (value as number) < (filter.value as number);
      case FilterOperator.LessOrEqual:
        return (value as number) <= (filter.value as number);
      case FilterOperator.Between: {
        const vals = filter.values as [unknown, unknown];
        return (value as number) >= (vals[0] as number) && (value as number) <= (vals[1] as number);
      }
      case FilterOperator.Contains:
        return String(value).toLowerCase().includes(String(filter.value).toLowerCase());
      case FilterOperator.StartsWith:
        return String(value).toLowerCase().startsWith(String(filter.value).toLowerCase());
      case FilterOperator.EndsWith:
        return String(value).toLowerCase().endsWith(String(filter.value).toLowerCase());
      case FilterOperator.In:
        return (filter.values ?? []).includes(value);
      case FilterOperator.NotIn:
        return !(filter.values ?? []).includes(value);
      case FilterOperator.IsNull:
        return value === null || value === undefined;
      case FilterOperator.IsNotNull:
        return value !== null && value !== undefined;
      default:
        return true;
    }
  }

  private applySort(items: T[], criteria: SortCriteria): T[] {
    return [...items].sort((a, b) => {
      for (const sort of criteria) {
        const aVal = (a as Record<string, unknown>)[sort.field];
        const bVal = (b as Record<string, unknown>)[sort.field];
        if (String(aVal) < String(bVal)) return sort.direction === SortDirection.Asc ? -1 : 1;
        if (String(aVal) > String(bVal)) return sort.direction === SortDirection.Asc ? 1 : -1;
      }
      return 0;
    });
  }

  private applyProjection(items: T[], projection: Projection): T[] {
    if (!projection.fields) return items;
    return items.map((item) => {
      const record = item as Record<string, unknown>;
      const projected: Record<string, unknown> = {};
      for (const field of projection.fields!) {
        if (field in record) projected[field] = record[field];
      }
      return projected as T;
    });
  }

  private handleCursorPagination(
    pagination: import("../../domain/pagination").CursorPaginationRequest,
    filter?: Filter,
    sort?: SortCriteria,
    projection?: Projection,
  ): PaginationResult<T> {
    let items = [...this.store.values()];
    if (filter) items = this.applyFilter(items, filter);
    if (sort) items = this.applySort(items, sort);
    const total = items.length;
    const cursorIndex = items.findIndex(
      (i) => String(i.id) === pagination.cursor,
    );
    const start = cursorIndex >= 0 ? cursorIndex + 1 : 0;
    const pageItems = items.slice(start, start + pagination.limit);
    const nextCursor = pageItems.length > 0
      ? String(pageItems[pageItems.length - 1]?.id)
      : undefined;
    return {
      items: projection ? this.applyProjection(pageItems, projection) : pageItems,
      metadata: {
        totalItems: total,
        hasNextPage: start + pagination.limit < total,
        hasPreviousPage: cursorIndex > 0,
        nextCursor,
      },
    };
  }

  private computeAggregations(
    items: T[],
    aggregations?: import("../../domain/repository").Aggregation[],
  ): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    if (!aggregations) return { count: items.length };
    for (const agg of aggregations) {
      const values = agg.field
        ? items.map((i) => (i as Record<string, unknown>)[agg.field!] as number)
        : [];
      const key = agg.alias ?? `${agg.type}_${agg.field ?? ""}`;
      switch (agg.type) {
        case "count":
          result[key] = agg.field ? values.filter((v) => v !== undefined).length : items.length;
          break;
        case "sum":
          result[key] = values.reduce((a, b) => a + (b ?? 0), 0);
          break;
        case "avg":
          result[key] = values.length > 0
            ? values.reduce((a, b) => a + (b ?? 0), 0) / values.length
            : 0;
          break;
        case "min":
          result[key] = values.length > 0 ? Math.min(...values) : 0;
          break;
        case "max":
          result[key] = values.length > 0 ? Math.max(...values) : 0;
          break;
      }
    }
    return result;
  }
}
