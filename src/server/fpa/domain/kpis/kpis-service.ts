import type { FPAScorecard, FPAKPI, ScorecardType } from "../../types";

export class FPAScorecardService {
  private scorecards = new Map<string, FPAScorecard>();
  private kpis = new Map<string, FPAKPI>();

  addScorecard(s: FPAScorecard): void {
    this.scorecards.set(s.id, s);
  }

  getScorecard(id: string): FPAScorecard | undefined {
    return this.scorecards.get(id);
  }

  getAllScorecards(): FPAScorecard[] {
    return [...this.scorecards.values()];
  }

  getByType(type: ScorecardType): FPAScorecard[] {
    return this.getAllScorecards().filter((s) => s.type === type);
  }

  getByCompany(companyId: string): FPAScorecard[] {
    return this.getAllScorecards().filter((s) => s.companyId === companyId);
  }

  getByPeriod(period: string): FPAScorecard[] {
    return this.getAllScorecards().filter((s) => s.period === period);
  }

  addKPI(kpi: FPAKPI): void {
    this.kpis.set(kpi.id, kpi);
  }

  getKPI(id: string): FPAKPI | undefined {
    return this.kpis.get(id);
  }

  getAllKPIs(): FPAKPI[] {
    return [...this.kpis.values()];
  }

  count(): number {
    return this.scorecards.size + this.kpis.size;
  }
}
