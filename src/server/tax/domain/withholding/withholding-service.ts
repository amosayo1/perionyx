import type { WithholdingTaxRecord, WithholdingType } from "../../types";

export class WithholdingService {
  private records = new Map<string, WithholdingTaxRecord>();

  addRecord(record: WithholdingTaxRecord): WithholdingTaxRecord {
    this.records.set(record.id, record);
    return record;
  }

  getRecord(id: string): WithholdingTaxRecord | undefined {
    return this.records.get(id);
  }

  getAllRecords(): WithholdingTaxRecord[] {
    return Array.from(this.records.values());
  }

  getByType(type: WithholdingType): WithholdingTaxRecord[] {
    return this.getAllRecords().filter(r => r.withholdingType === type);
  }

  getByPayee(payeeId: string): WithholdingTaxRecord[] {
    return this.getAllRecords().filter(r => r.payeeId === payeeId);
  }

  getByJurisdiction(jurisdictionId: string): WithholdingTaxRecord[] {
    return this.getAllRecords().filter(r => r.jurisdictionId === jurisdictionId);
  }

  getByStatus(status: string): WithholdingTaxRecord[] {
    return this.getAllRecords().filter(r => r.status === status);
  }

  getRecoverable(): WithholdingTaxRecord[] {
    return this.getAllRecords().filter(r => r.isRecoverable);
  }

  getCertified(): WithholdingTaxRecord[] {
    return this.getAllRecords().filter(r => r.status === "certified");
  }

  count(): number {
    return this.records.size;
  }
}
