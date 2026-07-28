import { buildCopilotContext } from "./context-builder";
import { buildIntelligenceSystemPrompt, buildFollowUpQuestions, extractSources } from "./intelligence-pipeline";
import type { TenantContext } from "@/server/context/tenant-context";
import { generateExecutiveBriefing } from "./executive-briefing";
import { traceTransactionLifecycle } from "./timeline-engine";
import { buildKnowledgeIndex } from "./knowledge-index";
import { getCommandCenterProfile, type PersonaRole } from "./command-center";
import { logger } from "@/lib/logger";
import { promptExecutionService } from "@/modules/ai-provider/prompt-execution";
import { aiProviderRegistry } from "@/modules/ai-provider/registry";
import type { ChatMessage } from "@/modules/ai-provider/types";

interface StreamChunk {
  content: string;
  citations: string[];
  followUps: string[];
}

export async function streamChatResponse(
  ctx: TenantContext,
  messages: { role: "user" | "assistant"; content: string }[],
  onChunk: (chunk: StreamChunk) => void,
  onDone: () => void,
  onError: (error: Error) => void,
  signal?: AbortSignal,
  persona?: PersonaRole,
): Promise<void> {
  try {
    const copilotCtx = await buildCopilotContext(ctx);

    // Check for executive briefing requests
    const lastMessage = messages[messages.length - 1]?.content?.toLowerCase() ?? "";
    if (lastMessage.includes("executive briefing") || lastMessage.includes("executive brief") || lastMessage === "generate executive briefing") {
      const period = lastMessage.includes("quarterly") ? "quarterly" as const
        : lastMessage.includes("monthly") ? "monthly" as const
        : lastMessage.includes("weekly") ? "weekly" as const
        : "daily" as const;
      const briefing = await generateExecutiveBriefing(ctx, period);
      const briefingText = formatBriefing(briefing);
      const followUps = buildFollowUpQuestions(briefingText, persona);
      onChunk({ content: briefingText, citations: ["Executive Briefing", ...briefing.sections.map((s) => s.title)], followUps });
      onDone();
      return;
    }

    // Check for transaction investigation
    const txMatch = lastMessage.match(/(?:trace|investigate|track|lifecycle of)\s*(?:transaction|payment|txn?)\s*[-#]?\s*(\w+)/i);
    if (txMatch) {
      const txId = txMatch[1]!.toUpperCase().startsWith("TXN") ? txMatch[1]! : `TXN-${txMatch[1]!}`;
      const timeline = await traceTransactionLifecycle(ctx, txId);
      if (timeline) {
        const timelineText = formatTimeline(timeline);
        const followUps = buildFollowUpQuestions(timelineText, persona);
        onChunk({ content: timelineText, citations: ["Transactions", "Approvals", "Ledger", "Audit", "Policy Engine"], followUps });
        onDone();
        return;
      }
    }

    // Check for knowledge index
    if (lastMessage.includes("knowledge index") || lastMessage.includes("what data") || lastMessage.includes("all modules")) {
      const ki = await buildKnowledgeIndex(ctx);
      const text = `## Knowledge Index\n\n${ki.modules.map((m) => `- **${m.name}**: ${m.recordCount} records — ${m.summary}`).join("\n")}\n\n**Total: ${ki.totalRecords} records across ${ki.modules.length} modules.**`;
      const followUps = buildFollowUpQuestions(text, persona);
      onChunk({ content: text, citations: ki.modules.map((m) => m.name), followUps });
      onDone();
      return;
    }

    const systemPrompt = buildIntelligenceSystemPrompt(copilotCtx, persona);

    const apiMessages: ChatMessage[] = messages.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));

    const provider = await aiProviderRegistry.getActive();
    const model = process.env.AI_MODEL || provider.getModels()[0]?.id || "gpt-4o-mini";

    if (!provider.isAvailable()) {
      // Offline mode — respond with available data
      const offlineResponse = buildOfflineResponse(copilotCtx, lastMessage);
      const followUps = buildFollowUpQuestions(offlineResponse, persona);
      const sources = extractSources(offlineResponse);
      onChunk({ content: offlineResponse, citations: sources, followUps });
      onDone();
      return;
    }

    await promptExecutionService.executeStream(
      systemPrompt,
      apiMessages,
      (chunk) => {
        if (chunk.content) {
          onChunk({ content: chunk.content, citations: [], followUps: [] });
        }
      },
      (result) => {
        const sources = extractSources(result.content);
        const followUps = buildFollowUpQuestions(result.content, persona);
        onChunk({ content: "", citations: sources, followUps });
        onDone();
      },
      (error) => {
        // Fallback to offline mode on API error
        const offlineResponse = buildOfflineResponse(copilotCtx, lastMessage);
        const followUps = buildFollowUpQuestions(offlineResponse, persona);
        const sources = extractSources(offlineResponse);
        onChunk({ content: offlineResponse, citations: sources, followUps });
        onDone();
      },
      {
        model,
        feature: "copilot-chat",
        companyId: ctx.companyId,
        userId: ctx.userId,
        signal,
        temperature: 0.2,
        maxTokens: 4096,
      },
    );
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      onDone();
      return;
    }
    onError(error instanceof Error ? error : new Error(String(error)));
  }
}

