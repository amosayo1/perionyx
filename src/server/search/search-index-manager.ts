import type { SearchDocument, SearchSourceType, SearchFilter, SearchIndexStats } from "./types";
import { STOP_WORDS, SEARCH_SOURCE_LABELS } from "./types";

export class SearchIndexManager {
  private documents = new Map<string, SearchDocument>();
  private invertedIndex = new Map<string, Set<string>>();
  private fieldIndex = new Map<string, Map<string, Set<string>>>();
  private sourceIndex = new Map<SearchSourceType, Set<string>>();
  private lastIndexedAt: string | null = null;

  private tokenize(text: string): string[] {
    const cleaned = text.toLowerCase().replace(/[^a-z0-9\s\-_]/g, " ").trim();
    const tokens = cleaned.split(/\s+/).filter(Boolean);
    const stopWords = STOP_WORDS;
    const result: string[] = [];
    for (const token of tokens) {
      if (!stopWords.has(token) && token.length > 1) {
        result.push(token);
      }
    }
    return result;
  }

  private tokenizeField(text: string): string[] {
    return this.tokenize(text);
  }

  addDocument(doc: SearchDocument): void {
    this.documents.set(doc.id, doc);

    const titleTokens = this.tokenizeField(doc.title);
    const descTokens = this.tokenizeField(doc.description);
    const contentTokens = this.tokenizeField(doc.content);
    const tagTokens = doc.tags.flatMap((t) => this.tokenizeField(t));

    const docTokens = new Set([...titleTokens, ...descTokens, ...contentTokens, ...tagTokens]);

    for (const token of docTokens) {
      const posting = this.invertedIndex.get(token) ?? new Set();
      posting.add(doc.id);
      this.invertedIndex.set(token, posting);
    }

    this.addToFieldIndex("title", titleTokens, doc.id);
    this.addToFieldIndex("description", descTokens, doc.id);
    this.addToFieldIndex("content", contentTokens, doc.id);
    this.addToFieldIndex("tags", tagTokens, doc.id);

    const source = doc.sourceType;
    const sourcePosting = this.sourceIndex.get(source) ?? new Set();
    sourcePosting.add(doc.id);
    this.sourceIndex.set(source, sourcePosting);

    this.lastIndexedAt = new Date().toISOString();
  }

  private addToFieldIndex(field: string, tokens: string[], docId: string): void {
    let fieldMap = this.fieldIndex.get(field);
    if (!fieldMap) {
      fieldMap = new Map();
      this.fieldIndex.set(field, fieldMap);
    }
    for (const token of tokens) {
      const posting = fieldMap.get(token) ?? new Set();
      posting.add(docId);
      fieldMap.set(token, posting);
    }
  }

  removeDocument(docId: string): void {
    const doc = this.documents.get(docId);
    if (!doc) return;

    const titleTokens = this.tokenizeField(doc.title);
    const descTokens = this.tokenizeField(doc.description);
    const contentTokens = this.tokenizeField(doc.content);
    const allTokens = new Set([...titleTokens, ...descTokens, ...contentTokens]);

    for (const token of allTokens) {
      const posting = this.invertedIndex.get(token);
      if (posting) {
        posting.delete(docId);
        if (posting.size === 0) this.invertedIndex.delete(token);
      }
    }

    this.removeFromFieldIndex("title", titleTokens, docId);
    this.removeFromFieldIndex("description", descTokens, docId);
    this.removeFromFieldIndex("content", contentTokens, docId);

    const source = doc.sourceType;
    const sourcePosting = this.sourceIndex.get(source);
    if (sourcePosting) {
      sourcePosting.delete(docId);
      if (sourcePosting.size === 0) this.sourceIndex.delete(source);
    }

    this.documents.delete(docId);
  }

  private removeFromFieldIndex(field: string, tokens: string[], docId: string): void {
    const fieldMap = this.fieldIndex.get(field);
    if (!fieldMap) return;
    for (const token of tokens) {
      const posting = fieldMap.get(token);
      if (posting) {
        posting.delete(docId);
        if (posting.size === 0) fieldMap.delete(token);
      }
    }
    if (fieldMap.size === 0) this.fieldIndex.delete(field);
  }

