# On-Call Guide

## Responsibilities

1. Monitor alerts and respond within SLO
2. Triage incidents and escalate as needed
3. Communicate status during incidents
4. Document post-incident findings
5. Maintain system reliability

## On-Call Schedule

- Primary: 1 week rotation
- Secondary: Backup for escalations
- Escalation: Engineering manager

## Alert Response

| Severity | Response Time | Communication |
|---|---|---|
| Critical | < 5 minutes | Phone + Slack |
| Warning | < 30 minutes | Slack |
| Info | < 4 hours | Email |

## Incident Response Flow

1. **Acknowledge** alert within response time
2. **Triage** — determine severity and impact
3. **Mitigate** — stop the bleeding (rollback, restart, scale)
4. **Resolve** — apply permanent fix
5. **Debrief** — document incident and action items

## Common Commands

```bash
# Check application status
kubectl get pods -n perionyx
kubectl get deployment/perionyx-app -n perionyx

# View logs
kubectl logs -l app=perionyx -n perionyx --tail=100
kubectl logs -l app=perionyx -n perionyx --since=1h

# Restart pods
kubectl rollout restart deployment/perionyx-app -n perionyx

# Rollback
kubectl rollout undo deployment/perionyx-app -n perionyx

# Scale
kubectl scale deployment/perionyx-app -n perionyx --replicas=5

# Access database
kubectl exec -it perionyx-db-0 -n perionyx -- psql -U postgres -d perionyx
```

## Escalation Criteria

Escalate to secondary/engineering manager when:
- Incident lasts > 1 hour
- Data loss suspected
- Security breach confirmed
- Customer impact > 10% of users
- Multiple systems affected

## Handoff Procedure

1. Review open incidents
2. Update status on ongoing issues
3. Share known workarounds
4. Transfer communication channels
5. Confirm next on-call is briefed
