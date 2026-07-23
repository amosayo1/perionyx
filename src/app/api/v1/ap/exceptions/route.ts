import { NextResponse } from "next/server";
import { cacheHeaders } from "@/server/http/handle-route";
import {
  apAuth,
  apRequirePermission,
  applyCommonHeaders,
} from "@/server/procurement/api/middleware";
import { apErrorResponse, apValidationError } from "@/server/procurement/api/errors";
import { exceptionListQuerySchema } from "@/lib/validations/ap";

export async function GET(request: Request) {
  const authResult = await apAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { ctx } = authResult;

  try {
    await apRequirePermission(ctx.tenant, "ap.exceptions.view");

    const { searchParams } = new URL(request.url);
    const query = exceptionListQuerySchema.safeParse(Object.fromEntries(searchParams));
    if (!query.success) {
      return apValidationError(
        query.error.issues.map((i) => ({ path: i.path.join("."), message: i.message, code: i.code })),
        ctx.correlationId,
      );
    }

    const response = NextResponse.json(
      {
        data: {
          exceptions: [],
          pagination: { total: 0, page: query.data.page, limit: query.data.limit },
        },
      },
      { headers: cacheHeaders(30) },
    );

    applyCommonHeaders(response, ctx.correlationId);
    return response;
  } catch (error) {
    return apErrorResponse(error instanceof Error ? error : new Error(String(error)), ctx.correlationId);
  }
}