  search(query: string, filters?: SearchFilter[]): SearchDocument[] {
    const tokens = this.tokenizeField(query);
    if (tokens.length === 0) return [];

    const matchedIds = new Set<string>();
    for (const token of tokens) {
      const posting = this.invertedIndex.get(token);
      if (posting) {
        for (const docId of posting) {
          matchedIds.add(docId);
        }
      }
    }

    let results = Array.from(matchedIds).map((id) => this.documents.get(id)!).filter(Boolean);

    if (filters && filters.length > 0) {
      results = results.filter((doc) => this.matchesFilters(doc, filters));
    }

    return results;
  }

  searchByField(query: string, field: string): SearchDocument[] {
    const tokens = this.tokenizeField(query);
    if (tokens.length === 0) return [];

    const fieldMap = this.fieldIndex.get(field);
    if (!fieldMap) return [];

    const matchedIds = new Set<string>();
    for (const token of tokens) {
      const posting = fieldMap.get(token);
      if (posting) {
        for (const docId of posting) {
          matchedIds.add(docId);
        }
      }
    }

    return Array.from(matchedIds).map((id) => this.documents.get(id)!).filter(Boolean);
  }

  getDocument(docId: string): SearchDocument | undefined {
    return this.documents.get(docId);
  }

  getDocumentCount(): number {
    return this.documents.size;
  }

  getTokenCount(): number {
    return this.invertedIndex.size;
  }

  getDocumentsBySource(source: SearchSourceType): SearchDocument[] {
    const ids = this.sourceIndex.get(source);
    if (!ids) return [];
    return Array.from(ids).map((id) => this.documents.get(id)!).filter(Boolean);
  }

  getCommonTokens(prefix: string, limit = 20): { token: string; count: number }[] {
    const lower = prefix.toLowerCase();
    const matches: { token: string; count: number }[] = [];

    for (const [token, posting] of this.invertedIndex) {
      if (token.startsWith(lower)) {
        matches.push({ token, count: posting.size });
      }
    }

    return matches.sort((a, b) => b.count - a.count).slice(0, limit);
  }

  clear(): void {
    this.documents.clear();
    this.invertedIndex.clear();
    this.fieldIndex.clear();
    this.sourceIndex.clear();
    this.lastIndexedAt = null;
  }

  getStats(): SearchIndexStats {
    const documentsBySource = Object.fromEntries(
      Array.from(this.sourceIndex.entries()).map(([source, ids]) => [source, ids.size]),
    ) as Record<SearchSourceType, number>;

    return {
      totalDocuments: this.documents.size,
      totalTokens: this.invertedIndex.size,
      documentsBySource,
      lastIndexedAt: this.lastIndexedAt,
    };
  }

  private matchesFilters(doc: SearchDocument, filters: SearchFilter[]): boolean {
    return filters.every((f) => {
      const fieldValue = this.getFieldValue(doc, f.field);
      return this.applyOperator(fieldValue, f.operator, f.value);
    });
  }

  private getFieldValue(doc: SearchDocument, field: string): unknown {
    const parts = field.split(".");
    let value: unknown = doc;
    for (const part of parts) {
      if (value && typeof value === "object" && part in (value as Record<string, unknown>)) {
        value = (value as Record<string, unknown>)[part];
      } else {
        return undefined;
      }
    }
    return value;
  }

  private applyOperator(fieldValue: unknown, operator: string, target: unknown): boolean {
    switch (operator) {
      case "eq":
        return fieldValue === target;
      case "neq":
        return fieldValue !== target;
      case "in":
        return Array.isArray(target) && target.includes(fieldValue);
      case "gt":
        return typeof fieldValue === "number" && typeof target === "number" && fieldValue > target;
      case "gte":
        return typeof fieldValue === "number" && typeof target === "number" && fieldValue >= target;
      case "lt":
        return typeof fieldValue === "number" && typeof target === "number" && fieldValue < target;
      case "lte":
        return typeof fieldValue === "number" && typeof target === "number" && fieldValue <= target;
      case "contains":
        return typeof fieldValue === "string" && typeof target === "string" && fieldValue.toLowerCase().includes(target.toLowerCase());
      default:
        return true;
    }
  }
}

export const searchIndexManager = new SearchIndexManager();
