import type { SearchQuery, SearchResult, SearchSuggestion, SavedSearch, SearchAuditEntry, SearchIndexStats, SearchAnalyticsEvent } from "./types";
import { searchIndexManager } from "./search-index-manager";
import { searchRankingEngine } from "./search-ranking-engine";
import { searchPermissionFilter } from "./search-permission-filter";
import { searchSuggestionEngine } from "./search-suggestion-engine";
import { recentSearchService } from "./recent-search-service";
import { searchAnalytics } from "./search-analytics";
import { searchAuditService } from "./search-audit-service";
import { knowledgeIndexer } from "./knowledge-indexer";
import { semanticSearchService } from "./semantic-search-service";
import { entityResolver } from "./entity-resolver";

export class EnterpriseSearchEngine {
  async search(query: SearchQuery, userPermissions: Set<string>): Promise<SearchResult[]> {
    const startTime = Date.now();

    const parsed = semanticSearchService.parse(query.query);

    const combinedQuery: SearchQuery = {
      ...query,
      filters: [...(query.filters ?? []), ...parsed.filters],
    };

    let documents = searchIndexManager.search(parsed.query, combinedQuery.filters);

    documents = searchPermissionFilter.filter(documents, userPermissions, combinedQuery);

    const results = searchRankingEngine.rank(documents, {
      ...combinedQuery,
      query: parsed.query,
    });

    const paginated = results.slice(query.offset ?? 0, (query.offset ?? 0) + query.limit);

    const latencyMs = Date.now() - startTime;

    recentSearchService.recordSearch(query.userId, query.companyId, query.query, query.mode, paginated.length);

    searchAnalytics.recordEvent({
      query: query.query,
      resultCount: paginated.length,
      latencyMs,
      mode: query.mode,
      userId: query.userId,
      companyId: query.companyId,
      timestamp: new Date().toISOString(),
    });

    searchAuditService.record("SEARCH", query.query, query.mode, query.userId, query.companyId, paginated.length, latencyMs);

    return paginated;
  }

  async suggest(prefix: string, companyId: string, userId: string): Promise<SearchSuggestion[]> {
    const startTime = Date.now();
    const suggestions = await searchSuggestionEngine.suggest(prefix, companyId, userId);
    const latencyMs = Date.now() - startTime;

    searchAuditService.record("SUGGEST", prefix, "KEYWORD", userId, companyId, suggestions.length, latencyMs);

    return suggestions;
  }

  async searchByEntity(
    entityType: string,
    entityId: string,
    companyId: string,
    userId: string,
    userPermissions: Set<string>,
  ): Promise<SearchResult[]> {
    const query: SearchQuery = {
      query: entityId,
      mode: "ENTITY",
      companyId,
      userId,
      limit: 50,
      offset: 0,
      filters: [{ field: "entityId", operator: "eq", value: entityId }],
    };

    return this.search(query, userPermissions);
  }

  async searchByRelationship(
    queryText: string,
    companyId: string,
    userId: string,
    userPermissions: Set<string>,
  ): Promise<SearchResult[]> {
    const query: SearchQuery = {
      query: queryText,
      mode: "RELATIONSHIP",
      companyId,
      userId,
      limit: 50,
      offset: 0,
    };

    return this.search(query, userPermissions);
  }

  getRecentSearches(userId: string, companyId: string, limit = 10) {
    return recentSearchService.getRecent(userId, companyId, limit);
  }

  clearRecentSearches(userId: string, companyId: string): void {
    recentSearchService.clearRecent(userId, companyId);
  }

  saveSearch(
    userId: string,
    companyId: string,
    name: string,
    query: string,
    filters?: { field: string; operator: "eq" | "neq" | "in" | "gt" | "gte" | "lt" | "lte" | "contains"; value: unknown }[],
  ): SavedSearch {
    return recentSearchService.saveSearch(userId, companyId, name, query, "SAVED", filters);
  }

  deleteSavedSearch(userId: string, companyId: string, searchId: string): boolean {
    return recentSearchService.deleteSavedSearch(userId, companyId, searchId);
  }

  getSavedSearches(userId: string, companyId: string): SavedSearch[] {
    return recentSearchService.getSavedSearches(userId, companyId);
  }

  async reindex(companyId: string) {
    searchIndexManager.clear();
    const result = await knowledgeIndexer.indexAll(companyId);

    searchAuditService.record("REINDEX", "*", "GLOBAL", "system", companyId, result.totalDocuments, result.durationMs);

    return result;
  }

  async reindexSource(companyId: string, source: import("./types").SearchSourceType) {
    const docs = searchIndexManager.getDocumentsBySource(source);
    for (const doc of docs) {
      searchIndexManager.removeDocument(doc.id);
    }

    return knowledgeIndexer.indexSource(source, companyId);
  }

  getStats(): SearchIndexStats {
    return searchIndexManager.getStats();
  }

  getAnalytics() {
    return searchAnalytics.getStats();
  }

  getAuditLog(companyId: string, limit = 100): SearchAuditEntry[] {
    return searchAuditService.getByCompany(companyId, limit);
  }

  getDocumentCount(): number {
    return searchIndexManager.getDocumentCount();
  }

  async warmCache(companyId: string): Promise<void> {
    const existing = searchIndexManager.getDocumentCount();
    if (existing > 0) return;

    await this.reindex(companyId);
  }
}

export const enterpriseSearchEngine = new EnterpriseSearchEngine();
