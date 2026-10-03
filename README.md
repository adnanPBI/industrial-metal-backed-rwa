# ReserveChain.io - End-to-End Implementation Foundation

Version: **0.2.0 / Blue-Glass Re-audited Contest-to-Production Foundation**

This package converts the supplied ReserveChain contest brief and developer instructions into a working, inspectable implementation foundation rather than a Figma-only submission. It contains:

- a no-dependency hosted contest demo with all 51 public page routes, premium institutional blue-glass design with restrained gold accents, Copper and Nickel program pages, illustrative Digital Asset Passports, pre-launch disclosures, functional waitlist API, email-verification simulation and a tamper-evident audit chain;
- a custom WordPress theme and `reservechain-core` plugin that seed the 51-page sitemap, structured asset registry, public REST API, waitlist/email verification, publication states, mode controls, admin workflows and append-only hash-chained audit log;
- ERC-20 asset-program contract and factory **audit-candidate scaffolds** based on OpenZeppelin imports, with no live token price, contract address, offering, liquidity or ownership claim;
- a React Native/Expo mobile foundation that consumes the same API and keeps wallet, purchase, live reserves and redemption disabled in pre-launch mode;
- Docker-based local WordPress setup, traceability, architecture, QA, handover and staged-delivery documentation.

## 1. Fastest working demo

Requires Node 22+ and Python 3.11+ (the server auto-generates derived site data on first start).

```bash
cd public-demo
node server.mjs
```

Open `http://127.0.0.1:4173`.

The demo waitlist persists into `public-demo/data/`. Derived 51-page runtime data is generated from `scripts/generate_site_data.py` and is not committed as duplicated source. Verification links are written to `public-demo/data/outbox.log`, not displayed to public users. For local acceptance testing only, you can set `RC_DEMO_EXPOSE_VERIFICATION=1` to return the verification URL in the API response.

Optional local admin console and API:

Open `http://127.0.0.1:4173/admin` after starting the server with an admin token.



```bash
RC_DEMO_ADMIN_TOKEN='choose-a-long-random-secret' node server.mjs
curl -H 'Authorization: Bearer choose-a-long-random-secret' http://127.0.0.1:4173/api/admin/audit
```

Never deploy a shared demo credential on a production page.

## 2. WordPress implementation

The required WordPress implementation is under `wordpress/wp-content/`.

```bash
cp .env.example .env
# change every development credential
./scripts/bootstrap-wordpress.sh
```

That path requires Docker and network access to pull WordPress/MariaDB images. The activation process creates custom tables, roles, two initial asset records and the full 51-page sitemap, then sets the ReserveChain home page as the WordPress front page.

Important safety control: selecting `live_offering` or `redemption` in WordPress admin is not enough to activate those modes. The deployment must also define `RC_ALLOW_LIVE_MODE=true` after owner authorization. The current package does not implement live payment collection or mainnet issuance.

## 3. Smart contracts

`contracts/` is an audit-candidate/testnet scaffold. Install the pinned package dependencies in a network-enabled development environment, compile, test, deploy to an approved testnet, commission an independent audit and complete issuer-control transfer before any mainnet consideration.

No production token is deployed by this package.

## 4. Mobile

`mobile/` is the shared-backend React Native/Expo foundation. It deliberately sets wallet, purchase, live Proof-of-Reserves and redemption features to `false` in pre-launch mode. App-store delivery requires owner-controlled Apple/Google accounts, signing assets, KYC/provider integration, TestFlight/Play testing and store-review work.

## 5. What is and is not complete

Read `docs/IMPLEMENTATION_STATUS.md` before presenting this package. The public demo and WordPress foundation are working code. External legal approvals, custody/insurance evidence, production KYC provider connections, independent smart-contract/security audits, owner multisig setup, cloud production infrastructure, app-store accounts, mainnet issuance, liquidity/exchange activity and live redemption cannot truthfully be marked complete from an offline development package and remain gated.

The architecture deliberately makes those modules configurable and stage-gated instead of inventing missing information.

## 6. v0.2 deep re-audit

See `docs/DEEP_REAUDIT_V0.2.md` and `docs/VISUAL_SYSTEM_BLUE_GLASS.md` for the applied remediation set, verified wiring and the remaining owner/third-party acceptance gates.

## 7. Repository fixtures and CI

Safe, clearly labelled dummy records are provided under `fixtures/demo/` for reviewer walkthroughs and local integration work. Runtime waitlist/audit files under `public-demo/data/` are intentionally ignored so test registrations and verification tokens are not committed.

GitHub Actions runs the static audit, end-to-end public-demo smoke test, PHP lint checks and package validation on pushes and pull requests. See `.github/workflows/ci.yml`.


## 8. Public-repository evidence handling

The public repository intentionally does **not** republish the original client-supplied IGAS certificate scans because those source documents include third-party contact/banking details. The UI uses repository-safe SVG evidence previews containing only the approved demo metadata. Original evidence remains an owner-controlled source input for the private production evidence store.
