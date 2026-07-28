/**
 * Enterprise Configuration Platform — Index
 *
 * Phase 24.0
 */

export {
  ConfigScope,
  ConfigEnvironment,
  type ConfigValue,
  type ConfigEntry,
  type FeatureFlag,
  type ConfigAuditEntry,
  type ConfigSchemaDefinition,
  type GetConfigInput,
  type SetConfigInput,
  type ConfigResolutionResult,
} from "./types";

export { ConfigurationRegistry, configurationRegistry } from "./registry";

export { FeatureFlagManager, featureFlagManager, BUILTIN_FLAGS } from "./feature-flags";
