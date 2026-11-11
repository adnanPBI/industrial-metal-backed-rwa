/* Sepolia-only, owner-controlled, zero-supply ERC-20 demonstrations.
 * This script does NOT make token sales, mint reserves or deploy to Mainnet.
 */
const fs = require('node:fs');
const path = require('node:path');
const { ethers, network } = require('hardhat');
const MAINNET = 1n;
const SEPOLIA = 11155111n;
async function main() {
  if(network.name !== 'sepolia') throw new Error('Refusing deployment outside the explicit Sepolia network');
  const actual = await ethers.provider.getNetwork();
  if(actual.chainId === MAINNET || actual.chainId !== SEPOLIA)
    throw new Error('Refusing deployment: RPC chain ID is not Ethereum Sepolia (11155111).');
  const signers=await ethers.getSigners();
  if(signers.length!==1) throw new Error('Exactly one configured testnet signer is required.');
  const deployer=signers[0];
  const balance=await ethers.provider.getBalance(deployer.address);
  if(balance===0n)throw new Error('Testnet deployer address '+deployer.address+' has no Sepolia ETH; use a reputable testnet faucet.');
  const desiredAdmin=(process.env.SEPOLIA_ADMIN_ADDRESS||deployer.address);
  if(!ethers.isAddress(desiredAdmin))throw new Error('Invalid SEPOLIA_ADMIN_ADDRESS.');
  const admin=ethers.getAddress(desiredAdmin);
  const programs=[
    {name:'ReserveChain Copper Powder (Sepolia Demo)',symbol:'RC-CU-T',id:'RC-PROG-CU-001'},
    {name:'ReserveChain Nickel Wire (Sepolia Demo)',symbol:'RC-NI-T',id:'RC-PROG-NI-001'}
  ];
  const factory=await ethers.getContractFactory('ReserveChainAssetToken');
  const cap=ethers.parseUnits('1000',18); // test-only, illustrative cap; no allocation or backing
  const deployed=[];
  for(const p of programs){
    const pid=ethers.id(p.id);
    const token=await factory.deploy(p.name,p.symbol,cap,pid,admin);
    await token.waitForDeployment();
    const address=await token.getAddress();
    const tx=token.deploymentTransaction();
    const receipt=await tx.wait(2);
    if(!receipt || receipt.status!==1)throw new Error('Sepolia deployment receipt did not succeed for '+p.id);
    const bytecode=await ethers.provider.getCode(address);
    if(bytecode==='0x')throw new Error('No deployed EVM code at '+address);
    if((await token.programId())!==pid || (await token.totalSupply())!==0n || (await token.cap())!==cap)
      throw new Error('Post-deployment contract readback mismatch for '+p.id);
    if(!(await token.hasRole(await token.DEFAULT_ADMIN_ROLE(),admin)))
      throw new Error('Testnet admin role mismatch for '+p.id);
    if((await token.name())!==p.name || (await token.symbol())!==p.symbol)
      throw new Error('Token metadata mismatch for '+p.id);
    deployed.push({
      programId:p.id,programIdHash:pid,address,name:p.name,symbol:p.symbol,
      cap:cap.toString(),totalSupply:'0',admin,
      transactionHash:receipt.hash,blockNumber:receipt.blockNumber,
      bytecodeHash:ethers.keccak256(bytecode),
      explorer:'https://sepolia.etherscan.io/address/'+address,
      transactionExplorer:'https://sepolia.etherscan.io/tx/'+receipt.hash
    });
    console.log('Sepolia readback verified: '+p.id+' at '+address+' TX '+receipt.hash);
  }
  const manifest={
    environment:'SEPOLIA_TESTNET_ONLY',
    chainId:Number(SEPOLIA),generatedAt:new Date().toISOString(),
    sourceCommit:process.env.GITHUB_SHA||'manual',
    description:'Unbacked technical demonstration; no ownership, reserve coverage, token offer or issuance.',
    testnetDeployer:deployer.address,
    assets:deployed
  };
  const target=path.resolve(__dirname,'../deployments/sepolia-demo.json');
  fs.mkdirSync(path.dirname(target),{recursive:true});
  fs.writeFileSync(target,JSON.stringify(manifest,null,2)+'\n');
  console.log('SEPOLIA_DEPLOYMENT_READBACK=PASS; assets='+deployed.length+'; record=contracts/deployments/sepolia-demo.json');
}
main().catch(error=>{console.error('Sepolia deployment failed: '+error.message);process.exitCode=1;});
