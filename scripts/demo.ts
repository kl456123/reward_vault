import hre from "hardhat";
import { Contract } from "ethers";
import { type SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import RewardVaultModule from "../ignition/modules/RewardVault";
import MockTokenModule from "../ignition/modules/MockToken";
import { generateSignature } from "../src/utils";
import { ActionType } from "../src/types";

async function deposit(
  mockToken: Contract,
  deployer: SignerWithAddress,
  chainId: bigint,
  rewardVault: Contract
) {
  const depositData = {
    depositId: 0n,
    projectId: 0n,
    token: await mockToken.getAddress(),
    amount: hre.ethers.parseUnits("100", 18),
    expireTime: BigInt(Math.ceil(Date.now() / 1000) + 10),
  };

  const depositSignature = await generateSignature(
    ActionType.Deposit,
    depositData,
    deployer,
    await rewardVault.getAddress(),
    chainId
  );
  await (
    await rewardVault.deposit({ ...depositData, signature: depositSignature })
  ).wait();
}

async function claim(
  mockToken: Contract,
  deployer: SignerWithAddress,
  chainId: bigint,
  rewardVault: Contract
) {
  const claimData = {
    claimId: 0n,
    projectId: 0n,
    token: await mockToken.getAddress(),
    amount: hre.ethers.parseUnits("20", 18),
    recipient: deployer.address,
    expireTime: BigInt(Math.ceil(Date.now() / 1000) + 10),
  };

  const claimSignature = await generateSignature(
    ActionType.Claim,
    claimData,
    deployer,
    await rewardVault.getAddress(),
    chainId
  );

  await (
    await rewardVault.claim({ ...claimData, signature: claimSignature })
  ).wait();
}

async function withdraw(
  mockToken: Contract,
  deployer: SignerWithAddress,
  chainId: bigint,
  rewardVault: Contract
) {
  const withdrawalData = {
    withdrawId: 0n,
    projectId: 0n,
    token: await mockToken.getAddress(),
    amount: hre.ethers.parseUnits("40", 18),
    recipient: deployer.address,
    expireTime: BigInt(Math.ceil(Date.now() / 1000) + 10),
  };

  const withdrawalSignature = await generateSignature(
    ActionType.Withdraw,
    withdrawalData,
    deployer,
    await rewardVault.getAddress(),
    chainId
  );

  await (
    await rewardVault.withdraw({
      ...withdrawalData,
      signature: withdrawalSignature,
    })
  ).wait();
}

async function main() {
  const { rewardVault } = await hre.ignition.deploy(RewardVaultModule);
  const { mockToken } = await hre.ignition.deploy(MockTokenModule);
  const [deployer] = await hre.ethers.getSigners();
  const { chainId } = await hre.ethers.provider.getNetwork();

  await deposit(mockToken, deployer, chainId, rewardVault);
  await claim(mockToken, deployer, chainId, rewardVault);
  await withdraw(mockToken, deployer, chainId, rewardVault);
}

main();
