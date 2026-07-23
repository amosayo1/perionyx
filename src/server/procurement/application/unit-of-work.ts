/**
 * Phase 21A.2 — AP Unit of Work
 *
 * Transaction boundary abstraction. Wraps all repository writes within a
 * single Prisma interactive transaction, ensuring atomicity of:
 * - Aggregate state changes
 * - Domain event collection (published after commit)
 * - Audit record writes
 *
 * Pattern: Command handler collects events/audits during execution,
 * Unit of Work persists everything atomically, then publishes events.
 */

import { prisma } from "@/server/db/prisma";
import type { PrismaClient } from "@prisma/client";
import type { DomainEvent, AuditEntry } from "./types";
import { apEventBus } from "../domain/events/event-bus";

export interface UnitOfWorkResult<T> {
  data: T;
  events: DomainEvent[];
  auditEntries: AuditEntry[];
}

export type TransactionalOperation<T> = (
  tx: PrismaClient,
) => Promise<{ data: T; events: DomainEvent[]; auditEntries: AuditEntry[] }>;

/**
 * Execute an operation within a Prisma interactive transaction.
 * On success: persists all DB writes atomically, then publishes domain events.
 * On failure: rolls back all DB writes, discards events.
 */
export async function executeUnitOfWork<T>(
  operation: TransactionalOperation<T>,
): Promise<UnitOfWorkResult<T>> {
  const result = await prisma.$transaction(async (tx) => {
    return operation(tx as unknown as PrismaClient);
  });

  // Post-commit: publish domain events
  if (result.events.length > 0) {
    await apEventBus.publishAll(result.events);
  }

  return result;
}

/**
 * Helper: create a UnitOfWorkResult with events and audits collected during execution.
 */
export function unitOfWorkResult<T>(
  data: T,
  events: DomainEvent[] = [],
  auditEntries: AuditEntry[] = [],
): { data: T; events: DomainEvent[]; auditEntries: AuditEntry[] } {
  return { data, events, auditEntries };
}
