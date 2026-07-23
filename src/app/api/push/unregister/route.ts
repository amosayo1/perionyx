import { NextResponse } from "next/server";
import { requireAuth } from "@/server/security/require-permission";
import { handleRouteError } from "@/server/http/handle-route";
import { getAllSubscriptions } from "../register/route";

export async function POST(request: Request) {
  try {
    await requireAuth(request);

    const { endpoint } = await request.json();

    if (!endpoint) {
      return NextResponse.json(
        { error: "Endpoint is required" },
        { status: 400 }
      );
    }

    const subs = getAllSubscriptions();

    return NextResponse.json({ success: true });
  } catch (err) {
    return handleRouteError(err, request);
  }
}
