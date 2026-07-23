import type {
  Person, Organization, Conversation, ResearchSession,
  Contribution, Evidence, Problem, Opportunity,
  FeatureRequest, Workflow, WorkflowPainPoint, WorkflowImprovement,
  BusinessImpact, Recommendation, RoadmapItem, Validation,
  ModuleReference, AdvisoryProfile, ContributorRole,
  ProductIntelligenceStore,
} from "./types";
import { createEmptyStore } from "./types";

export class ProductIntelligenceRepository {
  private store: ProductIntelligenceStore;

  constructor() {
    this.store = createEmptyStore();
  }

  getStore(): ProductIntelligenceStore {
    return this.store;
  }

  // ── Persons ──

  addPerson(person: Person): Person {
    this.store.persons.set(person.id, person);
    return person;
  }

  getPerson(id: string): Person | undefined {
    return this.store.persons.get(id);
  }

  findPersonByName(name: string): Person | undefined {
    return [...this.store.persons.values()].find(
      (p) => p.name.toLowerCase() === name.toLowerCase(),
    );
  }

  getAllPersons(): Person[] {
    return [...this.store.persons.values()];
  }

  updatePerson(id: string, updates: Partial<Person>): Person | undefined {
    const existing = this.store.persons.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...updates, updatedAt: new Date() };
    this.store.persons.set(id, updated);
    return updated;
  }

  deletePerson(id: string): boolean {
    return this.store.persons.delete(id);
  }

  // ── Organizations ──

  addOrganization(org: Organization): Organization {
    this.store.organizations.set(org.id, org);
    return org;
  }

  getOrganization(id: string): Organization | undefined {
    return this.store.organizations.get(id);
  }

  getAllOrganizations(): Organization[] {
    return [...this.store.organizations.values()];
  }

  findOrganizationByName(name: string): Organization | undefined {
    return [...this.store.organizations.values()].find(
      (o) => o.name.toLowerCase() === name.toLowerCase(),
    );
  }

  // ── Conversations ──

  addConversation(conv: Conversation): Conversation {
    this.store.conversations.set(conv.id, conv);
    return conv;
  }

  getConversation(id: string): Conversation | undefined {
    return this.store.conversations.get(id);
  }

  getPersonConversations(personId: string): Conversation[] {
    return [...this.store.conversations.values()]
      .filter((c) => c.personId === personId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  getAllConversations(): Conversation[] {
    return [...this.store.conversations.values()];
  }

  // ── Research Sessions ──

  addResearchSession(session: ResearchSession): ResearchSession {
    this.store.researchSessions.set(session.id, session);
    return session;
  }

  getResearchSession(id: string): ResearchSession | undefined {
    return this.store.researchSessions.get(id);
  }

  getAllResearchSessions(): ResearchSession[] {
    return [...this.store.researchSessions.values()];
  }

  // ── Contributions ──

  addContribution(contribution: Contribution): Contribution {
    this.store.contributions.set(contribution.id, contribution);
    return contribution;
  }

  getContribution(id: string): Contribution | undefined {
    return this.store.contributions.get(id);
  }

  getPersonContributions(personId: string): Contribution[] {
    return [...this.store.contributions.values()]
      .filter((c) => c.personId === personId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  getAllContributions(): Contribution[] {
    return [...this.store.contributions.values()];
  }

  // ── Evidence ──

  addEvidence(evidence: Evidence): Evidence {
    this.store.evidence.set(evidence.id, evidence);
    return evidence;
  }

  getEvidence(id: string): Evidence | undefined {
    return this.store.evidence.get(id);
  }

  getAllEvidence(): Evidence[] {
    return [...this.store.evidence.values()];
  }

  // ── Problems ──

  addProblem(problem: Problem): Problem {
    this.store.problems.set(problem.id, problem);
    return problem;
  }

  getProblem(id: string): Problem | undefined {
    return this.store.problems.get(id);
  }

  getAllProblems(): Problem[] {
    return [...this.store.problems.values()];
  }

  // ── Opportunities ──

  addOpportunity(opportunity: Opportunity): Opportunity {
    this.store.opportunities.set(opportunity.id, opportunity);
    return opportunity;
  }

  getOpportunity(id: string): Opportunity | undefined {
    return this.store.opportunities.get(id);
  }

  getAllOpportunities(): Opportunity[] {
    return [...this.store.opportunities.values()];
  }

  // ── Feature Requests ──

  addFeatureRequest(fr: FeatureRequest): FeatureRequest {
    this.store.featureRequests.set(fr.id, fr);
    return fr;
  }

  getFeatureRequest(id: string): FeatureRequest | undefined {
    return this.store.featureRequests.get(id);
  }

  getAllFeatureRequests(): FeatureRequest[] {
    return [...this.store.featureRequests.values()];
  }

  // ── Workflows ──

  addWorkflow(wf: Workflow): Workflow {
    this.store.workflows.set(wf.id, wf);
    return wf;
  }

  getWorkflow(id: string): Workflow | undefined {
    return this.store.workflows.get(id);
  }

  getAllWorkflows(): Workflow[] {
    return [...this.store.workflows.values()];
  }

  // ── Workflow Pain Points ──

  addWorkflowPainPoint(pp: WorkflowPainPoint): WorkflowPainPoint {
    this.store.workflowPainPoints.set(pp.id, pp);
    return pp;
  }

  getWorkflowPainPoint(id: string): WorkflowPainPoint | undefined {
    return this.store.workflowPainPoints.get(id);
  }

  getAllWorkflowPainPoints(): WorkflowPainPoint[] {
    return [...this.store.workflowPainPoints.values()];
  }

  // ── Workflow Improvements ──

  addWorkflowImprovement(wi: WorkflowImprovement): WorkflowImprovement {
    this.store.workflowImprovements.set(wi.id, wi);
    return wi;
  }

  getAllWorkflowImprovements(): WorkflowImprovement[] {
    return [...this.store.workflowImprovements.values()];
  }

  // ── Business Impacts ──

  addBusinessImpact(bi: BusinessImpact): BusinessImpact {
    this.store.businessImpacts.set(bi.id, bi);
    return bi;
  }

  getAllBusinessImpacts(): BusinessImpact[] {
    return [...this.store.businessImpacts.values()];
  }

  // ── Recommendations ──

  addRecommendation(rec: Recommendation): Recommendation {
    this.store.recommendations.set(rec.id, rec);
    return rec;
  }

  getAllRecommendations(): Recommendation[] {
    return [...this.store.recommendations.values()];
  }

  // ── Roadmap Items ──

  addRoadmapItem(item: RoadmapItem): RoadmapItem {
    this.store.roadmapItems.set(item.id, item);
    return item;
  }

  getRoadmapItem(id: string): RoadmapItem | undefined {
    return this.store.roadmapItems.get(id);
  }

  getAllRoadmapItems(): RoadmapItem[] {
    return [...this.store.roadmapItems.values()];
  }

  // ── Validations ──

  addValidation(v: Validation): Validation {
    this.store.validations.set(v.id, v);
    return v;
  }

  getFeatureRequestValidations(featureRequestId: string): Validation[] {
    return [...this.store.validations.values()]
      .filter((v) => v.featureRequestId === featureRequestId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  // ── Module References ──

  addModuleReference(mr: ModuleReference): ModuleReference {
    this.store.moduleReferences.set(mr.id, mr);
    return mr;
  }

  getModuleReference(id: string): ModuleReference | undefined {
    return this.store.moduleReferences.get(id);
  }

  getModuleReferenceByName(name: string): ModuleReference | undefined {
    return [...this.store.moduleReferences.values()].find(
      (m) => m.name.toLowerCase() === name.toLowerCase(),
    );
  }

  getAllModuleReferences(): ModuleReference[] {
    return [...this.store.moduleReferences.values()];
  }

  // ── Advisory Profiles ──

  addAdvisoryProfile(profile: AdvisoryProfile): AdvisoryProfile {
    this.store.advisoryProfiles.set(profile.id, profile);
    return profile;
  }

  getAdvisoryProfile(personId: string): AdvisoryProfile | undefined {
    return [...this.store.advisoryProfiles.values()].find(
      (p) => p.personId === personId,
    );
  }

  getAdvisoryProfilesByRole(role: ContributorRole): AdvisoryProfile[] {
    return [...this.store.advisoryProfiles.values()].filter(
      (p) => p.role === role,
    );
  }

  getAllAdvisoryProfiles(): AdvisoryProfile[] {
    return [...this.store.advisoryProfiles.values()];
  }
}
