import type { PostingBatch, PostingError, PostingStatus, PostingMode, JournalEntry } from "../types";

export class PostingService {
  private batches = new Map<string, PostingBatch>();
  private postedJournalIds = new Set<string>();

  addBatch(batch: PostingBatch): void {
    this.batches.set(batch.id, batch);
  }

  getBatch(id: string): PostingBatch | undefined {
    return this.batches.get(id);
  }

  getAllBatches(): PostingBatch[] {
    return [...this.batches.values()];
  }

  getBatchesByStatus(status: PostingStatus): PostingBatch[] {
    return this.getAllBatches().filter((b) => b.status === status);
  }

  getPendingBatches(): PostingBatch[] {
    return this.getBatchesByStatus("pending");
  }

  isJournalPosted(journalId: string): boolean {
    return this.postedJournalIds.has(journalId);
  }

  markPosted(journalId: string): void {
    this.postedJournalIds.add(journalId);
  }

  validateJournal(journal: JournalEntry): PostingError[] {
    const errors: PostingError[] = [];
    if (journal.lines.length === 0) {
      errors.push({
        journalId: journal.id,
        journalNumber: journal.journalNumber,
        code: "NO_LINES",
        message: "Journal has no lines",
      });
    }
    if (Math.abs(journal.totalDebit - journal.totalCredit) > 0.001) {
      errors.push({
        journalId: journal.id,
        journalNumber: journal.journalNumber,
        code: "UNBALANCED",
        message: `Debit ${journal.totalDebit} does not equal credit ${journal.totalCredit}`,
      });
    }
    if (this.isJournalPosted(journal.id)) {
      errors.push({
        journalId: journal.id,
        journalNumber: journal.journalNumber,
        code: "ALREADY_POSTED",
        message: "Journal has already been posted",
      });
    }
    return errors;
  }

  createBatch(
    id: string,
    name: string,
    mode: PostingMode,
    journalIds: string[],
    startedBy: string,
  ): PostingBatch {
    return {
      id,
      name,
      mode,
      journalIds,
      totalJournals: journalIds.length,
      postedJournals: 0,
      failedJournals: 0,
      status: "pending",
      startedBy,
      startedAt: new Date(),
      errors: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  count(): number {
    return this.postedJournalIds.size;
  }
}
