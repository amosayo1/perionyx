import { NextResponse } from "next/server";
import { z } from "zod";
import { transferBetweenWallets } from "@/modules/transactions";
import { executeIdempotently } from "@/modules/ledger";
import { rbacService, RBACService } from "@/modules/rbac/rbac.service";
import { parseTransferWalletBody } from "@/domain/schemas/financial";
import { handleRouteError, parseJsonBody, zodErrorResponse } from "@/server/http/handle-route";
import { serializeTransactionWithLedger } from "@/server/http/transaction-response";
import { WebhookService } from "@/modules/integrations/webhook.service";
import { rateLimit, rateLimitKey } from "@/server/security/rate-limit";
import { authenticateRequest } from "@/server/security/authenticate-request";

export async function POST(request: Request) {
  try {
    const ctx = await authenticateRequest(request);

    const ip = request.headers.get("x-forwarded-for") ?? ctx.userId;
    const rl = await rateLimit(rateLimitKey("transfer", ip), 30, 60000);
    if (!rl.ok) {
      return NextResponse.json(
        { error: { code: "TOO_MANY_REQUESTS", message: "Too many transfer requests. Try again later." } },
        { status: 429, headers: { "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } },
      );
    }

    const raw = await parseJsonBody<unknown>(request);
    const input = parseTransferWalletBody(raw);

    await rbacService.ensurePermission(ctx.userId, ctx.companyId, "transactions.transfer");

    const txn = await executeIdempotently(
      {
        companyId: String(ctx.companyId),
        idempotencyKey: input.idempotencyKey,
        method: "POST",
        path: "/api/v1/transactions/transfer",
        body: input as any,
      },
      async () => {
        const res = await transferBetweenWallets(ctx, input);
        // enqueue webhook delivery for external integrations (non-blocking)
        void import("@/modules/integrations/webhook-registry.service").then((m) => m.WebhookRegistry.notifyTransaction(String(ctx.companyId), res));
        // attempt external settlement via connectors (non-blocking)
        void import("@/modules/integrations/connectors/manager").then((m) => m.ConnectorsManager.settle(String(ctx.companyId), res));
        return res as any;
      },
    );

    return NextResponse.json(serializeTransactionWithLedger(txn));
  } catch (error) {
    if (error instanceof z.ZodError) {
      return zodErrorResponse(error);
    }
    return handleRouteError(error);
  }
}
