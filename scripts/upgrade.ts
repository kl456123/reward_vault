import { ethers, run } from "hardhat";
import { setTimeout } from "timers/promises";

async function main() {
  const [deployer] = await ethers.getSigners();

  const rewardVault = await (
    await ethers.getContractFactory("RewardVault")
  ).deploy();
  await rewardVault.waitForDeployment();

  await setTimeout(10000);
  await run("verify:verify", {
    address: await rewardVault.getAddress(),
  });

  const proxyAdminAddr = "0x246674577511aD7de5b229cbb6F5237FdD0e5a8d";
  const proxyAddr = "0x487b9e8031055d291d51c5c83a4d0f030d47199f";
  const proxyAdmin = await ethers.getContractAt("ProxyAdmin", proxyAdminAddr);
  await (await proxyAdmin.upgradeAndCall(proxyAddr, rewardVault, "0x")).wait();
}

main();
