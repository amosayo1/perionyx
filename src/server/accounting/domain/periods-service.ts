import type { AccountingPeriod, FiscalYear, CloseProcess, CloseStep, PeriodStatus, CloseType } from "../types";

export class PeriodsService {
  private periods = new Map<string, AccountingPeriod>();
  private fiscalYears = new Map<string, FiscalYear>();
  private closeProcesses = new Map<string, CloseProcess>();

  addPeriod(period: AccountingPeriod): void {
    this.periods.set(period.id, period);
  }

  getPeriod(id: string): AccountingPeriod | undefined {
    return this.periods.get(id);
  }

  getAllPeriods(): AccountingPeriod[] {
    return [...this.periods.values()];
  }

  getPeriodsByStatus(status: PeriodStatus): AccountingPeriod[] {
    return this.getAllPeriods().filter((p) => p.status === status);
  }

  getOpenPeriods(): AccountingPeriod[] {
    return this.getPeriodsByStatus("open");
  }

  addFiscalYear(fy: FiscalYear): void {
    this.fiscalYears.set(fy.id, fy);
  }

  getFiscalYear(id: string): FiscalYear | undefined {
    return this.fiscalYears.get(id);
  }

  getAllFiscalYears(): FiscalYear[] {
    return [...this.fiscalYears.values()];
  }

  addCloseProcess(cp: CloseProcess): void {
    this.closeProcesses.set(cp.id, cp);
  }

  getCloseProcess(id: string): CloseProcess | undefined {
    return this.closeProcesses.get(id);
  }

  getAllCloseProcesses(): CloseProcess[] {
    return [...this.closeProcesses.values()];
  }

  getCloseProcessesByPeriod(periodId: string): CloseProcess[] {
    return this.getAllCloseProcesses().filter((cp) => cp.periodId === periodId);
  }

  countPeriods(): number {
    return this.periods.size;
  }

  countFiscalYears(): number {
    return this.fiscalYears.size;
  }
}