export async function generateTitle(
  ctx: TenantContext,
  userMessage: string,
): Promise<string> {
  try {
    const provider = await aiProviderRegistry.getActive();
    if (!provider.isAvailable()) return "New conversation";

    const result = await promptExecutionService.execute(
      "Generate a short title (3-6 words) for a conversation that starts with this message. Respond with ONLY the title, no quotes or punctuation.",
      [{ role: "user", content: userMessage }],
      {
        maxTokens: 30,
        temperature: 0.3,
        feature: "copilot-title",
        companyId: ctx.companyId,
        userId: ctx.userId,
      },
    );

    return (result.content || "New conversation").trim();
  } catch (err) {
    logger.error(err, "Failed to generate conversation title");
    return "New conversation";
  }
}

function buildOfflineResponse(ctx: { summary: string; walletBalances: string; recentTransactions: string; pendingApprovals: string; recentAudit: string; openRiskAlerts: string; treasurySummary: string; policySummary: string; ledgerSummary: string; reconciliationSummary: string; calendarSummary: string; notificationSummary: string; exchangeRates: string; userCount: string }, query: string): string {
  const lower = query.toLowerCase();
  const sections: string[] = [];

  if (lower.includes("treasury") || lower.includes("wallet") || lower.includes("balance") || lower.includes("cash")) {
    sections.push("**Treasury & Wallet Balances**\n" + ctx.walletBalances);
    sections.push("**Treasury Accounts**\n" + ctx.treasurySummary);
  }
  if (lower.includes("transaction") || lower.includes("payment") || lower.includes("transfer")) {
    sections.push("**Recent Transactions**\n" + ctx.recentTransactions);
  }
  if (lower.includes("approval") || lower.includes("pending")) {
    sections.push("**Pending Approvals**\n" + ctx.pendingApprovals);
  }
  if (lower.includes("audit") || lower.includes("security") || lower.includes("compliance") || lower.includes("log")) {
    sections.push("**Recent Audit Activity**\n" + ctx.recentAudit);
  }
  if (lower.includes("risk") || lower.includes("alert") || lower.includes("incident")) {
    sections.push("**Open Risk Alerts**\n" + ctx.openRiskAlerts);
  }
  if (lower.includes("policy") || lower.includes("rule")) {
    sections.push("**Policies**\n" + ctx.policySummary);
  }
  if (lower.includes("ledger") || lower.includes("journal") || lower.includes("entry")) {
    sections.push("**Recent Ledger Entries**\n" + ctx.ledgerSummary);
  }
  if (lower.includes("recon") || lower.includes("match") || lower.includes("settlement")) {
    sections.push("**Reconciliation Status**\n" + ctx.reconciliationSummary);
  }
  if (lower.includes("calendar") || lower.includes("event") || lower.includes("holiday")) {
    sections.push("**Upcoming Calendar Events**\n" + ctx.calendarSummary);
  }
  if (lower.includes("fx") || lower.includes("exchange") || lower.includes("currency") || lower.includes("rate")) {
    sections.push("**Exchange Rates**\n" + ctx.exchangeRates);
  }
  if (lower.includes("user") || lower.includes("employee") || lower.includes("people")) {
    sections.push("**Users**: " + ctx.userCount);
  }
  if (lower.includes("notification") || lower.includes("bell") || lower.includes("unread")) {
    sections.push("**Notifications**: " + ctx.notificationSummary);
  }

  if (sections.length === 0) {
    sections.push(ctx.summary);
  }

  return [
    "**Summary**",
    ctx.summary,
    "",
    ...sections,
    "",
    "**Confidence**: High (based on live platform data)",
    "**Sources**: " + extractSources(query).join(", ") || "All available modules",
    "",
    "**Note**: AI_API_KEY not configured — responses use available live data. Set AI_API_KEY in your .env for AI-powered natural language responses.",
  ].join("\n");
}

function formatBriefing(briefing: Awaited<ReturnType<typeof generateExecutiveBriefing>>): string {
  return [
    `# ${briefing.title}`,
    `Generated: ${new Date(briefing.generatedAt).toLocaleString()}`,
    "",
    ...briefing.sections.map((s) => [
      `## ${s.title}`,
      s.summary,
      "",
      s.details,
      `Confidence: ${s.confidence}`,
      ...(s.recommendations?.length ? ["", "**Recommendations:**", ...s.recommendations.map((r) => `- ${r}`)] : []),
    ].join("\n")),
    "",
    "## Overall Recommendations",
    ...(briefing.recommendations.length > 0
      ? briefing.recommendations.map((r) => `- ${r}`)
      : ["No critical actions required at this time."]),
  ].join("\n");
}

function formatTimeline(timeline: Awaited<ReturnType<typeof traceTransactionLifecycle>>): string {
  if (!timeline) return "Transaction not found.";
  return [
    `# Transaction Lifecycle: ${timeline.transactionId}`,
    `Final Status: **${timeline.status}**${timeline.duration ? ` | Total Duration: ${timeline.duration}` : ""}`,
    "",
    "## Event Timeline",
    ...timeline.events.map((e, i) => [
      `### ${i + 1}. ${e.stage} [${e.module}]`,
      `**Time**: ${new Date(e.timestamp).toLocaleString()}`,
      `**Detail**: ${e.summary}`,
      `**Status**: ${e.status}`,
    ].join("\n")),
  ].join("\n\n");
}
