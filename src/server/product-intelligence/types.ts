// ──────────────────────────────────────────────────────────
// Core Identity
// ──────────────────────────────────────────────────────────

export type Industry =
  | "agriculture" | "construction" | "education" | "energy"
  | "financial-services" | "healthcare" | "hospitality" | "logistics"
  | "manufacturing" | "pharmaceuticals" | "real-estate" | "retail"
  | "technology" | "telecommunications" | "transportation" | "other";

export type Country = "saudi-arabia" | "uae" | "egypt" | "usa" | "uk" | "germany" | "other";

export type Region = "middle-east" | "north-africa" | "europe" | "north-america" | "asia" | "other";

export type FinanceSpecialization =
  | "accounts-payable" | "accounts-receivable" | "cost-accounting" | "financial-analysis"
  | "financial-reporting" | "fpna" | "general-ledger" | "inventory-accounting"
  | "payroll" | "procurement" | "reconciliation" | "tax-compliance"
  | "treasury" | "vat" | "zatca" | "audit" | "compliance" | "risk";

export type ErpSystem =
  | "sap" | "odoo" | "microsoft-dynamics" | "oracle" | "oracle-netsuite"
  | "daftra" | "aryyaf" | "tally" | "quickbooks" | "xero"
  | "sage" | "zoho" | "other";

export type AccountingStandard = "ifrs" | "gaap" | "socpa" | "other";

export type Language = "arabic" | "english" | "french" | "urdu" | "other";

export type CommunicationChannel = "linkedin" | "email" | "phone" | "whatsapp" | "zoom" | "teams" | "in-person" | "conference" | "support-ticket" | "other";

export type RelationshipStage =
  | "identified" | "connected" | "discovery" | "active-engagement"
  | "warm-introduction" | "in-discussion" | "evaluating" | "committed"
  | "design-partner" | "strategic-advisor" | "partner" | "inactive";

export type PersonType =
  | "customer" | "prospect" | "design-partner" | "strategic-advisor"
  | "subject-matter-expert" | "product-contributor" | "investor"
  | "partner" | "industry-contact" | "team-member";

export type PersonSeniority =
  | "cfo" | "finance-director" | "finance-manager" | "chief-accountant"
  | "senior-accountant" | "accountant" | "financial-analyst"
  | "treasurer" | "controller" | "consultant" | "advisor" | "other";

