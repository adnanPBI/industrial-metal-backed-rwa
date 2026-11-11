require('@nomicfoundation/hardhat-toolbox');
const rpc = process.env.SEPOLIA_RPC_URL || 'http://127.0.0.1:8545';
const suppliedKey = (process.env.SEPOLIA_DEPLOYER_PRIVATE_KEY || '').trim();
const key = suppliedKey && (suppliedKey.startsWith('0x') ? suppliedKey : '0x' + suppliedKey);
if(key && !/^0x[0-9a-fA-F]{64}$/.test(key)) throw new Error('SEPOLIA_DEPLOYER_PRIVATE_KEY must be a 32-byte hex secret.');
module.exports = {
  solidity: {
    version: '0.8.24',
    settings: { optimizer: { enabled: true, runs: 500 } }
  },
  networks: {
    hardhat: { chainId: 31337 },
    sepolia: { url: rpc, accounts: key ? [key] : [], chainId: 11155111, timeout: 90000 }
  },
  etherscan: { apiKey: process.env.ETHERSCAN_API_KEY || '' }
};
