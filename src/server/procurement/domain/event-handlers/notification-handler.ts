/**
 * AP Event Handler — Notification Dispatch
 *
 * Subscribes to AP domain events and dispatches notifications.
 * Listens for: approval.created, approval.chain.approved, approval.chain.rejected,
 *              exception.created, exception.escalated, invoice.blocked
 *
 * Notifications are enqueued to PgBoss for async delivery.
 */

import { apEventBus } from "../events/event-bus";
import type { DomainEvent } from "../../application/types";

/**
 * Register notification event handlers on the AP event bus.
 * Called once at application startup.
 */
export function registerNotificationHandlers(): void {
  apEventBus.subscribe("approval.created", handleApprovalRequired);
  apEventBus.subscribe("approval.chain.approved", handleApprovalChainApproved);
  apEventBus.subscribe("approval.chain.rejected", handleApprovalChainRejected);
  apEventBus.subscribe("exception.created", handleExceptionCreated);
  apEventBus.subscribe("exception.escalated", handleExceptionEscalated);
  apEventBus.subscribe("invoice.blocked", handleInvoiceBlocked);
}

async function handleApprovalRequired(event: DomainEvent): Promise<void> {
  const { invoiceId, levels } = event.payload as { invoiceId: string; levels: number };

  console.log(`[NOTIFY] Approval required: invoice ${invoiceId}, ${levels} level(s), company ${event.companyId}`);

  // In production, this would enqueue a PgBoss notification job:
  // await enqueue("notification-delivery", {
  //   type: "approval_required",
  //   companyId: event.companyId,
  //   invoiceId,
  //   levels,
  //   actorId: event.actorId,
  //   correlationId: event.correlationId,
  // });
}

async function handleApprovalChainApproved(event: DomainEvent): Promise<void> {
  const { invoiceId } = event.payload as { invoiceId: string };

  console.log(`[NOTIFY] Invoice approved: ${invoiceId}, company ${event.companyId}`);

  // await enqueue("notification-delivery", {
  //   type: "invoice_approved",
  //   companyId: event.companyId,
  //   invoiceId,
  //   actorId: event.actorId,
  //   correlationId: event.correlationId,
  // });
}

async function handleApprovalChainRejected(event: DomainEvent): Promise<void> {
  const { invoiceId } = event.payload as { invoiceId: string };

  console.log(`[NOTIFY] Invoice rejected: ${invoiceId}, company ${event.companyId}`);

  // await enqueue("notification-delivery", {
  //   type: "invoice_rejected",
  //   companyId: event.companyId,
  //   invoiceId,
  //   actorId: event.actorId,
  //   correlationId: event.correlationId,
  // });
}

async function handleExceptionCreated(event: DomainEvent): Promise<void> {
  const { invoiceId, type, severity } = event.payload as {
    invoiceId: string;
    type: string;
    severity: string;
  };

  console.log(`[NOTIFY] Exception: ${type} (${severity}) on invoice ${invoiceId}, company ${event.companyId}`);
}

async function handleExceptionEscalated(event: DomainEvent): Promise<void> {
  const { reason } = event.payload as { reason: string };

  console.log(`[NOTIFY] Exception escalated: ${event.aggregateId}, reason: ${reason}, company ${event.companyId}`);
}

async function handleInvoiceBlocked(event: DomainEvent): Promise<void> {
  const { blockType, reason } = event.payload as { blockType: string; reason: string };

  console.log(`[NOTIFY] Invoice blocked: ${event.aggregateId}, type: ${blockType}, reason: ${reason}, company ${event.companyId}`);
}
