import type {
  AssistantRequest, AssistantResponse, AIProvider, AIProviderRequest, AIProviderResponse,
  ConversationEntry, SuggestedAction, Citation, UserContext, PageContext,
} from "./types";
import { aiOrchestrator } from "./ai-orchestrator";
import { conversationMemory } from "./conversation-memory";
import { conversationContextEngine } from "./conversation-context-engine";
import { aiAuditService } from "./ai-audit-service";
import { enterpriseSearchEngine } from "@/server/search";

export class EnterpriseAssistant {
  async ask(request: AssistantRequest): Promise<AssistantResponse> {
    return aiOrchestrator.process(request);
  }

  askStreaming(
    request: AssistantRequest,
  ): AsyncIterable<AssistantResponse> {
    const self = this;
    return {
      [Symbol.asyncIterator](): AsyncIterator<AssistantResponse> {
        let done = false;
        return {
          async next(): Promise<IteratorResult<AssistantResponse>> {
            if (done) return { done: true, value: undefined as unknown as AssistantResponse };
            done = true;
            const response = await self.ask(request);
            return { done: false, value: response };
          },
        };
      },
    };
  }

  registerProvider(provider: AIProvider): void {
    aiOrchestrator.registerProvider(provider);
  }

  isReady(): boolean {
    return aiOrchestrator.isReady();
  }

  getConversationHistory(conversationId: string): ConversationEntry[] {
    return conversationMemory.getRecentHistory(conversationId, 50);
  }

  getUserConversations(userId: string, companyId: string): { id: string; lastActivityAt: string; entryCount: number }[] {
    return conversationMemory.getUserSessions(userId, companyId).map((s) => ({
      id: s.id,
      lastActivityAt: s.lastActivityAt,
      entryCount: s.entries.length,
    }));
  }

  deleteConversation(conversationId: string): void {
    conversationMemory.deleteSession(conversationId);
  }

  async refreshContext(conversationId: string): Promise<void> {
    await conversationContextEngine.refreshContext(conversationId);
  }

  async searchRelated(userId: string, companyId: string, query: string, userPermissions: Set<string>) {
    return enterpriseSearchEngine.search(
      { query, mode: "GLOBAL", companyId, userId, limit: 10, offset: 0 },
      userPermissions,
    );
  }

  getAuditLog(companyId: string, limit = 100) {
    return aiAuditService.getByCompany(companyId, limit);
  }

  getStats() {
    return aiAuditService.getStats();
  }

  getChatStats() {
    return conversationMemory.getStats();
  }
}

export const enterpriseAssistant = new EnterpriseAssistant();
