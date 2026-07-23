export interface OffsetPaginationRequest {
  type: "offset";
  page: number;
  limit: number;
}

export interface CursorPaginationRequest {
  type: "cursor";
  cursor: string;
  limit: number;
  direction?: "forward" | "backward";
}

export type PaginationRequest = OffsetPaginationRequest | CursorPaginationRequest;

export interface PageMetadata {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface CursorPageMetadata {
  totalItems: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  nextCursor?: string;
  previousCursor?: string;
}

export interface OffsetPaginationResult<T> {
  items: T[];
  metadata: PageMetadata;
}

export interface CursorPaginationResult<T> {
  items: T[];
  metadata: CursorPageMetadata;
}

export type PaginationResult<T> = OffsetPaginationResult<T> | CursorPaginationResult<T>;

export function offsetPagination(page: number, limit: number): OffsetPaginationRequest {
  return { type: "offset", page, limit };
}

export function cursorPagination(
  cursor: string,
  limit: number,
  direction?: "forward" | "backward",
): CursorPaginationRequest {
  return { type: "cursor", cursor, limit, direction };
}
