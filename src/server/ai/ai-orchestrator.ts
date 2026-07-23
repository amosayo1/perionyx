import type {
  AssistantRequest, AssistantResponse, AIProvider,
  UserContext, PageContext, Citation, SuggestedAction, EntityRef, ConversationEntry,
} from "./types";
import { conversationContextEngine } from "./conversation-context-engine";
import { evidenceCollector } from "./evidence-collector";
import { promptBuilder } from "./prompt-builder";
import { citationGenerator } from "./citation-generator";
import { recommendationComposer } from "./recommendation-composer";
import { permissionAwareResponder } from "./permission-aware-responder";
import { actionPlanner } from "./action-planner";
import { conversationMemory } from "./conversation-memory";
import { aiAuditService } from "./ai-audit-service";

export class AIOrchestrator {
  private provider: AIProvider | null = null;

  registerProvider(provider: AIProvider): void {
    this.provider = provider;
  }

  getProvider(): AIProvider | null {
    return this.provider;
  }

  isReady(): boolean {
    return this.provider !== null && this.provider.isAvailable();
  }

  async process(
    request: AssistantRequest,
  ): Promise<AssistantResponse> {
    const startTime = Date.now();

    const ctx = await conversationContextEngine.resolve(
      request.context.userId,
      request.context.companyId,
      request.context.currentPage,
      request.conversationId,
      request.context.selectedEntityType,
      request.context.selectedEntityId,
      request.context.recentActions,
    );

    const { citations, modulesUsed } = await evidenceCollector.collect(
      request.message,
      ctx.user,
      ctx.page,
    );

    const deduplicated = citationGenerator.deduplicate(citations);
    const prioritizedCitations = citationGenerator.prioritize(deduplicated, 15);

    let reply: string;

    if (this.provider && this.provider.isAvailable()) {
      const systemPrompt = promptBuilder.buildSystemPrompt(ctx.user, ctx.page, ctx.time);
      const userPrompt = promptBuilder.buildUserPrompt(request.message, prioritizedCitations, ctx.history);

      const aiResponse = await this.provider.generate({
        messages: [
          { role: "system", content: systemPrompt },
          ...ctx.history.slice(-4).map((e) => ({
            role: e.role as "user" | "assistant",
            content: e.content,
          })),
          { role: "user", content: userPrompt },
        ],
        temperature: 0.3,
        maxTokens: 2000,
      });

      reply = aiResponse.content;
    } else {
      reply = this.generateFallbackResponse(request.message, prioritizedCitations);
    }

    const suggestedActions = recommendationComposer.composeFromCitations(prioritizedCitations, ctx.user);
    const defaultActions = suggestedActions.length < 3
      ? recommendationComposer.composeDefaultActions(ctx.user)
      : [];
    const allActions = [...suggestedActions, ...defaultActions];

    const plan = actionPlanner.planFromResponse(reply, prioritizedCitations, ctx.user);

    if (plan) {
      const planAction: SuggestedAction = {
        id: `plan-${plan.id}`,
        label: `${plan.summary} (${plan.priority})`,
        action: "execute_plan",
        url: plan.steps[0]?.url,
        priority: plan.priority === "immediate" || plan.priority === "today" ? "high" : "medium",
      };
      allActions.unshift(planAction);
    }

    const entitiesReferenced: EntityRef[] = prioritizedCitations
      .filter((c): c is Citation & { entityType: string; entityId: string } =>
        !!c.entityType && !!c.entityId)
      .map((c) => ({
        type: c.entityType,
        id: c.entityId,
        label: `${c.module} ${c.entityId.slice(0, 8)}`,
        module: c.module,
      }));

    const response: AssistantResponse = {
      reply: this.addInlineCitations(reply, prioritizedCitations),
      citations: prioritizedCitations.slice(0, 10),
      suggestedActions: allActions,
      context: {
        modulesUsed: Array.from(modulesUsed),
        entitiesReferenced,
        dataFreshness: new Date().toISOString(),
      },
      conversationId: ctx.conversationId,
      generatedAt: new Date().toISOString(),
    };

    const filtered = permissionAwareResponder.filterResponse(response, ctx.user);

    conversationMemory.addEntry(
      ctx.conversationId,
      "user",
      request.message,
    );
    conversationMemory.addEntry(
      ctx.conversationId,
      "assistant",
      reply,
      filtered.citations,
      filtered.suggestedActions,
    );

    const permissionCheck = permissionAwareResponder.checkPermission("ai_assistant", ctx.user);
    const latencyMs = Date.now() - startTime;

    aiAuditService.record({
      action: "GENERATE",
      conversationId: ctx.conversationId,
      userId: ctx.user.userId,
      companyId: ctx.user.companyId,
      message: request.message,
      responseLength: reply.length,
      citationCount: filtered.citations.length,
      actionCount: filtered.suggestedActions.length,
      latencyMs,
      model: this.provider?.getModelName() ?? "fallback",
      permissionCheck: permissionCheck === "PASS" ? "PASS" : permissionCheck === "BLOCK" ? "BLOCK" : "PARTIAL",
      timestamp: new Date().toISOString(),
    });

    return filtered;
  }

  private generateFallbackResponse(message: string, citations: Citation[]): string {
    const lower = message.toLowerCase();

    if (citations.length > 0) {
      const topCitations = citations.slice(0, 3);
      const evidenceSummary = topCitations.map((c) => c.snippet).join("; ");

      if (lower.includes("attention") || lower.includes("urgent") || lower.includes("priority")) {
        return `Based on available information, here are items requiring attention:\n${topCitations.map((c) => `- ${c.snippet}`).join("\n")}\n\nNote: An AI provider is not configured. These results are based on direct data queries.`;
      }

      if (lower.includes("why") || lower.includes("explain") || lower.includes("reason")) {
        return `Based on the data available:\n${evidenceSummary}\n\nFor a deeper analysis, configure an AI provider (OpenAI, Anthropic, etc.).`;
      }

      if (lower.includes("summary") || lower.includes("summarize") || lower.includes("overview")) {
        return `Here is a summary of relevant information:\n${topCitations.map((c) => `- ${c.snippet}`).join("\n")}`;
      }

      return `Based on the available data:\n${evidenceSummary}\n\nConfigure an AI provider for natural language analysis.`;
    }

    return `I don't have enough information to answer this question. Try searching across modules or configuring an AI provider for detailed analysis.`;
  }

  private addInlineCitations(reply: string, citations: Citation[]): string {
    let result = reply;
    for (const c of citations.slice(0, 5)) {
      const citationMarker = `[${c.source}:${c.module}]`;
      if (!result.includes(citationMarker)) {
        result += `\n\n${citationMarker} ${c.snippet}`;
      }
    }
    return result;
  }
}

export const aiOrchestrator = new AIOrchestrator();
