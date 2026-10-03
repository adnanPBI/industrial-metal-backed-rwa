# Source conflicts and required owner confirmations

The implementation does not silently resolve contradictory project facts.

## Corporate jurisdiction

The pasted contest description says ReserveChain is at an **Estonia pre-incorporation/prelaunch stage**, while the same description's mandatory disclosure refers to a future **Swiss corporate and legal structure**. The Final Master Developer Instructions repeatedly state that the **Swiss corporate and issuance structure is in development**.

Current implementation choice: use the exact mandatory pre-launch disclosure supplied by the owner and keep corporate status configurable. Before production publication, the owner/legal adviser must confirm the correct entity/jurisdiction wording.

## 20% discount methodology

The 51-page website brief includes a page titled `20% Discount Methodology`; the Final Master instructions state that discounts, prices, ratios and commercial terms must not be hard-coded before approval.

Current implementation choice: create the page architecture but do not activate a transactional discount or embed it into contract economics. Approved commercial configuration must be supplied by the owner.

## Certificates vs live status

The supplied IGAS certificates support selected material specifications. They do not by themselves prove present ownership, current stock, custody, insurance, reserve eligibility or tokenization. Current UI labels those other states independently as pending/not published.
