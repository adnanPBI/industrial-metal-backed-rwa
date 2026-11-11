# ReserveChain contract suite - audit candidate scaffold

This folder implements a **testnet-oriented, not-yet-authorized** ERC-20 asset-program pattern using OpenZeppelin. It deliberately contains no token price, asset-to-token ratio, presale discount, liquidity promise, ownership right, live contract address, or automatic mainnet deployment.

`ReserveChainAssetToken.sol` provides capped supply, explicit issuer/pause/redemption roles, pause controls, issuance reference events and allowance-backed redemption burns. `ReserveChainTokenFactory.sol` permits additional owner-approved program tokens without rebuilding the platform.

Before any production use: freeze owner-approved token terms, use issuer-controlled multisig roles, install/pin dependencies, run unit/integration/invariant tests, deploy to an approved Ethereum testnet, obtain an independent smart-contract audit, remediate findings, repeat reconciliation tests, and obtain written mainnet/TGE authorization. Nothing in this folder is a deployed token or an offer.

## Sepolia demonstration acceptance

The **Copper Powder and Nickel Wire** ERC-20 candidates can be tested locally and deployed only to Sepolia (chain ID 11155111). They start with **zero issued supply** and confer **no current reserve, ownership, redemption or commercial rights**. The illustrative cap of 1,000 units each is a test parameter, not an approved tokenomics decision.

```sh
cd contracts
npm install --no-audit --no-fund
npm run compile
npm test
# In a trusted shell with a funded dedicated TESTNET wallet and Ethereum Sepolia RPC:
# SEPOLIA_RPC_URL=... SEPOLIA_DEPLOYER_PRIVATE_KEY=... npm run deploy:sepolia
```

GitHub Actions: `.github/workflows/sepolia-contracts.yml` executes compile and 9 access-control/financial-safety tests, then attempts deployment on the special `[deploy-sepolia]` commit or via manual dispatch. Deploying needs repository Actions **secrets** `SEPOLIA_RPC_URL` and `SEPOLIA_DEPLOYER_PRIVATE_KEY`, and a faucet-funded dedicated Sepolia wallet; no private key may be committed. Optional `SEPOLIA_ADMIN_ADDRESS` can be set through repository vars for an owner-controlled testnet admin. The deploy script refuses incorrect networks, checks chain ID and deployed bytecode/receipts, and writes two verified **addresses and transaction hashes** to `contracts/deployments/sepolia-demo.json`. Do not claim completion until that manifest is actually committed and independently checked on Sepolia Etherscan.

**No Mainnet network is configured.** Production economic terms, counsel approval, third-party audit, multi-signature governance and title/custody verification are outside this testnet demonstration.
