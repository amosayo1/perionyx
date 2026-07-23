import type { ConnectionConfig, SyncState } from "@/server/integrations/types";
import type { IntegrationProvider } from "@/server/integrations/integration-provider";
import type { SyncSession, SyncContext } from "./types";

export function createSyncContext(
  session: SyncSession,
  connection: ConnectionConfig,
  state: SyncState,
  provider: IntegrationProvider,
  signal?: AbortSignal,
): SyncContext {
  return {
    session,
    connection,
    state,
    provider,
    signal: signal ?? new AbortController().signal,
  };
}

export function createAbortableContext(
  session: SyncSession,
  connection: ConnectionConfig,
  state: SyncState,
  provider: IntegrationProvider,
  timeoutMs?: number,
): { context: SyncContext; abort: () => void } {
  const controller = new AbortController();

  if (timeoutMs && timeoutMs > 0) {
    setTimeout(() => controller.abort(), timeoutMs);
  }

  return {
    context: {
      session,
      connection,
      state,
      provider,
      signal: controller.signal,
    },
    abort: () => controller.abort(),
  };
}

export function isCancelled(context: SyncContext): boolean {
  return context.signal.aborted;
}

export function checkCancelled(context: SyncContext): void {
  if (context.signal.aborted) {
    throw new Error("Sync operation was cancelled");
  }
}
