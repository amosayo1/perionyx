/**
 * Runtime Core Types — Phase 24.0B
 */

// ── Runtime State ─────────────────────────────────────────────────────────

export type RuntimeState =
  | 'UNINITIALIZED'
  | 'INITIALIZING'
  | 'READY'
  | 'RUNNING'
  | 'DRAINING'
  | 'STOPPED'
  | 'ERROR';

// ── Runtime Metadata ──────────────────────────────────────────────────────

export interface RuntimeMetadata {
  version: string;
  environment: string;
  startedAt: Date;
  initializedAt?: Date;
  stoppedAt?: Date;
  state: RuntimeState;
  modules: string[];
}

// ── Service Registry ──────────────────────────────────────────────────────

export interface ServiceRegistration {
  name: string;
  service: unknown;
  version?: string;
  health?: () => Promise<ServiceHealthStatus>;
  shutdown?: () => Promise<void>;
}

export type ServiceHealthStatus = {
  status: 'healthy' | 'degraded' | 'unhealthy';
  latencyMs?: number;
  error?: string;
  details?: Record<string, unknown>;
};

// ── Lifecycle ─────────────────────────────────────────────────────────────

export type LifecyclePhase =
  | 'configuration'
  | 'secrets'
  | 'cache'
  | 'locks'
  | 'queue'
  | 'classification'
  | 'eventbus'
  | 'capabilities'
  | 'providers'
  | 'policies'
  | 'featureflags'
  | 'health'
  | 'telemetry'
  | 'scheduling';

export interface LifecycleHooks {
  onReady?: () => Promise<void>;
  onDraining?: () => Promise<void>;
  onStopped?: () => Promise<void>;
  onError?: (error: Error) => Promise<void>;
}
