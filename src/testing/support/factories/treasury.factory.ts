import { createMockFactory } from "./factory";

export interface TreasuryAccountMock {
  id: string;
  accountNumber: string;
  accountName: string;
  currency: string;
  balance: number;
  status: string;
  tenantId: string;
}

export const treasuryAccountFactory = createMockFactory<TreasuryAccountMock>(() => ({
  id: `acc_${Math.random().toString(36).slice(2, 10)}`,
  accountNumber: `ACC${Date.now()}`,
  accountName: "Test Account",
  currency: "USD",
  balance: 1000000,
  status: "active",
  tenantId: "tenant_001",
}));
