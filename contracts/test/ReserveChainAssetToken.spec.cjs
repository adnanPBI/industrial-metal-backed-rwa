const { expect } = require('chai');
const { ethers } = require('hardhat');
describe('ReserveChainAssetToken', function () {
  it('enforces cap, roles, pause and explicit redemption allowance', async function () {
    const [admin, holder, outsider] = await ethers.getSigners();
    const F = await ethers.getContractFactory('ReserveChainAssetToken');
    const programId = ethers.keccak256(ethers.toUtf8Bytes('RC-PROG-CU-001'));
    const token = await F.deploy('ReserveChain Copper Test','RCCT',ethers.parseEther('1000'),programId,admin.address);
    await token.mint(holder.address, ethers.parseEther('100'), ethers.ZeroHash);
    expect(await token.balanceOf(holder.address)).to.equal(ethers.parseEther('100'));
    await expect(token.connect(outsider).mint(outsider.address,1n,ethers.ZeroHash)).to.be.reverted;
    await token.pause();
    await expect(token.connect(holder).transfer(outsider.address,1n)).to.be.reverted;
    await token.unpause();
    await token.connect(holder).approve(admin.address, ethers.parseEther('10'));
    await token.redemptionBurnFrom(holder.address, ethers.parseEther('10'), ethers.keccak256(ethers.toUtf8Bytes('RC-RED-DEMO-1')));
    expect(await token.balanceOf(holder.address)).to.equal(ethers.parseEther('90'));
  });
});
