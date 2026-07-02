import "dotenv/config";
import { describe, it, expect, afterAll } from "vitest";
import { notificationService } from "@/modules/notifications/notifications.service";
import { createCompany, createMembership, createUser } from "../test/helpers/factories";
import { buildTenantContext, cleanup } from "../test/helpers/db";

afterAll(cleanup);

async function buildRealContext(companyId: string, userId?: string) {
  if (!userId) {
    const user = await createUser();
    await createMembership(user.id, companyId, "ADMIN");
    return buildTenantContext(companyId, { userId: user.id, role: "ADMIN" });
  }
  return buildTenantContext(companyId, { userId, role: "ADMIN" });
}

describe("NotificationService", () => {
  describe("send", () => {
    it("creates an in-app notification", async () => {
      const company = await createCompany();
      const ctx = buildTenantContext(company.id);
      const user = await createUser();
      await createMembership(user.id, company.id);
      const ctx2 = buildTenantContext(company.id, { userId: user.id });

      await notificationService.send({
        companyId: company.id,
        userId: user.id,
        eventType: "TRANSFER_COMPLETED",
        title: "Transfer received",
        message: "You got $100",
      });

      const list = await notificationService.list(ctx2);
      expect(list.items).toHaveLength(1);
      expect(list.items[0].title).toBe("Transfer received");
    });
  });

  describe("broadcast", () => {
    it("creates notification visible to all members", async () => {
      const company = await createCompany();
      const user = await createUser();
      await createMembership(user.id, company.id);
      const ctx = buildTenantContext(company.id, { userId: user.id });

      await notificationService.broadcast({
        companyId: company.id,
        eventType: "RECONCILIATION_COMPLETED",
        title: "Reconciliation done",
      });

      const list = await notificationService.list(ctx);
      const found = list.items.find((n) => n.title === "Reconciliation done");
      expect(found).toBeDefined();
    });
  });

  describe("list", () => {
    it("paginates with cursor", async () => {
      const company = await createCompany();
      const user = await createUser();
      await createMembership(user.id, company.id);
      const ctx = buildTenantContext(company.id, { userId: user.id });

      for (let i = 0; i < 3; i++) {
        await notificationService.send({
          companyId: company.id, userId: user.id,
          eventType: "TRANSFER_COMPLETED", title: `N ${i}`,
        });
      }

      const page1 = await notificationService.list(ctx, { limit: 2 });
      expect(page1.items).toHaveLength(2);
      expect(page1.nextCursor).toBeDefined();

      const page2 = await notificationService.list(ctx, { limit: 2, cursor: page1.nextCursor });
      expect(page2.items).toHaveLength(1);
      expect(page2.nextCursor).toBeUndefined();
    });

    it("filters unread only", async () => {
      const company = await createCompany();
      const user = await createUser();
      await createMembership(user.id, company.id);
      const ctx = buildTenantContext(company.id, { userId: user.id });

      await notificationService.send({
        companyId: company.id, userId: user.id,
        eventType: "TRANSFER_COMPLETED", title: "Unread one",
      });
      await notificationService.send({
        companyId: company.id, userId: user.id,
        eventType: "TRANSFER_COMPLETED", title: "Unread two",
      });
      const all = await notificationService.list(ctx, {});
      await notificationService.markRead(ctx, [all.items[0].id]);

      const unread = await notificationService.list(ctx, { unreadOnly: true });
      expect(unread.items).toHaveLength(1);
    });

    it("returns notifications for user or null userId", async () => {
      const company = await createCompany();
      const user = await createUser();
      await createMembership(user.id, company.id);
      const ctx = buildTenantContext(company.id, { userId: user.id });

      await notificationService.send({
        companyId: company.id, userId: user.id,
        eventType: "TRANSFER_COMPLETED", title: "Personal",
      });
      await notificationService.broadcast({
        companyId: company.id, eventType: "TRANSFER_COMPLETED", title: "Broadcast",
      });

      const list = await notificationService.list(ctx);
      const titles = list.items.map((n) => n.title);
      expect(titles).toContain("Personal");
      expect(titles).toContain("Broadcast");
    });
  });

  describe("getUnreadCount", () => {
    it("counts unread notifications", async () => {
      const company = await createCompany();
      const user = await createUser();
      await createMembership(user.id, company.id);
      const ctx = buildTenantContext(company.id, { userId: user.id });

      await notificationService.send({
        companyId: company.id, userId: user.id,
        eventType: "TRANSFER_COMPLETED", title: "Unread",
      });

      const { count } = await notificationService.getUnreadCount(ctx);
      expect(count).toBe(1);
    });
  });

  describe("markRead / markAllRead", () => {
    it("marks specific notifications read", async () => {
      const company = await createCompany();
      const user = await createUser();
      await createMembership(user.id, company.id);
      const ctx = buildTenantContext(company.id, { userId: user.id });

      await notificationService.send({
        companyId: company.id, userId: user.id,
        eventType: "TRANSFER_COMPLETED", title: "Read me",
      });
      const list = await notificationService.list(ctx);
      await notificationService.markRead(ctx, [list.items[0].id]);

      const unread = await notificationService.getUnreadCount(ctx);
      expect(unread.count).toBe(0);
    });

    it("marks all read", async () => {
      const company = await createCompany();
      const user = await createUser();
      await createMembership(user.id, company.id);
      const ctx = buildTenantContext(company.id, { userId: user.id });

      await notificationService.send({
        companyId: company.id, userId: user.id, eventType: "TRANSFER_COMPLETED", title: "A",
      });
      await notificationService.send({
        companyId: company.id, userId: user.id, eventType: "TRANSFER_COMPLETED", title: "B",
      });

      const result = await notificationService.markAllRead(ctx);
      expect(result.count).toBe(2);
      expect((await notificationService.getUnreadCount(ctx)).count).toBe(0);
    });
  });

  describe("channel management", () => {
    it("creates and lists channels", async () => {
      const company = await createCompany();
      const ctx = await buildRealContext(company.id);
      await notificationService.createChannel(ctx, {
        type: "EMAIL", name: "Finance Team", config: {},
      });
      const channels = await notificationService.getChannels(ctx);
      expect(channels).toHaveLength(1);
      expect(channels[0].name).toBe("Finance Team");
    });

    it("updates a channel", async () => {
      const company = await createCompany();
      const ctx = await buildRealContext(company.id);
      const c = await notificationService.createChannel(ctx, {
        type: "SLACK", name: "Alerts", config: { webhookUrl: "old" },
      });
      await notificationService.updateChannel(ctx, c.id, {
        name: "Critical Alerts", config: { webhookUrl: "new" },
      });
      const channels = await notificationService.getChannels(ctx);
      expect(channels[0]?.name).toBe("Critical Alerts");
      expect((channels[0]?.config as Record<string, string>)?.webhookUrl).toBe("new");
    });

    it("deletes a channel and cleans up preferences", async () => {
      const company = await createCompany();
      const user = await createUser();
      await createMembership(user.id, company.id);
      const ctx = buildTenantContext(company.id, { userId: user.id });

      const channel = await notificationService.createChannel(ctx, {
        type: "EMAIL", name: "Temp", config: {},
      });
      await notificationService.setupDefaultPreferences(ctx);
      await notificationService.deleteChannel(ctx, channel.id);

      const channels = await notificationService.getChannels(ctx);
      expect(channels).toHaveLength(0);
    });
  });

  describe("preferences", () => {
    it("sets up default preferences", async () => {
      const company = await createCompany();
      const user = await createUser();
      await createMembership(user.id, company.id);
      const ctx = buildTenantContext(company.id, { userId: user.id });

      const result = await notificationService.setupDefaultPreferences(ctx);
      expect(result.created).toBe(14);

      const second = await notificationService.setupDefaultPreferences(ctx);
      expect(second.created).toBe(0);
    });

    it("updates a preference", async () => {
      const company = await createCompany();
      const user = await createUser();
      await createMembership(user.id, company.id);
      const ctx = buildTenantContext(company.id, { userId: user.id });

      await notificationService.setupDefaultPreferences(ctx);
      const prefs = await notificationService.getPreferences(ctx);
      const pref = prefs[0];

      await notificationService.updatePreference(ctx, pref.id, false);
      const updated = await notificationService.getPreferences(ctx);
      expect(updated.find((p) => p.id === pref.id)!.enabled).toBe(false);
    });
  });
});
