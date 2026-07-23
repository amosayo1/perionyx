import type { Contract, ContractStatus, ContractType } from "../../types";

export class O2CContractService {
  private contracts = new Map<string, Contract>();

  addContract(contract: Contract): Contract {
    this.contracts.set(contract.id, contract);
    return contract;
  }

  getContract(id: string): Contract | undefined {
    return this.contracts.get(id);
  }

  getAllContracts(): Contract[] {
    return Array.from(this.contracts.values());
  }

  getByStatus(status: ContractStatus): Contract[] {
    return this.getAllContracts().filter(c => c.status === status);
  }

  getByCustomer(customerId: string): Contract[] {
    return this.getAllContracts().filter(c => c.customerId === customerId);
  }

  getByType(type: ContractType): Contract[] {
    return this.getAllContracts().filter(c => c.type === type);
  }

  getExpiring(days: number = 30): Contract[] {
    const now = Date.now();
    const future = now + days * 86400000;
    return this.getAllContracts().filter(c => {
      if (!c.renewalDate) return false;
      const t = c.renewalDate.getTime();
      return t >= now && t <= future && c.status === "active";
    });
  }

  getActive(): Contract[] {
    return this.getAllContracts().filter(c => c.status === "active");
  }

  count(): number {
    return this.contracts.size;
  }
}
