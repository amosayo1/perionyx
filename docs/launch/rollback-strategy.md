# Rollback Strategy

**Phase:** 8E.5
**Last Updated:** July 8, 2026

---

## 1. Rollback Principles

1. **Safety first** — if data integrity is at risk, rollback immediately
2. **Forward-only migrations** — all schema changes are additive; rollback via a new migration, never a destructive revert
3. **Stateless application** — rollback is a deploy of the previous version; no state to manage
4. **Feature flags** — new functionality is feature-flagged where possible, enabling disable without deploy

---

## 2. When to Rollback

Immediate rollback is triggered when ANY of the following conditions are met:

| Condition | Detection | Action |
|---|---|---|
| Health check returns non-200 | Monitoring alert | Rollback immediately |
| Error rate >1% on financial endpoints | Monitoring dashboard | Rollback immediately |
| P99 latency >5s for financial operations | Monitoring dashboard | Rollback immediately |
| Auth flow broken (cannot login) | Smoke test | Rollback immediately |
| Data integrity issue detected | Manual or automated check | Rollback immediately |
| Security vulnerability discovered | Internal or external report | Rollback immediately |
| >1% of transactions fail | Queue monitoring | Rollback immediately |
| Customer reports P0 issue with no workaround | Support ticket | Evaluate rollback |

### Rollback Decision Matrix

| Scenario | Rollback? | Preferred Action |
|---|---|---|
| New feature has UI bug | No — feature flag off | Disable feature flag, fix in next deploy |
| API endpoint returning 500 errors | Yes | Rollback to previous version |
| Database migration causes slow queries | No — if non-critical | Hotfix in next deploy |
| Financial calculation wrong | Yes | Rollback, fix, redeploy |
| Security vulnerability in new dependency | Yes | Rollback, remove dependency, redeploy |
| Performance regression >20% | Evaluate | Rollback if customer-facing impact |

---

## 3. Rollback Procedures

### Application Rollback

#### Option A: Docker Image Rollback

```
1. Identify previous working Docker image tag (e.g., v1.2.3)
2. Update deployment configuration to use previous tag
3. Deploy: docker compose up -d
4. Verify health check: curl GET /api/health
5. Run smoke tests
6. Monitor for 30 minutes
```

#### Option B: Standalone Build Rollback

```
1. Locate previous .next/standalone build (keep last 3 builds)
2. Symlink current → previous:
   ln -sfn /opt/perionyx/releases/v1.2.3 /opt/perionyx/current
3. Restart: systemctl restart perionyx
4. Verify health check
5. Run smoke tests
6. Monitor for 30 minutes
```

### Database Rollback

**Important:** Database rollback is a LAST RESORT. Forward-only migrations mean we never `migrate down`. Instead:

| Situation | Action |
|---|---|
| Migration introduced bug | Create a new migration that reverses the schema change + preserves data |
| Migration caused data loss | Restore from backup + replay WAL to point before migration |
| Migration caused performance regression | Rollback app only; migration remains (additive) |

#### Point-in-Time Recovery (for data corruption)

```
1. Identify timestamp before corruption
2. Restore from latest backup
3. Replay WAL to target timestamp
4. Verify data integrity
5. Deploy previous app version
6. Notify affected users
```

---

## 4. Rollback Verification

After rollback, verify:

| Check | Verification |
|---|---|
| Health endpoint | `GET /api/health` returns 200 |
| Auth flow | Login with test account succeeds |
| Financial operations | Create a transfer, verify balance |
| Audit logging | Verify audit records are being created |
| Background jobs | PgBoss is processing jobs |
| Error rate | <0.1% on all endpoints |
| Latency | P99 < 2s for financial operations |
| Customer confirmation | Affected customer confirms issue resolved |

---

## 5. Disaster Recovery

### DR Assumptions

| Assumption | Details |
|---|---|
| Single-region deployment | DR targets same-region recovery within 4 hours |
| Database is single primary | No read replicas configured; DR requires full restore |
| Application is stateless | No user-uploaded files, no session state on server |
| Backups stored separately | S3-compatible storage in separate account/region |

### DR Scenarios

| Scenario | RTO | RPO | Procedure |
|---|---|---|---|
| Entire region outage | 4 hours | 24 hours | Restore from latest S3 backup in new region |
| Database corruption | 2 hours | 24 hours (or 5 min with WAL) | PITR to point before corruption |
| Accidental data deletion | 2 hours | 5 minutes (WAL) | PITR to point before deletion |
| Application configuration loss | 30 minutes | 0 | Redeploy from CI/CD with env vars |
| Secrets compromise | 1 hour | 0 | Rotate all secrets, redeploy |

### DR Runbook

```
Region Outage:
1. Provision PostgreSQL in secondary region from latest S3 backup
2. Update DATABASE_URL in environment
3. Deploy application in secondary region
4. Update DNS to point to new deployment
5. Verify health check and data integrity
6. Notify customers of region failover
7. Restore primary region when available
```

---

## 6. Feature Flag Strategy

Feature flags reduce the need for rollbacks by allowing instant disable of new functionality.

| Flag Name | Purpose | Default |
|---|---|---|
| `new-dashboard` | New dashboard layout | `false` |
| `ai-copilot` | AI Copilot feature | `true` |
| `mobile-approvals` | Mobile approval actions | `true` |
| `reconciliation-v2` | Enhanced reconciliation UX | `true` |

### Feature Flag Implementation

```typescript
// Feature flags are checked at runtime via env vars or config
const isEnabled = process.env.FLAG_NEW_DASHBOARD === 'true';
```

### When to Use Feature Flags

| Use Feature Flag | Don't Use Feature Flag |
|---|---|
| New UI components | Security fixes (deploy immediately) |
| Experimental features | Data model changes (migration required) |
| Performance-sensitive features | Bug fixes (deploy immediately) |
| Gradual rollout | Compliance changes (deploy immediately) |

---

## 7. Rollback Communication

### Internal Communication

```
[ROLLBACK] {version} → {previous_version}
Reason: {trigger condition}
Impact: {affected users, features, transactions}
Status: {In Progress / Complete / Verified}
Next steps: {hotfix schedule, re-deploy timeline}
```

### Customer Communication (if customer-facing)

```
Subject: Service Update — Perionyx Rollback

We detected an issue with our latest deployment and have rolled back to
the previous version as a precaution. Your data is safe and unaffected.

What happened: {brief explanation}
Impact on you: {minimal / none}
What we're doing: {hotfix, testing, re-deploy timeline}

We'll provide an update within {timeframe}. If you experience any issues,
please contact us at {support-email}.
```

---

## 8. Post-Rollback Actions

| Action | Owner | Timeline |
|---|---|---|
| Root cause analysis | Engineering Lead | Within 24 hours |
| Hotfix development | Engineering Team | ASAP |
| Post-mortem | Incident Commander | Within 5 business days |
| Release checklist update | Engineering Lead | Within post-mortem |
| Communication to affected users | Product Director | Within 24 hours |

---

## References

- `docs/launch/deployment-checklist.md` — Deployment checklist with rollback triggers
- `docs/launch/operations-runbook.md` — Operations runbook
- `docs/launch/incident-response.md` — Incident response
- `docs/launch/enterprise-launch-certification.md` — Launch certification
- `docs/operations/release-checklist.md` — Release checklist
- `docs/performance/background-jobs-architecture.md` — Background jobs
