# Treasury Summary Model

## Overview

The Command Center uses aggregated summary data rather than raw datasets from each treasury module. This ensures the Command Center remains lightweight, rendering instantly without duplicating module complexity.

## Summary Types

| Type | Source Module | Key Fields |
|---|---|---|
| CashPositionSummary | Phase 9B.2 | totalCash, availableCash, restrictedCash, idleCash, workingCapital |
| LiquiditySummary | Phase 9B.3 | liquidityScore, fundingNeeds, coverageRatio, poolUtilization |
| PaymentSummary | Phase 9B.4 | paymentsToday, collectionsToday, pendingApprovals, netCashFlow |
| BankAccountSummary | Phase 9B.5 | activeAccounts, totalBanks, dormantAccounts, complianceIssues |
| ForecastSummary | Phase 9B.6 | forecastAccuracy, forecast30Day, variance, confidenceScore |
| RiskSummary | Phase 9B.7 | overallScore, fxExposure, counterpartyRisk, policyBreaches |

## Regional Summary

Aggregates cash and liquidity data by geographic region, showing health scores and top entities per region.

| Region | Cash | Liquidity | Health |
|---|---|---|---|
| North America | $380M | $290M | 94 |
| Europe | $195M | $136M | 87 |
| Middle East | $165M | $114M | 91 |
| Africa | $52.75M | $29.82M | 62 |
| Asia-Pacific | $50M | $21.3M | 78 |
| Latin America | $25M | $13M | 68 |

## Entity Summary

Top-level entity aggregation showing cash, liquidity, payments volume, and overall health score per legal entity.

## Currency Summary

Exposure and cash positions by currency with risk scores and hedge coverage.

## Institution Summary

Banking relationship scores, account counts, and balances for each banking partner.
