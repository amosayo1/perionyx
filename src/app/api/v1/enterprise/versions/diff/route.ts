import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { handleRouteError, zodErrorResponse } from "@/server/http/handle-route";
import { diffVersions, getVersionById } from "@/modules/version-history/version-history";

const querySchema = z.object({
  v1: z.string().min(1, "v1 (version ID) is required"),
  v2: z.string().min(1, "v2 (version ID) is required"),
});

export async function GET(request: Request) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
    const url = new URL(request.url);

    const parsed = querySchema.safeParse({
      v1: url.searchParams.get("v1"),
      v2: url.searchParams.get("v2"),
    });
    if (!parsed.success) return zodErrorResponse(parsed.error);

    const { v1, v2 } = parsed.data;
    const [version1, version2, diffs] = await Promise.all([
      getVersionById(ctx, v1),
      getVersionById(ctx, v2),
      diffVersions(ctx, v1, v2),
    ]);

    if (!version1 || !version2) {
      return NextResponse.json({ error: "One or both versions not found" }, { status: 404 });
    }

    return NextResponse.json({
      version1,
      version2,
      diffs,
      changesCount: diffs.length,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
