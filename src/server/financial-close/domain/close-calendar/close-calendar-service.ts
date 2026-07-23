import type { CloseCalendarEntry } from "../../types";

export class CloseCalendarService {
  private entries = new Map<string, CloseCalendarEntry>();

  add(entry: CloseCalendarEntry): CloseCalendarEntry {
    this.entries.set(entry.id, entry);
    return entry;
  }

  get(id: string): CloseCalendarEntry | undefined {
    return this.entries.get(id);
  }

  getAll(): CloseCalendarEntry[] {
    return Array.from(this.entries.values());
  }

  getByPeriod(periodId: string): CloseCalendarEntry[] {
    return this.getAll().filter((e) => e.periodId === periodId);
  }

  getByType(type: string): CloseCalendarEntry[] {
    return this.getAll().filter((e) => e.type === type);
  }

  getByDateRange(start: Date, end: Date): CloseCalendarEntry[] {
    return this.getAll().filter((e) => e.date >= start && e.date <= end);
  }

  getUpcoming(days: number): CloseCalendarEntry[] {
    const now = new Date();
    const future = new Date(now.getTime() + days * 86400000);
    return this.getAll().filter((e) => e.date >= now && e.date <= future).sort((a, b) => a.date.getTime() - b.date.getTime());
  }

  search(query: string): CloseCalendarEntry[] {
    const q = query.toLowerCase();
    return this.getAll().filter((e) => e.title.toLowerCase().includes(q));
  }

  count(): number {
    return this.entries.size;
  }

  update(id: string, updates: Partial<CloseCalendarEntry>): CloseCalendarEntry {
    const existing = this.entries.get(id);
    if (!existing) throw new Error(`Calendar entry ${id} not found`);
    const updated = { ...existing, ...updates, updatedAt: new Date() };
    this.entries.set(id, updated);
    return updated;
  }

  delete(id: string): void {
    this.entries.delete(id);
  }
}
