import type {
  UserContext, PageContext, TimeContext, ConversationEntry,
  EntityRef, RecentAction,
} from "./types";
import { contextResolver } from "./context-resolver";
import { conversationMemory } from "./conversation-memory";
import { enterpriseSearchEngine } from "@/server/search";

export interface ResolvedConversationContext {
  user: UserContext;
  page: PageContext;
  time: TimeContext;
  history: ConversationEntry[];
  entities: EntityRef[];
  recentActions: RecentAction[];
  conversationId: string;
}

export class ConversationContextEngine {
  async resolve(
    userId: string,
    companyId: string,
    page: string,
    conversationId?: string,
    selectedEntityType?: string,
    selectedEntityId?: string,
    recentActions?: RecentAction[],
  ): Promise<ResolvedConversationContext> {
    const [user, pageContext, time] = await Promise.all([
      contextResolver.resolveUser(userId, companyId),
      contextResolver.resolvePage(page),
      Promise.resolve(contextResolver.getTimeContext()),
    ]);

    if (!conversationId || !conversationMemory.getSession(conversationId)) {
      const session = conversationMemory.createSession(userId, companyId);
      conversationId = session.id;
    }

    conversationMemory.updatePageContext(conversationId, page, selectedEntityType, selectedEntityId);
    const history = conversationMemory.getRecentHistory(conversationId, 10);

    const entities = await this.resolveEntities(selectedEntityType, selectedEntityId, companyId);

    const resolvedRecentActions = recentActions ?? [];

    return {
      user,
      page: pageContext,
      time,
      history,
      entities,
      recentActions: resolvedRecentActions,
      conversationId,
    };
  }

  private async resolveEntities(
    entityType?: string,
    entityId?: string,
    _companyId?: string,
  ): Promise<EntityRef[]> {
    if (!entityType || !entityId) return [];

    return [
      {
        type: entityType,
        id: entityId,
        label: `${entityType} ${entityId.slice(0, 8)}`,
        module: entityType.toLowerCase(),
      },
    ];
  }

  async refreshContext(
    conversationId: string,
  ): Promise<void> {
    const session = conversationMemory.getSession(conversationId);
    if (!session) return;

    if (session.currentPage) {
      const pageContext = await contextResolver.resolvePage(session.currentPage);
      conversationMemory.updatePageContext(
        conversationId,
        session.currentPage,
        session.currentEntityType,
        session.currentEntityId,
      );
    }
  }
}

export const conversationContextEngine = new ConversationContextEngine();
