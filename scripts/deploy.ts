import hre from "hardhat";
import { Contract } from "ethers";
import { type SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import RewardVaultModule from "../ignition/modules/RewardVault";
import MockTokenModule from "../ignition/modules/MockToken";
import { generateSignature } from "../src/utils";
import { ActionType } from "../src/types";
import { NATIVE_TOKEN_ADDR } from "../src/constants";
import parameters from "../ignition/parameters.json";

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const { chainId } = await hre.ethers.provider.getNetwork();

  const rewardVault = await (
    await hre.ethers.getContractFactory("RewardVault")
  ).deploy();
  await rewardVault.waitForDeployment();

  const initData = rewardVault.interface.encodeFunctionData("initialize", [
    deployer.address,
  ]);

  const proxy = await (
    await hre.ethers.getContractFactory("TransparentUpgradeableProxy")
  ).deploy(rewardVault, deployer, initData);
  await proxy.waitForDeployment();

  // verify
  await hre.run("verify:verify", {
    address: await rewardVault.getAddress(),
  });

  // TODO(get proxy admin contract address)
  // await hre.run("verify:verify", {
  // address: proxyAdmin,
  // constructorArguments: [deployer.address],
  // });

  await hre.run("verify:verify", {
    address: await proxy.getAddress(),
    constructorArguments: [
      await rewardVault.getAddress(),
      deployer.address,
      initData,
    ],
  });
}
