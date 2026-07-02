import crypto from "crypto";
import { prisma } from "@/server/db/prisma";
import type { TenantContext } from "@/server/context/tenant-context";

export class WebhookService {
  /**
   * Deliver an event to all active webhooks subscribed to it.
   */
  static async deliver(companyId: string, event: string, payload: Record<string, any>) {
    const webhooks = await prisma.webhook.findMany({
      where: { companyId, active: true, events: { has: event } },
    });

    for (const webhook of webhooks) {
      const body = JSON.stringify({
        event,
        companyId,
        createdAt: new Date().toISOString(),
        data: payload,
      });

      const signature = webhook.secret
        ? crypto.createHmac("sha256", webhook.secret).update(body).digest("hex")
        : null;

      try {
        const res = await fetch(webhook.url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(signature ? { "X-Perionyx-Signature": `sha256=${signature}` } : {}),
            "X-Perionyx-Event": event,
          },
          body,
        });

        await prisma.webhookDelivery.create({
          data: {
            webhookId: webhook.id,
            companyId,
            event,
            payload: payload as any,
            status: res.ok ? "DELIVERED" : "FAILED",
            lastError: res.ok ? null : `HTTP ${res.status}: ${res.statusText}`,
            nextAttemptAt: res.ok ? null : new Date(Date.now() + 60000),
            attempts: 1,
          },
        });
      } catch (err: any) {
        await prisma.webhookDelivery.create({
          data: {
            webhookId: webhook.id,
            companyId,
            event,
            payload: payload as any,
            status: "FAILED",
            lastError: err?.message ?? "Network error",
            nextAttemptAt: new Date(Date.now() + 60000),
            attempts: 1,
          },
        });
      }
    }
  }

  /**
   * CRUD for webhook configs.
   */
  static async list(ctx: TenantContext) {
    return prisma.webhook.findMany({
      where: { companyId: ctx.companyId },
      orderBy: { name: "asc" },
      include: { _count: { select: { deliveries: true } } },
    });
  }

  static async create(ctx: TenantContext, data: {
    name: string; url: string; events: string[]; secret?: string;
  }) {
    const wh = await prisma.webhook.create({
      data: {
        companyId: ctx.companyId,
        name: data.name,
        url: data.url,
        secret: data.secret,
        events: data.events,
      },
    });
    return wh;
  }

  static async update(ctx: TenantContext, webhookId: string, data: {
    name?: string; url?: string; events?: string[]; secret?: string; active?: boolean;
  }) {
    const existing = await prisma.webhook.findFirst({ where: { id: webhookId, companyId: ctx.companyId } });
    if (!existing) throw new Error("Webhook not found");
    return prisma.webhook.update({
      where: { id: webhookId },
      data: {
        ...(data.name !== undefined ? { name: data.name } : {}),
        ...(data.url !== undefined ? { url: data.url } : {}),
        ...(data.events !== undefined ? { events: data.events } : {}),
        ...(data.secret !== undefined ? { secret: data.secret } : {}),
        ...(data.active !== undefined ? { active: data.active } : {}),
      },
    });
  }

  static async delete(ctx: TenantContext, webhookId: string) {
    const existing = await prisma.webhook.findFirst({ where: { id: webhookId, companyId: ctx.companyId } });
    if (!existing) throw new Error("Webhook not found");
    await prisma.webhook.delete({ where: { id: webhookId } });
    return { success: true };
  }

  static async getDeliveries(ctx: TenantContext, webhookId: string, limit = 25) {
    return prisma.webhookDelivery.findMany({
      where: { webhookId, companyId: ctx.companyId },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  }

  /**
   * Retry a failed delivery.
   */
  static async retryDelivery(ctx: TenantContext, deliveryId: string) {
    const d = await prisma.webhookDelivery.findFirst({
      where: { id: deliveryId, companyId: ctx.companyId },
      include: { webhook: true },
    });
    if (!d || d.status !== "FAILED") throw new Error("Delivery not found or not failed");
    if (!d.webhook.active) throw new Error("Webhook is inactive");

    const body = JSON.stringify({
      event: d.event,
      companyId: ctx.companyId,
      data: d.payload,
    });

    const signature = d.webhook.secret
      ? crypto.createHmac("sha256", d.webhook.secret).update(body).digest("hex")
      : null;

    try {
      const res = await fetch(d.webhook.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(signature ? { "X-Perionyx-Signature": `sha256=${signature}` } : {}),
          "X-Perionyx-Event": d.event,
        },
        body,
      });

      await prisma.webhookDelivery.update({
        where: { id: deliveryId },
        data: {
          status: res.ok ? "DELIVERED" : "FAILED",
          lastError: res.ok ? null : `HTTP ${res.status}`,
          attempts: { increment: 1 },
          nextAttemptAt: res.ok ? null : new Date(Date.now() + 120000),
        },
      });
    } catch (err: any) {
      await prisma.webhookDelivery.update({
        where: { id: deliveryId },
        data: {
          status: "FAILED",
          lastError: err?.message ?? "Network error",
          attempts: { increment: 1 },
          nextAttemptAt: new Date(Date.now() + 120000),
        },
      });
    }

    return { success: true };
  }
}
