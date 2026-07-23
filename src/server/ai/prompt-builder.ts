import type { UserContext, PageContext, Citation, TimeContext, ConversationEntry } from "./types";
import { ROLE_SYSTEM_PROMPTS } from "./types";

export class PromptBuilder {
  buildSystemPrompt(user: UserContext, page: PageContext, timeContext: TimeContext): string {
    const rolePrompt = this.getRolePrompt(user.roles);

    return `${rolePrompt}

## USER CONTEXT
- Name: ${user.userName}
- Company: ${user.companyName}
- Roles: ${user.roles.join(", ")}
- Current Page: ${page.currentPage} (module: ${page.currentModule})
${page.selectedEntityType && page.selectedEntityId ? `- Selected Entity: ${page.selectedEntityType} (${page.selectedEntityId.slice(0, 12)})` : ""}

## TIME CONTEXT
- Now: ${timeContext.now}
- Today: ${timeContext.todayStart}
- This Month: ${timeContext.thisMonthStart}
- This Year: ${timeContext.thisYearStart}

## RULES
1. NEVER fabricate data. Only reference information provided in the evidence.
2. If you don't have enough information, say so clearly.
3. Always cite your sources using the evidence provided.
4. Be concise and precise — this is a financial context.
5. Never expose data the user does not have permission to see.
6. If asked about something outside the user's role scope, defer gracefully.
7. For numbers, always provide the unit and currency when applicable.
8. When recommending actions, be specific about what to do and why.
9. Format monetary values consistently (e.g., AED 100,000).`;
  }

  buildUserPrompt(
    message: string,
    citations: Citation[],
    history: ConversationEntry[],
  ): string {
    const parts: string[] = [];

    if (history.length > 0) {
      const recentHistory = history.slice(-6);
      parts.push("## RECENT CONVERSATION");
      for (const entry of recentHistory) {
        const prefix = entry.role === "user" ? "User" : "Assistant";
        const content = entry.content.slice(0, 500);
        parts.push(`${prefix}: ${content}`);
      }
    }

    if (citations.length > 0) {
      parts.push("## AVAILABLE EVIDENCE");
      for (const c of citations.slice(0, 15)) {
        parts.push(`- [${c.source}@${c.module}] ${c.snippet}`);
      }
    }

    parts.push(`## USER QUESTION\n${message}`);
    parts.push("\nRespond with a clear, concise answer. Include citations inline as [Source: Module]. Suggest specific actions where appropriate.");

    return parts.join("\n\n");
  }

  buildContextSummary(user: UserContext, page: PageContext, timeContext: TimeContext): string {
    return [
      `User: ${user.userName}`,
      `Company: ${user.companyName}`,
      `Role: ${user.roles.join(", ") ?? "Unknown"}`,
      `Page: ${page.currentPage}`,
      `Time: ${timeContext.now}`,
    ].join(" | ");
  }

  private getRolePrompt(roles: string[]): string {
    const priority = ["CFO", "Treasurer", "Controller", "FinanceManager", "Auditor", "Operations", "Administrator"];

    for (const role of priority) {
      if (roles.includes(role) && ROLE_SYSTEM_PROMPTS[role]) {
        return ROLE_SYSTEM_PROMPTS[role];
      }
    }

    return ROLE_SYSTEM_PROMPTS.FinanceManager ?? "";
  }
}

export const promptBuilder = new PromptBuilder();
