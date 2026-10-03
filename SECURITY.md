# Security Policy

ReserveChain is currently a pre-launch implementation foundation. Do not use this repository as authorization to enable live token sales, payments, wallet functionality, reserve publication or redemption.

## Reporting a security issue

Use a private project-owner channel for vulnerabilities. Do not publish credentials, private keys, seed phrases, KYC data, unpublished evidence, or exploitable details in public GitHub issues.

## Repository rules

- Never commit `.env`, private keys, seed phrases, signing assets, recovery codes, production API credentials, KYC documents or production personal data.
- Production secrets must be supplied through an owner-controlled secret manager/environment configuration.
- Mainnet deployment, live payments, token issuance, liquidity and redemption require explicit written owner authorization plus the applicable legal, security, custody and operational gates.
- `fixtures/demo/` contains non-production illustrative data only.
- `public-demo/data/` is runtime state and is ignored by Git.
