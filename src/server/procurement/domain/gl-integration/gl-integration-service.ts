import type { Invoice } from "../../types";

let entryCounter = 0;

function nextEntryNumber(): string {
  entryCounter++;
  return `GL-PR-${String(entryCounter).padStart(6, "0")}`;
}

interface GLJournalEntry {
  id: string;
  entryNumber: string;
  type: string;
  referenceId: string;
  referenceType: string;
  description: string;
  debitAccount: string;
  creditAccount: string;
  debitAmount: number;
  creditAmount: number;
  currency: string;
  fxRate: number;
  baseAmount: number;
  entryDate: Date;
  posted: boolean;
  postedDate: Date;
  companyId: string;
}

/**
 * GL Integration Service for Procurement domain.
 * Generates GL journal entries for procurement events:
 * - Invoice received → Dr Purchases / Cr Accounts Payable
 * - Payment made → Dr Accounts Payable / Cr Cash
 * - Goods received → Dr Inventory / Cr GR/NI Clearing
 */
export class GLIntegrationService {
  private entries = new Map<string, GLJournalEntry>();

  getAllEntries(): GLJournalEntry[] {
    return Array.from(this.entries.values());
  }

  getEntriesByCompany(companyId: string): GLJournalEntry[] {
    return this.getAllEntries().filter((e) => e.companyId === companyId);
  }

  clearEntries(): void {
    this.entries.clear();
  }

  /** Invoice received: Dr Purchases (5000) / Cr Accounts Payable (2000) */
  generateInvoiceEntry(invoice: Invoice): GLJournalEntry {
    const entry: GLJournalEntry = {
      id: `gl-pr-inv-${invoice.id}`,
      entryNumber: nextEntryNumber(),
      type: "invoice",
      referenceId: invoice.id,
      referenceType: "ProcurementInvoice",
      description: `Invoice ${invoice.invoiceNumber} - ${invoice.vendorName}`,
      debitAccount: "5000", // Purchases / Cost of Goods
      creditAccount: "2000", // Accounts Payable
      debitAmount: invoice.totalWithTax,
      creditAmount: invoice.totalWithTax,
      currency: invoice.currency,
      fxRate: invoice.exchangeRate,
      baseAmount: invoice.totalWithTax * invoice.exchangeRate,
      entryDate: invoice.invoiceDate,
      posted: true,
      postedDate: invoice.invoiceDate,
      companyId: invoice.companyId,
    };
    this.entries.set(entry.id, entry);
    return entry;
  }

  /** Payment made: Dr Accounts Payable (2000) / Cr Cash (1000) */
  generatePaymentEntry(payment: { id: string; invoiceId: string; vendorName: string; amount: number; currency: string; paymentDate: Date; companyId: string }): GLJournalEntry {
    const entry: GLJournalEntry = {
      id: `gl-pr-pay-${payment.id}`,
      entryNumber: nextEntryNumber(),
      type: "payment",
      referenceId: payment.id,
      referenceType: "ProcurementPayment",
      description: `Payment to ${payment.vendorName} for invoice ${payment.invoiceId}`,
      debitAccount: "2000", // Accounts Payable
      creditAccount: "1000", // Cash
      debitAmount: payment.amount,
      creditAmount: payment.amount,
      currency: payment.currency,
      fxRate: 1,
      baseAmount: payment.amount,
      entryDate: payment.paymentDate,
      posted: true,
      postedDate: payment.paymentDate,
      companyId: payment.companyId,
    };
    this.entries.set(entry.id, entry);
    return entry;
  }

  /** Goods received: Dr Inventory (1300) / Cr GR/NI Clearing (2100) */
  generateReceiptEntry(receipt: { id: string; poId: string; vendorName: string; totalAmount: number; currency: string; receivedDate: Date; companyId: string }): GLJournalEntry {
    const entry: GLJournalEntry = {
      id: `gl-pr-rcv-${receipt.id}`,
      entryNumber: nextEntryNumber(),
      type: "receipt",
      referenceId: receipt.id,
      referenceType: "ProcurementReceipt",
      description: `Goods received from ${receipt.vendorName} - PO ${receipt.poId}`,
      debitAccount: "1300", // Inventory
      creditAccount: "2100", // GR/NI Clearing
      debitAmount: receipt.totalAmount,
      creditAmount: receipt.totalAmount,
      currency: receipt.currency,
      fxRate: 1,
      baseAmount: receipt.totalAmount,
      entryDate: receipt.receivedDate,
      posted: true,
      postedDate: receipt.receivedDate,
      companyId: receipt.companyId,
    };
    this.entries.set(entry.id, entry);
    return entry;
  }
}
