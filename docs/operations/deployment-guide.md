# Deployment Guide

## Prerequisites

- Docker and Docker Compose installed
- Kubernetes cluster (for production)
- Access to container registry (GHCR)
- Database migration permissions

## Environment Setup

```bash
# Clone repository
git clone https://github.com/organization/perionyx.git
cd perionyx

# Install dependencies
pnpm install

# Set up environment
cp .env.example .env.local
# Edit .env.local with your configuration
```

## Development Deployment

```bash
# Start development environment
docker compose -f docker/development/docker-compose.yml up -d

# Run database migrations
pnpm prisma:migrate

# Access at http://localhost:3000
```

## Staging Deployment

```bash
# Build and push Docker image
docker build -t ghcr.io/organization/perionyx:staging .
docker push ghcr.io/organization/perionyx:staging

# Deploy to staging
kubectl apply -f k8s/deployments/app.yaml -n perionyx-staging
kubectl set image deployment/perionyx-app app=ghcr.io/organization/perionyx:staging -n perionyx-staging
```

## Production Deployment

Use CI/CD pipeline (GitHub Actions):

1. Create a release tag: `git tag v1.0.0`
2. Push the tag: `git push origin v1.0.0`
3. CI/CD pipeline automatically:
   - Runs typecheck, lint, tests
   - Builds Docker image
   - Pushes to container registry
   - Deploys to staging
   - Deploys to production
   - Monitors rollout health

## Post-Deployment Verification

```bash
# Check health endpoint
curl https://app.perionyx.com/api/v1/enterprise/health

# Verify metrics endpoint
curl https://app.perionyx.com/api/metrics

# Check pod status
kubectl get pods -n perionyx

# Verify deployment rollout
kubectl rollout status deployment/perionyx-app -n perionyx
```
