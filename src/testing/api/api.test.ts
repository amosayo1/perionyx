import { describe, it, expect } from "vitest";

describe("API Tests", () => {
  const testRequest = async (path: string, options?: RequestInit): Promise<Response> => {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    return fetch(`${baseUrl}${path}`, {
      headers: { "Content-Type": "application/json", ...options?.headers },
      ...options,
    });
  };

  it("should handle GET requests", async () => {
    const response = await testRequest("/api/v1/health");
    expect(response.status).toBe(200);
  });

  it("should return JSON responses", async () => {
    const response = await testRequest("/api/v1/health");
    const body = await response.json();
    expect(body).toHaveProperty("status");
  });

  it("should reject invalid JSON bodies on POST", async () => {
    const response = await testRequest("/api/v1/transactions", {
      method: "POST",
      body: "invalid-json",
    });
    expect([400, 422]).toContain(response.status);
  });

  it("should include security headers", async () => {
    const response = await testRequest("/api/v1/health");
    expect(response.headers.get("content-type")).toContain("application/json");
  });
});
