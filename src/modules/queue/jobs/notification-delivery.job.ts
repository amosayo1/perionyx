import { logger } from "@/lib/logger";
import { prisma } from "@/server/db/prisma";
import { sendEmail } from "@/modules/notifications/channels/email";
import { sendSlackMessage } from "@/modules/notifications/channels/slack";
import { enqueue } from "../queue.service";

interface EmailDeliveryPayload {
  type: "email";
  companyId: string;
  userId: string;
  to: string;
  subject: string;
  text: string;
  html?: string;
}

interface SlackDeliveryPayload {
  type: "slack";
  companyId: string;
  userId: string;
  webhookUrl: string;
  title: string;
  text: string;
  metadata?: Record<string, unknown>;
}

interface ConnectorDeliveryPayload {
  type: "connector";
  companyId: string;
  userId: string;
  connectorId: string;
  channelId: string;
  channelType: "slack" | "teams";
  title: string;
  message?: string;
  eventType: string;
  metadata?: Record<string, unknown>;
  link?: string;
}

type DeliveryPayload = EmailDeliveryPayload | SlackDeliveryPayload | ConnectorDeliveryPayload;

export async function handleNotificationDelivery(job: { id: string; data: DeliveryPayload }) {
  const { data } = job;

  logger.info({ jobId: job.id, type: data.type }, "[NotificationJob] Processing delivery");

  switch (data.type) {
    case "email": {
      await sendEmail({
        to: data.to,
        subject: data.subject,
        text: data.text,
        html: data.html,
      });
      break;
    }

    case "slack": {
      await sendSlackMessage({
        webhookUrl: data.webhookUrl,
        title: data.title,
        text: data.text,
        fields: data.metadata
          ? Object.entries(data.metadata).map(([k, v]) => ({
              title: k,
              value: String(v),
              short: true,
            }))
          : undefined,
      });
      break;
    }

    case "connector": {
      const { connectorId, channelType, title, message, eventType, metadata, link } = data;
      void enqueue("notification-connector-deliver", {
        connectorId,
        companyId: data.companyId,
        channelId: data.channelId,
        channelType,
        title,
        message,
        eventType,
        metadata,
        link,
        recipientUserId: data.userId,
      }, {
        retryLimit: 3,
        retryDelay: 60,
        retryBackoff: true,
        expireInSeconds: 600,
      });
      break;
    }
  }
}

export function enqueueEmailDelivery(payload: Omit<EmailDeliveryPayload, "type">) {
  return enqueue("notification-delivery", { ...payload, type: "email" }, {
    retryLimit: 3,
    retryDelay: 60,
    retryBackoff: true,
    expireInSeconds: 600,
  });
}

export function enqueueSlackDelivery(payload: Omit<SlackDeliveryPayload, "type">) {
  return enqueue("notification-delivery", { ...payload, type: "slack" }, {
    retryLimit: 3,
    retryDelay: 60,
    retryBackoff: true,
    expireInSeconds: 600,
  });
}
