import { NextResponse } from "next/server";
import { requirePermission } from "@/server/security/require-permission";
import { handleRouteError } from "@/server/http/handle-route";
import { getAllSubscriptions } from "../register/route";

export async function POST(request: Request) {
  try {
    await requirePermission(request, "admin.security");

    const { title, body, url } = await request.json();

    const subscriptions = getAllSubscriptions();

    if (subscriptions.length === 0) {
      return NextResponse.json(
        { error: "No subscriptions registered" },
        { status: 404 }
      );
    }

    const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
    const vapidSubject = process.env.VAPID_SUBJECT || "mailto:admin@perionyx.io";

    if (!vapidPublicKey || !vapidPrivateKey) {
      return NextResponse.json(
        {
          error: "VAPID keys not configured",
          hint: "Set NEXT_PUBLIC_VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY environment variables",
        },
        { status: 501 }
      );
    }

    let webPush: typeof import("web-push");
    try {
      webPush = require("web-push");
    } catch {
      return NextResponse.json(
        {
          error: "web-push package not installed",
          hint: "Run: pnpm add web-push",
        },
        { status: 501 }
      );
    }

    webPush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);

    const results = await Promise.allSettled(
      subscriptions.map((sub) =>
        webPush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.keys.p256dh,
              auth: sub.keys.auth,
            },
          },
          JSON.stringify({
            title: title || "PERIONYX",
            body: body || "",
            url: url || "/",
            tag: `push-${Date.now()}`,
          })
        )
      )
    );

    const sent = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.filter((r) => r.status === "rejected").length;

    return NextResponse.json({
      success: true,
      sent,
      failed,
      total: subscriptions.length,
    });
  } catch (err) {
    return handleRouteError(err, request);
  }
}