export interface Person {
  id: string;
  name: string;
  role: string;
  seniority: PersonSeniority;
  organizationId?: string;
  personType: PersonType;
  relationshipStage: RelationshipStage;
  industry?: Industry;
  country?: Country;
  region?: Region;
  financeSpecializations: FinanceSpecialization[];
  erpExperience: ErpSystem[];
  accountingStandards: AccountingStandard[];
  languages: Language[];
  linkedinUrl?: string;
  whatsapp?: string;
  email?: string;
  notes: string;
  tags: string[];
  classification?: string;
  designPartnerPotential?: string;
  conversationSummary?: string;
  isStrategicAdvisor: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ──────────────────────────────────────────────────────────
// Organization
// ──────────────────────────────────────────────────────────

export interface Organization {
  id: string;
  name: string;
  industry?: Industry;
  country?: Country;
  region?: Region;
  erpSystems: ErpSystem[];
  website?: string;
  size?: string;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

// ──────────────────────────────────────────────────────────
// Communication
// ──────────────────────────────────────────────────────────

export type ConversationType =
  | "linkedin-introduction" | "linkedin-reply" | "linkedin-discussion"
  | "whatsapp" | "email-thread" | "support-ticket"
  | "discovery-call" | "customer-interview" | "meeting"
  | "conference-discussion" | "beta-feedback" | "demo"
  | "feedback-session" | "professional-discussion";

export type Sentiment = "positive" | "neutral" | "negative" | "mixed";

export interface Conversation {
  id: string;
  type: ConversationType;
  channel: CommunicationChannel;
  personId: string;
  direction: "inbound" | "outbound";
  sentiment: Sentiment;
  subject: string;
  summary: string;
  notes: string;
  keyInsights: string[];
  linkedInsights?: Record<string, string[]>;
  actionItems: string[];
  followUpDate?: Date;
  durationMinutes?: number;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

// ──────────────────────────────────────────────────────────
// Research
// ──────────────────────────────────────────────────────────

export type ResearchSessionType = "discovery-call" | "customer-interview" | "meeting" | "conference" | "usability-test";

export interface ResearchSession {
  id: string;
  type: ResearchSessionType;
  title: string;
  objective: string;
  participants: string[];
  date: Date;
  durationMinutes: number;
  platform: string;
  notes: string;
  summary: string;
  keyFindings: string[];
  actionItems: string[];
  recordings?: string[];
  transcripts?: string[];
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

// ──────────────────────────────────────────────────────────
// Product Contributions
// ──────────────────────────────────────────────────────────

export type ContributionType =
  | "problem-identified" | "solution-suggested" | "feature-request"
  | "workflow-insight" | "pain-point" | "improvement-idea"
  | "validation" | "rejection" | "use-case" | "integration-idea";

export type EvidenceLevel = "anecdotal" | "single-source" | "multiple-sources" | "validated" | "statistically-significant";

export type Confidence = "very-low" | "low" | "medium" | "high" | "very-high";

export type ImplementationStatus = "not-started" | "in-discovery" | "in-design" | "in-development" | "in-testing" | "shipped" | "deferred" | "rejected";

export interface Contribution {
  id: string;
  personId: string;
  conversationId?: string;
  researchSessionId?: string;
  type: ContributionType;
  domain: string;
  problem: string;
  suggestedSolution?: string;
  businessValue?: string;
  workflow?: string;
  existingCapability?: string;
  gap: string;
  roadmapCandidate: boolean;
  evidenceLevel: EvidenceLevel;
  confidence: Confidence;
  implementationStatus: ImplementationStatus;
  releaseVersion?: string;
  moduleIds: string[];
  acknowledged: boolean;
  publicCreditAllowed: boolean;
  notes: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

// ──────────────────────────────────────────────────────────
// Product Evidence
// ──────────────────────────────────────────────────────────

export interface Evidence {
  id: string;
  problem: string;
  currentWorkflow: string;
  currentWorkaround: string;
  businessImpact: string;
  frequency: "daily" | "weekly" | "monthly" | "quarterly" | "continuous";
  severity: "critical" | "high" | "medium" | "low";
  suggestedImprovement: string;
  supportingPersonIds: string[];
  supportingOrganizationIds: string[];
  supportingIndustries: Industry[];
  supportingCountries: Country[];
  supportingErpSystems: ErpSystem[];
  contributionIds: string[];
  confidenceScore: number;
  moduleIds: string[];
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

// ──────────────────────────────────────────────────────────
// Problems & Opportunities
// ──────────────────────────────────────────────────────────

export interface Problem {
  id: string;
  title: string;
  description: string;
  domain: string;
  affectedWorkflows: string[];
  evidenceIds: string[];
  contributionIds: string[];
  frequency: string;
  severity: "critical" | "high" | "medium" | "low";
  moduleIds: string[];
  validated: boolean;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Opportunity {
  id: string;
  title: string;
  description: string;
  domain: string;
  businessValue: string;
  problemIds: string[];
  featureIds: string[];
  moduleIds: string[];
  priority: "critical" | "high" | "medium" | "low";
  confidence: Confidence;
  targetRelease?: string;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

// ──────────────────────────────────────────────────────────
// Feature Requests
// ──────────────────────────────────────────────────────────

export interface FeatureRequest {
  id: string;
  title: string;
  description: string;
  domain: string;
  requestedByPersonIds: string[];
  validatedByPersonIds: string[];
  rejectedByPersonIds: string[];
  supportingEvidenceIds: string[];
  moduleIds: string[];
  industries: Industry[];
  workflows: string[];
  confidence: Confidence;
  priority: "critical" | "high" | "medium" | "low";
  implementationStatus: ImplementationStatus;
  releaseVersion?: string;
  retestingRequired: boolean;
  notes: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

// ──────────────────────────────────────────────────────────
// Workflows
// ──────────────────────────────────────────────────────────

export interface Workflow {
  id: string;
  name: string;
  domain: string;
  description: string;
  steps: string[];
  systems: string[];
  painPoints: string[];
  improvements: string[];
  personIds: string[];
  moduleIds: string[];
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkflowPainPoint {
  id: string;
  workflowId: string;
  description: string;
  currentWorkaround: string;
  businessImpact: string;
  frequency: string;
  severity: "critical" | "high" | "medium" | "low";
  evidenceIds: string[];
  automationPotential: "high" | "medium" | "low" | "none";
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkflowImprovement {
  id: string;
  workflowId: string;
  painPointId: string;
  description: string;
  expectedImpact: string;
  effort: "low" | "medium" | "high" | "very-high";
  contributionIds: string[];
  moduleIds: string[];
  implementationStatus: ImplementationStatus;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

// ──────────────────────────────────────────────────────────
// Business Impact & Recommendations
// ──────────────────────────────────────────────────────────

export interface BusinessImpact {
  id: string;
  problemId?: string;
  featureRequestId?: string;
  description: string;
  quantitativeImpact?: string;
  qualitativeImpact: string;
  affectedRoles: string[];
  affectedDepartments: string[];
  annualSavings?: number;
  annualRevenue?: number;
  efficiency: string;
  riskReduction: string;
  confidence: Confidence;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  rationale: string;
  priority: "critical" | "high" | "medium" | "low";
  effort: "low" | "medium" | "high" | "very-high";
  impact: "high" | "medium" | "low";
  evidenceIds: string[];
  contributionIds: string[];
  moduleIds: string[];
  targetRelease?: string;
  status: ImplementationStatus;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

// ──────────────────────────────────────────────────────────
// Roadmap
// ──────────────────────────────────────────────────────────

export type RoadmapStatus = "proposed" | "approved" | "in-progress" | "completed" | "deferred" | "cancelled";

export interface RoadmapItem {
  id: string;
  title: string;
  description: string;
  featureRequestIds: string[];
  contributionIds: string[];
  evidenceIds: string[];
  moduleIds: string[];
  status: RoadmapStatus;
  priority: "p0" | "p1" | "p2" | "p3";
  releaseVersion?: string;
  releaseDate?: Date;
  dependencies: string[];
  blockedBy: string[];
  notes: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

// ──────────────────────────────────────────────────────────
// Validation
// ──────────────────────────────────────────────────────────

export type ValidationOutcome = "approved" | "rejected" | "needs-more-evidence" | "deferred";

export interface Validation {
  id: string;
  featureRequestId: string;
  validatedByPersonId: string;
  outcome: ValidationOutcome;
  rationale: string;
  conditions?: string;
  confidence: Confidence;
  industries: Industry[];
  modules: string[];
  retestingNeeded: boolean;
  retestingDate?: Date;
  releaseVersion?: string;
  notes: string;
  createdAt: Date;
}

// ──────────────────────────────────────────────────────────
// Module Reference
// ──────────────────────────────────────────────────────────

export interface ModuleReference {
  id: string;
  name: string;
  description: string;
  domain: string;
  featureRequestIds: string[];
  contributionIds: string[];
  evidenceIds: string[];
  roadmapIds: string[];
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

// ──────────────────────────────────────────────────────────
// Advisory Network
// ──────────────────────────────────────────────────────────

export type ContributorRole = "strategic-advisor" | "subject-matter-expert" | "design-partner" | "product-contributor" | "investor" | "customer" | "technology-partner";

export interface AdvisoryProfile {
  id: string;
  personId: string;
  role: ContributorRole;
  engagementScore: number;
  contributionScore: number;
  expertiseScore: number;
  influence: "high" | "medium" | "low";
  interactionFrequency: "daily" | "weekly" | "monthly" | "quarterly" | "ad-hoc";
  totalContributions: number;
  totalValidations: number;
  modulesCovered: string[];
  domainsCovered: string[];
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

// ──────────────────────────────────────────────────────────
// Product Intelligence Store
// ──────────────────────────────────────────────────────────

export interface ProductIntelligenceStore {
  persons: Map<string, Person>;
  organizations: Map<string, Organization>;
  conversations: Map<string, Conversation>;
  researchSessions: Map<string, ResearchSession>;
  contributions: Map<string, Contribution>;
  evidence: Map<string, Evidence>;
  problems: Map<string, Problem>;
  opportunities: Map<string, Opportunity>;
  featureRequests: Map<string, FeatureRequest>;
  workflows: Map<string, Workflow>;
  workflowPainPoints: Map<string, WorkflowPainPoint>;
  workflowImprovements: Map<string, WorkflowImprovement>;
  businessImpacts: Map<string, BusinessImpact>;
  recommendations: Map<string, Recommendation>;
  roadmapItems: Map<string, RoadmapItem>;
  validations: Map<string, Validation>;
  moduleReferences: Map<string, ModuleReference>;
  advisoryProfiles: Map<string, AdvisoryProfile>;
}

export function createEmptyStore(): ProductIntelligenceStore {
  return {
    persons: new Map(),
    organizations: new Map(),
    conversations: new Map(),
    researchSessions: new Map(),
    contributions: new Map(),
    evidence: new Map(),
    problems: new Map(),
    opportunities: new Map(),
    featureRequests: new Map(),
    workflows: new Map(),
    workflowPainPoints: new Map(),
    workflowImprovements: new Map(),
    businessImpacts: new Map(),
    recommendations: new Map(),
    roadmapItems: new Map(),
    validations: new Map(),
    moduleReferences: new Map(),
    advisoryProfiles: new Map(),
  };
}
