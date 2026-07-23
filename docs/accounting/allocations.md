# Allocations

## Overview

The Allocations module enables cost and revenue allocation across cost centers, profit centers, departments, and business units. It supports multiple allocation methods, configurable rules, and execution tracking.

## Allocation Methods

| Method | Description |
|--------|-------------|
| Percentage | Distribute based on fixed percentages per target |
| Fixed Amount | Allocate a fixed amount to each target |
| Headcount | Distribute based on employee count |
| Revenue | Allocate based on revenue contribution |
| Square Footage | Allocate based on physical space usage |
| Transaction Count | Allocate based on transaction volume |
| Custom Formula | User-defined allocation logic |

## Allocation Dimensions

- Cost Centers — Operational cost tracking units
- Profit Centers — Revenue and profit responsibility units
- Departments — Organizational departments
- Business Units — Strategic business units

## Allocation Rules

Each rule specifies:
- Source account (where costs originate)
- Target accounts (where costs are distributed)
- Allocation method and parameters
- Frequency (monthly, quarterly, annual, one-time)
- Dimension filters (cost center, profit center, department)
- Active/inactive status

## Allocation Run

An allocation run is the execution of a rule:
- Links to the rule and period
- Records total amount allocated
- Tracks each target allocation
- Status: draft → executed → posted → failed

## AllocationsService

| Method | Description |
|--------|-------------|
| `addRule()` | Create allocation rule |
| `getRule()` | Get rule by ID |
| `getAllRules()` | List all rules |
| `getActiveRules()` | Get active rules |
| `addRun()` | Record allocation run |
| `getRun()` | Get run by ID |
| `getAllRuns()` | List all runs |
| `getRunsByPeriod()` | Filter runs by period |
