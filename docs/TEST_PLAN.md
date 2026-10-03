# QA and security plan

## Automated package checks

- JavaScript syntax checks for the no-dependency demo.
- PHP syntax lint over all WordPress theme/plugin files.
- JSON parsing validation.
- Demo HTTP health, assets and waitlist endpoints.
- Waitlist duplicate handling and verification flow.
- Audit-chain integrity verification after write events.
- Static checks that the public build contains no `Buy now`, active contract address or live payment UI.
- 51-page route count validation.

## Production acceptance expansion

- PHPUnit/WordPress integration tests for permissions, publication states and REST validation.
- browser E2E across current Chrome/Firefox/Safari/Edge and representative mobile sizes.
- accessibility audit including keyboard navigation and visible focus.
- Core Web Vitals/performance budget.
- SAST, dependency, secret and license scanning.
- DAST and independent backend/API penetration test.
- smart-contract unit, fuzz/invariant and event/supply/reconciliation tests plus independent audit.
- KYC/sanctions webhook replay/idempotency tests.
- blockchain reorganization and duplicate-event tests.
- database backup/restore and staging-to-production rollback.
- iOS/Android device, secure storage, deep-link, session, privacy and store testing.
- independent clean-environment handover test.
