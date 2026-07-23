import type { IndirectTaxTransaction, TaxType } from "../../types";

export class IndirectTaxService {
  private transactions = new Map<string, IndirectTaxTransaction>();

  addTransaction(tx: IndirectTaxTransaction): IndirectTaxTransaction {
    this.transactions.set(tx.id, tx);
    return tx;
  }

  getTransaction(id: string): IndirectTaxTransaction | undefined {
    return this.transactions.get(id);
  }

  getAllTransactions(): IndirectTaxTransaction[] {
    return Array.from(this.transactions.values());
  }

  getByJurisdiction(jurisdictionId: string): IndirectTaxTransaction[] {
    return this.getAllTransactions().filter(t => t.jurisdictionId === jurisdictionId);
  }

  getByTaxType(taxType: TaxType): IndirectTaxTransaction[] {
    return this.getAllTransactions().filter(t => t.taxType === taxType);
  }

  getByDateRange(from: Date, to: Date): IndirectTaxTransaction[] {
    return this.getAllTransactions().filter(t => t.transactionDate >= from && t.transactionDate <= to);
  }

  getByTransactionType(type: string): IndirectTaxTransaction[] {
    return this.getAllTransactions().filter(t => t.transactionType === type);
  }

  getByReverseCharge(): IndirectTaxTransaction[] {
    return this.getAllTransactions().filter(t => t.isReverseCharge);
  }

  getByExempt(): IndirectTaxTransaction[] {
    return this.getAllTransactions().filter(t => t.isExempt);
  }

  getVatCollected(dateFrom: Date, dateTo: Date): number {
    return this.getAllTransactions()
      .filter(t => t.transactionDate >= dateFrom && t.transactionDate <= dateTo && (t.taxType === "vat" || t.taxType === "gst"))
      .reduce((sum, t) => sum + t.outputTax, 0);
  }

  getVatPaid(dateFrom: Date, dateTo: Date): number {
    return this.getAllTransactions()
      .filter(t => t.transactionDate >= dateFrom && t.transactionDate <= dateTo && (t.taxType === "vat" || t.taxType === "gst"))
      .reduce((sum, t) => sum + t.inputTax, 0);
  }

  getNetVat(dateFrom: Date, dateTo: Date): number {
    return this.getVatCollected(dateFrom, dateTo) - this.getVatPaid(dateFrom, dateTo);
  }

  count(): number {
    return this.transactions.size;
  }
}
