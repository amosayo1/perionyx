import { test, expect } from "@playwright/test";

test.describe("Demo bootstrap", () => {
  test("demo bootstrap API returns success", async ({ request }) => {
    const response = await request.post("/api/demo/bootstrap");
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.user.email).toBe("demo@perionyx.dev");
    expect(body.company.name).toBe("Demo Company");
  });

  test("health endpoint returns ok", async ({ request }) => {
    const response = await request.get("/api/v1/health");
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.status).toBe("healthy");
  });
});
