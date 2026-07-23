// ---------------------------------------------------------------------------
// Next.js Cache Integration
// ---------------------------------------------------------------------------
// For Server Components and RSC payload caching, use Next.js built-in:
//   - fetch() with { next: { revalidate } }
//   - unstable_cache for function output caching
//   - React.cache for request-scoped memoization
//
// This module exposes helpers that wire Redis-backed caching alongside
// Next.js native caching for maximum efficiency.

import { unstable_cache } from "next/cache";
import { cache as reactCache } from "react";

export { unstable_cache, reactCache };

/**
 * Create an unstable_cache wrapper with standardized revalidation times.
 * Use in Server Components for data fetching that crosses the server boundary.
 */
export function withRevalidation<T>(
  fn: () => Promise<T>,
  keyParts: string[],
  revalidateSeconds: number,
): () => Promise<T> {
  return unstable_cache(fn, keyParts, { revalidate: revalidateSeconds });
}

/**
 * Request-scoped memoization via React.cache.
 * Prevents duplicate fetches within the same server component render pass.
 */
export function memoized<T>(fn: () => Promise<T>): () => Promise<T> {
  return reactCache(fn);
}
