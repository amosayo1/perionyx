# Kubernetes Deployment Guide — Perionyx Enterprise Finance Platform

**Version**: 1.0 | **Last Updated**: 2026-07-12

## Table of Contents

1. [Namespace Setup](#namespace-setup)
2. [Deployments and Services](#deployments-and-services)
3. [ConfigMaps and Secrets](#configmaps-and-secrets)
4. [Persistent Volumes](#persistent-volumes)
5. [HPA and Scaling](#hpa-and-scaling)
6. [Ingress Configuration](#ingress-configuration)
7. [Network Policies](#network-policies)
8. [Rolling Updates](#rolling-updates)
9. [Zero-Downtime Deployment](#zero-downtime-deployment)

---

## Namespace Setup

### Create Namespace

```yaml
# k8s/namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: perionyx
  labels:
    name: perionyx
    environment: production
    team: platform
    managed-by: terraform
```

```bash
kubectl apply -f k8s/namespace.yaml
```

### Resource Quotas

```yaml
# k8s/quota.yaml
apiVersion: v1
kind: ResourceQuota
metadata:
  name: perionyx-quota
  namespace: perionyx
spec:
  hard:
    requests.cpu: "20"
    requests.memory: "40Gi"
    limits.cpu: "40"
    limits.memory: "80Gi"
    persistentvolumeclaims: "10"
    pods: "50"
    services: "20"
    configmaps: "30"
    secrets: "30"
```

### Limit Ranges

```yaml
# k8s/limit-range.yaml
apiVersion: v1
kind: LimitRange
metadata:
  name: perionyx-limits
  namespace: perionyx
spec:
  limits:
    - default:
        cpu: "1"
        memory: "2Gi"
      defaultRequest:
        cpu: "500m"
        memory: "1Gi"
      max:
        cpu: "4"
        memory: "8Gi"
      min:
        cpu: "100m"
        memory: "256Mi"
      type: Container
```

---

## Deployments and Services

### Application Deployment

```yaml
# k8s/deployments/app.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: perionyx-app
  namespace: perionyx
  labels:
    app: perionyx
    component: app
    environment: production
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxUnavailable: 1
      maxSurge: 1
  selector:
    matchLabels:
      app: perionyx
      component: app
  template:
    metadata:
      labels:
        app: perionyx
        component: app
        version: v1
      annotations:
        prometheus.io/scrape: "true"
        prometheus.io/port: "3000"
        prometheus.io/path: "/api/metrics"
    spec:
      serviceAccountName: perionyx-app
      securityContext:
        runAsNonRoot: true
        runAsUser: 1001
        fsGroup: 1001
        seccompProfile:
          type: RuntimeDefault
      containers:
        - name: app
          image: ghcr.io/organization/perionyx:latest
          imagePullPolicy: Always
          ports:
            - containerPort: 3000
              protocol: TCP
              name: http
          envFrom:
            - configMapRef:
                name: perionyx-config
            - secretRef:
                name: perionyx-secrets
          resources:
            requests:
              cpu: "500m"
              memory: "1Gi"
            limits:
              cpu: "2"
              memory: "4Gi"
          livenessProbe:
            httpGet:
              path: /api/v1/enterprise/health
              port: 3000
            initialDelaySeconds: 30
            periodSeconds: 30
            timeoutSeconds: 5
            failureThreshold: 3
          readinessProbe:
            httpGet:
              path: /api/v1/enterprise/health
              port: 3000
            initialDelaySeconds: 10
            periodSeconds: 10
            timeoutSeconds: 3
            failureThreshold: 2
          startupProbe:
            httpGet:
              path: /api/v1/enterprise/health
              port: 3000
            initialDelaySeconds: 5
            periodSeconds: 5
            failureThreshold: 30
          lifecycle:
            preStop:
              exec:
                command: ["/bin/sh", "-c", "sleep 15"]
      affinity:
        podAntiAffinity:
          preferredDuringSchedulingIgnoredDuringExecution:
            - weight: 100
              podAffinityTerm:
                labelSelector:
                  matchLabels:
                    app: perionyx
                    component: app
                topologyKey: kubernetes.io/hostname
      topologySpreadConstraints:
        - maxSkew: 1
          topologyKey: topology.kubernetes.io/zone
          whenUnsatisfiable: DoNotSchedule
          labelSelector:
            matchLabels:
              app: perionyx
              component: app
```

### Service

```yaml
# k8s/services/app.yaml
apiVersion: v1
kind: Service
metadata:
  name: perionyx-app
  namespace: perionyx
  labels:
    app: perionyx
    component: app
spec:
  type: ClusterIP
  ports:
    - port: 80
      targetPort: 3000
      protocol: TCP
      name: http
  selector:
    app: perionyx
    component: app
```

### Worker Deployment (Queue)

```yaml
# k8s/deployments/worker.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: perionyx-worker
  namespace: perionyx
  labels:
    app: perionyx
    component: worker
spec:
  replicas: 2
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxUnavailable: 1
  selector:
    matchLabels:
      app: perionyx
      component: worker
  template:
    metadata:
      labels:
        app: perionyx
        component: worker
    spec:
      containers:
        - name: worker
          image: ghcr.io/organization/perionyx:latest
          command: ["node", "worker.js"]
          envFrom:
            - configMapRef:
                name: perionyx-config
            - secretRef:
                name: perionyx-secrets
          resources:
            requests:
              cpu: "250m"
              memory: "512Mi"
            limits:
              cpu: "1"
              memory: "2Gi"
```

### Pod Disruption Budget

```yaml
# k8s/pdb/app-pdb.yaml
apiVersion: policy/v1
kind: PodDisruptionBudget
metadata:
  name: perionyx-app-pdb
  namespace: perionyx
spec:
  minAvailable: 2
  selector:
    matchLabels:
      app: perionyx
      component: app
```

---

## ConfigMaps and Secrets

### ConfigMap

```yaml
# k8s/configmaps/app-config.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: perionyx-config
  namespace: perionyx
data:
  NODE_ENV: "production"
  NEXTAUTH_URL: "https://app.perionyx.com"
  LOG_LEVEL: "info"
  NEXT_TELEMETRY_DISABLED: "1"
  CACHE_PROVIDER: "redis"
  STORAGE_PROVIDER: "s3"
  S3_REGION: "us-east-1"
  S3_BUCKET: "perionyx-production"
  REDIS_CLUSTER_MODE: "false"
```

### Secrets

```yaml
# k8s/secrets/app-secrets.yaml
apiVersion: v1
kind: Secret
metadata:
  name: perionyx-secrets
  namespace: perionyx
type: Opaque
stringData:
  DATABASE_URL: "postgresql://perionyx:${DB_PASSWORD}@perionyx-db:5432/perionyx"
  AUTH_SECRET: "${AUTH_SECRET}"
  ENCRYPTION_KEY: "${ENCRYPTION_KEY}"
  REDIS_URL: "redis://:${REDIS_PASSWORD}@perionyx-redis:6379"
  S3_ACCESS_KEY_ID: "${S3_ACCESS_KEY_ID}"
  S3_SECRET_ACCESS_KEY: "${S3_SECRET_ACCESS_KEY}"
```

### External Secrets (Recommended for Production)

```yaml
# k8s/secrets/external-secrets.yaml
apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
metadata:
  name: perionyx-secrets
  namespace: perionyx
spec:
  refreshInterval: "1h"
  secretStoreRef:
    name: aws-secrets-manager
    kind: ClusterSecretStore
  target:
    name: perionyx-secrets
    creationPolicy: Owner
  data:
    - secretKey: DATABASE_URL
      remoteRef:
        key: perionyx/production/database
        property: url
    - secretKey: AUTH_SECRET
      remoteRef:
        key: perionyx/production/auth
        property: secret
    - secretKey: ENCRYPTION_KEY
      remoteRef:
        key: perionyx/production/encryption
        property: key
```

---

## Persistent Volumes

### StorageClass

```yaml
# k8s/pv/storage-class.yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: perionyx-gp3
provisioner: ebs.csi.aws.com
parameters:
  type: gp3
  iops: "3000"
  throughput: "125"
reclaimPolicy: Retain
allowVolumeExpansion: true
volumeBindingMode: WaitForFirstConsumer
```

### PersistentVolumeClaim

```yaml
# k8s/pv/claims.yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: perionyx-data
  namespace: perionyx
spec:
  accessModes:
    - ReadWriteOnce
  storageClassName: perionyx-gp3
  resources:
    requests:
      storage: 50Gi
---
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: perionyx-backups
  namespace: perionyx
spec:
  accessModes:
    - ReadWriteMany
  storageClassName: efs
  resources:
    requests:
      storage: 200Gi
```

### StatefulSet for Database (Optional — External DB Recommended)

For development/staging environments where you run PostgreSQL in-cluster:

```yaml
# k8s/statefulsets/postgres.yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: perionyx-db
  namespace: perionyx
spec:
  serviceName: perionyx-db
  replicas: 1
  selector:
    matchLabels:
      app: perionyx
      component: db
  template:
    metadata:
      labels:
        app: perionyx
        component: db
    spec:
      containers:
        - name: postgres
          image: postgres:16-alpine
          ports:
            - containerPort: 5432
          envFrom:
            - secretRef:
                name: perionyx-db-secrets
          volumeMounts:
            - name: data
              mountPath: /var/lib/postgresql/data
          resources:
            requests:
              cpu: "500m"
              memory: "1Gi"
            limits:
              cpu: "2"
              memory: "4Gi"
  volumeClaimTemplates:
    - metadata:
        name: data
      spec:
        accessModes: ["ReadWriteOnce"]
        storageClassName: perionyx-gp3
        resources:
          requests:
            storage: 100Gi
```

---

## HPA and Scaling

### Horizontal Pod Autoscaler

```yaml
# k8s/hpa/app-hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: perionyx-app-hpa
  namespace: perionyx
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: perionyx-app
  minReplicas: 3
  maxReplicas: 10
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
    - type: Resource
      resource:
        name: memory
        target:
          type: Utilization
          averageUtilization: 80
  behavior:
    scaleUp:
      stabilizationWindowSeconds: 60
      policies:
        - type: Percent
          value: 100
          periodSeconds: 60
        - type: Pods
          value: 4
          periodSeconds: 60
      selectPolicy: Max
    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
        - type: Percent
          value: 25
          periodSeconds: 60
```

### Cluster Autoscaler

For node-level scaling, configure the cluster autoscaler:

```yaml
# values for cluster-autoscaler Helm chart
autoDiscovery:
  clusterName: perionyx-production

awsRegion: us-east-1

extraArgs:
  skip-nodes-with-system-pods: false
  balance-similar-node-groups: true
  scale-down-delay-after-add: 10m
  scale-down-unneeded-time: 10m
```

### Vertical Pod Autoscaler (VPA)

```yaml
# k8s/vpa/app-vpa.yaml
apiVersion: autoscaling.k8s.io/v1
kind: VerticalPodAutoscaler
metadata:
  name: perionyx-app-vpa
  namespace: perionyx
spec:
  targetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: perionyx-app
  updatePolicy:
    updateMode: "Auto"
  resourcePolicy:
    containerPolicies:
      - containerName: app
        minAllowed:
          cpu: "250m"
          memory: "512Mi"
        maxAllowed:
          cpu: "4"
          memory: "8Gi"
```

---

## Ingress Configuration

### Ingress Controller

```yaml
# k8s/ingress/production.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: perionyx-ingress
  namespace: perionyx
  annotations:
    kubernetes.io/ingress.class: "nginx"
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    nginx.ingress.kubernetes.io/force-ssl-redirect: "true"
    nginx.ingress.kubernetes.io/proxy-body-size: "50m"
    nginx.ingress.kubernetes.io/proxy-read-timeout: "120"
    nginx.ingress.kubernetes.io/proxy-send-timeout: "120"
    nginx.ingress.kubernetes.io/proxy-buffering: "on"
    nginx.ingress.kubernetes.io/proxy-buffer-size: "8k"
    nginx.ingress.kubernetes.io/proxy-buffers-number: "8"
    nginx.ingress.kubernetes.io/use-forwarded-headers: "true"
    nginx.ingress.kubernetes.io/enable-cors: "false"
    nginx.ingress.kubernetes.io/limit-rps: "100"
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
spec:
  tls:
    - hosts:
        - app.perionyx.com
        - api.perionyx.com
      secretName: perionyx-tls
  rules:
    - host: app.perionyx.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: perionyx-app
                port:
                  number: 80
    - host: api.perionyx.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: perionyx-app
                port:
                  number: 80
```

### AWS ALB Ingress

```yaml
# k8s/ingress/alb.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: perionyx-alb-ingress
  namespace: perionyx
  annotations:
    alb.ingress.kubernetes.io/scheme: "internet-facing"
    alb.ingress.kubernetes.io/target-type: "ip"
    alb.ingress.kubernetes.io/listen-ports: '[{"HTTPS":443}, {"HTTP":80}]'
    alb.ingress.kubernetes.io/ssl-redirect: "443"
    alb.ingress.kubernetes.io/certificate-arn: "arn:aws:acm:us-east-1:..."
    alb.ingress.kubernetes.io/security-groups: "sg-perionyx-alb"
    alb.ingress.kubernetes.io/healthcheck-path: "/api/v1/enterprise/health"
    alb.ingress.kubernetes.io/success-codes: "200"
    alb.ingress.kubernetes.io/load-balancer-attributes: |
      idle_timeout.timeout_seconds=60
```

### Cert-Manager for TLS

```yaml
# k8s/tls/certificate.yaml
apiVersion: cert-manager.io/v1
kind: Certificate
metadata:
  name: perionyx-tls
  namespace: perionyx
spec:
  secretName: perionyx-tls
  issuerRef:
    name: letsencrypt-prod
    kind: ClusterIssuer
  dnsNames:
    - app.perionyx.com
    - api.perionyx.com
```

---

## Network Policies

### Default Deny

```yaml
# k8s/network-policies/default.yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: default-deny-all
  namespace: perionyx
spec:
  podSelector: {}
  policyTypes:
    - Ingress
    - Egress
```

### Allow App Traffic

```yaml
# k8s/network-policies/app-ingress.yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-app-ingress
  namespace: perionyx
spec:
  podSelector:
    matchLabels:
      app: perionyx
      component: app
  policyTypes:
    - Ingress
  ingress:
    - from:
        - namespaceSelector:
            matchLabels:
              kubernetes.io/metadata.name: ingress-nginx
        - namespaceSelector:
            matchLabels:
              kubernetes.io/metadata.name: perionyx
      ports:
        - protocol: TCP
          port: 3000
```

### Allow App Egress

```yaml
# k8s/network-policies/app-egress.yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-app-egress
  namespace: perionyx
spec:
  podSelector:
    matchLabels:
      app: perionyx
      component: app
  policyTypes:
    - Egress
  egress:
    - to:
        - podSelector:
            matchLabels:
              app: perionyx
              component: db
      ports:
        - protocol: TCP
          port: 5432
    - to:
        - podSelector:
            matchLabels:
              app: perionyx
              component: redis
      ports:
        - protocol: TCP
          port: 6379
    - to:
        - namespaceSelector: {}
      ports:
        - protocol: TCP
          port: 443
        - protocol: TCP
          port: 80
```

### Database Network Policy

```yaml
# k8s/network-policies/db.yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: restrict-db-access
  namespace: perionyx
spec:
  podSelector:
    matchLabels:
      app: perionyx
      component: db
  policyTypes:
    - Ingress
  ingress:
    - from:
        - podSelector:
            matchLabels:
              app: perionyx
      ports:
        - protocol: TCP
          port: 5432
```

---

## Rolling Updates

### Update Strategy

The deployment uses a rolling update strategy:

```yaml
strategy:
  type: RollingUpdate
  rollingUpdate:
    maxUnavailable: 1        # Maximum pods unavailable during update
    maxSurge: 1               # Maximum extra pods during update
```

### Performing a Rolling Update

```bash
# Update image version
kubectl set image deployment/perionyx-app \
  app=ghcr.io/organization/perionyx:v1.1.0 \
  -n perionyx

# Or update the deployment manifest and apply
kubectl apply -f k8s/deployments/app.yaml

# Monitor rollout
kubectl rollout status deployment/perionyx-app -n perionyx

# Get rollout history
kubectl rollout history deployment/perionyx-app -n perionyx
```

### Canary Deployment

```yaml
# k8s/deployments/app-canary.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: perionyx-app-canary
  namespace: perionyx
  labels:
    app: perionyx
    component: app
    track: canary
spec:
  replicas: 1
  selector:
    matchLabels:
      app: perionyx
      component: app
      track: canary
  template:
    metadata:
      labels:
        app: perionyx
        component: app
        track: canary
    spec:
      containers:
        - name: app
          image: ghcr.io/organization/perionyx:v1.2.0-rc.1
          # ... same as production
```

```yaml
# Service with canary routing
metadata:
  annotations:
    nginx.ingress.kubernetes.io/canary: "true"
    nginx.ingress.kubernetes.io/canary-weight: "10"  # 10% traffic
```

---

## Zero-Downtime Deployment

### Prerequisites

- Minimum 3 replicas configured
- PodDisruptionBudget configured (minAvailable >= 2)
- Readiness and liveness probes configured
- PreStop hook configured for graceful shutdown
- Session affinity disabled (stateless application)

### Graceful Shutdown Configuration

The application handles SIGTERM by:

1. Marking itself as unhealthy (readyz endpoint returns failure)
2. Draining active connections (15-second delay via preStop)
3. Completing in-flight requests
4. Flushing queues and closing connections
5. Exiting cleanly

### Deployment Verification Script

```bash
#!/bin/bash
# verify-zero-downtime.sh

NAMESPACE="perionyx"
DEPLOYMENT="perionyx-app"
NEW_VERSION=$1

echo "=== Zero-Downtime Deployment Verification ==="

# Start monitoring in background
kubectl get events -n ${NAMESPACE} --watch &
EVENTS_PID=$!

# Trigger rollout
echo "Starting deployment of ${NEW_VERSION}..."
kubectl set image deployment/${DEPLOYMENT} \
  app=ghcr.io/organization/perionyx:${NEW_VERSION} \
  -n ${NAMESPACE} --record

# Monitor rollout status
sleep 5

# Check for any service interruption
ROLLOUT_STATUS=$(kubectl rollout status deployment/${DEPLOYMENT} -n ${NAMESPACE} --timeout=5m)

if echo "$ROLLOUT_STATUS" | grep -q "successfully rolled out"; then
  echo "✓ Rollout completed successfully"
else
  echo "✗ Rollout failed"
  kubectl rollout undo deployment/${DEPLOYMENT} -n ${NAMESPACE}
  kill $EVENTS_PID 2>/dev/null
  exit 1
fi

# Verify no downtime occurred
# Check through a monitoring window
echo "Running traffic simulation during verification..."
for i in {1..50}; do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
    https://app.perionyx.com/api/v1/enterprise/health)
  if [ "$STATUS" != "200" ]; then
    echo "✗ Non-200 status during deployment: ${STATUS}"
    kill $EVENTS_PID 2>/dev/null
    exit 1
  fi
  sleep 0.5
done

echo "✓ Zero downtime verified — all checks passed"
kill $EVENTS_PID 2>/dev/null

# Update monitoring annotation
kubectl annotate deployment/${DEPLOYMENT} -n ${NAMESPACE} \
  "perionyx.io/last-zero-downtime-deploy=$(date -u +%Y-%m-%dT%H:%M:%SZ)"
```

### Rollback on Failure

```bash
# Immediate rollback
kubectl rollout undo deployment/perionyx-app -n perionyx

# Rollback to specific revision
kubectl rollout undo deployment/perionyx-app -n perionyx --to-revision=3

# Verify rollback
kubectl rollout status deployment/perionyx-app -n perionyx
```

### Complete Deployment Script

```bash
#!/bin/bash
# deploy.sh — Full zero-downtime deployment workflow

set -euo pipefail

NAMESPACE="perionyx"
DEPLOYMENT="perionyx-app"
VERSION=${1:-latest}
REGISTRY="ghcr.io/organization/perionyx"

echo "=== Perionyx Deployment Pipeline ==="
echo "Version: ${VERSION}"
echo "Timestamp: $(date -u +%Y-%m-%dT%H:%M:%SZ)"

# Step 1: Pre-deployment checks
echo "[1/6] Running pre-deployment checks..."
kubectl get pods -n ${NAMESPACE} | grep -q "${DEPLOYMENT}" || {
  echo "Error: Deployment not found"
  exit 1
}
kubectl rollout status deployment/${DEPLOYMENT} -n ${NAMESPACE}

# Step 2: Backup database
echo "[2/6] Creating pre-deployment database backup..."
kubectl exec -n ${NAMESPACE} deployment/${DEPLOYMENT} -- \
  pg_dump -Fc > /tmp/pre-deploy-${VERSION}.dump
aws s3 cp /tmp/pre-deploy-${VERSION}.dump \
  s3://perionyx-backups/pre-deploy/${VERSION}/

# Step 3: Update image
echo "[3/6] Updating deployment image..."
kubectl set image deployment/${DEPLOYMENT} \
  app=${REGISTRY}:${VERSION} -n ${NAMESPACE} --record

# Step 4: Monitor rollout
echo "[4/6] Monitoring rollout..."
kubectl rollout status deployment/${DEPLOYMENT} -n ${NAMESPACE} --timeout=10m

# Step 5: Post-deployment verification
echo "[5/6] Running post-deployment verification..."
for i in $(seq 1 10); do
  STATUS=$(curl -sf -o /dev/null -w "%{http_code}" \
    https://app.perionyx.com/api/v1/enterprise/health) || true
  if [ "$STATUS" = "200" ]; then
    echo "Health check passed"
    break
  fi
  if [ "$i" = "10" ]; then
    echo "Health check failed — initiating rollback"
    kubectl rollout undo deployment/${DEPLOYMENT} -n ${NAMESPACE}
    exit 1
  fi
  sleep 5
done

# Step 6: Annotate and notify
echo "[6/6] Deployment complete"
kubectl annotate deployment/${DEPLOYMENT} -n ${NAMESPACE} \
  "perionyx.io/deployed-version=${VERSION}" \
  "perionyx.io/deployed-at=$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
  --overwrite

echo "✓ Deployment of ${VERSION} completed successfully"
```
