# Evidence Model

## Overview

Evidence is structured proof of a business problem. It connects the person who identified it, the workflow it affects, the business impact, and the suggested improvement.

## Evidence Record Structure

```
Problem: Clear statement of the problem
CurrentWorkflow: How work is done today
CurrentWorkaround: How people cope with the limitation
BusinessImpact: What the problem costs the business
Frequency: How often the problem occurs
Severity: How critical the problem is
SuggestedImprovement: What should be built
SupportingPersons: Who validated this evidence
SupportingOrganizations: Which companies confirmed it
SupportingIndustries: Which industries are affected
SupportingCountries: Which geographic markets
SupportingErpSystems: Which ERP systems are involved
ConfidenceScore: 1-10, aggregated from all supporting data
```

## Severity Levels

| Level | Meaning |
|-------|---------|
| critical | Blocks business operations entirely |
| high | Significant productivity/cost impact |
| medium | Moderate inefficiency |
| low | Minor inconvenience |

## Frequency Levels

| Level | Meaning |
|-------|---------|
| daily | Impacts daily operations |
| weekly | Weekly recurring problem |
| monthly | Month-end related |
| quarterly | Quarter-end related |
| continuous | Always present in the background |

## Evidence Aggregation

Multiple supporting persons increase confidence:

| Supporters | Confidence Boost |
|------------|-----------------|
| 1 | Base score |
| 2-3 | +2 points |
| 4-5 | +3 points |
| 6+ | +4 points |

Same industry adds +1. Same country adds +0.5. Same ERP adds +1.
