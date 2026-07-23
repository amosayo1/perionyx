import type { SubLedger, SubLedgerType } from "../../types";

export class SubLedgerService {
  private subledgers = new Map<string, SubLedger>();

  createSubLedger(subledger: SubLedger): SubLedger {
    this.subledgers.set(subledger.id, subledger);
    return subledger;
  }

  getSubLedger(id: string): SubLedger | undefined {
    return this.subledgers.get(id);
  }

  getAllSubLedgers(): SubLedger[] {
    return Array.from(this.subledgers.values());
  }

  getByType(type: SubLedgerType): SubLedger[] {
    return this.getAllSubLedgers().filter(s => s.type === type);
  }

  getByLedger(ledgerId: string): SubLedger[] {
    return this.getAllSubLedgers().filter(s => s.ledgerId === ledgerId);
  }

  count(): number {
    return this.subledgers.size;
  }
}
