import { z } from "zod";
import { NextResponse } from "next/server";
import { requireAuth } from "@/server/security/require-permission";
import { handleRouteError } from "@/server/http/handle-route";
import { getAllSubscriptions } from "../register/route";

const UnregisterSchema = z.object({
  endpoint: z.string().url("endpoint must be a valid URL").max(2048),
});

export async function POST(request: Request) {
  try {
    await requireAuth(request);

    const rawBody = await request.json();
    const parsed = UnregisterSchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION", message: parsed.error.issues[0].message } },
        { status: 400 }
      );
    }
    const { endpoint } = parsed.data;

    const subs = getAllSubscriptions();

    return NextResponse.json({ success: true });
  } catch (err) {
    return handleRouteError(err, request);
  }
}
