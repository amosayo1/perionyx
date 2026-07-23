export type ContactSource = "linkedin" | "email" | "referral" | "event" | "website";
export type RelationshipStage =
  | "discovery-conversation"
  | "connected"
  | "meeting-scheduled"
  | "in-discussion"
  | "evaluating"
  | "committed"
  | "partner"
  | "discovery"
  | "active-product-discovery"
  | "active-engagement"
  | "warm-introduction";

export type Classification =
  | "subject-matter-expert"
  | "subject-matter-expert-pending"
  | "potential-design-partner"
  | "industry-contact"
  | "design-partner";

export type DesignPartnerPotential = "highest" | "very-high" | "high" | "medium" | "low";
export type InteractionChannel = "linkedin" | "email" | "phone" | "meeting" | "demo";
export type Sentiment = "positive" | "neutral" | "negative" | "mixed";
export type InteractionDirection = "inbound" | "outbound";
export type InteractionOutcome =
  | "open-to-collaboration"
  | "follow-up-scheduled"
  | "not-interested"
  | "evaluating"
  | "partnered"
  | "feedback-provided";

export type RelationshipHealth = "healthy" | "needs-attention" | "at-risk" | "dormant";
export type StrategicImportance = "critical" | "high" | "medium" | "low";
export type InterviewType = "discovery" | "demo" | "feedback" | "workshop" | "product-review" | "conference" | "call";
export type InterviewStatus = "scheduled" | "completed" | "cancelled" | "follow-up";
export type DiscoveryStage = "research" | "contacted" | "introductory-call" | "discovery-session" | "workshop" | "pilot" | "review" | "completed";
export type TimelineEventType = "linkedin" | "email" | "meeting" | "call" | "demo" | "pilot" | "workshop" | "product-review" | "discovery-session" | "conference" | "referral";
export type PainPointCategory =
  | "month-end-close"
  | "reconciliation"
  | "treasury"
  | "approvals"
  | "reporting"
  | "fp&a"
  | "tax"
  | "audit"
  | "compliance"
  | "cash-management"
  | "erp"
  | "integration"
  | "workflow"
  | "collaboration"
  | "data-collection"
  | "internal-controls"
  | "analytics"
  | "ai"
  | "automation"
  | "other";
export type InteractionType = "professional-discussion" | "demo" | "meeting" | "email-exchange" | "feedback-session" | "linkedin-introduction" | "linkedin-reply";

export interface CRMContact {
  id: string;
  name: string;
  role: string;
  company?: string;
  source: ContactSource;
  relationshipStage: RelationshipStage;
  status: "active" | "inactive" | "archived";
  expertise: string[];
  tags: string[];
  notes: string;
  isStrategicAdvisor: boolean;
  location?: string;
  whatsapp?: string;
  priority?: "low" | "medium" | "high";
  region?: string;
  relationshipType?: string;
  potentialRoles?: string[];
  classification?: Classification;
  designPartnerPotential?: DesignPartnerPotential;
  productModules?: string[];
  conversationSummary?: string;
  keyProductInsights?: string[];
  preferredLanguage?: string;
  industryExperience?: string[];
  potentialContributions?: string[];
  recommendedNextSteps?: string[];
  nextFollowUp?: string;
  conversationStatus?: string;
  relationshipStrength?: number;
  trustScore?: number;
  engagementLevel?: string;
  championPotential?: boolean;
  advisorPotential?: boolean;
  investorPotential?: boolean;
  pilotCustomerPotential?: boolean;
  referralPotential?: boolean;
  hiringPotential?: boolean;
  strategicImportance?: StrategicImportance;
  lastMeaningfulConversation?: string;
  nextRecommendedAction?: string;
  relationshipHealth?: RelationshipHealth;
  createdAt: Date;
  updatedAt: Date;
}

export interface CRMInteraction {
  id: string;
  contactId: string;
  type: "professional-discussion" | "demo" | "meeting" | "email-exchange" | "feedback-session" | "linkedin-introduction" | "linkedin-reply";
  channel: InteractionChannel;
  direction: InteractionDirection;
  sentiment: Sentiment;
  outcome: InteractionOutcome;
  notes: string;
  linkedInsights?: Record<string, string[]>;
  keyInsights?: string[];
  createdAt: Date;
}

