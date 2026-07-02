import { prisma } from "@/server/db/prisma";
import { connectorPlatformRegistry } from "../registry";
import { logger } from "@/lib/logger";
import { recordAudit } from "@/modules/audit";
import type { SlackMessage, TeamsMessage } from "../communication-types";

interface NotificationConnectorDeliveryData {
  connectorId: string;
  companyId: string;
  channelId: string;
  channelType: string;
  title: string;
  message?: string | null;
  eventType: string;
  metadata?: Record<string, unknown> | null;
  link?: string | null;
  recipientUserId?: string;
}

export async function handleNotificationConnectorDelivery(job: {
  id: string;
  data: NotificationConnectorDeliveryData;
}): Promise<void> {
  const { connectorId, companyId, channelId, channelType, title, message, eventType, metadata, link } = job.data;

  const connector = connectorPlatformRegistry.getInstance(connectorId);
  if (!connector) {
    logger.warn({ connectorId }, "[NotifDelivery] Connector not found in registry");
    return;
  }

  const slack = connector as any;
  const teams = connector as any;

  try {
    let result: { ok: boolean; message?: string; externalId?: string };

    if (channelType === "slack" && typeof slack.sendMessage === "function") {
      const slackMsg: SlackMessage = {
        channel: channelId,
        text: message ?? title,
        blocks: buildSlackBlocks(title, message, eventType, link, metadata),
      };
      result = await slack.sendMessage(slackMsg);
    } else if (channelType === "teams" && typeof teams.sendMessage === "function") {
      const [teamId, actualChannelId] = channelId.split(":");
      const teamsMsg: TeamsMessage = {
        teamId: teamId ?? channelId,
        channelId: actualChannelId ?? channelId,
        summary: title,
        title,
        text: message ?? undefined,
        sections: metadata ? [
          {
            facts: Object.entries(metadata).map(([name, value]) => ({
              name,
              value: typeof value === "string" ? value : JSON.stringify(value),
            })),
          },
        ] : undefined,
      };
      result = await teams.sendMessage(teamsMsg);
    } else {
      logger.warn({ channelType, connectorId }, "[NotifDelivery] Unsupported channel type or missing sendMessage");
      return;
    }

    if (result.ok) {
      logger.info({ connectorId, channelId, externalId: result.externalId }, "[NotifDelivery] Delivered");

      await recordAudit(prisma, {
        action: "NOTIFICATION_DELIVERED",
        resourceType: "notification",
        companyId,
        metadata: { connectorId, channelId, channelType, eventType, externalId: result.externalId },
      });
    } else {
      logger.error({ connectorId, channelId, error: result.message }, "[NotifDelivery] Failed");

      await recordAudit(prisma, {
        action: "NOTIFICATION_FAILED",
        resourceType: "notification",
        companyId,
        severity: "WARNING",
        metadata: { connectorId, channelId, channelType, eventType, error: result.message },
      });

      throw new Error(result.message ?? "Delivery failed");
    }
  } catch (err: any) {
    logger.error({ err, connectorId, channelId }, "[NotifDelivery] Delivery error");

    await recordAudit(prisma, {
      action: "NOTIFICATION_FAILED",
      resourceType: "notification",
      companyId,
      severity: "WARNING",
      metadata: { connectorId, channelId, channelType, eventType, error: err?.message ?? String(err) },
    });

    throw err;
  }
}

function buildSlackBlocks(
  title: string,
  message: string | null | undefined,
  eventType: string,
  link?: string | null,
  metadata?: Record<string, unknown> | null,
): unknown[] {
  const blocks: unknown[] = [];

  blocks.push({
    type: "header",
    text: { type: "plain_text", text: title, emoji: true },
  });

  if (message) {
    blocks.push({
      type: "section",
      text: { type: "mrkdwn", text: message },
    });
  }

  const fields: { type: string; text: string }[] = [];
  fields.push({ type: "mrkdwn", text: `*Event:*\n${eventType}` });

  if (metadata) {
    for (const [key, val] of Object.entries(metadata)) {
      if (key === "severity") {
        const emoji = getSeverityEmoji(String(val));
        fields.push({ type: "mrkdwn", text: `*Severity:*\n${emoji} ${val}` });
      }
    }
  }

  if (fields.length > 0) {
    blocks.push({ type: "section", fields });
  }

  if (link) {
    blocks.push({
      type: "actions",
      elements: [
        {
          type: "button",
          text: { type: "plain_text", text: "View Details", emoji: true },
          url: link,
        },
      ],
    });
  }

  blocks.push({
    type: "context",
    elements: [
      { type: "mrkdwn", text: `Vaulta • ${new Date().toLocaleString()}` },
    ],
  });

  return blocks;
}

function getSeverityEmoji(severity: string): string {
  switch (severity.toUpperCase()) {
    case "CRITICAL": return "🔴";
    case "HIGH": return "🟠";
    case "MEDIUM": return "🟡";
    case "LOW": return "🟢";
    default: return "ℹ️";
  }
}
