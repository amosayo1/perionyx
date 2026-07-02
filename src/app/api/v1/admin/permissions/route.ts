import { NextResponse } from "next/server";
import { PermissionRegistry } from "@/modules/rbac/permission-registry";

export async function GET() {
  return NextResponse.json(PermissionRegistry);
}
