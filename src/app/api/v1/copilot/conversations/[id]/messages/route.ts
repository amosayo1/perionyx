import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { handleRouteError, parseJsonBody } from "@/server/http/handle-route";
import { getConversation, addUserMessage, addAssistantMessage, updateConversationTitle } from "@/modules/copilot/conversation.service";
import { streamChatResponse, generateTitle } from "@/modules/copilot/ai.service";
import type { PersonaRole } from "@/modules/copilot/command-center";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);

    const conversation = await getConversation(ctx, id);
    if (!conversation) {
      return new Response(JSON.stringify({ error: { code: "NOT_FOUND", message: "Conversation not found" } }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const body = await parseJsonBody<{ message: string; persona?: PersonaRole }>(request);
    if (!body.message || typeof body.message !== "string" || !body.message.trim()) {
      return new Response(JSON.stringify({ error: { code: "VALIDATION", message: "message is required" } }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const persona = body.persona;

    // If this is the first message, auto-generate a title
    const isFirstMessage = conversation.messages.length === 0;
    if (isFirstMessage) {
      const title = await generateTitle(ctx, body.message);
      await updateConversationTitle(ctx, id, title);
    }

    // Save user message
    const userMsg = await addUserMessage(ctx, id, body.message.trim());

    // Build history for AI
    const allMessages = [
      ...conversation.messages.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
      { role: "user" as const, content: body.message.trim() },
    ];

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        let fullContent = "";
        let citations: string[] = [];
        let followUps: string[] = [];

        await streamChatResponse(
          ctx,
          allMessages,
          (chunk) => {
            if (chunk.content) {
              fullContent += chunk.content;
              const data = JSON.stringify({ type: "delta", content: chunk.content });
              controller.enqueue(encoder.encode(`data: ${data}\n\n`));
            }
            if (chunk.citations.length > 0) citations = chunk.citations;
            if (chunk.followUps.length > 0) followUps = chunk.followUps;
          },
          async () => {
            // Save the complete assistant message
            const assistantMsg = await addAssistantMessage(id, fullContent, citations, followUps);
            const done = JSON.stringify({
              type: "done",
              message: {
                id: assistantMsg.id,
                role: "assistant",
                content: assistantMsg.content,
                citations: assistantMsg.citations,
                followUps: assistantMsg.followUps,
                createdAt: assistantMsg.createdAt,
              },
              userMessage: {
                id: userMsg.id,
                role: "user",
                content: userMsg.content,
                citations: [],
                followUps: [],
                createdAt: userMsg.createdAt,
              },
            });
            controller.enqueue(encoder.encode(`data: ${done}\n\n`));
            controller.close();
          },
          (error) => {
            const err = JSON.stringify({ type: "error", message: error.message });
            controller.enqueue(encoder.encode(`data: ${err}\n\n`));
            controller.close();
          },
          undefined,
          persona,
        );
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
