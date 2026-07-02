import { createHmac, timingSafeEqual } from "node:crypto";
import { prisma } from "@/server/db/prisma";
import { logger } from "@/lib/logger";
import { connectorOrchestrator } from "../orchestrator";

interface QBOEntity {
  name: string;
  id: string;
  operation: "Create" | "Update" | "Merge" | "Delete";
  lastUpdated: string;
}

interface QBODataChangeEvent {
  entities: QBOEntity[];
}

interface QBOEventNotification {
  realmId: string;
  dataChangeEvent: QBODataChangeEvent;
}

interface QBOWebhookPayload {
  eventNotifications: QBOEventNotification[];
}

const entityToSyncJob: Record<string, string> = {
  Account: "connector-sync",
  Vendor: "connector-sync",
  Customer: "connector-sync",
  Invoice: "connector-sync",
  Payment: "connector-sync",
  JournalEntry: "connector-sync",
  Estimate: "connector-sync",
  Bill: "connector-sync",
  SalesReceipt: "connector-sync",
  CreditMemo: "connector-sync",
};

export async function verifyQBOWebhook(
  body: string,
  intuitSignature: string | null,
): Promise<boolean> {
  if (!intuitSignature) return false;

  const webhookToken = process.env.QB_WEBHOOK_TOKEN;
  if (!webhookToken) {
    logger.warn("[QBOWebhook] QB_WEBHOOK_TOKEN not configured");
    return false;
  }

  try {
    const hmac = createHmac("sha256", webhookToken);
    hmac.update(body, "utf8");
    const expected = hmac.digest("base64");

    const expectedBuf = Buffer.from(expected);
    const receivedBuf = Buffer.from(intuitSignature);

    if (expectedBuf.length !== receivedBuf.length) return false;

    return timingSafeEqual(expectedBuf, receivedBuf);
  } catch (err) {
    logger.error({ err }, "[QBOWebhook] Signature verification failed");
    return false;
  }
}

export async function handleQBOWebhookEvent(
  companyId: string,
  connectorId: string,
  payload: QBOWebhookPayload,
): Promise<void> {
  const { eventNotifications } = payload;

  if (!eventNotifications || eventNotifications.length === 0) {
    logger.info("[QBOWebhook] No event notifications in payload");
    return;
  }

  const entitiesToSync = new Set<string>();

  for (const notification of eventNotifications) {
    const { realmId, dataChangeEvent } = notification;

    if (!dataChangeEvent?.entities) continue;

    for (const entity of dataChangeEvent.entities) {
      const { name, operation } = entity;

      logger.info(
        { realmId, entityName: name, operation, entityId: entity.id },
        "[QBOWebhook] Entity change received",
      );

      if (operation === "Delete") {
        entitiesToSync.add(name);
        continue;
      }

      entitiesToSync.add(name);
    }
  }

  const syncTypes = new Set<string>();
  for (const entityName of entitiesToSync) {
    const jobName = entityToSyncJob[entityName];
    if (jobName) {
      syncTypes.add(jobName);
    } else {
      syncTypes.add("connector-sync");
    }
  }

  for (const jobName of syncTypes) {
    await connectorOrchestrator.dispatchWebhookSync(connectorId, companyId);
  }
}
