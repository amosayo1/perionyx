export enum FilterOperator {
  Equals = "eq",
  NotEquals = "neq",
  GreaterThan = "gt",
  GreaterOrEqual = "gte",
  LessThan = "lt",
  LessOrEqual = "lte",
  Between = "between",
  Contains = "contains",
  StartsWith = "startsWith",
  EndsWith = "endsWith",
  In = "in",
  NotIn = "notIn",
  IsNull = "isNull",
  IsNotNull = "isNotNull",
}

export interface FieldFilter {
  field: string;
  operator: FilterOperator;
  value?: unknown;
  values?: unknown[];
}

export interface LogicalFilter {
  type: "and" | "or";
  filters: Filter[];
}

export type Filter = FieldFilter | LogicalFilter;

export function isFieldFilter(filter: Filter): filter is FieldFilter {
  return "field" in filter && "operator" in filter;
}

export function isLogicalFilter(filter: Filter): filter is LogicalFilter {
  return "type" in filter && "filters" in filter;
}

export interface FilterGroup {
  filters: Filter[];
}

export function and(...filters: Filter[]): LogicalFilter {
  return { type: "and", filters };
}

export function or(...filters: Filter[]): LogicalFilter {
  return { type: "or", filters };
}

export function eq(field: string, value: unknown): FieldFilter {
  return { field, operator: FilterOperator.Equals, value };
}

export function neq(field: string, value: unknown): FieldFilter {
  return { field, operator: FilterOperator.NotEquals, value };
}

export function gt(field: string, value: unknown): FieldFilter {
  return { field, operator: FilterOperator.GreaterThan, value };
}

export function gte(field: string, value: unknown): FieldFilter {
  return { field, operator: FilterOperator.GreaterOrEqual, value };
}

export function lt(field: string, value: unknown): FieldFilter {
  return { field, operator: FilterOperator.LessThan, value };
}

export function lte(field: string, value: unknown): FieldFilter {
  return { field, operator: FilterOperator.LessOrEqual, value };
}

export function between(field: string, min: unknown, max: unknown): FieldFilter {
  return { field, operator: FilterOperator.Between, values: [min, max] };
}

export function contains(field: string, value: string): FieldFilter {
  return { field, operator: FilterOperator.Contains, value };
}

export function startsWith(field: string, value: string): FieldFilter {
  return { field, operator: FilterOperator.StartsWith, value };
}

export function endsWith(field: string, value: string): FieldFilter {
  return { field, operator: FilterOperator.EndsWith, value };
}

export function inList(field: string, values: unknown[]): FieldFilter {
  return { field, operator: FilterOperator.In, values };
}

export function notIn(field: string, values: unknown[]): FieldFilter {
  return { field, operator: FilterOperator.NotIn, values };
}

export function isNull(field: string): FieldFilter {
  return { field, operator: FilterOperator.IsNull };
}

export function isNotNull(field: string): FieldFilter {
  return { field, operator: FilterOperator.IsNotNull };
}
