# ReserveChain architecture

## Core principle

ReserveChain is treated as an evidence-governed RWA platform, not a cryptocurrency landing page. The data model separates **material specification evidence** from **ownership, custody, insurance, valuation, reserve, token and redemption states**. One source document must never silently imply another status.

## Contest-stage system

```text
Browser
  |
  +-- Public demo (no-dependency Node server)
  |     +-- 51 route definitions
  |     +-- Copper / Nickel evidence pages
  |     +-- illustrative Digital Asset Passports
  |     +-- waitlist API + email verification outbox
  |     +-- hash-chained audit events
  |
  +-- WordPress production foundation
        +-- ReserveChain Institutional theme
        +-- reservechain-core plugin
              +-- wp_rc_assets
              +-- wp_rc_documents
              +-- wp_rc_waitlist
              +-- wp_rc_audit
              +-- /wp-json/reservechain/v1/*
              +-- publication workflow
              +-- stage/mode controls
              +-- admin control center

Mobile client -> same ReserveChain REST API
Future KYC / blockchain / custody / PoR services -> approved integrations only
```

## Canonical record boundaries

`rc_assets` stores the public/administrative state of an asset program. Every claim has a distinct field: verification, custody, reserve and tokenization are not derived from a laboratory certificate.

`rc_documents` is designed for source metadata, visibility, publication state, hashes and versioning. In a production deployment, confidential evidence should move to owner-controlled private object storage with signed URLs, malware scanning and access policy rather than the public WordPress media directory.

`rc_waitlist` accepts registration-of-interest data only. It does not collect funds, wallet addresses or token reservations.

`rc_audit` uses a previous-event hash plus stable serialized event payload to create a tamper-evident chain. There is no deletion route or standard admin edit path for audit events.

## Stage gating

The platform has named operating modes. Live offering and redemption require both an admin selection and a deployment-level authorization constant. Production should extend this into a maker-checker approval record and deployment release gate.

## Target production evolution

For large-scale production, keep WordPress responsible for public content and approved projections while moving confidential documents, blockchain synchronization, payment/reconciliation and compliance cases into isolated services behind authenticated APIs. The WordPress REST surface should expose only approved public records.

## Security baseline

- WordPress capability separation and nonces for admin changes.
- REST validation and sanitization.
- no wallet/payment API in pre-launch build.
- hashed email-verification token at rest.
- IP-derived transient rate limit without storing the raw address in the waitlist record.
- honeypot field for basic automated form abuse.
- CSP/security headers in the standalone demo.
- append-only audit interface.
- no live secrets in source.
- owner-controlled production accounts and multisig required before launch.
