export enum SortDirection {
  Asc = "asc",
  Desc = "desc",
}

export interface SortField {
  field: string;
  direction: SortDirection;
}

export type SortCriteria = SortField[];

export function asc(field: string): SortField {
  return { field, direction: SortDirection.Asc };
}

export function desc(field: string): SortField {
  return { field, direction: SortDirection.Desc };
}

export function by(...fields: SortField[]): SortCriteria {
  return fields;
}
