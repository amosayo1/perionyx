import type { Citation, CitationSource } from "./types";

export class CitationGenerator {
  formatText(citations: Citation[]): string {
    if (citations.length === 0) return "";

    const grouped = this.groupByModule(citations);
    const parts: string[] = [];

    for (const [module, group] of Object.entries(grouped)) {
      const entries = group.map((c, i) => {
        const entityStr = c.entityType && c.entityId
          ? ` (${c.entityType}:${c.entityId.slice(0, 8)})`
          : "";
        return `  ${i + 1}. ${c.snippet}${entityStr} [${c.source}]`;
      });
      parts.push(`${module}:\n${entries.join("\n")}`);
    }

    return parts.join("\n\n");
  }

  deduplicate(citations: Citation[]): Citation[] {
    const seen = new Set<string>();
    return citations.filter((c) => {
      const key = `${c.source}:${c.module}:${c.snippet.slice(0, 100)}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  prioritize(citations: Citation[], maxCount = 10): Citation[] {
    return citations
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, maxCount);
  }

  private groupByModule(citations: Citation[]): Record<string, Citation[]> {
    const groups: Record<string, Citation[]> = {};
    for (const c of citations) {
      const key = c.module;
      if (!groups[key]) groups[key] = [];
      groups[key].push(c);
    }
    return groups;
  }
}

export const citationGenerator = new CitationGenerator();
