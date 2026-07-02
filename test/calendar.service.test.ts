import "dotenv/config";
import { describe, it, expect, afterAll } from "vitest";
import { CalendarService } from "@/modules/calendar/calendar.service";
import { createCompany, createUser, createMembership } from "../test/helpers/factories";
import { buildTenantContext, cleanup } from "../test/helpers/db";

afterAll(cleanup);

async function buildRealContext(companyId: string) {
  const user = await createUser();
  await createMembership(user.id, companyId, "ADMIN");
  return buildTenantContext(companyId, { userId: user.id, role: "ADMIN" });
}

describe("CalendarService", () => {
  describe("createEvent", () => {
    it("creates a calendar event", async () => {
      const company = await createCompany();
      const ctx = await buildRealContext(company.id);
      const event = await CalendarService.createEvent(ctx, {
        title: "Monthly close",
        type: "MANUAL",
        startDate: new Date("2026-07-01").toISOString(),
      });
      expect(event.title).toBe("Monthly close");
      expect(event.type).toBe("MANUAL");
      expect(event.status).toBe("SCHEDULED");
    });

    it("creates event with all fields", async () => {
      const company = await createCompany();
      const ctx = await buildRealContext(company.id);
      const event = await CalendarService.createEvent(ctx, {
        title: "Audit deadline",
        type: "AUDIT",
        description: "Annual audit",
        startDate: new Date("2026-12-01").toISOString(),
        endDate: new Date("2026-12-15").toISOString(),
        allDay: true,
        referenceType: "Manual",
        referenceId: "ref-1",
      });
      expect(event.description).toBe("Annual audit");
      expect(event.allDay).toBe(true);
      expect(event.referenceType).toBe("Manual");
    });
  });

  describe("listEvents", () => {
    it("returns events with cursor pagination", async () => {
      const company = await createCompany();
      const ctx = await buildRealContext(company.id);
      for (let i = 0; i < 3; i++) {
        await CalendarService.createEvent(ctx, {
          title: `Event ${i}`,
          type: "MANUAL",
          startDate: new Date(`2026-07-${10 + i}`).toISOString(),
        });
      }

      const page1 = await CalendarService.listEvents(ctx, { limit: 2 });
      expect(page1.items).toHaveLength(2);
      expect(page1.nextCursor).toBeDefined();

      const page2 = await CalendarService.listEvents(ctx, { limit: 2, cursor: page1.nextCursor });
      expect(page2.items).toHaveLength(1);
      expect(page2.nextCursor).toBeUndefined();
    });

    it("filters by type", async () => {
      const company = await createCompany();
      const ctx = await buildRealContext(company.id);
      await CalendarService.createEvent(ctx, { title: "A", type: "MANUAL", startDate: new Date().toISOString() });
      await CalendarService.createEvent(ctx, { title: "B", type: "AUDIT", startDate: new Date().toISOString() });

      const audits = await CalendarService.listEvents(ctx, { type: "AUDIT" });
      expect(audits.items).toHaveLength(1);
      expect(audits.items[0].title).toBe("B");
    });

    it("filters by date range", async () => {
      const company = await createCompany();
      const ctx = await buildRealContext(company.id);
      await CalendarService.createEvent(ctx, { title: "Old", type: "MANUAL", startDate: "2025-01-01T00:00:00.000Z" });
      await CalendarService.createEvent(ctx, { title: "New", type: "MANUAL", startDate: "2026-07-01T00:00:00.000Z" });

      const result = await CalendarService.listEvents(ctx, { from: "2026-01-01T00:00:00.000Z" });
      expect(result.items).toHaveLength(1);
      expect(result.items[0].title).toBe("New");
    });
  });

  describe("markComplete", () => {
    it("marks an event complete", async () => {
      const company = await createCompany();
      const ctx = await buildRealContext(company.id);
      const event = await CalendarService.createEvent(ctx, {
        title: "Do this", type: "MANUAL", startDate: new Date().toISOString(),
      });
      const completed = await CalendarService.markComplete(ctx, event.id);
      expect(completed).not.toBeNull();
      expect(completed!.status).toBe("COMPLETED");
    });

    it("returns null for missing event", async () => {
      const company = await createCompany();
      const ctx = await buildRealContext(company.id);
      const result = await CalendarService.markComplete(ctx, "nonexistent");
      expect(result).toBeNull();
    });
  });

  describe("autoGenerateEvents", () => {
    it("runs without error", async () => {
      const company = await createCompany();
      const ctx = await buildRealContext(company.id);
      await CalendarService.autoGenerateEvents(ctx);
      const events = await CalendarService.listEvents(ctx, {});
      expect(events.items).toBeDefined();
    });
  });
});
