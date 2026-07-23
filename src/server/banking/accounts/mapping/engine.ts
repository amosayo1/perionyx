import type { LegalEntityMapping } from "../types";

export class AccountMappingEngine {
  private mappings = new Map<string, LegalEntityMapping>();

  assignToLegalEntity(
    accountId: string,
    legalEntityId: string,
    legalEntityName: string,
    mappedBy: string,
    businessUnit?: { id: string; name: string },
    department?: { id: string; name: string },
  ): LegalEntityMapping {
    const mapping: LegalEntityMapping = {
      accountId,
      legalEntityId,
      legalEntityName,
      businessUnitId: businessUnit?.id,
      businessUnitName: businessUnit?.name,
      departmentId: department?.id,
      departmentName: department?.name,
      mappedAt: new Date().toISOString(),
      mappedBy,
    };

    this.mappings.set(accountId, mapping);
    return mapping;
  }

  getMapping(accountId: string): LegalEntityMapping | undefined {
    return this.mappings.get(accountId);
  }

  getAccountsByLegalEntity(legalEntityId: string): LegalEntityMapping[] {
    return Array.from(this.mappings.values()).filter(
      (m) => m.legalEntityId === legalEntityId,
    );
  }

  getAccountsByBusinessUnit(businessUnitId: string): LegalEntityMapping[] {
    return Array.from(this.mappings.values()).filter(
      (m) => m.businessUnitId === businessUnitId,
    );
  }

  getAccountsByDepartment(departmentId: string): LegalEntityMapping[] {
    return Array.from(this.mappings.values()).filter(
      (m) => m.departmentId === departmentId,
    );
  }

  getUnmappedAccounts(allAccountIds: string[]): string[] {
    return allAccountIds.filter((id) => !this.mappings.has(id));
  }

  updateMapping(accountId: string, updates: Partial<LegalEntityMapping>): LegalEntityMapping | undefined {
    const existing = this.mappings.get(accountId);
    if (!existing) return undefined;

    const updated = { ...existing, ...updates, mappedAt: new Date().toISOString() };
    this.mappings.set(accountId, updated);
    return updated;
  }

  removeMapping(accountId: string): void {
    this.mappings.delete(accountId);
  }

  clear(): void {
    this.mappings.clear();
  }

  getAllMappings(): LegalEntityMapping[] {
    return Array.from(this.mappings.values());
  }

  get total(): number {
    return this.mappings.size;
  }
}

export const accountMappingEngine = new AccountMappingEngine();