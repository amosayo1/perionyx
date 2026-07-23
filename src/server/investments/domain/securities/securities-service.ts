import type { Security, Issuer, SecurityType, CreditRating, Region } from "../../types";

export class SecuritiesService {
  private securities: Map<string, Security> = new Map();
  private issuers: Map<string, Issuer> = new Map();

  addSecurity(security: Security): void {
    this.securities.set(security.id, security);
  }

  getSecurity(id: string): Security | undefined {
    return this.securities.get(id);
  }

  getAllSecurities(): Security[] {
    return [...this.securities.values()];
  }

  getSecuritiesByType(type: SecurityType): Security[] {
    return this.getAllSecurities().filter((s) => s.securityType === type);
  }

  getSecuritiesByIssuer(issuerId: string): Security[] {
    return this.getAllSecurities().filter((s) => s.issuerId === issuerId);
  }

  getSecuritiesByRating(rating: CreditRating): Security[] {
    return this.getAllSecurities().filter((s) => s.creditRating === rating);
  }

  addIssuer(issuer: Issuer): void {
    this.issuers.set(issuer.id, issuer);
  }

  getIssuer(id: string): Issuer | undefined {
    return this.issuers.get(id);
  }

  getAllIssuers(): Issuer[] {
    return [...this.issuers.values()];
  }

  search(query: string): Security[] {
    const q = query.toLowerCase();
    return this.getAllSecurities().filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.isin?.toLowerCase().includes(q) ||
        s.cusip?.toLowerCase().includes(q) ||
        s.ticker?.toLowerCase().includes(q) ||
        s.issuer.toLowerCase().includes(q),
    );
  }

  getByCountry(country: string): Security[] {
    return this.getAllSecurities().filter((s) => s.country === country);
  }

  getByRegion(region: Region): Security[] {
    return this.getAllSecurities().filter((s) => s.region === region);
  }
}
