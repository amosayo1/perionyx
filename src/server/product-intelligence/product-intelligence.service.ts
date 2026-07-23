import { ProductIntelligenceRepository } from "./repository";
import { KnowledgeSearchService } from "./search.service";
import { ProductAnalyticsService } from "./analytics.service";
import type {
  Person, Organization, Conversation, ResearchSession,
  Contribution, Evidence, Problem, Opportunity,
  FeatureRequest, Workflow, WorkflowPainPoint, WorkflowImprovement,
  BusinessImpact, Recommendation, RoadmapItem, Validation,
  ModuleReference, AdvisoryProfile, ContributorRole,
  PersonType, RelationshipStage, ConversationType,
  CommunicationChannel, Sentiment, ContributionType,
  EvidenceLevel, Confidence, ImplementationStatus,
  Industry, Country, Region, FinanceSpecialization,
  ErpSystem, AccountingStandard, Language,
  PersonSeniority, ResearchSessionType, ValidationOutcome,
  RoadmapStatus,
} from "./types";

function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export class EnterpriseProductIntelligenceService {
  private repo: ProductIntelligenceRepository;
  private searchService: KnowledgeSearchService;
  private analyticsService: ProductAnalyticsService;

  constructor() {
    this.repo = new ProductIntelligenceRepository();
    this.searchService = new KnowledgeSearchService(this.repo);
    this.analyticsService = new ProductAnalyticsService(this.repo);
  }

  get repository(): ProductIntelligenceRepository {
    return this.repo;
  }

  get search(): KnowledgeSearchService {
    return this.searchService;
  }

  get analytics(): ProductAnalyticsService {
    return this.analyticsService;
  }

  // ── Person Management ──

  addPerson(data: {
    name: string; role: string; seniority: PersonSeniority;
    personType: PersonType; relationshipStage: RelationshipStage;
    organizationId?: string; industry?: Industry; country?: Country;
    region?: Region; financeSpecializations?: FinanceSpecialization[];
    erpExperience?: ErpSystem[]; accountingStandards?: AccountingStandard[];
    languages?: Language[]; linkedinUrl?: string; whatsapp?: string;
    email?: string; notes?: string; tags?: string[];
    isStrategicAdvisor?: boolean;
  }): Person {
    const existing = this.repo.findPersonByName(data.name);
    if (existing) return existing;

    const person: Person = {
      id: generateId("per"),
      name: data.name,
      role: data.role,
      seniority: data.seniority,
      organizationId: data.organizationId,
      personType: data.personType,
      relationshipStage: data.relationshipStage,
      industry: data.industry,
      country: data.country,
      region: data.region,
      financeSpecializations: data.financeSpecializations ?? [],
      erpExperience: data.erpExperience ?? [],
      accountingStandards: data.accountingStandards ?? [],
      languages: data.languages ?? [],
      linkedinUrl: data.linkedinUrl,
      whatsapp: data.whatsapp,
      email: data.email,
      notes: data.notes ?? "",
      tags: data.tags ?? [],
      isStrategicAdvisor: data.isStrategicAdvisor ?? false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.repo.addPerson(person);
    return person;
  }

  getPerson(id: string): Person | undefined {
    return this.repo.getPerson(id);
  }

  findPersonByName(name: string): Person | undefined {
    return this.repo.findPersonByName(name);
  }

  getAllPersons(): Person[] {
    return this.repo.getAllPersons();
  }

  // ── Organization Management ──

  addOrganization(data: {
    name: string; industry?: Industry; country?: Country;
    region?: Region; erpSystems?: ErpSystem[]; website?: string;
    size?: string; notes?: string;
  }): Organization {
    const existing = this.repo.findOrganizationByName(data.name);
    if (existing) return existing;

    const org: Organization = {
      id: generateId("org"),
      name: data.name,
      industry: data.industry,
      country: data.country,
      region: data.region,
      erpSystems: data.erpSystems ?? [],
      website: data.website,
      size: data.size,
      notes: data.notes ?? "",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.repo.addOrganization(org);
    return org;
  }

  getOrganization(id: string): Organization | undefined {
    return this.repo.getOrganization(id);
  }

  // ── Conversation Management ──

  addConversation(data: {
    type: ConversationType; channel: CommunicationChannel;
    personId: string; direction: "inbound" | "outbound";
    sentiment: Sentiment; subject: string; summary: string;
    notes?: string; keyInsights?: string[];
    linkedInsights?: Record<string, string[]>;
    actionItems?: string[]; followUpDate?: Date;
    durationMinutes?: number; tags?: string[];
  }): Conversation {
    const conv: Conversation = {
      id: generateId("conv"),
      type: data.type,
      channel: data.channel,
      personId: data.personId,
      direction: data.direction,
      sentiment: data.sentiment,
      subject: data.subject,
      summary: data.summary,
      notes: data.notes ?? "",
      keyInsights: data.keyInsights ?? [],
      linkedInsights: data.linkedInsights,
      actionItems: data.actionItems ?? [],
      followUpDate: data.followUpDate,
      durationMinutes: data.durationMinutes,
      tags: data.tags ?? [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.repo.addConversation(conv);
    return conv;
  }

  getPersonConversations(personId: string): Conversation[] {
    return this.repo.getPersonConversations(personId);
  }

  // ── Research Session Management ──

  addResearchSession(data: {
    type: ResearchSessionType; title: string; objective: string;
    participants: string[]; date: Date; durationMinutes: number;
    platform: string; notes?: string; summary: string;
    keyFindings?: string[]; actionItems?: string[];
    recordings?: string[]; transcripts?: string[]; tags?: string[];
  }): ResearchSession {
    const session: ResearchSession = {
      id: generateId("rs"),
      type: data.type,
      title: data.title,
      objective: data.objective,
      participants: data.participants,
      date: data.date,
      durationMinutes: data.durationMinutes,
      platform: data.platform,
      notes: data.notes ?? "",
      summary: data.summary,
      keyFindings: data.keyFindings ?? [],
      actionItems: data.actionItems ?? [],
      recordings: data.recordings,
      transcripts: data.transcripts,
      tags: data.tags ?? [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.repo.addResearchSession(session);
    return session;
  }

  // ── Contribution Management ──

  addContribution(data: {
    personId: string; conversationId?: string;
    researchSessionId?: string; type: ContributionType;
    domain: string; problem: string;
    suggestedSolution?: string; businessValue?: string;
    workflow?: string; existingCapability?: string; gap: string;
    roadmapCandidate?: boolean; evidenceLevel?: EvidenceLevel;
    confidence?: Confidence; implementationStatus?: ImplementationStatus;
    releaseVersion?: string; moduleIds?: string[];
    acknowledged?: boolean; publicCreditAllowed?: boolean;
    notes?: string; tags?: string[];
  }): Contribution {
    const contribution: Contribution = {
      id: generateId("cont"),
      personId: data.personId,
      conversationId: data.conversationId,
      researchSessionId: data.researchSessionId,
      type: data.type,
      domain: data.domain,
      problem: data.problem,
      suggestedSolution: data.suggestedSolution,
      businessValue: data.businessValue,
      workflow: data.workflow,
      existingCapability: data.existingCapability,
      gap: data.gap,
      roadmapCandidate: data.roadmapCandidate ?? false,
      evidenceLevel: data.evidenceLevel ?? "anecdotal",
      confidence: data.confidence ?? "medium",
      implementationStatus: data.implementationStatus ?? "not-started",
      releaseVersion: data.releaseVersion,
      moduleIds: data.moduleIds ?? [],
      acknowledged: data.acknowledged ?? false,
      publicCreditAllowed: data.publicCreditAllowed ?? false,
      notes: data.notes ?? "",
      tags: data.tags ?? [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.repo.addContribution(contribution);
    return contribution;
  }

  getPersonContributions(personId: string): Contribution[] {
    return this.repo.getPersonContributions(personId);
  }

  getAllContributions(): Contribution[] {
    return this.repo.getAllContributions();
  }

  // ── Evidence Management ──

  addEvidence(data: {
    problem: string; currentWorkflow: string;
    currentWorkaround: string; businessImpact: string;
    frequency: Evidence["frequency"]; severity: Evidence["severity"];
    suggestedImprovement: string; supportingPersonIds?: string[];
    supportingOrganizationIds?: string[];
    supportingIndustries?: Industry[];
    supportingCountries?: Country[];
    supportingErpSystems?: ErpSystem[];
    contributionIds?: string[]; confidenceScore?: number;
    moduleIds?: string[]; notes?: string;
  }): Evidence {
    const evidence: Evidence = {
      id: generateId("evid"),
      problem: data.problem,
      currentWorkflow: data.currentWorkflow,
      currentWorkaround: data.currentWorkaround,
      businessImpact: data.businessImpact,
      frequency: data.frequency,
      severity: data.severity,
      suggestedImprovement: data.suggestedImprovement,
      supportingPersonIds: data.supportingPersonIds ?? [],
      supportingOrganizationIds: data.supportingOrganizationIds ?? [],
      supportingIndustries: data.supportingIndustries ?? [],
      supportingCountries: data.supportingCountries ?? [],
      supportingErpSystems: data.supportingErpSystems ?? [],
      contributionIds: data.contributionIds ?? [],
      confidenceScore: data.confidenceScore ?? 0,
      moduleIds: data.moduleIds ?? [],
      notes: data.notes ?? "",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.repo.addEvidence(evidence);
    return evidence;
  }

  getAllEvidence(): Evidence[] {
    return this.repo.getAllEvidence();
  }

  // ── Problem Management ──

  addProblem(data: {
    title: string; description: string; domain: string;
    affectedWorkflows?: string[]; evidenceIds?: string[];
    contributionIds?: string[]; frequency?: string;
    severity: Problem["severity"]; moduleIds?: string[];
    validated?: boolean; notes?: string;
  }): Problem {
    const problem: Problem = {
      id: generateId("prob"),
      title: data.title,
      description: data.description,
      domain: data.domain,
      affectedWorkflows: data.affectedWorkflows ?? [],
      evidenceIds: data.evidenceIds ?? [],
      contributionIds: data.contributionIds ?? [],
      frequency: data.frequency ?? "continuous",
      severity: data.severity,
      moduleIds: data.moduleIds ?? [],
      validated: data.validated ?? false,
      notes: data.notes ?? "",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.repo.addProblem(problem);
    return problem;
  }

  getAllProblems(): Problem[] {
    return this.repo.getAllProblems();
  }

  // ── Feature Request Management ──

  addFeatureRequest(data: {
    title: string; description: string; domain: string;
    requestedByPersonIds?: string[];
    validatedByPersonIds?: string[];
    rejectedByPersonIds?: string[];
    supportingEvidenceIds?: string[]; moduleIds?: string[];
    industries?: Industry[]; workflows?: string[];
    confidence?: Confidence; priority: FeatureRequest["priority"];
    implementationStatus?: ImplementationStatus;
    releaseVersion?: string; retestingRequired?: boolean;
    notes?: string; tags?: string[];
  }): FeatureRequest {
    const fr: FeatureRequest = {
      id: generateId("fr"),
      title: data.title,
      description: data.description,
      domain: data.domain,
      requestedByPersonIds: data.requestedByPersonIds ?? [],
      validatedByPersonIds: data.validatedByPersonIds ?? [],
      rejectedByPersonIds: data.rejectedByPersonIds ?? [],
      supportingEvidenceIds: data.supportingEvidenceIds ?? [],
      moduleIds: data.moduleIds ?? [],
      industries: data.industries ?? [],
      workflows: data.workflows ?? [],
      confidence: data.confidence ?? "medium",
      priority: data.priority,
      implementationStatus: data.implementationStatus ?? "not-started",
      releaseVersion: data.releaseVersion,
      retestingRequired: data.retestingRequired ?? false,
      notes: data.notes ?? "",
      tags: data.tags ?? [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.repo.addFeatureRequest(fr);
    return fr;
  }

  getAllFeatureRequests(): FeatureRequest[] {
    return this.repo.getAllFeatureRequests();
  }

  // ── Workflow Management ──

  addWorkflow(data: {
    name: string; domain: string; description: string;
    steps?: string[]; systems?: string[]; painPoints?: string[];
    improvements?: string[]; personIds?: string[];
    moduleIds?: string[]; notes?: string;
  }): Workflow {
    const wf: Workflow = {
      id: generateId("wf"),
      name: data.name,
      domain: data.domain,
      description: data.description,
      steps: data.steps ?? [],
      systems: data.systems ?? [],
      painPoints: data.painPoints ?? [],
      improvements: data.improvements ?? [],
      personIds: data.personIds ?? [],
      moduleIds: data.moduleIds ?? [],
      notes: data.notes ?? "",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.repo.addWorkflow(wf);
    return wf;
  }

  // ── Workflow Pain Point Management ──

  addWorkflowPainPoint(data: {
    workflowId: string; description: string;
    currentWorkaround: string; businessImpact: string;
    frequency: string; severity: WorkflowPainPoint["severity"];
    evidenceIds?: string[];
    automationPotential?: WorkflowPainPoint["automationPotential"];
    notes?: string;
  }): WorkflowPainPoint {
    const pp: WorkflowPainPoint = {
      id: generateId("wpp"),
      workflowId: data.workflowId,
      description: data.description,
      currentWorkaround: data.currentWorkaround,
      businessImpact: data.businessImpact,
      frequency: data.frequency,
      severity: data.severity,
      evidenceIds: data.evidenceIds ?? [],
      automationPotential: data.automationPotential ?? "medium",
      notes: data.notes ?? "",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.repo.addWorkflowPainPoint(pp);
    return pp;
  }

  // ── Workflow Improvement Management ──

  addWorkflowImprovement(data: {
    workflowId: string; painPointId: string;
    description: string; expectedImpact: string;
    effort: WorkflowImprovement["effort"];
    contributionIds?: string[]; moduleIds?: string[];
    implementationStatus?: ImplementationStatus; notes?: string;
  }): WorkflowImprovement {
    const wi: WorkflowImprovement = {
      id: generateId("wfi"),
      workflowId: data.workflowId,
      painPointId: data.painPointId,
      description: data.description,
      expectedImpact: data.expectedImpact,
      effort: data.effort,
      contributionIds: data.contributionIds ?? [],
      moduleIds: data.moduleIds ?? [],
      implementationStatus: data.implementationStatus ?? "not-started",
      notes: data.notes ?? "",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.repo.addWorkflowImprovement(wi);
    return wi;
  }

  // ── Business Impact Management ──

  addBusinessImpact(data: {
    problemId?: string; featureRequestId?: string;
    description: string; quantitativeImpact?: string;
    qualitativeImpact: string; affectedRoles?: string[];
    affectedDepartments?: string[]; annualSavings?: number;
    annualRevenue?: number; efficiency?: string;
    riskReduction?: string; confidence?: Confidence; notes?: string;
  }): BusinessImpact {
    const bi: BusinessImpact = {
      id: generateId("bi"),
      problemId: data.problemId,
      featureRequestId: data.featureRequestId,
      description: data.description,
      quantitativeImpact: data.quantitativeImpact,
      qualitativeImpact: data.qualitativeImpact,
      affectedRoles: data.affectedRoles ?? [],
      affectedDepartments: data.affectedDepartments ?? [],
      annualSavings: data.annualSavings,
      annualRevenue: data.annualRevenue,
      efficiency: data.efficiency ?? "",
      riskReduction: data.riskReduction ?? "",
      confidence: data.confidence ?? "medium",
      notes: data.notes ?? "",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.repo.addBusinessImpact(bi);
    return bi;
  }

  // ── Recommendation Management ──

  addRecommendation(data: {
    title: string; description: string; rationale: string;
    priority: Recommendation["priority"]; effort: Recommendation["effort"];
    impact: Recommendation["impact"]; evidenceIds?: string[];
    contributionIds?: string[]; moduleIds?: string[];
    targetRelease?: string; status?: ImplementationStatus; notes?: string;
  }): Recommendation {
    const rec: Recommendation = {
      id: generateId("rec"),
      title: data.title,
      description: data.description,
      rationale: data.rationale,
      priority: data.priority,
      effort: data.effort,
      impact: data.impact,
      evidenceIds: data.evidenceIds ?? [],
      contributionIds: data.contributionIds ?? [],
      moduleIds: data.moduleIds ?? [],
      targetRelease: data.targetRelease,
      status: data.status ?? "not-started",
      notes: data.notes ?? "",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.repo.addRecommendation(rec);
    return rec;
  }

  getAllRecommendations(): Recommendation[] {
    return this.repo.getAllRecommendations();
  }

  // ── Roadmap Management ──

  addRoadmapItem(data: {
    title: string; description: string;
    featureRequestIds?: string[]; contributionIds?: string[];
    evidenceIds?: string[]; moduleIds?: string[];
    status: RoadmapStatus; priority: RoadmapItem["priority"];
    releaseVersion?: string; releaseDate?: Date;
    dependencies?: string[]; blockedBy?: string[];
    notes?: string; tags?: string[];
  }): RoadmapItem {
    const item: RoadmapItem = {
      id: generateId("rm"),
      title: data.title,
      description: data.description,
      featureRequestIds: data.featureRequestIds ?? [],
      contributionIds: data.contributionIds ?? [],
      evidenceIds: data.evidenceIds ?? [],
      moduleIds: data.moduleIds ?? [],
      status: data.status,
      priority: data.priority,
      releaseVersion: data.releaseVersion,
      releaseDate: data.releaseDate,
      dependencies: data.dependencies ?? [],
      blockedBy: data.blockedBy ?? [],
      notes: data.notes ?? "",
      tags: data.tags ?? [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.repo.addRoadmapItem(item);
    return item;
  }

  getAllRoadmapItems(): RoadmapItem[] {
    return this.repo.getAllRoadmapItems();
  }

  // ── Validation Management ──

  addValidation(data: {
    featureRequestId: string; validatedByPersonId: string;
    outcome: ValidationOutcome; rationale: string;
    conditions?: string; confidence?: Confidence;
    industries?: Industry[]; modules?: string[];
    retestingNeeded?: boolean; retestingDate?: Date;
    releaseVersion?: string; notes?: string;
  }): Validation {
    const v: Validation = {
      id: generateId("val"),
      featureRequestId: data.featureRequestId,
      validatedByPersonId: data.validatedByPersonId,
      outcome: data.outcome,
      rationale: data.rationale,
      conditions: data.conditions,
      confidence: data.confidence ?? "medium",
      industries: data.industries ?? [],
      modules: data.modules ?? [],
      retestingNeeded: data.retestingNeeded ?? false,
      retestingDate: data.retestingDate,
      releaseVersion: data.releaseVersion,
      notes: data.notes ?? "",
      createdAt: new Date(),
    };
    this.repo.addValidation(v);
    return v;
  }

  // ── Module Reference Management ──

  addModuleReference(data: {
    name: string; description: string; domain: string;
    tags?: string[];
  }): ModuleReference {
    const mr: ModuleReference = {
      id: generateId("mod"),
      name: data.name,
      description: data.description,
      domain: data.domain,
      featureRequestIds: [],
      contributionIds: [],
      evidenceIds: [],
      roadmapIds: [],
      tags: data.tags ?? [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.repo.addModuleReference(mr);
    return mr;
  }

  getModuleReferenceByName(name: string): ModuleReference | undefined {
    return this.repo.getModuleReferenceByName(name);
  }

  getAllModuleReferences(): ModuleReference[] {
    return this.repo.getAllModuleReferences();
  }

  // ── Advisory Profile Management ──

  addAdvisoryProfile(data: {
    personId: string; role: ContributorRole;
    engagementScore?: number; contributionScore?: number;
    expertiseScore?: number; influence?: AdvisoryProfile["influence"];
    interactionFrequency?: AdvisoryProfile["interactionFrequency"];
    notes?: string;
  }): AdvisoryProfile {
    const profile: AdvisoryProfile = {
      id: generateId("adv"),
      personId: data.personId,
      role: data.role,
      engagementScore: data.engagementScore ?? 0,
      contributionScore: data.contributionScore ?? 0,
      expertiseScore: data.expertiseScore ?? 0,
      influence: data.influence ?? "medium",
      interactionFrequency: data.interactionFrequency ?? "ad-hoc",
      totalContributions: 0,
      totalValidations: 0,
      modulesCovered: [],
      domainsCovered: [],
      notes: data.notes ?? "",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.repo.addAdvisoryProfile(profile);
    return profile;
  }

  getAdvisoryProfilesByRole(role: ContributorRole): AdvisoryProfile[] {
    return this.repo.getAdvisoryProfilesByRole(role);
  }

  getAllAdvisoryProfiles(): AdvisoryProfile[] {
    return this.repo.getAllAdvisoryProfiles();
  }

  // ── Utility ──

  getStats() {
    return {
      summary: this.analytics.getSummary(),
      leaderboard: this.analytics.getContributionLeaderboard(),
      mostRequested: this.analytics.getMostRequestedFeatures(10),
      topProblems: this.analytics.getMostCommonProblems(10),
      topAutomation: this.analytics.getMostRequestedAutomation(),
      topAI: this.analytics.getMostRequestedAI(),
    };
  }

  generateReport(): string {
    const summary = this.analytics.getSummary();
    const leaderboard = this.analytics.getContributionLeaderboard(10);
    const features = this.analytics.getMostRequestedFeatures(10);
    const problems = this.analytics.getMostCommonProblems(10);

    const lines: string[] = [];
    lines.push("# Enterprise Product Intelligence Report");
    lines.push("");
    lines.push("## Summary");
    lines.push(`- Persons: ${summary.totalPersons}`);
    lines.push(`- Conversations: ${summary.totalConversations}`);
    lines.push(`- Contributions: ${summary.totalContributions}`);
    lines.push(`- Evidence: ${summary.totalEvidence}`);
    lines.push(`- Feature Requests: ${summary.totalFeatureRequests}`);
    lines.push(`- Problems: ${summary.totalProblems}`);
    lines.push(`- Recommendations: ${summary.totalRecommendations}`);
    lines.push(`- Roadmap Items: ${summary.totalRoadmapItems}`);
    lines.push("");
    lines.push("## Contribution Leaderboard");
    for (const entry of leaderboard) {
      lines.push(`- ${entry.name} (${entry.role}): ${entry.contributions} contributions`);
    }
    lines.push("");
    lines.push("## Most Requested Features");
    for (const f of features) {
      lines.push(`- ${f.title} [${f.priority}] (${f.count} requesters) — ${f.status}`);
    }
    lines.push("");
    lines.push("## Top Problems");
    for (const p of problems) {
      lines.push(`- ${p.problem} [${p.severity}] (${p.evidenceCount} evidence records)`);
    }

    return lines.join("\n");
  }
}
