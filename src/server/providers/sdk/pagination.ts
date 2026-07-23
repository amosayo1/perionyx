export interface PaginationState {
  cursor?: string | null;
  page?: number;
  pageSize: number;
  totalItems?: number;
  totalPages?: number;
  hasMore: boolean;
}

export interface PaginatedResult<T> {
  items: T[];
  nextCursor?: string | null;
  nextPage?: number;
  totalItems?: number;
  hasMore: boolean;
}

export function createInitialPaginationState(pageSize = 100): PaginationState {
  return {
    cursor: null,
    page: 1,
    pageSize,
    hasMore: true,
  };
}

export function buildPageParams(state: PaginationState): Record<string, string | number> {
  const params: Record<string, string | number> = {
    page_size: state.pageSize,
  };

  if (state.cursor) {
    params.cursor = state.cursor;
  } else {
    params.page = state.page ?? 1;
  }

  return params;
}

export function updatePaginationState<T>(
  state: PaginationState,
  result: PaginatedResult<T>,
): PaginationState {
  return {
    ...state,
    cursor: result.nextCursor ?? state.cursor,
    page: result.nextPage ?? (state.page ?? 1) + 1,
    totalItems: result.totalItems ?? state.totalItems,
    hasMore: result.hasMore,
  };
}

export async function paginateAll<T>(
  fetchPage: (state: PaginationState) => Promise<PaginatedResult<T>>,
  pageSize = 100,
): Promise<T[]> {
  const allItems: T[] = [];
  const state = createInitialPaginationState(pageSize);

  do {
    const result = await fetchPage(state);
    allItems.push(...result.items);
    if (!result.hasMore) break;
    Object.assign(state, updatePaginationState(state, result));
  } while (state.hasMore);

  return allItems;
}
