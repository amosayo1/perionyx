/**
 * Runtime Context — AsyncLocalStorage-based propagation
 *
 * Phase 24.0B / Phase 26.0A
 *
 * Provides automatic context propagation through async call chains.
 * The ONLY way to establish runtime context in production code.
 *
 * Core API (2 functions):
 *   withRuntimeContext(options, fn) — establish context for a scope
 *   requireRuntimeContext() — read context (throws if not in scope)
 *
 * Usage:
 *   import { withRuntimeContext, requireRuntimeContext } from '@/runtime/context';
 *
 *   await withRuntimeContext({ tenant: { userId, companyId, role } }, async () => {
 *     // Any async call within this scope can read context
 *     const ctx = requireRuntimeContext();
 *   });
 */

import { AsyncLocalStorage } from 'node:async_hooks';
import type {
  RuntimeContext,
  WithContextOptions,
} from './types';

// ── AsyncLocalStorage instance ─────────────────────────────────────────────

const runtimeContextStorage = new AsyncLocalStorage<RuntimeContext>();

// ── Core API ───────────────────────────────────────────────────────────────

/**
 * Execute a function within a runtime context.
 * Context is automatically propagated to all async calls within `fn`.
 */
export async function withRuntimeContext<T>(
  options: WithContextOptions,
  fn: () => Promise<T>,
): Promise<T> {
  const parentCtx = runtimeContextStorage.getStore();
  const merged: RuntimeContext = {
    tenant: options.tenant ?? parentCtx?.tenant,
    request: options.request ?? parentCtx?.request,
    trace: options.trace ?? parentCtx?.trace,
    permission: options.permission ?? parentCtx?.permission,
    financial: options.financial ?? parentCtx?.financial,
    locale: options.locale ?? parentCtx?.locale,
  };
  return runtimeContextStorage.run(merged, fn);
}

/**
 * Get the current runtime context or throw if not in scope.
 */
export function requireRuntimeContext(): RuntimeContext {
  const ctx = runtimeContextStorage.getStore();
  if (!ctx) {
    throw new Error(
      'RuntimeContext not available. Wrap your call in withRuntimeContext().',
    );
  }
  return ctx;
}

/**
 * Get the current runtime context.
 * Returns undefined if called outside a context scope.
 */
export function getRuntimeContext(): RuntimeContext | undefined {
  return runtimeContextStorage.getStore();
}
