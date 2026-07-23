import type { SearchSuggestion, SearchSourceType } from "./types";
import { searchIndexManager } from "./search-index-manager";
import { recentSearchService } from "./recent-search-service";

export class SearchSuggestionEngine {
  async suggest(
    prefix: string,
    companyId: string,
    userId: string,
    limit = 10,
  ): Promise<SearchSuggestion[]> {
    if (!prefix || prefix.length < 1) return [];

    const suggestions: SearchSuggestion[] = [];
    const seen = new Set<string>();

    const indexTokens = searchIndexManager.getCommonTokens(prefix, limit);
    for (const { token, count } of indexTokens) {
      const key = `query:${token}`;
      if (!seen.has(key) && suggestions.length < limit) {
        suggestions.push({
          text: token,
          type: "query",
          score: Math.min(count / 100, 1),
          sourceType: this.inferSourceType(token),
        });
        seen.add(key);
      }
    }

    const recent = recentSearchService.getRecent(userId, companyId, 5);
    for (const entry of recent) {
      const lower = entry.query.toLowerCase();
      if (lower.startsWith(prefix.toLowerCase()) && !seen.has(`recent:${entry.query}`) && suggestions.length < limit) {
        suggestions.push({
          text: entry.query,
          type: "recent",
          score: 0.6,
        });
        seen.add(`recent:${entry.query}`);
      }
    }

    const saved = recentSearchService.getSavedSearches(userId, companyId);
    for (const savedSearch of saved) {
      const lower = savedSearch.name.toLowerCase();
      if (lower.startsWith(prefix.toLowerCase()) && !seen.has(`saved:${savedSearch.id}`) && suggestions.length < limit) {
        suggestions.push({
          text: savedSearch.name,
          type: "saved",
          score: 0.8,
        });
        seen.add(`saved:${savedSearch.id}`);
      }
    }

    return suggestions.sort((a, b) => b.score - a.score).slice(0, limit);
  }

  private inferSourceType(_token: string): SearchSourceType | undefined {
    return undefined;
  }
}

export const searchSuggestionEngine = new SearchSuggestionEngine();
