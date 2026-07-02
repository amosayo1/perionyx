const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

export type CursorPagination = {
  take: number;
  cursor?: string;
};

export function parseCursorPagination(searchParams: URLSearchParams): CursorPagination {
  const raw = searchParams.get("limit");
  const parsed = raw ? Number.parseInt(raw, 10) : NaN;
  const take = Number.isFinite(parsed)
    ? Math.min(MAX_LIMIT, Math.max(1, parsed))
    : DEFAULT_LIMIT;
  const cursor = searchParams.get("cursor") ?? undefined;
  return { take, cursor };
}
