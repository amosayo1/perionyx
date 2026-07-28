import nodeCrypto from "crypto";
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

/**
 * Verify a Plaid webhook using JWS signature verification.
 *
 * Plaid signs webhooks with ES256 (ECDSA P-256 + SHA-256).
 * The Plaid-Verification header contains a JWS with:
 *   - Header: { alg: "ES256", kid: "<key_id>", ... }
 *   - Payload: { body: "<raw_request_body>", ... }
 *   - Signature: ECDSA P-256 signature
 *
 * Verification steps:
 *   1. Parse JWS header to extract kid (key ID)
 *   2. Fetch Plaid's public JWKS from their well-known endpoint
 *   3. Verify JWS signature against the public key
 *   4. Confirm the payload body matches the raw request body
 */
export async function verifyPlaidWebhook(
  body: string,
  plaidVerificationHeader: string,
): Promise<boolean> {
  try {
    if (!plaidVerificationHeader) {
      logger.warn("[PlaidWebhook] Missing Plaid-Verification header");
      return false;
    }

    const parts = plaidVerificationHeader.split(".");
    if (parts.length !== 3) {
      logger.warn("[PlaidWebhook] Invalid JWS format — expected 3 parts");
      return false;
    }

    const [headerB64, payloadB64, signatureB64] = parts;
    const header = JSON.parse(Buffer.from(headerB64, "base64url").toString("utf8"));

    if (header.alg !== "ES256") {
      logger.warn({ alg: header.alg }, "[PlaidWebhook] Unsupported algorithm");
      return false;
    }

    const kid = header.kid;
    if (!kid) {
      logger.warn("[PlaidWebhook] Missing kid in JWS header");
      return false;
    }

    const jwksUrl = process.env.PLAID_JWKS_URL ?? "https://production.plaid.com/.well-known/jwks.json";
    const response = await fetch(jwksUrl);
    if (!response.ok) {
      logger.error({ status: response.status }, "[PlaidWebhook] Failed to fetch JWKS");
      return false;
    }

    const { keys } = await response.json() as { keys: Array<{ kid: string; kty: string; crv: string; x: string; y: string }> };
    const key = keys.find((k) => k.kid === kid);
    if (!key) {
      logger.warn({ kid }, "[PlaidWebhook] Key not found in JWKS");
      return false;
    }

    const publicKey = nodeCrypto.createPublicKey({
      key: {
        key: Buffer.from(
          JSON.stringify({ kty: key.kty, crv: key.crv, x: key.x, y: key.y }),
          "utf8",
        ),
        format: "jwk",
      },
      format: "jwk",
      type: "spki",
    });

    const verifyingInput = Buffer.from(`${headerB64}.${payloadB64}`);
    const sigBytes = Buffer.from(signatureB64, "base64url");
    const isValid = nodeCrypto.verify(null, verifyingInput, publicKey, sigBytes);

    if (!isValid) {
      logger.warn("[PlaidWebhook] JWS signature verification failed");
      return false;
    }

    const verifiedPayload = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf8"));
    if (typeof verifiedPayload.body === "string" && verifiedPayload.body !== body) {
      logger.warn("[PlaidWebhook] Body mismatch after signature verification");
      return false;
    }

    return true;
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
          const itemErrResult = await prisma.connectorConfig.updateMany({
            where: { id: connectorId, version: (config as any).version },
            data: { config: cfg as any, active: false, version: { increment: 1 } },
          });
          if (itemErrResult.count === 0) {
            const { ConflictError } = await import("@/lib/errors/app-error");
            throw new ConflictError("Concurrent modification detected — Plaid webhook ITEM_ERROR update conflicted.");
          }
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
        const loginRemResult = await prisma.connectorConfig.updateMany({
          where: { id: connectorId, version: (config as any).version },
          data: { config: cfg as any, active: false, version: { increment: 1 } },
        });
        if (loginRemResult.count === 0) {
          const { ConflictError } = await import("@/lib/errors/app-error");
          throw new ConflictError("Concurrent modification detected — Plaid webhook ITEM_LOGIN_REMOVED update conflicted.");
        }
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
