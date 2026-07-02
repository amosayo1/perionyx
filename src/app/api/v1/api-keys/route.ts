import { NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { handleRouteError, parseJsonBody } from "@/server/http/handle-route";
import { ApiKeyService } from "@/modules/api-keys";

export async function GET() {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
    const keys = await ApiKeyService.list(ctx);
    return NextResponse.json({ items: keys });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
    const body = await parseJsonBody<{ name: string; scopes?: string[]; expiresAt?: string }>(request);
    const key = await ApiKeyService.create(ctx, body);
    return NextResponse.json(key, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
    const body = await parseJsonBody<{ id: string; name?: string; scopes?: string[]; active?: boolean; expiresAt?: string | null }>(request);
    const key = await ApiKeyService.update(ctx, body.id, body);
    return NextResponse.json(key);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
    const body = await parseJsonBody<{ id: string }>(request);
    const result = await ApiKeyService.delete(ctx, body.id);
    return NextResponse.json(result);
  } catch (error) {
    return handleRouteError(error);
  }
}
