# Health Scoring Model

## Overview

The Health Scoring Model provides a unified 0–100 score for every component in the banking platform: providers, connections, institutions, accounts, regions, and the enterprise overall.

## Score Interpretation

```
Score: 100 ┌─────────────────────────────────────────────────┐
           │                  HEALTHY                        │
           │  All systems operational, no issues detected    │
     80 ───┼─────────────────────────────────────────────────┤
           │                  DEGRADED                       │
           │  Some issues detected, monitoring active        │
     50 ───┼─────────────────────────────────────────────────┤
           │                UNHEALTHY                        │
           │  Significant issues, attention required         │
     20 ───┼─────────────────────────────────────────────────┤
           │                   DOWN                          │
           │  Service unavailable, immediate action needed   │
      0 ───┴─────────────────────────────────────────────────┘
```

## Scoring Components

### Provider Score (0–100)

```
Base Score: 100

Deductions:
  -40  Unavailable (available === false)
  -20  Degraded (authStatus === "DEGRADED")
  -40  Failed (authStatus === "FAILED")
  -10  Webhook unhealthy
  -30  Latency > 5000ms
  -20  Latency 3000–5000ms
  -10  Latency 1000–3000ms
  -10  Missing capabilities

Score = max(0, 100 - deductions)
```

### Connection Score (0–100)

```
Base Score: 100

Deductions:
  -50  Revoked status
  -40  Expired status
  -40  Disconnected status
  -30  Error status
  -25  Credential expired
  -10  Credential expiring soon (≤7 days)
  -15  ≥3 consecutive sync failures
  -5   Re-authentication recommended (age ≥90 days)

Score = max(0, 100 - deductions)
```

### Institution Score (0–100)

```
Institution Score = average of all connection scores for that institution

Example:
  Institution "Bank of America" has 3 connections:
    Score: 85, 92, 78
    Institution Score = (85 + 92 + 78) / 3 = 85
```

### Region Score (0–100)

```
Region Score = average of all connection scores in that region

Example:
  Region "NORTH_AMERICA" has 5 connections:
    Scores: 90, 85, 70, 95, 80
    Region Score = (90 + 85 + 70 + 95 + 80) / 5 = 84
```

### Overall Enterprise Score (0–100)

```
Overall Score = average of (all provider scores + all connection scores)

The overall score represents the health of the entire banking platform.
```

## Score to Status Mapping

| Score Range | Status | Icon | Description |
|---|---|---|---|
| 80–100 | HEALTHY | ✅ | All systems operational |
| 50–79 | DEGRADED | ⚠️ | Some issues detected |
| 20–49 | UNHEALTHY | 🔴 | Significant intervention required |
| 0–19 | DOWN | 🚫 | Service unavailable |

## Score Lifecycle

```
Score Generation Flow:

1. Provider Monitor
   │
   ├── Check availability → deduct if unavailable
   ├── Measure latency → deduct if threshold exceeded
   ├── Check auth status → deduct if degraded/failed
   ├── Check webhook → deduct if unhealthy
   └── Check capabilities → deduct if missing

2. Connection Health Monitor
   │
   ├── Check connection status → deduct if error/revoked
   ├── Check credential → deduct if expired/expiring
   ├── Check sync history → deduct if failures
   └── Check age → deduct if re-auth recommended

3. HealthScorer
   │
   ├── Aggregate provider scores
   ├── Aggregate connection scores
   ├── Compute institution averages
   ├── Compute region averages
   └── Compute overall enterprise score

4. Dashboard
   │
   └── Display all scores with status badges
```

## Dashboard Display

The enterprise dashboard displays scores at every level:

```
┌─────────────────────────────────────────────────────────────────┐
│  Overall Health: HEALTHY  Score: 87/100                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Providers                    Connections                       │
│  Plaid     95  HEALTHY       conn-abc    92  HEALTHY            │
│  TrueLayer 88  HEALTHY       conn-def    78  DEGRADED           │
│  Yodlee    72  DEGRADED      conn-ghi    95  HEALTHY            │
│                                                                   │
│  Institutions                Regions                            │
│  Chase     90  HEALTHY       N America   88  HEALTHY            │
│  Barclays  85  HEALTHY       Europe      82  HEALTHY            │
│  HSBC      78  DEGRADED      Middle East 75  DEGRADED           │
│                                                                   │
│  Active Alerts: 3 (1 CRITICAL, 2 WARNING)                      │
└─────────────────────────────────────────────────────────────────┘
```
