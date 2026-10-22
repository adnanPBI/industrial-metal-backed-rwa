# ReserveChain independent remediation triage — 2026-10-22

## Reviewed inputs
- External pre-acceptance audit and full remediation notice in the three supplied text files.
- 34-entry `ReserveChain_Remediated_Repository_Patch_v1.0.zip` (SHA-256: `f2b6b104c70ff6dabca997bbb71dac28ccfd3c540aef16f6afb23c0ec9d7a3d6`).
- Standalone `asset-programs.json`, `digital-asset-passports.json`, `proof-of-reserves.json`.
- `ReserveChain_Whitepaper_v1.0.docx` (Stage 1 draft).

## Independently reproduced blocking defects in contributed ZIP
1. **WordPress replacement classes break the currently wired application:** replaced `RC_Admin` loses `init()`, `save_asset()`, `menu()`, etc.; replaced `RC_Audit` loses `append()` and `verify_chain()`; replaced `RC_Waitlist` loses `register()` and `verify()`. Existing `reservechain-core.php` still calls old interfaces.
2. **Database installation is not migratory:** contributed `RC_Installer::activate()` replaces `rc_assets` with `rc_asset_programs` and `rc_audit` with `rc_audit_log` while untouched REST/admin classes expect the existing tables. It omits existing installation/seed procedures and has no verified backup/rollback.
3. **The '17-ledger reconciliation' patch is not a double-entry, signed, immutable, independently matched accounting system:** it sums floats and optionally compares arbitrary supplied totals; a missing on-chain total yields `RECONCILED`. No actual RPC indexer or chain confirmation oracle exists.
4. **Blockchain indexer is not an Ethereum indexer:** it trusts incoming event payloads and their confirmation counts; simply saving an option key does not verify block hashes or handle chain reorganizations.
5. **KYC webhook patch is only a generic HMAC snippet:** it lacks provider-specific raw-body signature semantics, replay defense, verified timestamps, trusted endpoint wiring, case persistence and a source-of-truth eligibility policy.
6. **Acquisition contract is not production safe:** initially disabled, but a single issuer-role call can activate it without an independent legal/production gate. Investor jurisdiction is user-supplied; price/cap/reset and role segregation require independent audits.
7. **Redemption lock proposal moves assets directly out of a holder's address using privileged `_transfer` without holder authorization; do not deploy.** Role access alone does not satisfy physical redemption/title controls.
8. **Proposed specimen physical inventory is not verified:** provided per-bobbin `166.67 g` across 30 units totals **5000.1 g**, whereas the stated aggregate is 5000 g. Generated seals and synthetic custody statuses are not substantiated by provided custodian records.
9. **Proposed whitepaper/mobile UI uses future-tense architecture as operational fact**, including 'deployed on Ethereum Mainnet' and '17-ledger daily sync active'. These are not established by the repository.
10. **Theme removal conflicts with the latest owner's request:** keep the blue-glass/soft-white toggle. An older audit's instruction to remove it is superseded by explicit user direction.
11. **The ZIP does not contain all files enumerated in the remediation notice:** no operational EAS mobile build proof, no iOS/Android store acceptance, no production indexer deployment, no full DOCX/PDF/deck delivery, and no independent chain/security audit.

## Applied on the repository
- Existing WordPress plugin/table contracts preserved; new explicit publication review queue and separate checker requirement with default-disabled owner-publication authorization flag.
- Structured, review-only, privacy-minimized normalization of supplied metal program data and two passport references in `fixtures/reviewed/`. No proposed custody, seals or valuations are published to the site.
- Reconciliation and claims fail closed in reviewed fixture metadata: **not implemented**, **not verified**, **no issued tokens**.
- Automated remediation gates for non-public source records, 30 unique coil proposals, accurate sample references and `0` token supply.
- Previously deployed blue-glass/soft-white themes retained.

## Not accepted or deployed from contributed ZIP
The Solidity acquisition/redemption/treasury/vesting/factory replacements, and the PHP installer/admin/audit/waitlist/KYC/indexer/reconciliation replacements **must not be blindly merged**. These require independent design, corrected code, tests and legal/custody approval. The supplied DOCX remains review-only and should not be represented as a published final whitepaper. Source certificates must not be uploaded publicly without approval and private-detail review.

## Remaining independent acceptance gates
- Legal structure, jurisdiction/eligibility policy and owner-executed agreements;
- physical title, audited lot-level custody, assay disclosure approval, insurance and valuations;
- full website editorial and EN/ES/IT translations with legal review;
- secure web/mobile auth, KYC provider, escrow/custody, blockchain indexing, all 17 financial ledgers with reconciliation;
- independent audited contracts/testnet and owner-controlled multisig;
- QA on live WordPress/MariaDB, native iOS/Android/TestFlight/Google Play, backup+restore, pentest, and final handover signoffs.

**Verdict:** public pre-launch prototype/foundation with selected safe remediation. **Not final production acceptance.**
