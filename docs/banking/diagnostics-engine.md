# Diagnostics Engine

## Overview

The Diagnostics Engine automatically detects and reports issues across the entire banking platform. It runs comprehensive scans covering providers, connections, credentials, permissions, and sync health.

## Detection Categories

```
┌─────────────────────────────────────────────────────────────────┐
│                      Diagnostics Engine                         │
│                                                                   │
│  Issue Detection                         Response Actions        │
│  ┌──────────────────────┐              ┌──────────────────────┐ │
│  │ Expired Credentials  │              │ Create Alert         │ │
│  │ Invalid Permissions  │              │ Record Incident      │ │
│  │ Unsupported Caps     │───► Analyze──► Track Recovery       │ │
│  │ Provider Outages     │              │ Generate Report      │ │
│  │ Sync Failures        │              │ Update Dashboard     │ │
│  │ Auth Failures        │              │                      │ │
│  │ Latency Spikes       │              │                      │ │
│  │ Duplicate Imports    │              │                      │ │
│  │ Balance Mismatches   │              │                      │ │
│  └──────────────────────┘              └──────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## Detected Issues

### 1. Expired Credentials
- **Severity**: CRITICAL
- **Detection**: Connection with credential expiry date in the past
- **Auto-resolvable**: No (requires user action)
- **Trigger**: When `credentialDaysRemaining <= 0`

### 2. Invalid Permissions
- **Severity**: CRITICAL (revoked) / WARNING (degraded)
- **Detection**: Connection permission status changed
- **Auto-resolvable**: No
- **Trigger**: On `permissionStatus === "REVOKED"` or `"DEGRADED"`

### 3. Provider Outages
- **Severity**: EMERGENCY (unavailable) / CRITICAL (degraded)
- **Detection**: Provider health check fails or status degrades
- **Auto-resolvable**: Yes (on next health check)
- **Trigger**: When `available === false` or `authStatus === "FAILED"`

### 4. Latency Spikes
- **Severity**: CRITICAL (>5s) / WARNING (>3s)
- **Detection**: Provider response time exceeds threshold
- **Auto-resolvable**: No
- **Trigger**: When `latencyMs > 3000`

### 5. Authentication Failures
- **Severity**: CRITICAL
- **Detection**: Provider auth status is FAILED
- **Auto-resolvable**: No
- **Trigger**: When `authStatus === "FAILED"`

### 6. Duplicate Imports
- **Severity**: INFO
- **Detection**: Multiple transactions with same external ID
- **Auto-resolvable**: No
- **Trigger**: Threshold of 10+ duplicates

### 7. Balance Mismatches
- **Severity**: WARNING
- **Detection**: Provider balance differs from computed balance
- **Auto-resolvable**: No (requires reconciliation review)

### 8. Webhook Inactivity
- **Severity**: WARNING
- **Detection**: Webhook subscription inactive for extended period
- **Auto-resolvable**: Yes (on webhook renewal)

### 9. Rate Limit Exceeded
- **Severity**: WARNING
- **Detection**: Rate limit usage exceeds 90% of total
- **Auto-resolvable**: Yes (on rate limit reset)

## Diagnostic Report

```typescript
interface DiagnosticReport {
  id: string;                    // Unique report identifier
  generatedAt: string;           // ISO timestamp
  totalIssues: number;           // Total issues found
  criticalCount: number;         // CRITICAL + EMERGENCY count
  warningCount: number;          // WARNING count
  infoCount: number;             // INFO count
  issues: DiagnosticIssue[];     // All detected issues
  summary: string;               // Human-readable summary
}
```

## Issue Lifecycle

```
DETECTED ──► REPORTED ──► ACKNOWLEDGED ──► RESOLVED
    │            │              │
    │            ├── Auto-resolve: false
    │            │   (requires manual intervention)
    │            │
    │            ├── Auto-resolve: true
    │            │   (resolved on next health check)
    │            │
    └────────────┴── Escalate after N hours
```

## Integration Flow

```
Full Diagnostics Scan
    │
    ├── For each connection:
    │     ├── Check credential expiry
    │     ├── Check permission status
    │     ├── Check sync history
    │     └── Check last successful sync
    │
    ├── For each provider:
    │     ├── Check availability
    │     ├── Check latency
    │     ├── Check auth status
    │     ├── Check rate limits
    │     └── Check webhook health
    │
    ├── Generate issues list
    │
    ├── For each issue:
    │     ├── Create alert
    │     ├── Store in history
    │     └── Update dashboard
    │
    └── Return DiagnosticReport
```
