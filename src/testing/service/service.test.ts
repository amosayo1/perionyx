import { describe, it, expect } from "vitest";
import { createMockFactory } from "../support/factories/factory";

interface ServiceMock {
  id: string;
  name: string;
  version: string;
  config: Record<string, unknown>;
}

describe("Service Tests", () => {
  const serviceFactory = createMockFactory<ServiceMock>(() => ({
    id: "svc_001",
    name: "TestService",
    version: "1.0.0",
    config: { enabled: true, timeout: 5000 },
  }));

  it("should create service with overrides", () => {
    const service = serviceFactory.create({ version: "2.0.0" });
    expect(service.version).toBe("2.0.0");
    expect(service.name).toBe("TestService");
  });

  it("should create multiple services", () => {
    const services = serviceFactory.createMany(3);
    expect(services).toHaveLength(3);
  });

  it("should validate service configuration", () => {
    const service = serviceFactory.create();
    expect(service.config).toHaveProperty("enabled");
    expect(service.config).toHaveProperty("timeout");
  });
});
