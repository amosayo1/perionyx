import type { SearchQuery, SearchFilter, SearchSourceType } from "./types";

interface ParsedQuery {
  query: string;
  filters: SearchFilter[];
  intent: "LIST" | "FIND" | "COUNT" | "COMPARE" | "UNKNOWN";
  targetSource?: SearchSourceType;
}

export class SemanticSearchService {
  parse(query: string): ParsedQuery {
    const lower = query.toLowerCase().trim();

    const q = this.extractFilters(lower);

    const intent = this.detectIntent(q.query);

    const targetSource = this.detectTargetSource(q.query);

    return {
      query: q.query,
      filters: q.filters,
      intent,
      targetSource,
    };
  }

  private extractFilters(query: string): { query: string; filters: SearchFilter[] } {
    const filters: SearchFilter[] = [];

    const statusMatch = query.match(/\b(status|state):(\w+)/);
    if (statusMatch) {
      filters.push({ field: "metadata.status", operator: "eq", value: statusMatch[2].toUpperCase() });
      query = query.replace(statusMatch[0], "").trim();
    }

    const typeMatch = query.match(/\b(type|category):(\w+)/);
    if (typeMatch) {
      filters.push({ field: "metadata.type", operator: "eq", value: typeMatch[2].toUpperCase() });
      query = query.replace(typeMatch[0], "").trim();
    }

    return { query, filters };
  }

  private detectIntent(query: string): ParsedQuery["intent"] {
    const lower = query.toLowerCase();

    if (/^(show|list|find|get|display|view)\b/.test(lower)) return "LIST";
    if (/^(how many|count|number of)\b/.test(lower)) return "COUNT";
    if (/^(compare|vs|versus|difference)\b/.test(lower)) return "COMPARE";
    if (/^(search|lookup|where|which)\b/.test(lower)) return "FIND";

    if (/\?$/.test(lower)) return "FIND";

    return "UNKNOWN";
  }

  private detectTargetSource(query: string): SearchSourceType | undefined {
    const lower = query.toLowerCase();

    const patterns: [RegExp, SearchSourceType][] = [
      [/\b(?:payment|payments|transaction|transactions|transfer|transfers)\b/, "PAYMENT"],
      [/\b(?:invoice|invoices|bill|bills)\b/, "INVOICE"],
      [/\b(?:vendor|vendors|supplier|suppliers)\b/, "VENDOR"],
      [/\b(?:customer|customers|client|clients)\b/, "CUSTOMER"],
      [/\b(?:treasury|account|accounts|balance|balances)\b/, "TREASURY"],
      [/\b(?:workflow|workflows|automation|automations)\b/, "WORKFLOW"],
      [/\b(?:approval|approvals|pending.*approval)\b/, "APPROVAL"],
      [/\b(?:policy|policies|rule|rules)\b/, "POLICY"],
      [/\b(?:risk|risks|alert|alerts)\b/, "RISK"],
      [/\b(?:compliance|violation|violations|audit)\b/, "COMPLIANCE"],
      [/\b(?:user|users|employee|employees|staff)\b/, "USER"],
      [/\b(?:report|reports|dashboard|dashboards)\b/, "REPORT"],
      [/\b(?:notification|notifications|alert|alerts)\b/, "NOTIFICATION"],
    ];

    for (const [pattern, source] of patterns) {
      if (pattern.test(lower)) return source;
    }

    return undefined;
  }
}

export const semanticSearchService = new SemanticSearchService();
