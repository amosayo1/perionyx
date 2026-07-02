import type { AuditSeverity } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import { logger } from "@/lib/logger";
import { recordAudit } from "@/modules/audit";
import { connectorOrchestrator } from "../orchestrator";

interface PlaidWebhookPayload {
  webhook_type: string;
  webhook_code: string;
  item_id: string;
  error?: {
    error_type: string;
    error_code: string;
    error_message: string;
  };
  new_transactions?: number;
  removed_transactions?: string[];
}

export async function verifyPlaidWebhook(
  _body: string,
  _plaidVerificationHeader: string,
): Promise<boolean> {
  try {
    const { PlaidApi, PlaidEnvironments, Configuration } = await import("plaid");
    const clientId = process.env.PLAID_CLIENT_ID;
    const secret = process.env.PLAID_SECRET;
    const env = (process.env.PLAID_ENV ?? "sandbox") as "sandbox" | "development" | "production";

    if (!clientId || !secret) return false;

    const client = new PlaidApi(
      new Configuration({
        basePath: PlaidEnvironments[env],
        baseOptions: {
          headers: { "PLAID-CLIENT-ID": clientId, "PLAID-SECRET": secret },
        },
      }),
    );

    const response = await client.institutionsGet({
      count: 1,
      offset: 0,
      country_codes: ["US" as any],
    });

    return response.data.institutions.length > 0;
  } catch (err) {
    logger.error({ err }, "[PlaidWebhook] Verification failed");
    return false;
  }
}

export async function handlePlaidWebhookEvent(
  companyId: string,
  connectorId: string,
  payload: PlaidWebhookPayload,
): Promise<void> {
  const { webhook_type, webhook_code, item_id, error, removed_transactions } = payload;

  logger.info({ webhook_type, webhook_code, item_id }, "[PlaidWebhook] Received event");

  switch (webhook_code) {
    case "SYNC_UPDATES_AVAILABLE": {
      await connectorOrchestrator.dispatchWebhookSync(connectorId, companyId, "transactions");
      break;
    }

    case "DEFAULT_UPDATE": {
      await connectorOrchestrator.dispatchWebhookSync(connectorId, companyId, "transactions");
      break;
    }

    case "TRANSACTIONS_REMOVED": {
      if (removed_transactions && removed_transactions.length > 0) {
        await prisma.externalTransaction.deleteMany({
          where: {
            companyId,
            source: "plaid",
            externalId: { in: removed_transactions },
          },
        });

        await recordAudit(prisma, {
          companyId,
          action: "PLAID_TRANSACTIONS_REMOVED",
          resourceType: "ExternalTransaction",
          metadata: { count: removed_transactions.length, item_id },
        });
      }
      break;
    }

    case "ITEM_ERROR": {
      if (error) {
        const config = await prisma.connectorConfig.findFirst({
          where: { id: connectorId, companyId },
        });
        if (config) {
          const cfg = config.config as Record<string, unknown>;
          cfg.healthStatus = "CRITICAL";
          cfg.errorMessage = `[${error.error_type}] ${error.error_code}: ${error.error_message}`;
          await prisma.connectorConfig.update({
            where: { id: connectorId },
            data: { config: cfg as any, active: false },
          });
        }

        const { notificationService } = await import("@/modules/notifications");
        await notificationService.broadcast({
          companyId,
          eventType: "CONNECTOR_FAILURE",
          title: "Plaid connector error",
          message: `[${error.error_code}] ${error.error_message}`,
          metadata: {
            connectorId,
            errorType: error.error_type,
            errorCode: error.error_code,
            errorMessage: error.error_message,
          },
        });

        await recordAudit(prisma, {
          companyId,
          action: "PLAID_ITEM_ERROR",
          resourceType: "ConnectorConfig",
          resourceId: connectorId,
          severity: "WARNING" as AuditSeverity,
          metadata: {
            errorType: error.error_type,
            errorCode: error.error_code,
            errorMessage: error.error_message,
          },
        });
      }
      break;
    }

    case "PENDING_EXPIRATION": {
      const { notificationService } = await import("@/modules/notifications");
      await notificationService.broadcast({
        companyId,
        eventType: "CONNECTOR_FAILURE",
        title: "Plaid access token expiring",
        message: `The Plaid access token for item ${item_id} will expire soon. Re-authentication is required.`,
        metadata: {
          connectorId,
          itemId: item_id,
          webhookType: webhook_type,
          webhookCode: webhook_code,
        },
      });

        await recordAudit(prisma, {
          companyId,
          action: "PLAID_TOKEN_EXPIRING",
          resourceType: "ConnectorConfig",
          resourceId: connectorId,
          severity: "WARNING" as AuditSeverity,
        metadata: { item_id },
      });
      break;
    }

    case "ITEM_LOGIN_REMOVED": {
      const config = await prisma.connectorConfig.findFirst({
        where: { id: connectorId, companyId },
      });
      if (config) {
        const cfg = config.config as Record<string, unknown>;
        cfg.healthStatus = "CRITICAL";
        cfg.errorMessage = "User revoked Plaid access";
        await prisma.connectorConfig.update({
          where: { id: connectorId },
          data: { config: cfg as any, active: false },
        });
      }

      const { updateConnectorStatus } = await import("../config");
      await updateConnectorStatus({ companyId, userId: "" } as any, connectorId, "disabled" as any, "User revoked Plaid access");

      await recordAudit(prisma, {
        companyId,
        action: "PLAID_LOGIN_REMOVED",
        resourceType: "ConnectorConfig",
        resourceId: connectorId,
        severity: "WARNING" as AuditSeverity,
        metadata: { item_id },
      });
      break;
    }

    default:
      logger.info({ webhook_type, webhook_code }, "[PlaidWebhook] Unhandled event");
      break;
  }
}
