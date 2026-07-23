import { NextResponse } from "next/server";
import { requireAuth } from "@/server/security/require-permission";
import { handleRouteError } from "@/server/http/handle-route";

interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

const subscriptions = new Map<string, PushSubscriptionData>();

export function getAllSubscriptions(): PushSubscriptionData[] {
  return Array.from(subscriptions.values());
}

export async function POST(request: Request) {
  try {
    await requireAuth(request);

    const body = (await request.json()) as PushSubscriptionData;

    if (!body.endpoint || !body.keys?.p256dh || !body.keys?.auth) {
      return NextResponse.json(
        { error: "Invalid subscription object" },
        { status: 400 }
      );
    }

    subscriptions.set(body.endpoint, body);

    return NextResponse.json({ success: true });
  } catch (err) {
    return handleRouteError(err, request);
  }
}
