import crypto from "crypto";
import { SecretStoreFactory } from '@/modules/secrets/secret-store';
import { logger } from "@/lib/logger";

export class WebhookService {
  static async send(url: string, event: string, payload: unknown, idempotencyKey?: string) {
    const body = JSON.stringify({ event, data: payload });
    const idempotency = idempotencyKey ?? crypto.createHash("sha256").update(body).digest("hex");
    const store = SecretStoreFactory();
    const secretFromStore = await store.getSecret('webhook.secret');
    const secret = process.env.WEBHOOK_SECRET ?? secretFromStore ?? "";
    const signature = crypto.createHmac("sha256", secret).update(body).digest("hex");

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "X-Webhook-Event": event,
      "X-Idempotency-Key": idempotency,
      "X-Signature": signature,
    };

    const res = await fetch(url, { method: "POST", headers, body });
    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      throw new Error(`Webhook send failed: ${res.status} ${txt}`);
    }
    return res;
  }

  static async notifyTransaction(companyId: string, txn: unknown) {
    const url = process.env.WEBHOOK_URL;
    if (!url) return null;
    try {
      return await this.send(url, "transaction.created", { companyId, transaction: txn }, (txn as any)?.id);
    } catch (err) {
      logger.error(err, "Webhook error");
      return null;
    }
  }
}

export default WebhookService;
