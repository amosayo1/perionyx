/**
 * Runtime Core — Barrel Export
 *
 * Phase 24.0B
 */

export type {
  RuntimeState,
  RuntimeMetadata,
  ServiceRegistration,
  ServiceHealthStatus,
  LifecyclePhase,
  LifecycleHooks,
} from './types';

export { Runtime, runtime } from './runtime';
