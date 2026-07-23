import type { Journal, JournalEntry, JournalSource, PostingStatus } from "../../types";

export class JournalService {
  private journals = new Map<string, Journal>();
  private entries = new Map<string, JournalEntry[]>();

  createJournal(journal: Journal): Journal {
    this.journals.set(journal.id, journal);
    this.entries.set(journal.id, []);
    return journal;
  }

  getJournal(id: string): Journal | undefined {
    return this.journals.get(id);
  }

  getAllJournals(): Journal[] {
    return Array.from(this.journals.values());
  }

  updateJournal(id: string, update: Partial<Journal>): Journal | undefined {
    const existing = this.journals.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...update, updatedAt: new Date() };
    this.journals.set(id, updated);
    return updated;
  }

  deleteJournal(id: string): boolean {
    this.entries.delete(id);
    return this.journals.delete(id);
  }

  getBySource(source: JournalSource): Journal[] {
    return this.getAllJournals().filter(j => j.source === source);
  }

  getByStatus(status: PostingStatus): Journal[] {
    return this.getAllJournals().filter(j => j.status === status);
  }

  getByPeriod(periodId: string): Journal[] {
    return this.getAllJournals().filter(j => j.periodId === periodId);
  }

  getPendingApproval(): Journal[] {
    return this.getAllJournals().filter(j => j.status === "draft");
  }

  addEntry(entry: JournalEntry): JournalEntry {
    const existing = this.entries.get(entry.journalId) || [];
    existing.push(entry);
    this.entries.set(entry.journalId, existing);
    return entry;
  }

  getEntries(journalId: string): JournalEntry[] {
    return this.entries.get(journalId) || [];
  }

  getAllEntries(): JournalEntry[] {
    return Array.from(this.entries.values()).flat();
  }

  getEntriesByAccount(accountId: string): JournalEntry[] {
    return this.getAllEntries().filter(e => e.accountId === accountId);
  }

  getEntriesByPeriod(periodId: string): JournalEntry[] {
    const periodJournals = this.getByPeriod(periodId);
    const ids = new Set(periodJournals.map(j => j.id));
    return this.getAllEntries().filter(e => ids.has(e.journalId));
  }

  count(): number {
    return this.journals.size;
  }

  countEntries(): number {
    return this.getAllEntries().length;
  }

  getTotalDebit(journalId: string): number {
    return this.getEntries(journalId).reduce((s, e) => s + e.debit, 0);
  }

  getTotalCredit(journalId: string): number {
    return this.getEntries(journalId).reduce((s, e) => s + e.credit, 0);
  }

  isBalanced(journalId: string): boolean {
    return Math.abs(this.getTotalDebit(journalId) - this.getTotalCredit(journalId)) < 0.001;
  }
}
