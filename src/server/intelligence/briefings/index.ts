export { ExecutiveBriefingEngine, executiveBriefingEngine } from "./executive-briefing-engine";
export { ExecutiveDigestService, executiveDigestService } from "./executive-digest-service";
export { BriefingScheduler, briefingScheduler } from "./briefing-scheduler";
export { BriefingComposer, briefingComposer } from "./briefing-composer";
export { BriefingSectionGenerator, briefingSectionGenerator } from "./briefing-section-generator";
export { RoleAwareBriefingBuilder, roleAwareBriefingBuilder } from "./role-aware-briefing-builder";
export { BusinessNarrativeGenerator, businessNarrativeGenerator } from "./business-narrative-generator";
export { BriefingCache, briefingCache } from "./briefing-cache";

export type {
  ExecutiveRole,
  BriefingType,
  BriefingFrequency,
  BriefingSectionType,
  RecommendationType,
  NarrativeTone,
  BriefingRecommendation,
  BriefingMetric,
  BriefingSection,
  ExecutiveBriefing,
  BriefingConfig,
} from "./types";

export {
  DEFAULT_BRIEFING_CONFIG,
  FREQUENCY_MAP,
  ROLE_SECTION_PRIORITY,
  BRIEFING_TYPES,
} from "./types";
