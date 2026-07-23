# Mandate Management

## Overview

Mandates define the legal authorization structure for each bank account — who can sign, with what authority, and up to what limit. The Mandate Management system tracks the complete lifecycle of every mandate across all banking relationships.

## Mandate Structure

Each mandate links:
- A specific bank account
- One or more signatories
- A signing authority type
- An approval limit
- Effective and expiry dates

## Mandate Statuses

| Status | Meaning |
|---|---|
| Active | Currently in effect |
| Expiring | Within 30 days of expiry |
| Expired | Beyond expiry date |
| Revoked | Cancelled by entity/bank |
| Pending Renewal | Renewal initiated, awaiting confirmation |

## Renewal Process

1. **60 days before expiry**: Renewal reminder generated
2. **30 days before expiry**: Mandate flagged as "Expiring"
3. **At expiry**: Mandate status changes to "Expired"
4. **Renewal**: New board resolution or authorization letter submitted
5. **Post-renewal**: Status updated to "Active" with new expiry

## Authority Matrix

A mandate defines:
- Which signatories are authorized
- What signing authority type applies
- Maximum approval limit per transaction
- Whether the mandate is for specific account groups or individual accounts
- Any special conditions or restrictions

## Audit Requirements

- All mandate changes recorded with timestamp and authorizer
- Annual mandate review mandatory
- Board approval required for mandate structure changes
- Bank confirmation of mandate updates required
