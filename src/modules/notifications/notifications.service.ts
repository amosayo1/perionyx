import { prisma as defaultPrisma } from "@/server/db/prisma";
import type { TenantContext } from "@/server/context/tenant-context";
import { recordAudit } from "@/modules/audit";
import { sendInApp } from "./channels/in-app";
import { enqueue } from "@/modules/queue/queue.service";
import { enqueueEmailDelivery, enqueueSlackDelivery } from "@/modules/queue/jobs/notification-delivery.job";
import { logger } from "@/lib/logger";
import { emitRealtimeEvent } from "@/server/realtime";
import { RealtimeEvents, RealtimeChannels } from "@/server/realtime";
import type { DbClient } from "@/lib/db/types";

export type NotificationEventType =
  | "APPROVAL_REQUIRED"
  | "APPROVAL_COMPLETED"
  | "APPROVAL_REJECTED"
  | "RISK_ALERT_CREATED"
  | "RISK_ALERT_RESOLVED"
  | "RECONCILIATION_COMPLETED"
  | "RECONCILIATION_FAILED"
  | "POLICY_VIOLATION"
  | "CONNECTOR_FAILURE"
  | "TRANSFER_COMPLETED"
  | "TRANSFER_FAILED"
  | "CALENDAR_EVENT_REMINDER"
  | "PLAID_SYNC_FAILED"
  | "PLAID_ACCOUNT_LINKED"
  | "PLAID_ACCOUNT_UNLINKED";

export type SendNotificationInput = {
  companyId: string;
  userId?: string | null;
  eventType: NotificationEventType;
  title: string;
  message?: string;
  metadata?: Record<string, any>;
  link?: string;
};

export class NotificationService {
  constructor(private prisma: DbClient = defaultPrisma) {}

  async send(input: SendNotificationInput) {
    const notification = await sendInApp({
      companyId: input.companyId,
      userId: input.userId,
      eventType: input.eventType as any,
      title: input.title,
      message: input.message ?? null,
      metadata: input.metadata ?? null,
      link: input.link ?? null,
    });

    void enqueue("webhook-send", {
      companyId: input.companyId,
      eventType: input.eventType,
      payload: {
        title: input.title,
        message: input.message,
        link: input.link,
        metadata: input.metadata,
        userId: input.userId,
      },
    }, {
      retryLimit: 3,
      retryDelay: 60,
      retryBackoff: true,
      expireInSeconds: 600,
    });

    if (input.userId) {
      await this.sendViaExternalChannels(input);
    }

    // Push real-time event to connected clients
    if (input.userId) {
      emitRealtimeEvent(
        input.companyId,
        RealtimeChannels.NOTIFICATION,
        RealtimeEvents.NOTIFICATION_NEW,
        {
          notificationId: notification.id,
          type: input.eventType,
          title: input.title,
          userId: input.userId,
        },
      );
    }
  }

  private async sendViaExternalChannels(input: SendNotificationInput) {
    const prefs = await this.prisma.notificationPreference.findMany({
      where: {
        userId: input.userId!,
        companyId: input.companyId,
        eventType: input.eventType as any,
        enabled: true,
        channelId: { not: null },
      },
      include: { channel: true },
    });

    for (const pref of prefs) {
      if (!pref.channel?.isActive) continue;

      try {
        if (pref.channel.type === "EMAIL") {
          const user = await this.prisma.user.findUnique({ where: { id: input.userId! } });
          if (user?.email) {
            void enqueueEmailDelivery({
              companyId: input.companyId,
              userId: input.userId!,
              to: user.email,
              subject: `[Perionyx] ${input.title}`,
              text: input.message ?? input.title,
            });
          }
        } else if (pref.channel.type === "SLACK") {
          const config = pref.channel.config as Record<string, any>;
          if (config.webhookUrl) {
            void enqueueSlackDelivery({
              companyId: input.companyId,
              userId: input.userId!,
              webhookUrl: config.webhookUrl,
              title: input.title,
              text: input.message ?? input.title,
              metadata: input.metadata,
            });
          }
        } else if (pref.channel.type === "SLACK_CONNECTOR" || pref.channel.type === "TEAMS_CONNECTOR") {
          const config = pref.channel.config as Record<string, any>;
          if (config.connectorId && config.channelId) {
            void enqueue("notification-connector-deliver", {
              connectorId: config.connectorId,
              companyId: input.companyId,
              channelId: config.channelId,
              channelType: pref.channel.type === "SLACK_CONNECTOR" ? "slack" : "teams",
              title: input.title,
              message: input.message,
              eventType: input.eventType,
              metadata: input.metadata,
              link: input.link,
              recipientUserId: input.userId,
            }, {
              retryLimit: 3,
              retryDelay: 60,
              retryBackoff: true,
              expireInSeconds: 600,
            });
          }
        }
      } catch (err) {
        logger.error(err, `[Notifications] Failed to enqueue via ${pref.channel.type}`);
      }
    }
  }

