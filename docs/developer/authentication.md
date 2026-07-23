# Authentication

## Overview

Perionyx supports multiple authentication methods to accommodate different integration patterns.

## API Keys

The simplest way to authenticate. Include your API key in the `Authorization` header.

```
Authorization: va_abc123def456...
```

**Key Format:** `va_` followed by 64 hexadecimal characters.

**Management:** Create, list, rotate, and revoke API keys via the Developer Portal or API.

**Security Notes:**
- Keys are hashed using SHA-256 and encrypted at rest using AES-256-GCM
- Full key value is only shown once at creation
- Multiple keys can be active simultaneously
- Keys can be scoped to specific permissions

## Personal Access Tokens

User-bound tokens for personal API access.

```
Authorization: Bearer pat_abc123def456...
```

**Format:** `pat_` prefix, shorter expiration than API keys.

## OAuth2

For third-party applications requiring delegated access.

### Authorization Code Flow
1. Redirect user to `GET /api/auth/authorize`
2. User approves and is redirected to your callback URL
3. Exchange authorization code for access token at `POST /api/auth/token`
4. Use access token in `Authorization: Bearer <token>` header

### Client Credentials Flow
For machine-to-machine communication:
```
POST /api/auth/token
Content-Type: application/x-www-form-urlencoded

grant_type=client_credentials&client_id=...&client_secret=...
```

## Service Accounts

For automated systems and CI/CD pipelines.

```
Authorization: Basic base64(client_id:client_secret)
```

**Features:**
- IP allowlisting for additional security
- Scoped permissions per account
- Audit logging of all account activity
- Independent of human user accounts

## Scoped Tokens

Time-limited, resource-specific tokens for fine-grained access.

**Use Cases:**
- One-time operations
- Temporary integration access
- Limited-scope automated tasks

## Token Lifecycle

### Expiration
- API Keys: Configurable (default 90 days, max 1 year)
- Personal Access Tokens: Configurable (default 30 days)
- Scoped Tokens: Minutes to hours
- Service Accounts: Configurable (default 1 year)

### Revocation
All token types support immediate revocation. Revoked tokens are rejected on the next request.

### Rotation
Regular key rotation is recommended. Perionyx supports multiple active keys for seamless rotation.

## Scope Reference

| Scope | Permission |
|-------|-----------|
| `workflow:read` | Read workflow definitions and executions |
| `workflow:write` | Create and modify workflows |
| `treasury:read` | Read treasury positions |
| `treasury:write` | Create treasury transfers |
| `approvals:read` | Read approval requests |
| `approvals:write` | Create and approve requests |
| `webhook:read` | Read webhook subscriptions |
| `webhook:write` | Create webhook subscriptions |
| `api_keys:read` | Read API key configurations |
| `api_keys:write` | Create and manage API keys |
| `audit:read` | Read audit logs |
| `analytics:read` | Read analytics data |
