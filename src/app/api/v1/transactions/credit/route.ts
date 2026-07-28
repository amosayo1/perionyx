import { NextResponse } from "next/server";
import { z } from "zod";
import { creditWallet } from "@/modules/transactions";
import { executeIdempotently } from "@/modules/ledger";
import { rbacService, RBACService } from "@/modules/rbac/rbac.service";
import { parseCreditWalletBody } from "@/domain/schemas/financial";
import { handleRouteError, parseJsonBody, zodErrorResponse } from "@/server/http/handle-route";
import { serializeTransactionWithLedger } from "@/server/http/transaction-response";
import { WebhookService } from "@/modules/integrations/webhook.service";
import { rateLimit, rateLimitKey } from "@/server/security/rate-limit";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

export async function POST(request: Request) {
  return withRuntimeContext(request, async (ctx) => {
    try {
      const tenant = ctx.tenant;

      const ip = request.headers.get("x-forwarded-for") ?? tenant.userId;
      const rl = await rateLimit(rateLimitKey("credit", ip), 30, 60000);
      if (!rl.ok) {
        return NextResponse.json(
          { error: { code: "TOO_MANY_REQUESTS", message: "Too many credit requests. Try again later." } },
          { status: 429, headers: { "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } },
        );
      }

      const raw = await parseJsonBody<unknown>(request);
      const input = parseCreditWalletBody(raw);

      await rbacService.ensurePermission(tenant.userId, tenant.companyId, "transactions.credit");

      const txn = await executeIdempotently(
        {
          companyId: String(tenant.companyId),
          idempotencyKey: input.idempotencyKey,
          method: "POST",
          path: "/api/v1/transactions/credit",
          body: input as any,
        },
        async () => {
          const res = await creditWallet(tenant, input);
          void import("@/modules/integrations/webhook-registry.service").then((m) => m.WebhookRegistry.notifyTransaction(String(tenant.companyId), res));
          void import("@/modules/integrations/connectors/manager").then((m) => m.ConnectorsManager.settle(String(tenant.companyId), res));
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
  });
}
