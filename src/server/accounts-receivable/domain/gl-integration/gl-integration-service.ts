import type { GLJournalEntry, Invoice, Receipt, WriteOff, Adjustment } from "../../types";

let entryCounter = 0;

function nextEntryNumber(): string {
  entryCounter++;
  return `GL-AR-${String(entryCounter).padStart(6, "0")}`;
}

export class GLIntegrationService {
  private entries = new Map<string, GLJournalEntry>();

  getAllEntries(): GLJournalEntry[] {
    return Array.from(this.entries.values());
  }

  clearEntries(): void {
    this.entries.clear();
  }

  generateInvoiceEntry(invoice: Invoice): GLJournalEntry {
    const entry: GLJournalEntry = {
      id: `gl-inv-${invoice.id}`,
      entryNumber: nextEntryNumber(),
      type: "invoice",
      referenceId: invoice.id,
      referenceType: "Invoice",
      description: `Invoice ${invoice.invoiceNumber} - ${invoice.customerName}`,
      debitAccount: "1200", // Accounts Receivable
      creditAccount: "4000", // Revenue
      debitAmount: invoice.grandTotal,
      creditAmount: invoice.grandTotal,
      currency: invoice.currency,
      fxRate: 1,
      baseAmount: invoice.grandTotal,
      entryDate: invoice.invoiceDate,
      posted: true,
      postedDate: invoice.invoiceDate,
      companyId: invoice.companyId,
    };
    this.entries.set(entry.id, entry);
    return entry;
  }

  generateReceiptEntry(receipt: Receipt): GLJournalEntry {
    const entry: GLJournalEntry = {
      id: `gl-rec-${receipt.id}`,
      entryNumber: nextEntryNumber(),
      type: "receipt",
      referenceId: receipt.id,
      referenceType: "Receipt",
      description: `Receipt ${receipt.receiptNumber} - ${receipt.customerName}`,
      debitAccount: "1000", // Cash
      creditAccount: "1200", // Accounts Receivable
      debitAmount: receipt.baseAmount,
      creditAmount: receipt.baseAmount,
      currency: receipt.currency,
      fxRate: receipt.fxRate,
      baseAmount: receipt.baseAmount,
      entryDate: receipt.receiptDate,
      posted: true,
      postedDate: receipt.receiptDate,
      companyId: receipt.companyId,
    };
    this.entries.set(entry.id, entry);
    return entry;
  }

  generateWriteOffEntry(writeOff: WriteOff): GLJournalEntry {
    const entry: GLJournalEntry = {
      id: `gl-wo-${writeOff.id}`,
      entryNumber: nextEntryNumber(),
      type: "writeOff",
      referenceId: writeOff.id,
      referenceType: "WriteOff",
      description: `Write-off ${writeOff.writeOffNumber} - ${writeOff.customerName}`,
      debitAccount: "6400", // Bad Debt Expense
      creditAccount: "1200", // Accounts Receivable
      debitAmount: writeOff.writeOffAmount,
      creditAmount: writeOff.writeOffAmount,
      currency: writeOff.currency,
      fxRate: 1,
      baseAmount: writeOff.writeOffAmount,
      entryDate: writeOff.appliedDate ?? new Date(),
      posted: true,
      postedDate: writeOff.appliedDate ?? new Date(),
      companyId: writeOff.companyId,
    };
    this.entries.set(entry.id, entry);
    return entry;
  }

  generateAdjustmentEntry(adjustment: Adjustment): GLJournalEntry | null {
    const baseEntry = {
      id: `gl-adj-${adjustment.id}`,
      entryNumber: nextEntryNumber(),
      referenceId: adjustment.id,
      referenceType: "Adjustment",
      description: `${adjustment.type} ${adjustment.adjustmentNumber} - ${adjustment.customerName}`,
      currency: adjustment.currency,
      fxRate: 1,
      baseAmount: adjustment.amount,
      entryDate: adjustment.appliedDate ?? new Date(),
      posted: true,
      postedDate: adjustment.appliedDate ?? new Date(),
      companyId: adjustment.companyId,
    };

    let debitAccount: string;
    let creditAccount: string;
    switch (adjustment.type) {
      case "creditNote":
        debitAccount = "4100"; // Sales Returns
        creditAccount = "1200"; // Accounts Receivable
        break;
      case "debitNote":
        debitAccount = "1200";
        creditAccount = "4000";
        break;
      case "discount":
        debitAccount = "4200"; // Sales Discounts
        creditAccount = "1200";
        break;
      case "correction":
        debitAccount = adjustment.amount >= 0 ? "1200" : "4000";
        creditAccount = adjustment.amount >= 0 ? "4000" : "1200";
        break;
      default:
        debitAccount = "1200";
        creditAccount = "4000";
    }

    const entry: GLJournalEntry = {
      ...baseEntry,
      type: "adjustment",
      debitAccount,
      creditAccount,
      debitAmount: Math.abs(adjustment.amount),
      creditAmount: Math.abs(adjustment.amount),
    };
    this.entries.set(entry.id, entry);
    return entry;
  }

  generateAllEntries(
    invoices: Invoice[],
    receipts: Receipt[],
    writeOffs: WriteOff[],
    adjustments: Adjustment[],
  ): GLJournalEntry[] {
    const all: GLJournalEntry[] = [];
    for (const inv of invoices) all.push(this.generateInvoiceEntry(inv));
    for (const rec of receipts) all.push(this.generateReceiptEntry(rec));
    for (const wo of writeOffs) all.push(this.generateWriteOffEntry(wo));
    for (const adj of adjustments) {
      const entry = this.generateAdjustmentEntry(adj);
      if (entry) all.push(entry);
    }
    return all;
  }
}
