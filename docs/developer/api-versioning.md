# API Versioning

## Strategy

Perionyx API uses URL-based versioning with header-based negotiation as a secondary option.

### URL Path

Version is part of the URL path:

```
/api/v1/wallets
/api/v2/wallets
```

### Header Negotiation

Optional `Accept-Version` header for content negotiation:

```
Accept-Version: v1
```

## Version Lifecycle

Each version goes through the following stages:

```
Current → Beta → Deprecated → Sunset
```

### Current
The default and recommended version. All new features are added here.

### Beta
Preview of next version changes. Available for early testing.

### Deprecated
Still functional but no longer recommended. Deprecation warning headers included in responses.

### Sunset
No longer available. Requests return 410 Gone with migration instructions.

## Backward Compatibility Policy

### Within a Version (v1.x)
- No breaking changes
- Additive changes only (new endpoints, optional parameters, new fields)
- Deprecation before removal of any behavior

### Between Versions (v1 → v2)
- Breaking changes allowed with migration guide
- Minimum 6 months between deprecation and sunset
- Migration documentation provided

## What Constitutes a Breaking Change

- Removing or renaming an endpoint
- Removing or renaming a field
- Making a previously optional field required
- Changing response structure
- Changing error codes
- Changing authentication requirements

## What Does NOT Require a New Version

- Adding a new endpoint
- Adding an optional field to a response
- Adding a new optional parameter
- Adding a new response header
- Bug fixes that maintain contract
- Performance improvements

## Changelog

### v1 (Current — July 2026)
- Initial API release
- Treasury operations
- Wallet management
- Transaction processing
- Approval workflows
- Webhook subscriptions
- API key management
- Connector configuration
- Reconciliation management