export interface CRMOpportunity {
  id: string;
  contactId: string;
  title: string;
  stage: "discovery" | "qualification" | "proposal" | "negotiation" | "closed-won" | "closed-lost";
  probability: number;
  category: "strategic-partnership" | "investment" | "advisor" | "referral" | "product-feedback";
  potentialOutcomes: string[];
  priority: "low" | "medium" | "high";
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CRMTask {
  id: string;
  contactId: string;
  title: string;
  assignedTo: string;
  dueDate: Date;
  status: "open" | "in-progress" | "completed" | "cancelled";
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ContactIntelligence {
  contactId: string;
  strengths: string[];
  potentialValue: string[];
  notes?: string;
  updatedAt: Date;
}

export interface CRMStore {
  contacts: Map<string, CRMContact>;
  interactions: Map<string, CRMInteraction>;
  opportunities: Map<string, CRMOpportunity>;
  tasks: Map<string, CRMTask>;
  intelligence: Map<string, ContactIntelligence>;
}

export interface ProfessionalProfile {
  contactId: string;
  currentRole?: string;
  previousRoles: string[];
  industry?: string;
  department?: string;
  financeFunction?: string;
  yearsExperience?: number;
  certifications: string[];
  erpExperience: string[];
  accountingStandards: string[];
  companySize?: string;
  country?: string;
  region?: string;
  decisionAuthority?: string;
  technologyStack: string[];
}

export interface VoiceOfCustomerInsight {
  id: string;
  contactId: string;
  painPoint?: string;
  desiredOutcome?: string;
  currentProcess?: string;
  manualWork?: string;
  workaround?: string;
  featureRequest?: string;
  idea?: string;
  opportunity?: string;
  risk?: string;
  quote?: string;
  evidence?: string;
  confidenceLevel?: string;
  interviewDate?: string;
  interviewType?: InterviewType;
  interviewStatus?: InterviewStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface PainPoint {
  id: string;
  category: PainPointCategory;
  subcategory?: string;
  frequency?: string;
  severity?: string;
  trend?: string;
  industries: string[];
  roles: string[];
  companies: string[];
  contactId?: string;
  insightId?: string;
  firstMention?: string;
  latestMention?: string;
  supportingQuotes: string[];
  linkedProductAreas: string[];
  roadmapItems: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductDiscoverySession {
  id: string;
  contactId: string;
  discoveryStage?: DiscoveryStage;
  interviewGoals: string[];
  interviewQuestions: string[];
  interviewNotes?: string;
  keyLearnings: string[];
  followUpRequired: boolean;
  featureRequests: string[];
  workflowInsights: string[];
  automationOpportunities: string[];
  designObservations: string[];
  constitutionReferences: string[];
  roadmapLinks: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface TimelineEvent {
  id: string;
  contactId: string;
  eventType: TimelineEventType;
  title: string;
  description?: string;
  eventDate?: string;
  link?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

export interface KnowledgeGraphLink {
  id: string;
  sourceContactId: string;
  targetContactId?: string;
  targetCompany?: string;
  targetIndustry?: string;
  targetPainPoint?: string;
  targetErp?: string;
  targetWorkflow?: string;
  targetModule?: string;
  targetFeature?: string;
  targetRoadmap?: string;
  targetConstitution?: string;
  targetInterview?: string;
  targetRecommendation?: string;
  linkType: string;
  strength?: number;
  description?: string;
  createdAt: Date;
}

export interface RelationshipAnalytics {
  totalContacts: number;
  byStage: Record<string, number>;
  byHealth: Record<string, number>;
  byImportance: Record<string, number>;
  byIndustry: Record<string, number>;
  byRegion: Record<string, number>;
  topPainPoints: Array<{ category: string; count: number; trend: string }>;
  voCInsights: {
    total: number;
    completed: number;
    byType: Record<string, number>;
    topFeatures: Array<{ feature: string; count: number }>;
  };
  discoveryProgress: {
    total: number;
    byStage: Record<string, number>;
    pendingFollowUp: number;
  };
}

export interface ContactSearchResult {
  contact: CRMContact;
  relevance: number;
  matchedFields: string[];
}
