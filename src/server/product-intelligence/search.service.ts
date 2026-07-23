import { ProductIntelligenceRepository } from "./repository";
import type { Person, Conversation, Contribution, Evidence } from "./types";

export interface SearchResult {
  persons: Person[];
  conversations: Conversation[];
  contributions: Contribution[];
  evidence: Evidence[];
  totalScore: number;
}

export class KnowledgeSearchService {
  constructor(private repo: ProductIntelligenceRepository) {}

  search(query: string): SearchResult {
    const q = query.toLowerCase().trim();
    if (!q) return { persons: [], conversations: [], contributions: [], evidence: [], totalScore: 0 };

    const persons = this.searchPersons(q);
    const conversations = this.searchConversations(q);
    const contributions = this.searchContributions(q);
    const evidence = this.searchEvidence(q);

    return {
      persons,
      conversations,
      contributions,
      evidence,
      totalScore: persons.length + conversations.length + contributions.length + evidence.length,
    };
  }

  searchByPerson(name: string): SearchResult {
    const person = this.repo.findPersonByName(name);
    if (!person) return this.search(name);

    return {
      persons: [person],
      conversations: this.repo.getPersonConversations(person.id),
      contributions: this.repo.getPersonContributions(person.id),
      evidence: this.repo.getAllEvidence().filter((e) => e.supportingPersonIds.includes(person.id)),
      totalScore: 1,
    };
  }

  searchByModule(moduleName: string): SearchResult {
    const q = moduleName.toLowerCase();
    return {
      persons: [],
      conversations: this.repo.getAllConversations().filter((c) =>
        c.tags.some((t) => t.toLowerCase().includes(q)),
      ),
      contributions: this.repo.getAllContributions().filter((c) =>
        c.moduleIds.some((m) => m.toLowerCase().includes(q)),
      ),
      evidence: this.repo.getAllEvidence().filter((e) =>
        e.moduleIds.some((m) => m.toLowerCase().includes(q)),
      ),
      totalScore: 0,
    };
  }

  searchByIndustry(industry: string): SearchResult {
    const q = industry.toLowerCase();
    return {
      persons: this.repo.getAllPersons().filter(
        (p) => p.industry?.toLowerCase() === q,
      ),
      conversations: [],
      contributions: [],
      evidence: this.repo.getAllEvidence().filter((e) =>
        e.supportingIndustries.some((i) => i.toLowerCase() === q),
      ),
      totalScore: 0,
    };
  }

  searchByProblem(problemText: string): SearchResult {
    const q = problemText.toLowerCase();
    return {
      persons: [],
      conversations: [],
      contributions: this.repo.getAllContributions().filter(
        (c) => c.problem.toLowerCase().includes(q),
      ),
      evidence: this.repo.getAllEvidence().filter(
        (e) => e.problem.toLowerCase().includes(q),
      ),
      totalScore: 0,
    };
  }

  private searchPersons(q: string): Person[] {
    return this.repo.getAllPersons().filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.role.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q)) ||
        p.financeSpecializations.some((s) => s.toLowerCase().includes(q)),
    );
  }

  private searchConversations(q: string): Conversation[] {
    return this.repo.getAllConversations().filter(
      (c) =>
        c.summary.toLowerCase().includes(q) ||
        c.subject.toLowerCase().includes(q) ||
        c.notes.toLowerCase().includes(q) ||
        c.keyInsights.some((i) => i.toLowerCase().includes(q)),
    );
  }

  private searchContributions(q: string): Contribution[] {
    return this.repo.getAllContributions().filter(
      (c) =>
        c.problem.toLowerCase().includes(q) ||
        c.domain.toLowerCase().includes(q) ||
        c.gap.toLowerCase().includes(q) ||
        (c.suggestedSolution?.toLowerCase().includes(q) ?? false) ||
        c.tags.some((t) => t.toLowerCase().includes(q)),
    );
  }

  private searchEvidence(q: string): Evidence[] {
    return this.repo.getAllEvidence().filter(
      (e) =>
        e.problem.toLowerCase().includes(q) ||
        e.currentWorkflow.toLowerCase().includes(q) ||
        e.suggestedImprovement.toLowerCase().includes(q),
    );
  }
}
