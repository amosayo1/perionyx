import type { RecentSearchEntry, SavedSearch, SearchMode, SearchFilter } from "./types";

export class RecentSearchService {
  private recentSearches = new Map<string, RecentSearchEntry[]>();
  private savedSearches = new Map<string, SavedSearch[]>();
  private readonly maxRecentPerUser = 50;

  private userKey(userId: string, companyId: string): string {
    return `${userId}:${companyId}`;
  }

  recordSearch(
    userId: string,
    companyId: string,
    query: string,
    mode: SearchMode,
    resultCount: number,
  ): void {
    const key = this.userKey(userId, companyId);
    const entries = this.recentSearches.get(key) ?? [];

    const existingIdx = entries.findIndex((e) => e.query === query && e.mode === mode);
    if (existingIdx >= 0) {
      entries.splice(existingIdx, 1);
    }

    entries.unshift({
      userId,
      companyId,
      query,
      mode,
      resultCount,
      searchedAt: new Date().toISOString(),
    });

    if (entries.length > this.maxRecentPerUser) {
      entries.pop();
    }

    this.recentSearches.set(key, entries);
  }

  getRecent(userId: string, companyId: string, limit = 10): RecentSearchEntry[] {
    const key = this.userKey(userId, companyId);
    const entries = this.recentSearches.get(key) ?? [];
    return entries.slice(0, limit);
  }

  clearRecent(userId: string, companyId: string): void {
    const key = this.userKey(userId, companyId);
    this.recentSearches.delete(key);
  }

  saveSearch(
    userId: string,
    companyId: string,
    name: string,
    query: string,
    mode: SearchMode,
    filters?: SearchFilter[],
  ): SavedSearch {
    const key = this.userKey(userId, companyId);
    const searches = this.savedSearches.get(key) ?? [];

    const saved: SavedSearch = {
      id: `saved-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      userId,
      companyId,
      name,
      query,
      mode,
      filters,
      createdAt: new Date().toISOString(),
    };

    searches.push(saved);
    this.savedSearches.set(key, searches);
    return saved;
  }

  deleteSavedSearch(userId: string, companyId: string, searchId: string): boolean {
    const key = this.userKey(userId, companyId);
    const searches = this.savedSearches.get(key);
    if (!searches) return false;

    const idx = searches.findIndex((s) => s.id === searchId);
    if (idx < 0) return false;

    searches.splice(idx, 1);
    if (searches.length === 0) {
      this.savedSearches.delete(key);
    } else {
      this.savedSearches.set(key, searches);
    }
    return true;
  }

  getSavedSearches(userId: string, companyId: string): SavedSearch[] {
    const key = this.userKey(userId, companyId);
    return this.savedSearches.get(key) ?? [];
  }

  getSavedSearch(userId: string, companyId: string, searchId: string): SavedSearch | undefined {
    const key = this.userKey(userId, companyId);
    return (this.savedSearches.get(key) ?? []).find((s) => s.id === searchId);
  }
}

export const recentSearchService = new RecentSearchService();
