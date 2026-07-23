# Maintenance Guide

## Routine Maintenance Tasks

### Daily

- [ ] Review error logs
- [ ] Check queue backlog sizes
- [ ] Verify health check endpoints
- [ ] Monitor cache hit ratios

### Weekly

- [ ] Review security audit logs
- [ ] Check disk usage on all volumes
- [ ] Verify backup completion
- [ ] Review performance metrics

### Monthly

- [ ] Run vulnerability scan
- [ ] Review dependency updates
- [ ] Perform access review
- [ ] Test disaster recovery drill
- [ ] Rotate secrets and keys

### Quarterly

- [ ] Full security audit
- [ ] Penetration testing
- [ ] Load testing
- [ ] Review compliance status
- [ ] Update runbooks

## Maintenance Procedures

### Database Maintenance

```bash
# Analyze tables for query optimization
ANALYZE;

# Reindex fragmented indexes
REINDEX DATABASE perionyx;

# Vacuum dead tuples
VACUUM ANALYZE;
```

### Redis Maintenance

```bash
# Check memory usage
INFO memory

# Defragment (Redis 7+)
MEMORY PURGE

# Set maxmemory policy
CONFIG SET maxmemory-policy allkeys-lru
```

### Log Rotation

```bash
# Docker: logs are automatically rotated (10MB, 3 files)
# K8s: container logs are rotated by kubelet
# Application: structured JSON logs, 30-day retention
```

## Certificate Rotation

```bash
# Check certificate expiry
kubectl get certificate perionyx-tls -n perionyx -o json | jq .status.notAfter

# Force renewal
kubectl delete secret perionyx-tls -n perionyx
cert-manager automatically reissues
```
