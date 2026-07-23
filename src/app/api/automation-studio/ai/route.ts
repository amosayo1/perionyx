import { NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { handleRouteError, parseJsonBody } from "@/server/http/handle-route";
import { rbacService } from "@/modules/rbac/rbac.service";
import { promptExecutionService } from "@/modules/ai-provider";

const AUTOMATION_STUDIO_SYSTEM_PROMPT =
  "You are Perionyx's automation studio AI assistant. You help finance teams design, configure, and optimize business rules, approval workflows, and automation schedules. Be concise, precise, and action-oriented.";

interface GeminiContent {
  role?: string;
  parts?: Array<{ text?: string }>;
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
    await rbacService.ensurePermission(ctx.userId, ctx.companyId, "automation.manage");

    const body = await parseJsonBody<{ contents?: GeminiContent[] }>(req);

    if (!body.contents || !Array.isArray(body.contents)) {
      return NextResponse.json(
        { error: { code: "VALIDATION", message: "Invalid request: expected `contents` array" } },
        { status: 400 },
      );
    }

    const messages = body.contents
      .filter((c) => c.parts && c.parts.length > 0)
      .map((c) => ({
        role: (c.role === "model" ? "assistant" : "user") as "user" | "assistant",
        content: c.parts!.map((p) => p.text ?? "").join("\n"),
      }));

    if (messages.length === 0) {
      return NextResponse.json(
        { error: { code: "VALIDATION", message: "No valid messages in contents array" } },
        { status: 400 },
      );
    }

    const response = await promptExecutionService.execute(AUTOMATION_STUDIO_SYSTEM_PROMPT, messages, {
      companyId: ctx.companyId,
      userId: ctx.userId,
      feature: "automation-studio",
    });

    return NextResponse.json({
      candidates: [
        {
          content: {
            parts: [{ text: response.content }],
            role: "model",
          },
          finishReason: response.finishReason ?? "STOP",
        },
      ],
      usageMetadata: response.usage
        ? {
            promptTokenCount: response.usage.promptTokens,
            candidatesTokenCount: response.usage.completionTokens,
            totalTokenCount: response.usage.totalTokens,
          }
        : undefined,
    });
  } catch (err) {
    return handleRouteError(err, req);
  }
}
