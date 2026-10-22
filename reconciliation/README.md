# 17-ledger reconciliation — offline validator foundation

The user's audit notes correctly identified that the proposed PHP "17-ledger" routine is **not** an operational accounting reconciliation engine. It uses floats and can return `RECONCILED` when authoritative on-chain data is absent.

This directory provides only a **deterministic, non-financial offline validation helper**, covering the 17 proposed ledger categories. It validates entry IDs, individual transaction debit/credit equality, asset-specific currency precision with `BigInt`, and emits missing-ledger information. It cannot connect to a bank, blockchain, custodian or any live account, and cannot post funds, issue/burn tokens or assert reserve coverage.

**Statuses:** `INCOMPLETE`, `EXCEPTION`, `LOCAL_BOOKS_BALANCED_UNATTESTED`, `NOT_ATTESTED`. None represents independent external reconciliation.

For true Phase 17 signoff: implement durable ACID journals and a locked chart of accounts, replay-safe event ingestion, 17-ledger balancing across physical quantities/value (different unit systems), signed bank/custodian and RPC inputs, chain-reorganization rollback, proof anchoring, exception case workflow, finance/reviewer dual control, backup/restore and independent audit. No live launch claim is authorized by this utility.

Execute `node --test tests/reconciliation.test.mjs` to test its standalone arithmetic and fail-closed classifications.
