import type { TaxCalendarEntry, TaxCalendarStatus } from "../../types";

export class TaxCalendarService {
  private entries = new Map<string, TaxCalendarEntry>();

  addEntry(entry: TaxCalendarEntry): TaxCalendarEntry {
    this.entries.set(entry.id, entry);
    return entry;
  }

  getEntry(id: string): TaxCalendarEntry | undefined {
    return this.entries.get(id);
  }

  getAllEntries(): TaxCalendarEntry[] {
    return Array.from(this.entries.values());
  }

  getByJurisdiction(jurisdictionId: string): TaxCalendarEntry[] {
    return this.getAllEntries().filter(e => e.jurisdictionId === jurisdictionId);
  }

  getByStatus(status: TaxCalendarStatus): TaxCalendarEntry[] {
    return this.getAllEntries().filter(e => e.status === status);
  }

  getUpcoming(): TaxCalendarEntry[] {
    const now = new Date();
    return this.getAllEntries().filter(e => e.status === "upcoming" && e.dueDate > now);
  }

  getDue(): TaxCalendarEntry[] {
    const now = new Date();
    return this.getAllEntries().filter(e => e.status === "due" || (e.status === "upcoming" && e.dueDate <= now));
  }

  getOverdue(): TaxCalendarEntry[] {
    return this.getAllEntries().filter(e => e.status === "overdue");
  }

  getByDateRange(from: Date, to: Date): TaxCalendarEntry[] {
    return this.getAllEntries().filter(e => e.dueDate >= from && e.dueDate <= to);
  }

  getByObligationType(type: string): TaxCalendarEntry[] {
    return this.getAllEntries().filter(e => e.obligationType === type);
  }

  count(): number {
    return this.entries.size;
  }
}
