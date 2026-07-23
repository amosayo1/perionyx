import type {
  CreditRiskData,
  CounterpartyRiskData,
  CountryRiskData,
  ConcentrationRiskData,
  Counterparty,
} from "../types";

export class CreditRiskService {
  private creditData = new Map<string, CreditRiskData>();
  private counterpartyData = new Map<string, CounterpartyRiskData>();
  private countryData = new Map<string, CountryRiskData>();
  private concentrationData = new Map<string, ConcentrationRiskData>();
  private counterparties = new Map<string, Counterparty>();

  addCreditData(data: CreditRiskData): void {
    this.creditData.set(data.riskId, data);
  }

  getCreditData(riskId: string): CreditRiskData | undefined {
    return this.creditData.get(riskId);
  }

  getAllCreditData(): CreditRiskData[] {
    return [...this.creditData.values()];
  }

  addCounterpartyRiskData(data: CounterpartyRiskData): void {
    this.counterpartyData.set(data.riskId, data);
  }

  getCounterpartyRiskData(riskId: string): CounterpartyRiskData | undefined {
    return this.counterpartyData.get(riskId);
  }

  getAllCounterpartyRiskData(): CounterpartyRiskData[] {
    return [...this.counterpartyData.values()];
  }

  addCountryRiskData(data: CountryRiskData): void {
    this.countryData.set(data.riskId, data);
  }

  getCountryRiskData(riskId: string): CountryRiskData | undefined {
    return this.countryData.get(riskId);
  }

  getAllCountryRiskData(): CountryRiskData[] {
    return [...this.countryData.values()];
  }

  addConcentrationRiskData(data: ConcentrationRiskData): void {
    this.concentrationData.set(data.riskId, data);
  }

  getConcentrationRiskData(riskId: string): ConcentrationRiskData | undefined {
    return this.concentrationData.get(riskId);
  }

  getAllConcentrationRiskData(): ConcentrationRiskData[] {
    return [...this.concentrationData.values()];
  }

  addCounterparty(cp: Counterparty): void {
    this.counterparties.set(cp.id, cp);
  }

  getCounterparty(id: string): Counterparty | undefined {
    return this.counterparties.get(id);
  }

  getAllCounterparties(): Counterparty[] {
    return [...this.counterparties.values()];
  }

  getTotalCreditExposure(): number {
    return [...this.creditData.values()].reduce(
      (sum, d) => sum + d.exposure,
      0,
    );
  }

  getCreditUtilizationRate(): number {
    const items = this.creditData.values();
    let totalLimit = 0;
    let totalUtilized = 0;
    for (const d of items) {
      totalLimit += d.creditLimit;
      totalUtilized += d.creditUtilization;
    }
    return totalLimit > 0 ? totalUtilized / totalLimit : 0;
  }
}
