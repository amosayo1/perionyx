# Operational Checklist

## Daily Checks

- [ ] All health endpoints return "healthy"
- [ ] Error rate < 0.1%
- [ ] P95 latency < 2s
- [ ] Cache hit rate > 80%
- [ ] Queue backlogs < 100
- [ ] Database connections < 80% pool
- [ ] Memory usage < 80%
- [ ] CPU usage < 70%

## Weekly Checks

- [ ] Security audit logs reviewed
- [ ] Backup integrity verified
- [ ] Disk usage < 80%
- [ ] SSL certificates valid > 30 days
- [ ] Dependencies checked for updates
- [ ] Performance trends reviewed

## Monthly Checks

- [ ] Vulnerability scan completed
- [ ] Access review performed
- [ ] Disaster recovery drill executed
- [ ] Incident response drill performed
- [ ] On-call schedule verified
- [ ] Documentation reviewed and updated

## Quarterly Checks

- [ ] Penetration test completed
- [ ] Load test executed
- [ ] Compliance audit performed
- [ ] Business continuity plan tested
- [ ] Security training completed
- [ ] Vendor security reviews completed

## Deployment Checklist

- [ ] TypeScript compiles without errors
- [ ] All tests pass
- [ ] Build succeeds
- [ ] Migration verified
- [ ] Security scan passed
- [ ] Changelog updated
- [ ] Release tagged
- [ ] Staging deployed and verified
- [ ] Production deployment approved
- [ ] Rollback plan documented

## Incident Response Checklist

### Immediate (0-5 minutes)

- [ ] Acknowledge alert
- [ ] Determine severity
- [ ] Notify team if critical
- [ ] Begin triage

### Triage (5-30 minutes)

- [ ] Check health endpoints
- [ ] Review recent changes
- [ ] Examine error logs
- [ ] Check metrics dashboards
- [ ] Determine impact scope

### Mitigation (30-60 minutes)

- [ ] Apply immediate fix
- [ ] Rollback if needed
- [ ] Scale resources if needed
- [ ] Redirect traffic if needed
- [ ] Communicate status

### Resolution (1-24 hours)

- [ ] Apply permanent fix
- [ ] Verify fix in staging
- [ ] Deploy to production
- [ ] Monitor for recurrence
- [ ] Update runbook

### Post-Incident (24-48 hours)

- [ ] Write incident report
- [ ] Document root cause
- [ ] Create action items
- [ ] Schedule follow-up
- [ ] Update monitoring