  async broadcast(input: SendNotificationInput) {
    await sendInApp({
      companyId: input.companyId,
      userId: null,
      eventType: input.eventType as any,
      title: input.title,
      message: input.message ?? null,
      metadata: input.metadata ?? null,
      link: input.link ?? null,
    });

    const members = await this.prisma.companyMembership.findMany({
      where: { companyId: input.companyId },
      include: { user: { select: { id: true } } },
    });

    for (const member of members) {
      await this.sendViaExternalChannels({
        ...input,
        userId: member.user.id,
      });
    }
  }

  async list(ctx: TenantContext, opts?: { limit?: number; cursor?: string; unreadOnly?: boolean }) {
    const limit = opts?.limit ?? 50;
    const where: Record<string, any> = {
      companyId: ctx.companyId,
      OR: [{ userId: ctx.userId }, { userId: null }],
    };
    if (opts?.unreadOnly) where.read = false;

    const items = await this.prisma.notification.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit + 1,
      ...(opts?.cursor ? { cursor: { id: opts.cursor }, skip: 1 } : {}),
    });

    let nextCursor: string | undefined;
    if (items.length > limit) {
      items.pop();
      nextCursor = items[items.length - 1]?.id;
    }

    return {
      items: items.map((n) => ({
        id: n.id,
        eventType: n.eventType,
        title: n.title,
        message: n.message,
        link: n.link,
        read: n.read,
        channel: n.channel,
        createdAt: n.createdAt.toISOString(),
      })),
      nextCursor,
    };
  }

  async getUnreadCount(ctx: TenantContext) {
    const count = await this.prisma.notification.count({
      where: {
        companyId: ctx.companyId,
        OR: [{ userId: ctx.userId }, { userId: null }],
        read: false,
      },
    });
    return { count };
  }

  async markRead(ctx: TenantContext, ids: string[]) {
    await this.prisma.notification.updateMany({
      where: { id: { in: ids }, companyId: ctx.companyId },
      data: { read: true },
    });

    await recordAudit(this.prisma, {
      companyId: ctx.companyId, actorUserId: ctx.userId,
      action: "NOTIFICATIONS_MARKED_READ", resourceType: "Notification",
      metadata: { count: ids.length },
    });

    return { success: true };
  }

  async markAllRead(ctx: TenantContext) {
    const result = await this.prisma.notification.updateMany({
      where: {
        companyId: ctx.companyId,
        OR: [{ userId: ctx.userId }, { userId: null }],
        read: false,
      },
      data: { read: true },
    });

    return { count: result.count };
  }

  async getPreferences(ctx: TenantContext) {
    const prefs = await this.prisma.notificationPreference.findMany({
      where: { userId: ctx.userId, companyId: ctx.companyId },
      include: { channel: true },
      orderBy: { eventType: "asc" },
    });

    return prefs.map((p) => ({
      id: p.id,
      eventType: p.eventType,
      channelId: p.channelId,
      channelName: p.channel?.name ?? null,
      channelType: p.channel?.type ?? null,
      enabled: p.enabled,
    }));
  }

  async updatePreference(ctx: TenantContext, prefId: string, enabled: boolean) {
    const pref = await this.prisma.notificationPreference.findFirst({
      where: { id: prefId, userId: ctx.userId, companyId: ctx.companyId },
    });
    if (!pref) throw new Error("Preference not found");

    const updated = await this.prisma.notificationPreference.update({
      where: { id: prefId },
      data: { enabled },
    });

    return { id: updated.id, eventType: updated.eventType, enabled: updated.enabled };
  }

  async getChannels(ctx: TenantContext) {
    const channels = await this.prisma.notificationChannel.findMany({
      where: { companyId: ctx.companyId },
      orderBy: { name: "asc" },
    });

    return channels.map((c) => ({
      id: c.id,
      type: c.type,
      name: c.name,
      isActive: c.isActive,
      config: c.config,
      createdAt: c.createdAt.toISOString(),
    }));
  }

  async createChannel(ctx: TenantContext, data: {
    type: string; name: string; config: Record<string, any>; isActive?: boolean;
  }) {
    const channel = await this.prisma.notificationChannel.create({
      data: {
        companyId: ctx.companyId,
        type: data.type,
        name: data.name,
        config: data.config as any,
        isActive: data.isActive ?? true,
      },
    });

    await recordAudit(this.prisma, {
      companyId: ctx.companyId, actorUserId: ctx.userId,
      action: "NOTIFICATION_CHANNEL_CREATED", resourceType: "NotificationChannel", resourceId: channel.id,
      metadata: { type: data.type, name: data.name },
    });

    return channel;
  }

  async updateChannel(ctx: TenantContext, channelId: string, data: {
    name?: string; config?: Record<string, any>; isActive?: boolean;
  }) {
    const channel = await this.prisma.notificationChannel.findFirst({
      where: { id: channelId, companyId: ctx.companyId },
    });
    if (!channel) throw new Error("Channel not found");

    const updated = await this.prisma.notificationChannel.update({
      where: { id: channelId },
      data: {
        ...(data.name !== undefined ? { name: data.name } : {}),
        ...(data.config !== undefined ? { config: data.config as any } : {}),
        ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
      },
    });

    return updated;
  }

  async deleteChannel(ctx: TenantContext, channelId: string) {
    const channel = await this.prisma.notificationChannel.findFirst({
      where: { id: channelId, companyId: ctx.companyId },
    });
    if (!channel) throw new Error("Channel not found");

    await this.prisma.notificationPreference.deleteMany({
      where: { channelId },
    });
    await this.prisma.notificationChannel.delete({
      where: { id: channelId },
    });

    return { success: true };
  }

  async setupDefaultPreferences(ctx: TenantContext) {
    const eventTypes = [
      "APPROVAL_REQUIRED", "APPROVAL_COMPLETED", "APPROVAL_REJECTED",
      "RISK_ALERT_CREATED", "RISK_ALERT_RESOLVED",
      "RECONCILIATION_COMPLETED", "RECONCILIATION_FAILED",
      "POLICY_VIOLATION", "CONNECTOR_FAILURE",
      "TRANSFER_COMPLETED", "TRANSFER_FAILED",
      "PLAID_SYNC_FAILED", "PLAID_ACCOUNT_LINKED", "PLAID_ACCOUNT_UNLINKED",
    ];

    const existing = await this.prisma.notificationPreference.findMany({
      where: { userId: ctx.userId, companyId: ctx.companyId },
      select: { eventType: true },
    });
    const existingTypes = new Set(existing.map((e) => e.eventType));

    const newPrefs = eventTypes
      .filter((et) => !existingTypes.has(et as any))
      .map((eventType) => ({
        userId: ctx.userId,
        companyId: ctx.companyId,
        eventType: eventType as any,
        enabled: true,
      }));

    if (newPrefs.length > 0) {
      await this.prisma.notificationPreference.createMany({ data: newPrefs });
    }

    return { created: newPrefs.length };
  }
}

export const notificationService = new NotificationService();
