# ADR-010: AI Copilot

**Status**: Ratified  
**Date**: June 2025  
**Author**: Architecture Team  

## Context

Enterprise financial platforms generate vast amounts of data. Users need intelligent assistance to find insights, answer questions, and detect anomalies. However, AI in financial contexts must be trustworthy — hallucinations are unacceptable.

## Decision

Build an **offline-first AI architecture** with the following principles:

1. **Grounded generation**: All AI responses must be based on platform data, not AI training data
2. **Offline fallback**: When no AI API key is configured, the system provides structured data responses
3. **No autonomous action**: AI recommends actions; humans must approve them
4. **Source citation**: Every factual claim includes its data source
5. **Confidence scoring**: Responses include confidence ratings (high/medium/low/simulated)

### Architecture Components
- **Knowledge Index**: Queries all Prisma modules for data summaries
- **Context Builder**: Assembles complete enterprise context from 19 parallel queries
- **Intent Detection**: Recognizes "executive briefing", "trace TXN-xxx", "what data" patterns
- **Response Formatting**: Structured responses with summary, details, sources, confidence, recommendations

## Consequences

- **Positive**: Works without any AI API key — true offline capability
- **Positive**: Trustworthy — every claim is verifiable and sourced
- **Positive**: Transparent — users can see why the AI said what it said
- **Negative**: Limited to rule-based intelligence when offline
- **Negative**: External LLM adds latency when enabled (mitigated by streaming)

## Alternatives Considered

1. **AI-only (no offline fallback)**: Rejected — platform must work without external dependencies
2. **Fine-tuned model**: Rejected — maintenance burden, data privacy concerns
3. **RAG-only without structured data**: Rejected — insufficient for financial accuracy requirements
