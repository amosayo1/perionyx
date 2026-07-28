import { z } from "zod";
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

const PushSubscriptionSchema = z.object({
  endpoint: z.string().url("endpoint must be a valid URL").max(2048),
  keys: z.object({
    p256dh: z.string().min(1, "p256dh key is required").max(512),
    auth: z.string().min(1, "auth key is required").max(256),
  }),
});

const subscriptions = new Map<string, PushSubscriptionData>();

export function getAllSubscriptions(): PushSubscriptionData[] {
  return Array.from(subscriptions.values());
}

export async function POST(request: Request) {
  try {
    await requireAuth(request);

    const rawBody = await request.json();
    const parsed = PushSubscriptionSchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION", message: parsed.error.issues[0].message } },
        { status: 400 }
      );
    }
    const body = parsed.data as PushSubscriptionData;

    subscriptions.set(body.endpoint, body);

    return NextResponse.json({ success: true });
  } catch (err) {
    return handleRouteError(err, request);
  }
}
