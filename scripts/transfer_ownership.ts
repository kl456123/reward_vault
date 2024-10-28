import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  const proxyAdminAddr = "0x246674577511aD7de5b229cbb6F5237FdD0e5a8d";
  const rewardVaultAddr = "0x487b9e8031055d291d51c5c83a4d0f030d47199f";
  const newOwnerAddr = "0x3B1Ea58f0126e4D5731E1D37F425D7f892867507";
  const newAdminAddr = "0x44259777e66b1Ac57F19acfaAc1379B019c9bE99";
  const proxyAdmin = await ethers.getContractAt("ProxyAdmin", proxyAdminAddr);
  const rewardVault = await ethers.getContractAt(
    "RewardVault",
    rewardVaultAddr
  );
  if ((await rewardVault.owner()) !== newOwnerAddr) {
    await (await rewardVault.transferOwnership(newOwnerAddr)).wait();
    console.log(
      `success to transfer the ownership of reward vault to ${newOwnerAddr} !`
    );
  } else {
    console.log("The ownership of reward vault is transfered already!");
  }
  if ((await proxyAdmin.owner()) !== newAdminAddr) {
    await (await proxyAdmin.transferOwnership(newAdminAddr)).wait();
    console.log(
      `success to transfer the ownership of proxyAdmin to ${newAdminAddr} !`
    );
  } else {
    console.log("The ownership of prxoyAdmin is transfered already!");
  }
}

main();
