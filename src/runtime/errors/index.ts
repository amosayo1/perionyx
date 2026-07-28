/**
 * Runtime Errors — Typed error hierarchy for Runtime Services
 *
 * Phase 24.0B
 */

// ── Base Runtime Error ────────────────────────────────────────────────────

export class RuntimeError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number = 500,
    public readonly details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'RuntimeError';
  }
}

// ── Configuration Errors ──────────────────────────────────────────────────

export class ConfigurationError extends RuntimeError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'CONFIGURATION_ERROR', 500, details);
    this.name = 'ConfigurationError';
  }
}

export class ConfigNotFoundError extends ConfigurationError {
  constructor(key: string, scope?: string) {
    super(`Configuration not found: ${key}${scope ? ` (scope: ${scope})` : ''}`, { key, scope });
    this.name = 'ConfigNotFoundError';
  }
}

export class ConfigValidationError extends ConfigurationError {
  constructor(key: string, errors: string[]) {
    super(`Configuration validation failed for "${key}": ${errors.join(', ')}`, { key, errors });
    this.name = 'ConfigValidationError';
  }
}

// ── Secret Errors ─────────────────────────────────────────────────────────

export class SecretError extends RuntimeError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'SECRET_ERROR', 500, details);
    this.name = 'SecretError';
  }
}

export class SecretNotFoundError extends SecretError {
  constructor(name: string) {
    super(`Secret not found: ${name}`, { name });
    this.name = 'SecretNotFoundError';
  }
}

export class SecretAccessDeniedError extends SecretError {
  constructor(name: string, userId?: string) {
    super(`Access denied to secret: ${name}${userId ? ` (user: ${userId})` : ''}`, { name, userId });
    this.name = 'SecretAccessDeniedError';
  }
}

// ── Capability Errors ─────────────────────────────────────────────────────

export class CapabilityError extends RuntimeError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'CAPABILITY_ERROR', 500, details);
    this.name = 'CapabilityError';
  }
}

export class CapabilityNotFoundError extends CapabilityError {
  constructor(capabilityId: string) {
    super(`Capability not found: ${capabilityId}`, { capabilityId });
    this.name = 'CapabilityNotFoundError';
  }
}

// ── Policy Errors ─────────────────────────────────────────────────────────

export class PolicyError extends RuntimeError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'POLICY_ERROR', 500, details);
    this.name = 'PolicyError';
  }
}

export class PolicyDeniedError extends PolicyError {
  constructor(reason: string, policyKey?: string) {
    super(`Policy denied: ${reason}`, { policyKey, reason });
    this.name = 'PolicyDeniedError';
  }
}

// ── Event Errors ──────────────────────────────────────────────────────────

export class EventError extends RuntimeError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'EVENT_ERROR', 500, details);
    this.name = 'EventError';
  }
}

// ── Lifecycle Errors ──────────────────────────────────────────────────────

export class LifecycleError extends RuntimeError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'LIFECYCLE_ERROR', 500, details);
    this.name = 'LifecycleError';
  }
}

export class BootstrapError extends LifecycleError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, { ...details, phase: 'bootstrap' });
    this.name = 'BootstrapError';
  }
}

export class ShutdownError extends LifecycleError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, { ...details, phase: 'shutdown' });
    this.name = 'ShutdownError';
  }
}

// ── Health Errors ─────────────────────────────────────────────────────────

export class HealthError extends RuntimeError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'HEALTH_ERROR', 500, details);
    this.name = 'HealthError';
  }
}
