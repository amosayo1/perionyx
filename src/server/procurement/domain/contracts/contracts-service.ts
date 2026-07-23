import type { Contract, ContractStatus } from "../../types";

export class ContractService {
  private contracts = new Map<string, Contract>();
  private contractCounter = 0;

  addContract(contract: Contract): void {
    this.contracts.set(contract.id, contract);
  }

  getContract(id: string): Contract | undefined {
    return this.contracts.get(id);
  }

  getAllContracts(): Contract[] {
    return [...this.contracts.values()];
  }

  getByStatus(status: ContractStatus): Contract[] {
    return this.getAllContracts().filter((c) => c.status === status);
  }

  getByVendor(vendorId: string): Contract[] {
    return this.getAllContracts().filter((c) => c.vendorId === vendorId);
  }

  getByCompany(companyId: string): Contract[] {
    return this.getAllContracts().filter((c) => c.companyId === companyId);
  }

  getExpiring(days: number = 30): Contract[] {
    const future = new Date(Date.now() + days * 86400000);
    return this.getAllContracts().filter(
      (c) => c.status === "active" && c.endDate <= future,
    );
  }

  getActive(): Contract[] {
    return this.getByStatus("active");
  }

  generateContractNumber(): string {
    this.contractCounter++;
    const ts = Date.now().toString(36).toUpperCase();
    return `CTR-${ts}-${String(this.contractCounter).padStart(5, "0")}`;
  }

  count(): number {
    return this.contracts.size;
  }
}
