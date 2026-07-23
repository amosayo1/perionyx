import type { SearchDocument, SearchQuery, SearchResult, SearchHighlight } from "./types";
import { FIELD_WEIGHTS, SEARCH_SOURCE_WEIGHTS } from "./types";
import { searchIndexManager } from "./search-index-manager";

export class SearchRankingEngine {
  rank(documents: SearchDocument[], query: SearchQuery): SearchResult[] {
    const queryTokens = this.tokenize(query.query);

    const scored = documents.map((doc) => {
      const score = this.computeScore(doc, queryTokens, query);
      const highlights = this.generateHighlights(doc, queryTokens);

      return {
        document: doc,
        score: Math.round(score * 1000) / 1000,
        highlights,
        explanation: this.explainScore(doc, score, queryTokens),
      };
    });

    scored.sort((a, b) => {
      if (a.document.pinned !== b.document.pinned) {
        return a.document.pinned ? -1 : 1;
      }
      return b.score - a.score;
    });

    return scored;
  }

  private computeScore(doc: SearchDocument, queryTokens: string[], query: SearchQuery): number {
    if (queryTokens.length === 0) return 0;

    const docText = [
      { field: "title", text: doc.title },
      { field: "description", text: doc.description },
      { field: "content", text: doc.content },
    ];

    let relevanceScore = 0;

    for (const { field, text } of docText) {
      const tokens = this.tokenize(text);
      const fieldWeight = FIELD_WEIGHTS[field as keyof typeof FIELD_WEIGHTS] ?? 1.0;

      for (const queryToken of queryTokens) {
        const tf = tokens.filter((t) => t === queryToken).length / Math.max(tokens.length, 1);
        if (tf > 0) {
          const totalDocs = Math.max(searchIndexManager.getDocumentCount(), 1);
          const idf = Math.log(1 + totalDocs / Math.max(1, this.docFrequency(queryToken)));
          relevanceScore += tf * idf * fieldWeight;
        }
      }
    }

    const sourceWeight = SEARCH_SOURCE_WEIGHTS[doc.sourceType] ?? 0.5;
    relevanceScore *= sourceWeight;

    const recencyBoost = this.recencyBoost(doc.updatedAt);
    relevanceScore *= recencyBoost;

    const importanceBoost = 1 + doc.businessImportance * 0.1;
    relevanceScore *= importanceBoost;

    if (query.mode === "ENTITY" && doc.entityType) {
      relevanceScore *= 1.5;
    }

    if (query.mode === "RELATIONSHIP") {
      relevanceScore *= 1.3;
    }

    return relevanceScore;
  }

  private tokenize(text: string): string[] {
    return text.toLowerCase().replace(/[^a-z0-9\s\-_]/g, " ").trim().split(/\s+/).filter(
      (t) => t.length > 1,
    );
  }

  private docFrequency(token: string): number {
    const posting = (searchIndexManager as unknown as { invertedIndex: Map<string, Set<string>> }).invertedIndex?.get(token);
    return posting?.size ?? 0;
  }

  private recencyBoost(updatedAt: string): number {
    const age = Date.now() - new Date(updatedAt).getTime();
    const ageDays = age / 86_400_000;
    if (ageDays < 1) return 1.5;
    if (ageDays < 7) return 1.3;
    if (ageDays < 30) return 1.1;
    if (ageDays < 90) return 1.0;
    if (ageDays < 365) return 0.8;
    return 0.5;
  }

  private generateHighlights(doc: SearchDocument, queryTokens: string[]): SearchHighlight[] {
    const highlights: SearchHighlight[] = [];
    const seen = new Set<string>();

    for (const token of queryTokens) {
      const highlightField = (fieldName: string, text: string) => {
        const lower = text.toLowerCase();
        const idx = lower.indexOf(token);
        if (idx >= 0) {
          const key = `${fieldName}:${token}`;
          if (!seen.has(key)) {
            const start = Math.max(0, idx - 40);
            const end = Math.min(text.length, idx + token.length + 40);
            let snippet = text.slice(start, end);
            if (start > 0) snippet = "..." + snippet;
            if (end < text.length) snippet = snippet + "...";
            highlights.push({ field: fieldName, snippet });
            seen.add(key);
          }
        }
      };

      highlightField("title", doc.title);
      highlightField("description", doc.description);
      highlightField("content", doc.content);
    }

    return highlights.slice(0, 3);
  }

  private explainScore(doc: SearchDocument, score: number, queryTokens: string[]): string {
    if (score === 0) return "No relevant matches found.";
    const parts: string[] = [];
    parts.push(`Score ${score.toFixed(2)}`);

    const titleMatch = queryTokens.filter((t) => doc.title.toLowerCase().includes(t));
    if (titleMatch.length > 0) {
      parts.push(`matched in title: "${titleMatch.join(", ")}"`);
    }

    const descMatch = queryTokens.filter((t) => doc.description.toLowerCase().includes(t));
    if (descMatch.length > 0) {
      parts.push(`matched in description: "${descMatch.join(", ")}"`);
    }

    parts.push(`source: ${doc.sourceType}`);
    if (doc.pinned) parts.push("pinned result");

    return parts.join(" | ");
  }

  rerankByRelationship(relationships: Map<string, number>): (results: SearchResult[]) => SearchResult[] {
    return (results: SearchResult[]) => {
      return results.map((r) => {
        const relBoost = relationships.get(r.document.entityId) ?? 0;
        return {
          ...r,
          score: r.score + relBoost * 0.5,
          explanation: relBoost > 0
            ? `${r.explanation} | +${(relBoost * 0.5).toFixed(2)} from entity relationships`
            : r.explanation,
        };
      }).sort((a, b) => b.score - a.score);
    };
  }
}

export const searchRankingEngine = new SearchRankingEngine();
