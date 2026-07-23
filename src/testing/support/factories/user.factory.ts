import { createMockFactory } from "./factory";

export interface UserMock {
  id: string;
  email: string;
  name: string;
  tenantId: string;
  role: string;
  isActive: boolean;
  createdAt: Date;
}

export const userFactory = createMockFactory<UserMock>(() => ({
  id: `user_${Math.random().toString(36).slice(2, 10)}`,
  email: `user${Date.now()}@example.com`,
  name: "Test User",
  tenantId: "tenant_001",
  role: "admin",
  isActive: true,
  createdAt: new Date(),
}));
