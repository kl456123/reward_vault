import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  const proxyAdminAddr = "0x246674577511aD7de5b229cbb6F5237FdD0e5a8d";
  const rewardVaultAddr = "0x487B9E8031055d291d51C5C83a4d0F030D47199f";

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

  // check signer role
  const SIGNER = await rewardVault.SIGNER();
  if(await rewardVault.hasRole(SIGNER, deployer)) {
    await (await rewardVault.renounceRole(SIGNER, deployer)).wait();
    console.log(`success to revoke signer role from ${deployer.address}`)
  } else {
    console.log(`The signer role is revoked from ${deployer.address} already`)
  }

  const GUARDIAN = await rewardVault.GUARDIAN();
  if(await rewardVault.hasRole(GUARDIAN, deployer)) {
    await (await rewardVault.renounceRole(GUARDIAN, deployer)).wait();
    console.log(`success to revoke guardian role from ${deployer.address}`)
  } else {
    console.log(`The guardian role is revoked from ${deployer.address} already`)
  }

  // check admin role
  const ADMIN_ROLE = await rewardVault.DEFAULT_ADMIN_ROLE();
  if (!await rewardVault.hasRole(ADMIN_ROLE, newOwnerAddr)) {
    await (await rewardVault.grantRole(ADMIN_ROLE, newOwnerAddr)).wait();
    console.log(`success to grant admin role to ${newOwnerAddr}`)
  } else {
    console.log(`The admin role is granted to ${newOwnerAddr} already`)
  }

  if (await rewardVault.hasRole(ADMIN_ROLE, deployer)) {
    await (await rewardVault.renounceRole(ADMIN_ROLE, deployer)).wait();
    console.log(`success to revoke admin role from ${deployer.address}`)
  } else {
    console.log(`The admin role is revoked from ${deployer.address} already`)
  }
}

main();
