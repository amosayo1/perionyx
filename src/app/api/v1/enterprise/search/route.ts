import { NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { handleRouteError } from "@/server/http/handle-route";
import { globalSearch } from "@/modules/search/global-search";

export async function GET(request: Request) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
    const url = new URL(request.url);
    const q = url.searchParams.get("q") ?? "";
    const limit = Math.min(Number(url.searchParams.get("limit")) || 20, 50);

    const results = await globalSearch(ctx, q, limit);
    return NextResponse.json({ items: results, total: results.length, query: q });
  } catch (error) {
    return handleRouteError(error);
  }
}
