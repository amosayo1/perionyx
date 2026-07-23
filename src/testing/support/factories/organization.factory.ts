import { createMockFactory } from "./factory";

export interface OrganizationMock {
  id: string;
  name: string;
  tenantId: string;
  industry: string;
  country: string;
  currency: string;
  createdAt: Date;
}

export const organizationFactory = createMockFactory<OrganizationMock>(() => ({
  id: `org_${Math.random().toString(36).slice(2, 10)}`,
  name: "Test Organization",
  tenantId: "tenant_001",
  industry: "finance",
  country: "US",
  currency: "USD",
  createdAt: new Date(),
}));
