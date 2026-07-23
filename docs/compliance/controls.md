# Controls & Testing

## Control Types
- **Preventive**: Stops issues before they occur (e.g., MFA, SoD enforcement)
- **Detective**: Identifies issues after occurrence (e.g., access review, vulnerability scan)
- **Corrective**: Fixes issues after detection (e.g., DRP testing, data retention cleanup)
- **Compensating**: Alternative controls when primary isn't feasible

## Test Results
- **pass**: Control operating effectively
- **fail**: Control failed — remediation required
- **warning**: Control partially effective — requires attention
- **not-tested**: No test performed yet

## Services
- `ControlService` — CRUD for controls
- `ControlTestService` — CRUD for test results, query by control/tester/result
