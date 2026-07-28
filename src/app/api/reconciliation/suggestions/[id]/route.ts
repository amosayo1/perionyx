import { z } from "zod";
import { NextRequest, NextResponse } from "next/server";
import { cacheHeaders, handleRouteError } from "@/server/http/handle-route";
import { prisma } from "@/server/db/prisma";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

const SuggestionBodySchema = z.object({
  status: z.enum(["ACCEPTED", "REJECTED", "SKIPPED"], { message: "status is required" }),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withRuntimeContext(request, async (ctx) => {
    try {
      const { id } = await params;
      const rawBody = await request.json();
      const parsed = SuggestionBodySchema.safeParse(rawBody);
      if (!parsed.success) {
        return NextResponse.json({ error: { code: "VALIDATION", message: parsed.error.issues[0].message } }, { status: 400 });
      }
      const { status } = parsed.data;
  
      const suggestion = await prisma.matchingSuggestion.update({
        where: { id },
        data: {
          status,
          acceptedBy: status === "ACCEPTED" ? ctx.tenant.userId : undefined,
          acceptedAt: status === "ACCEPTED" ? new Date() : undefined,
        },
      });
  
      return NextResponse.json(suggestion);
    } catch (error) {
      return handleRouteError(error);
    }
  });
}
