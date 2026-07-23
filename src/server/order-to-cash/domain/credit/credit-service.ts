import type { CreditProfile, CustomerRiskRating, CreditDecision } from "../../types";

export class CreditService {
  private profiles = new Map<string, CreditProfile>();

  addProfile(profile: CreditProfile): CreditProfile {
    this.profiles.set(profile.id, profile);
    return profile;
  }

  getProfile(id: string): CreditProfile | undefined {
    return this.profiles.get(id);
  }

  getAllProfiles(): CreditProfile[] {
    return Array.from(this.profiles.values());
  }

  getByCustomer(customerId: string): CreditProfile | undefined {
    return this.getAllProfiles().find(p => p.customerId === customerId);
  }

  getByRiskRating(riskRating: CustomerRiskRating): CreditProfile[] {
    return this.getAllProfiles().filter(p => p.riskRating === riskRating);
  }

  getOnHold(): CreditProfile[] {
    return this.getAllProfiles().filter(p => p.onHold);
  }

  getByDecision(decision: CreditDecision): CreditProfile[] {
    return this.getAllProfiles().filter(p => p.decision === decision);
  }

  count(): number {
    return this.profiles.size;
  }
}
