import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { handleRouteError, parseJsonBody, noCacheHeaders } from "@/server/http/handle-route";
import { rbacService } from "@/modules/rbac/rbac.service";
import { CredentialManagerService } from "@/modules/integration-platform";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
    await rbacService.ensurePermission(ctx.userId, ctx.companyId, "integration.credential");
    const { searchParams } = new URL(request.url);
    const instanceId = searchParams.get("instanceId");
    if (!instanceId) return NextResponse.json({ error: "instanceId required" }, { status: 400 });
    const credentials = await CredentialManagerService.listCredentials(ctx, instanceId);
    return NextResponse.json({ credentials });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
    await rbacService.ensurePermission(ctx.userId, ctx.companyId, "integration.credential");
    const body = await parseJsonBody<{ instanceId: string; key: string; value: string }>(request);
    await CredentialManagerService.storeCredential(ctx, body.instanceId, body.key, body.value);
    return new NextResponse(null, { status: 201, headers: { ...noCacheHeaders() } });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
    await rbacService.ensurePermission(ctx.userId, ctx.companyId, "integration.credential");
    const body = await parseJsonBody<{ instanceId: string; key: string; newValue: string }>(request);
    await CredentialManagerService.rotateCredential(ctx, body.instanceId, body.key, body.newValue);
    return NextResponse.json({ rotated: true }, { headers: { ...noCacheHeaders() } });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
    await rbacService.ensurePermission(ctx.userId, ctx.companyId, "integration.credential");
    const { searchParams } = new URL(request.url);
    const instanceId = searchParams.get("instanceId");
    const key = searchParams.get("key");
    if (!instanceId || !key) return NextResponse.json({ error: "instanceId and key required" }, { status: 400 });
    await CredentialManagerService.deleteCredential(ctx, instanceId, key);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return handleRouteError(error);
  }
}
