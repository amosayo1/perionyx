import type { ComplianceRecord, ComplianceStatus } from "../../types";

export class TaxComplianceService {
  private records = new Map<string, ComplianceRecord>();

  addRecord(record: ComplianceRecord): ComplianceRecord {
    this.records.set(record.id, record);
    return record;
  }

  getRecord(id: string): ComplianceRecord | undefined {
    return this.records.get(id);
  }

  getAllRecords(): ComplianceRecord[] {
    return Array.from(this.records.values());
  }

  getByJurisdiction(jurisdictionId: string): ComplianceRecord[] {
    return this.getAllRecords().filter(r => r.jurisdictionId === jurisdictionId);
  }

  getByStatus(status: ComplianceStatus): ComplianceRecord[] {
    return this.getAllRecords().filter(r => r.status === status);
  }

  getAtRisk(): ComplianceRecord[] {
    return this.getAllRecords().filter(r => r.status === "at-risk");
  }

  getNonCompliant(): ComplianceRecord[] {
    return this.getAllRecords().filter(r => r.status === "non-compliant");
  }

  getByRiskLevel(riskLevel: string): ComplianceRecord[] {
    return this.getAllRecords().filter(r => r.riskLevel === riskLevel);
  }

  search(query: string): ComplianceRecord[] {
    const q = query.toLowerCase();
    return this.getAllRecords().filter(r =>
      r.jurisdictionId.toLowerCase().includes(q) ||
      r.violations.some(v => v.toLowerCase().includes(q))
    );
  }

  count(): number {
    return this.records.size;
  }
}
