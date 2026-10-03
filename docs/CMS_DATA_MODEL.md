# CMS and data model

## Asset programs (`wp_rc_assets`)

Core fields: program ID, slug, product name, material, physical form, lot/batch reference, purity, diameter, laboratory, certificate number/date, publication state, verification status, custody status, reserve status, tokenization status, passport ID and evidence note.

The next production iteration expands this into related lot/batch/container/coil tables rather than adding hundreds of nullable columns to the program record.

## Documents (`wp_rc_documents`)

Document type, asset link, title, version, source reference, protected file reference, SHA-256, visibility, publication state, issue date, approval date and creation date.

Production rule: confidential ownership, custody, insurance, KYC and reserve evidence belongs in private owner-controlled object storage. WordPress Media Library is not the intended confidential data room.

## Waitlist (`wp_rc_waitlist`)

First/last name, email, country, interest type, material interest, optional range/type fields, message, three consent/acknowledgement flags, hashed verification token, verified timestamp, subscription state, source and creation timestamp.

The waitlist does not accept wallet addresses, payments or token reservations.

## Audit (`wp_rc_audit`)

Actor, action, record type/id, before/after JSON, reason, previous hash, event hash and timestamp. The plugin exposes inserts and verification, not ordinary update/delete controls.

## Page architecture

The 51 public assignments are stored in a version-controlled definition file and seeded into WordPress as real pages. This prevents screenshot revisions from becoming duplicate URLs and gives the CMS a deterministic sitemap.
