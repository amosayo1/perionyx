import { NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { serverError } from "@/lib/validations/automation-studio";

const AI_API_KEY = process.env.AI_API_KEY;
const AI_BASE_URL = process.env.AI_BASE_URL ?? "https://generativelanguage.googleapis.com";
const AI_MODEL = process.env.AI_MODEL ?? "gemini-2.0-flash";

export async function POST(req: Request) {
  const session = await auth();
  const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!AI_API_KEY) {
    return NextResponse.json(
      { error: "AI_API_KEY is not configured on the server" },
      { status: 503 },
    );
  }

  try {
    const body = await req.json();
    const { contents } = body;

    if (!contents || !Array.isArray(contents)) {
      return NextResponse.json(
        { error: "Invalid request: expected `contents` array" },
        { status: 400 },
      );
    }

    const url = `${AI_BASE_URL}/v1beta/models/${AI_MODEL}:generateContent`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": AI_API_KEY,
      },
      body: JSON.stringify({ contents }),
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => "Unknown error");
      return NextResponse.json(
        { error: `AI provider returned ${response.status}`, details: errText },
        { status: 502 },
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (err) {
    return serverError(err);
  }
}
