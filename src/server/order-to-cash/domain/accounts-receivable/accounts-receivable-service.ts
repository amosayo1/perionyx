import type { ARRecord, ARStatus, AgingBucket } from "../../types";

export class ARService {
  private records = new Map<string, ARRecord>();

  addARRecord(record: ARRecord): ARRecord {
    this.records.set(record.id, record);
    return record;
  }

  getARRecord(id: string): ARRecord | undefined {
    return this.records.get(id);
  }

  getAllARRecords(): ARRecord[] {
    return Array.from(this.records.values());
  }

  getByCustomer(customerId: string): ARRecord[] {
    return this.getAllARRecords().filter(r => r.customerId === customerId);
  }

  getByStatus(status: ARStatus): ARRecord[] {
    return this.getAllARRecords().filter(r => r.status === status);
  }

  getByAgingBucket(bucket: AgingBucket): ARRecord[] {
    return this.getAllARRecords().filter(r => r.agingBucket === bucket);
  }

  getOverdue(): ARRecord[] {
    return this.getAllARRecords().filter(r => r.status === "overdue" || r.daysOverdue > 0);
  }

  getDisputed(): ARRecord[] {
    return this.getAllARRecords().filter(r => r.dispute);
  }

  getOpen(): ARRecord[] {
    return this.getAllARRecords().filter(r => r.status === "open" || r.status === "overdue" || r.status === "partially-paid");
  }

  count(): number {
    return this.records.size;
  }
}
