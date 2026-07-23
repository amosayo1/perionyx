export { EnterpriseSearchEngine, enterpriseSearchEngine } from "./enterprise-search-engine";
export { SemanticSearchService, semanticSearchService } from "./semantic-search-service";
export { SearchIndexManager, searchIndexManager } from "./search-index-manager";
export { SearchRankingEngine, searchRankingEngine } from "./search-ranking-engine";
export { EntityResolver, entityResolver } from "./entity-resolver";
export { SearchSuggestionEngine, searchSuggestionEngine } from "./search-suggestion-engine";
export { RecentSearchService, recentSearchService } from "./recent-search-service";
export { SearchAnalytics, searchAnalytics } from "./search-analytics";
export { SearchPermissionFilter, searchPermissionFilter } from "./search-permission-filter";
export { KnowledgeIndexer, knowledgeIndexer } from "./knowledge-indexer";
export { SearchAuditService, searchAuditService } from "./search-audit-service";

export type {
  SearchSourceType,
  SearchMode,
  SearchDocument,
  SearchQuery,
  SearchFilter,
  SearchFilterOperator,
  SearchResult,
  SearchHighlight,
  SearchSuggestion,
  SearchAnalyticsEvent,
  SearchAuditEntry,
  SavedSearch,
  RecentSearchEntry,
  SearchIndexStats,
} from "./types";

export {
  SEARCH_SOURCE_LABELS,
  SEARCH_SOURCE_WEIGHTS,
  STOP_WORDS,
  FIELD_WEIGHTS,
} from "./types";
