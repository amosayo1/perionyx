/**
 * AP Event Handler — Audit Trail Persistence
 *
 * Subscribes to ALL AP domain events and persists audit records.
 * Ensures every state-changing action is recorded in ProcurementAPAuditRecord.
 *
 * This is the single source of truth for the AP audit trail.
 */

import { prisma } from "@/server/db/prisma";
import { apEventBus } from "../events/event-bus";
import type { DomainEvent } from "../../application/types";
import type { APAuditAction } from "@prisma/client";

/**
 * Map domain event types to Prisma APAuditAction enum values.
 */
function mapEventToAction(eventType: string): APAuditAction {
  if (eventType.includes("created") || eventType.includes("captured") || eventType.includes("received")) return "CREATED";
  if (eventType.includes("approved") || eventType.includes("confirmed")) return "APPROVED";
  if (eventType.includes("rejected")) return "REJECTED";
  if (eventType.includes("voided") || eventType.includes("cancelled")) return "VOIDED";
  if (eventType.includes("payment.") && eventType.includes("submitted")) return "PAID";
  if (eventType.includes("exception") || eventType.includes("dispute")) return "EXCEPTION";
  if (eventType.includes("resolved") || eventType.includes("completed")) return "RESOLVED";
  if (eventType.includes("delegated")) return "DELEGATED";
  if (eventType.includes("escalated")) return "ESCALATED";
  if (eventType.includes("updated") || eventType.includes("changed")) return "UPDATED";
  if (eventType.includes("status")) return "STATUS_CHANGED";
  return "UPDATED";
}

/**
 * Register audit trail event handlers on the AP event bus.
 * Called once at application startup.
 */
export function registerAuditHandlers(): void {
  apEventBus.subscribe("*", handleAnyEvent);
}

async function handleAnyEvent(event: DomainEvent): Promise<void> {
  try {
    const action = mapEventToAction(event.eventType);
    const payload = event.payload as Record<string, unknown>;

    await prisma.procurementAPAuditRecord.create({
      data: {
        companyId: event.companyId,
        entityType: event.aggregateType,
        entityId: event.aggregateId,
        action,
        userId: event.actorId,
        userRole: "system",
        description: `${event.eventType} on ${event.aggregateType} ${event.aggregateId}`,
        reason: typeof payload.reason === "string" ? payload.reason : undefined,
        correlationId: event.correlationId,
        metadata: event.payload as never,
      },
    });
  } catch (error) {
    console.error(`[AUDIT] Failed to persist audit record for ${event.eventType}:`, error);
  }
}
