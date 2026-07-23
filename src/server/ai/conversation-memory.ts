import type { ConversationSession, ConversationEntry, Citation, SuggestedAction } from "./types";

export class ConversationMemory {
  private sessions = new Map<string, ConversationSession>();
  private readonly maxEntriesPerSession = 50;
  private readonly maxSessions = 10_000;

  createSession(userId: string, companyId: string): ConversationSession {
    const id = `conv-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    const session: ConversationSession = {
      id,
      userId,
      companyId,
      entries: [],
      recentEntityIds: [],
      startedAt: new Date().toISOString(),
      lastActivityAt: new Date().toISOString(),
      metadata: {},
    };
    this.sessions.set(id, session);
    this.trim();
    return session;
  }

  getSession(sessionId: string): ConversationSession | undefined {
    return this.sessions.get(sessionId);
  }

  addEntry(
    sessionId: string,
    role: ConversationEntry["role"],
    content: string,
    citations?: Citation[],
    actions?: SuggestedAction[],
  ): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    const entry: ConversationEntry = {
      role,
      content,
      timestamp: new Date().toISOString(),
      citations,
      actions,
    };

    session.entries.push(entry);
    session.lastActivityAt = new Date().toISOString();

    if (session.entries.length > this.maxEntriesPerSession) {
      session.entries = session.entries.slice(-this.maxEntriesPerSession);
    }
  }

  updatePageContext(sessionId: string, page: string, entityType?: string, entityId?: string): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    session.currentPage = page;
    if (entityType) session.currentEntityType = entityType;
    if (entityId) {
      session.currentEntityId = entityId;
      if (!session.recentEntityIds.includes(entityId)) {
        session.recentEntityIds.push(entityId);
        if (session.recentEntityIds.length > 20) {
          session.recentEntityIds = session.recentEntityIds.slice(-20);
        }
      }
    }
    session.lastActivityAt = new Date().toISOString();
  }

  getRecentEntities(sessionId: string): string[] {
    return this.sessions.get(sessionId)?.recentEntityIds ?? [];
  }

  getRecentHistory(sessionId: string, count = 10): ConversationEntry[] {
    const session = this.sessions.get(sessionId);
    if (!session) return [];
    return session.entries.slice(-count);
  }

  updateMetadata(sessionId: string, metadata: Record<string, unknown>): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;
    Object.assign(session.metadata, metadata);
  }

  deleteSession(sessionId: string): void {
    this.sessions.delete(sessionId);
  }

  getUserSessions(userId: string, companyId: string, limit = 10): ConversationSession[] {
    return Array.from(this.sessions.values())
      .filter((s) => s.userId === userId && s.companyId === companyId)
      .sort((a, b) => new Date(b.lastActivityAt).getTime() - new Date(a.lastActivityAt).getTime())
      .slice(0, limit);
  }

  getStats(): { totalSessions: number; totalEntries: number } {
    let totalEntries = 0;
    for (const session of this.sessions.values()) {
      totalEntries += session.entries.length;
    }
    return { totalSessions: this.sessions.size, totalEntries };
  }

  private trim(): void {
    if (this.sessions.size > this.maxSessions) {
      const sorted = Array.from(this.sessions.entries())
        .sort(([, a], [, b]) => new Date(b.lastActivityAt).getTime() - new Date(a.lastActivityAt).getTime());
      const toDelete = sorted.slice(this.maxSessions);
      for (const [id] of toDelete) {
        this.sessions.delete(id);
      }
    }
  }
}

export const conversationMemory = new ConversationMemory();
