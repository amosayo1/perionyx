# Migration Guide

## v1 → v2 (Future)

This guide will be published when v2 is announced. Currently, v1 is the current and only version.

## General Migration Principles

1. **No surprises**: Breaking changes are only introduced in new versions
2. **Sufficient notice**: Minimum 6 months between deprecation and sunset
3. **Migration tools**: Automated migration scripts where possible
4. **Backward compatibility**: Old versions remain available during transition
5. **Documentation**: Full migration guide with before/after examples

## Preparing for Future Migrations

### 1. Version-Pin Your Integrations
Always specify the API version in your requests. Don't rely on default version behavior.

### 2. Monitor Deprecation Headers
Watch for deprecation warnings in API response headers.

### 3. Test Against New Versions Early
When a new version enters beta, test your integration against it.

### 4. Maintain Upgrade Flexibility
- Keep dependencies up to date
- Use the official SDKs which handle versioning
- Abstract API calls behind an interface

## Current Migration Path

There are no active migrations. All customers should use v1.

## Changelog

### v1 — July 2026
Initial release of the Perionyx API with:
- Treasury operations
- Wallet management
- Transaction processing
- Approval workflows
- Webhook subscriptions
- API key management
- Connector configuration
- Reconciliation management
