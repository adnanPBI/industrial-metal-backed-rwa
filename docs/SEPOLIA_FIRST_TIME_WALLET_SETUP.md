# ReserveChain: first-time Sepolia setup (no wallet and no paid ETH required)

This is only for a **public Sepolia demonstration** of two *unbacked, zero-supply* ERC-20 candidates (Copper Powder and Nickel Wire). No ERC-20 Mainnet contracts are deployed or authorized. Do not treat testnet tokens as ownership or custody claims.

## Step 1 — Create a fresh TESTNET-ONLY account locally

1. Install MetaMask from the official site: https://metamask.io/ . Follow https://support.metamask.io/start/creating-a-new-wallet/ .
2. Prefer a **new wallet instance with its own fresh Secret Recovery Phrase**, not another account under a wallet containing real assets. Never reuse the seed/key of any wallet holding real funds.
3. Store the recovery phrase safely offline. In MetaMask's network selector, enable test networks, select **Sepolia**, and copy the account's public address (starts `0x`).
4. The public address is safe to share for funding and verification. The recovery phrase and private key must stay private.

## Step 2 — Claim free Sepolia test ETH

For a **new empty wallet**, try:
- Google Cloud Web3 Sepolia faucet: https://cloud.google.com/application/web3/faucet/ethereum/sepolia — Google account and rate/anti-abuse checks may apply.
- Sepolia PoW Faucet: https://sepolia-faucet.pk910.de/ — enter *public address*, complete browser proof-of-work puzzle, and claim earned test ETH when its threshold is reached. No real ETH purchase is needed.

Alchemy's faucet at https://www.alchemy.com/faucets commonly requires an existing Ethereum **mainnet balance and transaction activity** for that same address; it is not the first choice for a brand-new test wallet.

A pair of contract deployments consumes Sepolia gas; if there is insufficient Sepolia ETH, claim more when allowed. Confirm receipt on https://sepolia.etherscan.io/address/0xYOUR_PUBLIC_ADDRESS . Never send mainnet ETH to pay for Sepolia gas or buy test ETH from strangers.

## Step 3 — Obtain a Sepolia JSON-RPC endpoint

Use a trusted provider's free Sepolia endpoint, for example create a free account at https://www.alchemy.com/ and create an **Ethereum Sepolia** app/API endpoint. Confirm the network is **Ethereum Sepolia (chain ID 11155111)**, *not Base Sepolia*, Ethereum Mainnet or another testnet. The URL is usually HTTPS and may contain an API key: treat it as a secret.

## Step 4 — Set the two GitHub Actions secrets yourself

Open https://github.com/adnanPBI/industrial-metal-backed-rwa/settings/secrets/actions in the **ReserveChain repository** (or configure these under the `sepolia-testnet` GitHub Actions environment if your team has environment approval policies).

Add:
- `SEPOLIA_RPC_URL`: exact HTTPS endpoint for Ethereum Sepolia from Step 3.
- `SEPOLIA_DEPLOYER_PRIVATE_KEY`: private key exported from the **new testnet-only account**, **not the 12/24-word recovery phrase**. Do not paste either key into GitHub source files, chat, screenshots, logs, workflow code or issue threads.

Optional repository **Actions variable** `SEPOLIA_ADMIN_ADDRESS` (public 0x address) allows the intended owner to hold admin rights. If omitted, the testnet deployer remains the initial admin. Decide custody of this testnet admin together with the client before transfer.

Only you or an authorized account administrator should type these values directly into GitHub's secrets UI. Never give an assistant or third party the recovery phrase or private key. Remove obsolete testnet credentials after the demo.

## Step 5 — Run automated deployment once funded and configured

Open https://github.com/adnanPBI/industrial-metal-backed-rwa/actions/workflows/sepolia-contracts.yml and select **Run workflow** on `main`.

The workflow:
1. Compiles Solidity 0.8.24 with Hardhat and runs the complete 9-test suite.
2. Refuses to deploy unless the RPC chain is **Sepolia chain ID 11155111**, the configured wallet has test ETH, and the contracts have not been mistakenly assigned to Mainnet.
3. Deploys **two testnet ERC-20 candidates**, one for Copper and one for Nickel, starting with **zero issued supply**.
4. Verifies receipts, contract bytecode, program IDs, supply and role permissions.
5. Commits the public **addresses and transaction hashes** as `contracts/deployments/sepolia-demo.json` and provides Sepolia Etherscan URLs.

Do **not** announce a deployed testnet address until the job is successful and `sepolia-demo.json` exists. The repository's existing nine passing tests are **local tests**, not evidence of an on-chain deployment.

## What to share with the contest holder

After a genuinely successful deployment, share the **GitHub test results**, **both Sepolia Etherscan contract addresses**, the **transaction hashes** and the zero-supply prelaunch statement. Never share signing credentials, the wallet recovery phrase, or any private endpoint/API key.

## Troubleshooting

- **Secrets absent:** GitHub step `Confirm secure Sepolia deployment prerequisites` fails. Configure secrets in Step 4 and rerun.
- **Insufficient ETH:** Sepolia faucet claim failed, or the wallet has insufficient Sepolia ETH for both contracts. Check testnet address on Etherscan.
- **Wrong chain:** RPC points to Ethereum Mainnet or another chain. Correct endpoint; deployment script will deliberately refuse.
- **Deployment receipt failure:** View workflow logs, confirm gas/RPC, and examine the public transaction hash. A partially deployed pair must be reviewed before rerunning to avoid accidental duplicate contracts.
- **GitHub write permission:** Workflow must be allowed to commit its manifest. Repository administrators may need to enable Actions read/write permissions and environment approvals.

**Production use is separate** and requires owner-approved rights/tokenomics, compliance and custody evidence, independent security review, and written Mainnet authorization.
