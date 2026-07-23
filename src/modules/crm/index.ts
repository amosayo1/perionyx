export { CRMService } from "./crm.service";
export { RelationshipIntelligenceService, relationshipIntelligenceService } from "./relationship-intelligence.service";
export { VoiceOfCustomerService, voiceOfCustomerService } from "./voice-of-customer.service";
export { PainPointService, painPointService } from "./pain-point.service";
export { ProductDiscoveryService, productDiscoveryService } from "./product-discovery.service";
export { KnowledgeGraphService, knowledgeGraphService } from "./knowledge-graph.service";
export type {
  CRMContact,
  CRMInteraction,
  CRMOpportunity,
  CRMTask,
  ContactIntelligence,
  ContactSource,
  RelationshipStage,
  Classification,
  DesignPartnerPotential,
  InteractionChannel,
  InteractionDirection,
  Sentiment,
  InteractionOutcome,
  RelationshipHealth,
  StrategicImportance,
  InterviewType,
  InterviewStatus,
  DiscoveryStage,
  TimelineEventType,
  PainPointCategory,
  ProfessionalProfile,
  VoiceOfCustomerInsight,
  PainPoint,
  ProductDiscoverySession,
  TimelineEvent,
  KnowledgeGraphLink,
  RelationshipAnalytics,
  ContactSearchResult,
} from "./types";
export { seedCrmData } from "./crm-seed";
