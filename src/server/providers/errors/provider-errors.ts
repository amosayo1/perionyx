export class ProviderError extends Error {
  constructor(
    message: string,
    public readonly providerId: string,
    public readonly connectionId?: string,
    public readonly retryable: boolean = false,
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = "ProviderError";
  }
}

export class AuthenticationError extends ProviderError {
  constructor(
    message: string,
    providerId: string,
    connectionId?: string,
  ) {
    super(message, providerId, connectionId, false);
    this.name = "AuthenticationError";
  }
}

export class ConnectionError extends ProviderError {
  constructor(
    message: string,
    providerId: string,
    connectionId?: string,
  ) {
    super(message, providerId, connectionId, true);
    this.name = "ConnectionError";
  }
}

export class RateLimitError extends ProviderError {
  constructor(
    message: string,
    providerId: string,
    connectionId?: string,
    public readonly retryAfterMs?: number,
  ) {
    super(message, providerId, connectionId, true);
    this.name = "RateLimitError";
  }
}

export class ValidationError extends ProviderError {
  constructor(
    message: string,
    providerId: string,
    connectionId?: string,
    public readonly fields?: string[],
  ) {
    super(message, providerId, connectionId, false);
    this.name = "ValidationError";
  }
}

export class ConflictError extends ProviderError {
  constructor(
    message: string,
    providerId: string,
    connectionId?: string,
    public readonly localVersion?: string,
    public readonly remoteVersion?: string,
  ) {
    super(message, providerId, connectionId, false);
    this.name = "ConflictError";
  }
}

export class SyncError extends ProviderError {
  constructor(
    message: string,
    providerId: string,
    connectionId?: string,
    public readonly itemCount?: number,
  ) {
    super(message, providerId, connectionId, true);
    this.name = "SyncError";
  }
}

export class WebhookError extends ProviderError {
  constructor(
    message: string,
    providerId: string,
    connectionId?: string,
    public readonly webhookId?: string,
  ) {
    super(message, providerId, connectionId, true);
    this.name = "WebhookError";
  }
}

export class TimeoutError extends ProviderError {
  constructor(
    message: string,
    providerId: string,
    connectionId?: string,
    public readonly timeoutMs?: number,
  ) {
    super(message, providerId, connectionId, true);
    this.name = "TimeoutError";
  }
}

export class SerializationError extends ProviderError {
  constructor(
    message: string,
    providerId: string,
    connectionId?: string,
    public readonly field?: string,
  ) {
    super(message, providerId, connectionId, false);
    this.name = "SerializationError";
  }
}
