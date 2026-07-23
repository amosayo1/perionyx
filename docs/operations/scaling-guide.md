# Scaling Guide

## Horizontal Scaling (Application)

### Kubernetes HPA

The application auto-scales based on CPU and memory:

```yaml
minReplicas: 3
maxReplicas: 10
metrics:
  - cpu: 70%
  - memory: 80%
```

### Manual Scaling

```bash
# Scale up
kubectl scale deployment/perionyx-app -n perionyx --replicas=5

# Scale down
kubectl scale deployment/perionyx-app -n perionyx --replicas=2
```

## Vertical Scaling (Database)

### Connection Pool Sizing

| Environment | Pool Size | Max Connections |
|---|---|---|
| Development | 5 | 20 |
| Staging | 10 | 50 |
| Production | 20 | 100 |

### Resource Allocation

| Component | Min | Max | Recommended |
|---|---|---|---|
| Application | 512MB | 2GB | 1GB |
| Database | 1GB | 4GB | 2GB |
| Redis | 256MB | 1GB | 512MB |

## Database Scaling

### Read Replicas

For read-heavy workloads:
```bash
# Create read replica
kubectl apply -f k8s/deployments/db-read-replica.yaml

# Configure connection string
DATABASE_URL=postgresql://primary:5432/perionyx
DATABASE_REPLICA_URL=postgresql://replica:5432/perionyx
```

### Connection Pooling with PgBouncer

```bash
# Deploy PgBouncer
kubectl apply -f k8s/deployments/pgbouncer.yaml

# Update app to connect through PgBouncer
DATABASE_URL=postgresql://pgbouncer:6432/perionyx
```

## Cache Scaling

### Redis Cluster Mode

For large-scale deployments:
- Enable Redis Cluster with 3+ nodes
- Application auto-detects via `REDIS_CLUSTER_MODE=true`
- Cache keys distributed across shards

### Memory Limits

| Cache Type | Max Size | Eviction Policy |
|---|---|---|
| Entity cache | 10,000 entries | LRU |
| Query cache | 5,000 entries | TTL-based |
| Session cache | 50,000 entries | LRU + TTL |

## Queue Scaling

| Queue | Workers | Rate Limit |
|---|---|---|
| notification | 20 | 500/min |
| payment | 10 | 200/min |
| sync | 5 | 100/min |
| alert | 5 | 100/min |
| audit | 3 | 200/min |
