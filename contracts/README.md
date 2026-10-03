# ReserveChain contract suite - audit candidate scaffold

This folder implements a **testnet-oriented, not-yet-authorized** ERC-20 asset-program pattern using OpenZeppelin. It deliberately contains no token price, asset-to-token ratio, presale discount, liquidity promise, ownership right, live contract address, or automatic mainnet deployment.

`ReserveChainAssetToken.sol` provides capped supply, explicit issuer/pause/redemption roles, pause controls, issuance reference events and allowance-backed redemption burns. `ReserveChainTokenFactory.sol` permits additional owner-approved program tokens without rebuilding the platform.

Before any production use: freeze owner-approved token terms, use issuer-controlled multisig roles, install/pin dependencies, run unit/integration/invariant tests, deploy to an approved Ethereum testnet, obtain an independent smart-contract audit, remediate findings, repeat reconciliation tests, and obtain written mainnet/TGE authorization. Nothing in this folder is a deployed token or an offer.
