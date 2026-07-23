import type { TransferPricingRecord, TransferPricingMethod } from "../../types";

export class TransferPricingService {
  private records = new Map<string, TransferPricingRecord>();

  addRecord(record: TransferPricingRecord): TransferPricingRecord {
    this.records.set(record.id, record);
    return record;
  }

  getRecord(id: string): TransferPricingRecord | undefined {
    return this.records.get(id);
  }

  getAllRecords(): TransferPricingRecord[] {
    return Array.from(this.records.values());
  }

  getByParty(relatedPartyId: string): TransferPricingRecord[] {
    return this.getAllRecords().filter(r => r.relatedPartyId === relatedPartyId);
  }

  getByMethod(method: TransferPricingMethod): TransferPricingRecord[] {
    return this.getAllRecords().filter(r => r.method === method);
  }

  getByTransactionType(type: string): TransferPricingRecord[] {
    return this.getAllRecords().filter(r => r.transactionType === type);
  }

  getByFiscalYear(fiscalYear: string): TransferPricingRecord[] {
    return this.getAllRecords().filter(r => r.fiscalYear === fiscalYear);
  }

  getByRisk(riskRating: string): TransferPricingRecord[] {
    return this.getAllRecords().filter(r => r.riskRating === riskRating);
  }

  getNeedsDocumentation(): TransferPricingRecord[] {
    return this.getAllRecords().filter(r => r.documentationStatus === "needed" || r.documentationStatus === "incomplete");
  }

  count(): number {
    return this.records.size;
  }
}
