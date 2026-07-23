import type { IntercompanyJournal } from "../types";

export class IntercompanyService {
  private journals = new Map<string, IntercompanyJournal>();

  addJournal(ic: IntercompanyJournal): void {
    this.journals.set(ic.id, ic);
  }

  getJournal(id: string): IntercompanyJournal | undefined {
    return this.journals.get(id);
  }

  getAllJournals(): IntercompanyJournal[] {
    return [...this.journals.values()];
  }

  getByFromCompany(companyId: string): IntercompanyJournal[] {
    return this.getAllJournals().filter((j) => j.fromCompanyId === companyId);
  }

  getByToCompany(companyId: string): IntercompanyJournal[] {
    return this.getAllJournals().filter((j) => j.toCompanyId === companyId);
  }

  getByStatus(status: string): IntercompanyJournal[] {
    return this.getAllJournals().filter((j) => j.status === status);
  }

  getUnsettled(): IntercompanyJournal[] {
    return this.getAllJournals().filter((j) => j.status !== "settled");
  }

  count(): number {
    return this.journals.size;
  }
}
