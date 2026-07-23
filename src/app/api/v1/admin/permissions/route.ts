import { NextResponse } from "next/server";
import { PermissionRegistry } from "@/server/iam/permissions";
import { requirePermission } from "@/server/security/require-permission";
import { handleRouteError } from "@/server/http/handle-route";

export async function GET(request: Request) {
  try {
    await requirePermission(request, "admin.permissions");
    return NextResponse.json(PermissionRegistry.getAll());
  } catch (err) {
    return handleRouteError(err, request);
  }
}
