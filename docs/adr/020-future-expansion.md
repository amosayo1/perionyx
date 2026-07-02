# ADR-020: Future Expansion

**Status**: Draft  
**Date**: January 2025  
**Author**: Architecture Team  

## Context

Perionyx is designed for long-term growth. Anticipating future requirements allows us to make architectural decisions today that won't constrain the platform tomorrow.

## Decision

Document the following future expansion paths (no implementation decisions yet):

### 1. CQRS (Command Query Responsibility Segregation)
- **When needed**: When complex queries (analytics, reports, cross-module search) impact transactional performance
- **Approach**: Separate read models for queries, event-sourced write models
- **Why not now**: Current query volume doesn't justify the complexity

### 2. Event Sourcing
- **When needed**: When full event history and state reconstruction are required for all entities
- **Approach**: Store events as the source of truth, derive current state from event stream
- **Why not now**: Adds significant complexity; current audit + versioning is sufficient

### 3. Read Replicas
- **When needed**: When primary database query load exceeds capacity
- **Approach**: Configure Prisma to route read queries to replicas
- **Why not now**: Single instance sufficient for current scale

### 4. Sharding
- **When needed**: When data volume exceeds single-node PostgreSQL capacity
- **Approach**: Shard by companyId across multiple database instances
- **Why not now**: Premature — adds operational complexity

### 5. Sub-Millisecond P99
- **When needed**: When page load times become a competitive differentiator
- **Approach**: CDN caching, edge functions, Redis for all frequent queries
- **Why not now**: Current performance is acceptable for enterprise users

### 6. Multi-Region Deployment
- **When needed**: When data residency requirements demand regional deployment
- **Approach**: Regional database instances with read replicas, cross-region replication
- **Why not now**: Premature — single-region sufficient for current customers

## Consequences

- **Positive**: Clear migration paths when scale demands grow
- **Positive**: Current architecture doesn't preclude any of these approaches
- **Positive**: Team can make informed trade-offs knowing the expansion options
- **Negative**: Some current design decisions may need revision when scaling
- **Negative**: No implementation experience with these patterns yet

## Alternatives Considered

1. **Build for scale now (CQRS + event sourcing from day one)**: Rejected — overengineering, delayed time to market
2. **No expansion planning**: Rejected — risks painful migrations later
3. **Use a scale-out database (CockroachDB, Yugabyte)**: Rejected — operational complexity, compatibility concerns
