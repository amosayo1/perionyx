/**
 * Perionyx Runtime — Barrel Index
 *
 * Phase 24.0B
 *
 * The canonical execution environment for every Platform, Provider Driver,
 * AI Agent, Workflow, and Financial Domain.
 */

// Core
export { Runtime, runtime } from './core';
export type {
  RuntimeState,
  RuntimeMetadata,
  ServiceRegistration,
  ServiceHealthStatus,
  LifecyclePhase,
  LifecycleHooks,
} from './core';

// Context
export {
  withRuntimeContext,
  getRuntimeContext,
  requireRuntimeContext,
} from './context';
export type {
  RuntimeContext,
  WithContextOptions,
  TenantContext,
  RequestContext,
  TraceContext,
  PermissionContext,
  FinancialContext,
  LocaleContext,
} from './context';

// Errors
export {
  RuntimeError,
  ConfigurationError,
  ConfigNotFoundError,
  ConfigValidationError,
  SecretError,
  SecretNotFoundError,
  SecretAccessDeniedError,
  CapabilityError,
  CapabilityNotFoundError,
  PolicyError,
  PolicyDeniedError,
  EventError,
  LifecycleError,
  BootstrapError,
  ShutdownError,
  HealthError,
} from './errors';
