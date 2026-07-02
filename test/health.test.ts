import "dotenv/config";
import { describe, it, expect, afterAll } from "vitest";
import { prisma } from "../src/server/db/prisma";

describe("Health check", () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("validates environment returns expected structure", async () => {
    const { validateEnv } = await import("../src/server/env/validate");
    const result = validateEnv();
    expect(result).toHaveProperty("ok");
    expect(result).toHaveProperty("missing");
    expect(result).toHaveProperty("warnings");
    expect(Array.isArray(result.missing)).toBe(true);
    expect(Array.isArray(result.warnings)).toBe(true);
  });

  it("can connect to the database", async () => {
    const result = await prisma.$queryRaw`SELECT 1 as ok`;
    expect(result).toBeDefined();
  });
});
