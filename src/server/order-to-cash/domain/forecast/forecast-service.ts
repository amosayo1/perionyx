import type { O2CForecastRecord } from "../../types";

export class O2CForecastService {
  private records = new Map<string, O2CForecastRecord>();

  addForecastRecord(record: O2CForecastRecord): O2CForecastRecord {
    this.records.set(record.id, record);
    return record;
  }

  getForecastRecord(id: string): O2CForecastRecord | undefined {
    return this.records.get(id);
  }

  getAllForecastRecords(): O2CForecastRecord[] {
    return Array.from(this.records.values());
  }

  getByMetric(metric: string): O2CForecastRecord[] {
    return this.getAllForecastRecords().filter(r => r.metric === metric);
  }

  getByPeriod(period: string): O2CForecastRecord[] {
    return this.getAllForecastRecords().filter(r => r.period === period);
  }

  getByCompany(companyId: string): O2CForecastRecord[] {
    return this.getAllForecastRecords().filter(r => r.companyId === companyId);
  }

  count(): number {
    return this.records.size;
  }
}
