# Payment Rails & Routing Strategy

## Supported Rails

| Rail | Code | Type | Settlement | Coverage |
|---|---|---|---|---|
| Wire | WIRE | Domestic | 4 hours | US, EU |
| ACH | ACH | Domestic | 1 day | US |
| SEPA | SEPA | Domestic | 1 day | EU |
| SWIFT | SWIFT | Cross-border | 2 days | Global |
| RTGS | RTGS | Domestic | Real-time | US, UK, EU, IN |
| RTP | RTP | Instant | Real-time | US |
| FedNow | FEDNOW | Instant | Real-time | US |
| FPS | FPS | Instant | Real-time | UK |
| CHAPS | CHAPS | Domestic | 2 hours | UK |
| BACS | BACS | Domestic | 3 days | UK |
| Instant Payment | INSTANT | Instant | Real-time | EU, APAC |
| Internal Transfer | INTERNAL | Internal | Instant | Global |
| Book Transfer | BOOK | Internal | Instant | Global |
| Cross-border | CB | Cross-border | 2 days | Global |

## Rail Selection Criteria

The routing matrix (`PaymentRoutingMatrix`) selects optimal rails based on:

1. **Currency**: Which rails support the payment currency
2. **Country/Region**: Geographic coverage
3. **Amount**: Rail min/max limits
4. **Speed**: Settlement time requirements
5. **Cost**: Transaction fees
6. **Risk**: Rail reliability and success rate

### Route Selection Algorithm

```
preferred_rail = find_best_rail(currency, country, amount)
if preferred_rail.available:
    use preferred_rail
else:
    use fallback_rail
```

## Routing Matrix

20 pre-configured routes cover all major currency/country pairs. Each route specifies:
- Preferred rail (first choice)
- Fallback rail (secondary option)
- Average settlement time
- Average cost
- Risk score (5-20 scale)
- Provider (labeled "Mock Provider")

## Provider Abstraction

All banking provider references use "Mock Provider" labels. This ensures:
- No real provider integrations
- No SDK dependencies
- No API calls
- Clean migration path when Phase 9A banking abstractions are ready

## Future Extensions

- Real-time rail status monitoring
- Intelligent routing with ML optimization
- Cost/speed trade-off visualization
- Rail performance benchmarking
- Automated rail switching based on SLA performance
