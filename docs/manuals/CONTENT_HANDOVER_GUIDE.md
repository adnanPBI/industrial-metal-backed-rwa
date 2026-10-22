# ReserveChain.io - Content and Evidence Handover Guide (reviewed draft)

**Status:** Implementation guidance; not evidence of physical holdings, verified reserves, corporate formation, or an offering. Owner approval required before any asset evidence is published.

## 1. Asset program minimum records
- **Copper / lot #03-K-07:** program ID, lot and customer-stated unit of measure; assay reference **IGAS 0004512**, issue date **2022-07-04**; particle-size analysis, apparent/tap density, oxygen and moisture reports *only after signed lab review*; box/container IDs, individually confirmed weights, unique current seals, owner/title chain, sampling chain-of-custody and custodian receipt.
- **Nickel / lot 120/NP1:** assay reference **IGAS 0004368**, issue date **2021-10-19**; 0.025 mm wire diameter as source-reported; individually weighed 30-bobbin inventory and verified seal IDs, including source-referenced sampled bobbins **8, 10, 19, 27**; tensile/elongation reports when independently supplied.
- Both require documentary differentiation between historical assay and **present** title, custody, insurance, weight and redemption eligibility.

## 2. Source levels
| Level | Record | Permitted presentation |
|---|---|---|
| S0 | Synthetic illustration or template | Mark as illustrative; no ownership/reserve claim |
| S1 | Supplied historical assay scan | Reference date, lot and assay facts *only with publication authorization*; no current ownership claim |
| S2 | Owner and custody records independently reconciled | Private checker review, not automatically public |
| S3 | Executed agreements, current custody + independent reserve attestation | Only publish fields specifically signed off by the owner/compliance reviewer |

The supplied proposed container identifiers, seals and per-bobbin weight estimates are **S0/S1 proposals**, not S3 evidence. The 30 equal bobbin estimates total 5000.1 grams by arithmetic rounding; obtain an individually measured weighing schedule instead of asserting exact equality.

## 3. File and naming conventions
- `RC-PROG-<MATERIAL>-<SERIES>` for asset programs; immutable source lineage.
- `RC-CU-<LOT>-BOX-<NUMBER>` and `RC-NI-<LOT>-BOBBIN-<NUMBER>` are **proposed** patterns; only a custodian-assigned/confirmed serial becomes an evidentiary identifier.
- Uploaded scanned documents: private by default, versioned with SHA-256 digest of the **actual uploaded binary**. Never copy proposed hash values into evidence without recomputing the bytes.
- Hero/product photography: owner-licensed, non-watermarked, high resolution; accessible captions and EN/ES/IT translations if approved. Concept artwork must be explicitly labeled and must not mimic assay evidence.
- Third-party certificates: check redistribution license, redact personal contact/banking details and get owner/compliance approval before public exposure.

## 4. Maker-checker (publication)
1. The contributor enters a proposed asset change, source file and substantive reason.
2. The platform withdraws materially changed published content from the public API pending review.
3. An independent reviewer (different WordPress user; `rc_review_assets` capability) examines evidence and obtains **written owner publication approval**.
4. The checker supplies an approval record ID and reason, and the application appends a hash-chain audit event.
5. Publishing also requires explicit `RC_ALLOW_EVIDENCE_PUBLICATION` flag in the owner-controlled WordPress configuration; default is disabled.
6. Rejection must leave the proposed asset unpublished. Prior displayed claims do not grant permission for new claims.

**Limit:** Application audit hashes alone are not externally anchored or tamper-proof against a database administrator. Independent WORM storage/signing and restore verification remain required.

## 5. Localization
English, Spanish and Italian *content production* needs qualified human translation and legal review. A key-value bundle does not complete a 51-page translation. Hreflang links and translated offerings must not be published before all intended pages and disclosure text are approved.

## 6. Publication gate
Require a signed checklist for title, lot units, assay publication rights, ownership chain, custody, insurance, valuation, reserve reconciliation, independent checker, privacy review, and jurisdiction/legal review. If any item is missing, retain **Pending**, **Not issued** and **Not offered for sale**.
