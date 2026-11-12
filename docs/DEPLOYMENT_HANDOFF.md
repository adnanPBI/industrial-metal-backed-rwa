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

## Verified Ethereum Sepolia ERC-20 demonstration (2026-11-12)

**Testnet only — no live token sale, custody proof, reserve coverage, ownership right, or production authorization.** Canonical deployment record: `contracts/deployments/sepolia-demo.json` (chain ID `11155111`). The actions workflow `ReserveChain Solidity tests and Sepolia demonstration` completed 9 Hardhat tests and deployment readbacks for two program contracts. Supply was **zero at the moment of deployment**; independently query Sepolia for current state before any subsequent disclosure.

| Asset program | Symbol | Contract (Sepolia Etherscan) | Deployment tx | Block |
| --- | --- | --- | --- | --- |
| RC-PROG-CU-001 | RC-CU-T | [`0xE67f6301eb05A9B5eF8E6b43d0a8b7137d4DEcFB`](https://sepolia.etherscan.io/address/0xE67f6301eb05A9B5eF8E6b43d0a8b7137d4DEcFB) | [`0xaad8c8ca972807474d8ea509aa423776a1c87c2384c87db505174131ef68c0f2`](https://sepolia.etherscan.io/tx/0xaad8c8ca972807474d8ea509aa423776a1c87c2384c87db505174131ef68c0f2) | 12117118 |
| RC-PROG-NI-001 | RC-NI-T | [`0xDd22f3E82dAc3647a705E4786a48F25969e20c01`](https://sepolia.etherscan.io/address/0xDd22f3E82dAc3647a705E4786a48F25969e20c01) | [`0xbe75434cd4e68c4602fa15bb42ded5327e3f515fa45467e58d6ee23d0eb5f885`](https://sepolia.etherscan.io/tx/0xbe75434cd4e68c4602fa15bb42ded5327e3f515fa45467e58d6ee23d0eb5f885) | 12117120 |

Deployment admin recorded: `0xf9Dfa3e0f50931bb27C8bc86DE71e64d11e7e463`. Deployment record includes bytecode hashes, source commit, exact token metadata, and transaction receipts. The public demo's generated asset data and WordPress theme's `assets/data/sepolia-demo.json` are derived from this manifest via `python scripts/generate_site_data.py`; this is a reproducible testnet demonstration, not an audit opinion.

### Verification and rollback

1. Run `cd contracts && npm install && npm test` and inspect the Solidity workflow result.
2. Check both Sepolia links, transaction hashes and block numbers against the manifest and live Etherscan/RPC; do not equate deploy-time zero supply with a current-state readback.
3. Run `python scripts/generate_site_data.py`, `python tests/static_audit.py`, and `node --test tests/editorial-v2.test.mjs` after installing the required six editorial images.
4. Check homepage, both individual metal pages, Digital Asset Passport pages, and WordPress equivalents. Explicitly confirm links point to Sepolia, not Mainnet.
5. For visual delivery, install the six owner-supplied WebP photos in both editorial directories. Use `python tests/editorial_media_acceptance.py` to enforce dimensions, digests, mirrored bytes and distinct assets. Missing image fallback is **not** an acceptance substitute.
6. To roll back frontend/UI changes, revert the relevant Git commit and redeploy; on-chain test contracts cannot be undeployed. No production token or reserve actions may be authorized by this handoff.

**Production gates remain:** third-party Solidity audit, issuer-controlled multisig, legal/issuer approval, asset-title and custody evidence, reserve reconciliation, jurisdiction/compliance clearance, independent QA, and documented owner acceptance.
