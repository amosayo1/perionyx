import type { CollectionCase, CollectionStatus } from "../../types";

export class CollectionsService {
  private cases = new Map<string, CollectionCase>();

  addCase(c: CollectionCase): CollectionCase {
    this.cases.set(c.id, c);
    return c;
  }

  getCase(id: string): CollectionCase | undefined {
    return this.cases.get(id);
  }

  getAllCases(): CollectionCase[] {
    return Array.from(this.cases.values());
  }

  getByStatus(status: CollectionStatus): CollectionCase[] {
    return this.getAllCases().filter(c => c.status === status);
  }

  getByCustomer(customerId: string): CollectionCase[] {
    return this.getAllCases().filter(c => c.customerId === customerId);
  }

  getByAssignee(assignee: string): CollectionCase[] {
    return this.getAllCases().filter(c => c.assignee === assignee);
  }

  getActive(): CollectionCase[] {
    return this.getAllCases().filter(c => c.status === "active" || c.status === "escalated");
  }

  count(): number {
    return this.cases.size;
  }
}
