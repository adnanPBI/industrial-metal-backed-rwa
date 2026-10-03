# Demo Data Policy

Repository fixture data lives in `fixtures/demo/` and is explicitly labelled **ILLUSTRATIVE / DEMO DATA**.

The fixtures exist only to make local development, QA, UI review and contest demonstrations reproducible. They must never be promoted into production or presented as evidence of reserves, ownership, custody, insurance, valuation, issued tokens, investor eligibility or redemption rights.

Runtime records produced by `public-demo/server.mjs` are written to `public-demo/data/` and are ignored by Git except for `.gitkeep`. This prevents test registrations, verification tokens and local audit logs from being committed accidentally.

The two initial program fixtures use only the already supplied IGAS certificate facts used elsewhere in the demo. Any additional production facts require owner-approved source records and the configured review/publication workflow.
