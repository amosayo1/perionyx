import type { TaxJurisdiction, TaxAuthority, TaxRegistration, TaxJurisdictionLevel, TaxType } from "../../types";

export class JurisdictionService {
  private jurisdictions = new Map<string, TaxJurisdiction>();
  private authorities = new Map<string, TaxAuthority>();
  private registrations = new Map<string, TaxRegistration>();

  addJurisdiction(jurisdiction: TaxJurisdiction): TaxJurisdiction {
    this.jurisdictions.set(jurisdiction.id, jurisdiction);
    return jurisdiction;
  }

  getJurisdiction(id: string): TaxJurisdiction | undefined {
    return this.jurisdictions.get(id);
  }

  getAllJurisdictions(): TaxJurisdiction[] {
    return Array.from(this.jurisdictions.values());
  }

  getByLevel(level: TaxJurisdictionLevel): TaxJurisdiction[] {
    return this.getAllJurisdictions().filter(j => j.level === level);
  }

  getByCountry(country: string): TaxJurisdiction[] {
    return this.getAllJurisdictions().filter(j => j.country === country);
  }

  getByTaxType(taxType: TaxType): TaxJurisdiction[] {
    return this.getAllJurisdictions().filter(j => j.taxTypes.includes(taxType));
  }

  getActive(): TaxJurisdiction[] {
    return this.getAllJurisdictions().filter(j => j.isActive);
  }

  search(query: string): TaxJurisdiction[] {
    const q = query.toLowerCase();
    return this.getAllJurisdictions().filter(j =>
      j.country.toLowerCase().includes(q) ||
      (j.state && j.state.toLowerCase().includes(q)) ||
      (j.region && j.region.toLowerCase().includes(q)) ||
      (j.city && j.city.toLowerCase().includes(q))
    );
  }

  count(): number {
    return this.jurisdictions.size;
  }

  addAuthority(authority: TaxAuthority): TaxAuthority {
    this.authorities.set(authority.id, authority);
    return authority;
  }

  getAuthority(id: string): TaxAuthority | undefined {
    return this.authorities.get(id);
  }

  getByJurisdiction(jurisdictionId: string): (TaxJurisdiction | TaxAuthority | TaxRegistration)[] {
    return [
      ...this.getAllJurisdictions().filter(j => j.id === jurisdictionId),
      ...this.authorities.values().filter(a => a.jurisdictionId === jurisdictionId),
      ...this.registrations.values().filter(r => r.jurisdictionId === jurisdictionId),
    ];
  }

  getAllAuthorities(): TaxAuthority[] {
    return Array.from(this.authorities.values());
  }

  addRegistration(registration: TaxRegistration): TaxRegistration {
    this.registrations.set(registration.id, registration);
    return registration;
  }

  getRegistration(id: string): TaxRegistration | undefined {
    return this.registrations.get(id);
  }

  getRegistrationsByJurisdiction(jurisdictionId: string): TaxRegistration[] {
    return Array.from(this.registrations.values()).filter(r => r.jurisdictionId === jurisdictionId);
  }

  getAllRegistrations(): TaxRegistration[] {
    return Array.from(this.registrations.values());
  }

  countRegistrations(): number {
    return this.registrations.size;
  }
}
