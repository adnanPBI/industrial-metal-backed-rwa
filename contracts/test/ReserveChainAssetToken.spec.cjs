const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('ReserveChainAssetToken — pre-launch demonstration safety', function () {
  let admin, holder, outsider, burner;
  let token;
  let programId;
  const cap = ethers.parseUnits('1000',18);
  beforeEach(async function(){
    [admin,holder,outsider,burner]=await ethers.getSigners();
    programId=ethers.id('RC-PROG-CU-001');
    const Token=await ethers.getContractFactory('ReserveChainAssetToken');
    token=await Token.deploy('ReserveChain Copper Powder — Testnet Only','RC-CU-T',cap,programId,admin.address);
    await token.waitForDeployment();
  });
  it('starts unissued, with explicit program identity and bounded capacity', async function(){
    expect(await token.totalSupply()).to.equal(0n);
    expect(await token.cap()).to.equal(cap);
    expect(await token.programId()).to.equal(programId);
    expect(await token.hasRole(await token.DEFAULT_ADMIN_ROLE(),admin.address)).to.equal(true);
    expect(await token.hasRole(await token.ISSUER_ROLE(),outsider.address)).to.equal(false);
  });
  it('restricts minting to the issuer, rejects zero recipient, enforces cap', async function(){
    await expect(token.connect(outsider).mint(holder.address,1n,ethers.ZeroHash)).to.be.reverted;
    await expect(token.mint(ethers.ZeroAddress,1n,ethers.ZeroHash)).to.be.reverted;
    await token.mint(holder.address,cap,ethers.id('TESTNET-SOURCE-1'));
    expect(await token.totalSupply()).to.equal(cap);
    await expect(token.mint(holder.address,1n,ethers.ZeroHash)).to.be.reverted;
  });
  it('only an authorized pauser can freeze and unfreeze transfers and issuance', async function(){
    await token.mint(holder.address,100n,ethers.ZeroHash);
    await expect(token.connect(outsider).pause()).to.be.reverted;
    await token.pause();
    await expect(token.connect(holder).transfer(outsider.address,10n)).to.be.reverted;
    await expect(token.mint(holder.address,1n,ethers.ZeroHash)).to.be.reverted;
    await expect(token.connect(outsider).unpause()).to.be.reverted;
    await token.unpause();
    await token.connect(holder).transfer(outsider.address,10n);
    expect(await token.balanceOf(outsider.address)).to.equal(10n);
  });
  it('requires BOTH burner role and holder allowance before redemption burn', async function(){
    await token.mint(holder.address,100n,ethers.ZeroHash);
    await expect(token.connect(outsider).redemptionBurnFrom(holder.address,1n,ethers.ZeroHash)).to.be.reverted;
    await token.grantRole(await token.REDEMPTION_BURNER_ROLE(),burner.address);
    await expect(token.connect(burner).redemptionBurnFrom(holder.address,1n,ethers.ZeroHash)).to.be.reverted;
    await token.connect(holder).approve(burner.address,30n);
    await token.connect(burner).redemptionBurnFrom(holder.address,30n,ethers.id('DEMO-REDEMPTION'));
    expect(await token.balanceOf(holder.address)).to.equal(70n);
    expect(await token.totalSupply()).to.equal(70n);
    expect(await token.allowance(holder.address,burner.address)).to.equal(0n);
  });
  it('does not permit minting while paused even with issuer role',async function(){
    await token.pause();
    await expect(token.mint(holder.address,1n,ethers.ZeroHash)).to.be.reverted;
  });
  it('rejects a null admin or program ID',async function(){
    const F=await ethers.getContractFactory('ReserveChainAssetToken');
    await expect(F.deploy('T','T',cap,ethers.ZeroHash,admin.address)).to.be.revertedWith('program id required');
    await expect(F.deploy('T','T',cap,programId,ethers.ZeroAddress)).to.be.revertedWith('issuer admin required');
  });
  it('grants future roles only through admin-controlled AccessControl',async function(){
    await expect(token.connect(outsider).grantRole(await token.ISSUER_ROLE(),outsider.address)).to.be.reverted;
    await token.grantRole(await token.ISSUER_ROLE(),outsider.address);
    await token.connect(outsider).mint(outsider.address,1n,ethers.ZeroHash);
    await token.revokeRole(await token.ISSUER_ROLE(),outsider.address);
    await expect(token.connect(outsider).mint(outsider.address,1n,ethers.ZeroHash)).to.be.reverted;
  });
});

describe('ReserveChainTokenFactory — two-program control',function(){
  it('supports authorized one-time Copper and Nickel creation, and rejects duplicate/unauthorized creation',async function(){
    const [admin,outsider]=await ethers.getSigners();
    const F=await ethers.getContractFactory('ReserveChainTokenFactory');
    const factory=await F.deploy(admin.address);
    await factory.waitForDeployment();
    const copper=ethers.id('RC-PROG-CU-001');
    const nickel=ethers.id('RC-PROG-NI-001');
    const cap=ethers.parseUnits('1000',18);
    await expect(factory.connect(outsider).createProgramToken(copper,'Copper','CU',cap,admin.address)).to.be.reverted;
    await factory.createProgramToken(copper,'Copper','CU',cap,admin.address);
    await factory.createProgramToken(nickel,'Nickel','NI',cap,admin.address);
    const c=await factory.tokenByProgram(copper);
    const n=await factory.tokenByProgram(nickel);
    expect(c).not.to.equal(ethers.ZeroAddress);
    expect(n).not.to.equal(ethers.ZeroAddress);
    expect(c).not.to.equal(n);
    await expect(factory.createProgramToken(copper,'Another','A',cap,admin.address)).to.be.revertedWith('program already configured');
    const copperToken=await ethers.getContractAt('ReserveChainAssetToken',c);
    expect(await copperToken.totalSupply()).to.equal(0n);
  });
  it('rejects a null factory administrator',async function(){
    const F=await ethers.getContractFactory('ReserveChainTokenFactory');
    await expect(F.deploy(ethers.ZeroAddress)).to.be.revertedWith('issuer admin required');
  });
});
