# Deployment and handoff runbook - foundation

## Local contest/demo server

1. Install Node 22+.
2. `cd public-demo`.
3. Run `node server.mjs`.
4. Open `http://127.0.0.1:4173`.
5. Submit the waitlist form.
6. Read the development mail link in `data/outbox.log` and verify the registration.
7. Run `GET /api/health` and confirm `audit_chain_valid: true`.

## Local WordPress

1. Install Docker Desktop/Engine and Docker Compose.
2. Copy `.env.example` to `.env` and replace development credentials.
3. Run `./scripts/bootstrap-wordpress.sh`.
4. Activate/verify the `ReserveChain Institutional` theme and `ReserveChain Core` plugin.
5. Confirm 51 seeded pages and `/wp-json/reservechain/v1/health`.
6. Configure an SMTP/transactional-email provider for real waitlist verification.

## Staging requirements

- staging-only domain/subdomain and `noindex` policy;
- HTTPS and HSTS after TLS is stable;
- CSP/security headers;
- private database credentials from secrets manager/environment;
- restricted WordPress admin access and MFA plugin/provider;
- transactional email under a ReserveChain-controlled account;
- owner-controlled backups and restoration test;
- log/error monitoring;
- WAF/rate limiting;
- no shared public admin credentials.

## Production gates

Production must not activate wallet/payment/TGE/redemption merely because code exists. Required inputs include written owner authorization, legal rules, final asset/evidence approval, issuer-controlled multisig, smart-contract audit/remediation, reconciliation tests, security acceptance, backup restoration and production account transfer.

## Handover

Final handover must include source repositories/Git history, build scripts, environment inventory, database schema/migrations, contract ABIs/deployment records, app signing/store configuration, DNS/email/analytics/monitoring inventory, credentials through a secure channel, training, restore/rollback evidence and removal of developer access after owner confirmation.
