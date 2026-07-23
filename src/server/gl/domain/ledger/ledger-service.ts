import type { Ledger, LedgerBalance, AccountBalance } from "../../types";

export class LedgerService {
  private ledgers = new Map<string, Ledger>();
  private ledgerBalances = new Map<string, LedgerBalance>();
  private accountBalances = new Map<string, AccountBalance>();

  createLedger(ledger: Ledger): Ledger {
    this.ledgers.set(ledger.id, ledger);
    return ledger;
  }

  getLedger(id: string): Ledger | undefined {
    return this.ledgers.get(id);
  }

  getAllLedgers(): Ledger[] {
    return Array.from(this.ledgers.values());
  }

  updateLedgerBalance(balance: LedgerBalance): LedgerBalance {
    const key = `${balance.ledgerId}-${balance.periodId}`;
    this.ledgerBalances.set(key, balance);
    return balance;
  }

  getLedgerBalance(ledgerId: string, periodId: string): LedgerBalance | undefined {
    return this.ledgerBalances.get(`${ledgerId}-${periodId}`);
  }

  getAllLedgerBalances(): LedgerBalance[] {
    return Array.from(this.ledgerBalances.values());
  }

  updateAccountBalance(balance: AccountBalance): AccountBalance {
    const key = `${balance.accountId}-${balance.periodId}`;
    this.accountBalances.set(key, balance);
    return balance;
  }

  getAccountBalance(accountId: string, periodId: string): AccountBalance | undefined {
    return this.accountBalances.get(`${accountId}-${periodId}`);
  }

  getAllAccountBalances(): AccountBalance[] {
    return Array.from(this.accountBalances.values());
  }

  getAccountBalancesByPeriod(periodId: string): AccountBalance[] {
    return this.getAllAccountBalances().filter(b => b.periodId === periodId);
  }

  count(): number {
    return this.ledgers.size;
  }

  countBalances(): number {
    return this.ledgerBalances.size;
  }

  countAccountBalances(): number {
    return this.accountBalances.size;
  }
}
