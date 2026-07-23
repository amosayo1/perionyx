import type { JournalEntry, JournalStatus, JournalType, RecurringJournal } from "../types";

export class JournalService {
  private journals = new Map<string, JournalEntry>();
  private recurring = new Map<string, RecurringJournal>();
  private journalCounter = 0;

  addJournal(journal: JournalEntry): void {
    this.journals.set(journal.id, journal);
  }

  getJournal(id: string): JournalEntry | undefined {
    return this.journals.get(id);
  }

  getAllJournals(): JournalEntry[] {
    return [...this.journals.values()];
  }

  getJournalsByStatus(status: JournalStatus): JournalEntry[] {
    return this.getAllJournals().filter((j) => j.status === status);
  }

  getJournalsByType(type: JournalType): JournalEntry[] {
    return this.getAllJournals().filter((j) => j.type === type);
  }

  getJournalsByPeriod(periodId: string): JournalEntry[] {
    return this.getAllJournals().filter((j) => j.periodId === periodId);
  }

  getJournalsByCompany(companyId: string): JournalEntry[] {
    return this.getAllJournals().filter((j) => j.companyId === companyId);
  }

  getDraftJournals(): JournalEntry[] {
    return this.getJournalsByStatus("draft");
  }

  getUnpostedJournals(): JournalEntry[] {
    return this.getAllJournals().filter(
      (j) => j.status === "approved" || j.status === "draft",
    );
  }

  generateJournalNumber(): string {
    this.journalCounter++;
    const ts = Date.now().toString(36).toUpperCase();
    return `JRN-${ts}-${String(this.journalCounter).padStart(4, "0")}`;
  }

  addRecurring(recurring: RecurringJournal): void {
    this.recurring.set(recurring.id, recurring);
  }

  getRecurring(id: string): RecurringJournal | undefined {
    return this.recurring.get(id);
  }

  getAllRecurring(): RecurringJournal[] {
    return [...this.recurring.values()];
  }

  getDueRecurring(): RecurringJournal[] {
    const now = new Date();
    return this.getAllRecurring().filter(
      (r) => r.isActive && r.nextRunDate <= now,
    );
  }

  count(): number {
    return this.journals.size;
  }
}
