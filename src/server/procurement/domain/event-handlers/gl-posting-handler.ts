/**
 * AP Event Handler — GL Posting
 *
 * Subscribes to AP domain events and generates GL journal entries.
 * Listens for: invoice.captured, payment.confirmed
 *
 * Uses the in-memory GLIntegrationService to track entries.
 * In production, this would persist to GLJournal + GLJournalEntry via Prisma.
 */

import { apEventBus } from "../events/event-bus";
import { GLIntegrationService } from "../gl-integration/gl-integration-service";
import type { DomainEvent } from "../../application/types";

/** Shared GL integration service instance for AP domain. */
const glService = new GLIntegrationService();

/**
 * Register GL posting event handlers on the AP event bus.
 * Called once at application startup.
 */
export function registerGLPostingHandlers(): void {
  apEventBus.subscribe("invoice.captured", handleInvoiceCaptured);
  apEventBus.subscribe("payment.confirmed", handlePaymentConfirmed);
}

async function handleInvoiceCaptured(event: DomainEvent): Promise<void> {
  const { vendorId, amount, currency } = event.payload as {
    vendorId: string;
    amount: number;
    currency: string;
  };

  try {
    glService.generateInvoiceEntry({
      id: event.aggregateId,
      invoiceNumber: event.aggregateId,
      vendorName: vendorId,
      totalWithTax: amount,
      currency,
      exchangeRate: 1,
      invoiceDate: new Date(),
      companyId: event.companyId,
    } as never);

    console.log(`[GL] Invoice entry generated: ${event.aggregateId}, amount: ${amount} ${currency}`);
  } catch (error) {
    console.error(`[GL] Failed to post invoice entry for ${event.aggregateId}:`, error);
  }
}

async function handlePaymentConfirmed(event: DomainEvent): Promise<void> {
  const { bankReference, amount } = event.payload as {
    bankReference: string;
    amount: number;
  };

  try {
    glService.generatePaymentEntry({
      id: event.aggregateId,
      invoiceId: bankReference,
      vendorName: "vendor",
      amount,
      currency: "USD",
      paymentDate: new Date(),
      companyId: event.companyId,
    });

    console.log(`[GL] Payment entry generated: ${event.aggregateId}, amount: ${amount}`);
  } catch (error) {
    console.error(`[GL] Failed to post payment entry for ${event.aggregateId}:`, error);
  }
}

/** Get all GL entries for a company (for reporting). */
export function getAPGLEntries(companyId: string) {
  return glService.getEntriesByCompany(companyId);
}
