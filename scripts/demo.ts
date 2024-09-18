import hre from "hardhat";
import { Contract } from "ethers";
import { type SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import RewardVaultModule from "../ignition/modules/grant_role";
import MockTokenModule from "../ignition/modules/mock_token";
import { generateSignature } from "../src/utils";
import { ActionType } from "../src/types";
import { NATIVE_TOKEN_ADDR } from "../src/constants";
import parameters from "../ignition/parameters.json";

async function deposit(
  mockToken: Contract,
  deployer: SignerWithAddress,
  chainId: bigint,
  rewardVault: Contract
) {
  const depositData = {
    depositId: 0n,
    projectId: 0n,
    token: NATIVE_TOKEN_ADDR,
    amount: hre.ethers.parseUnits("0.001", 18),
    expireTime: BigInt(Math.ceil(Date.now() / 1000) + 1000),
  };

  const depositSignature = await generateSignature(
    ActionType.Deposit,
    depositData,
    deployer,
    await rewardVault.getAddress(),
    chainId
  );
  await (
    await rewardVault.deposit(
      { ...depositData, signature: depositSignature },
      { value: depositData.amount }
    )
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
    token: NATIVE_TOKEN_ADDR,
    amount: hre.ethers.parseUnits("0.0005", 18),
    recipient: deployer.address,
    expireTime: BigInt(Math.ceil(Date.now() / 1000) + 1000),
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
    token: NATIVE_TOKEN_ADDR,
    amount: hre.ethers.parseUnits("0.0005", 18),
    recipient: deployer.address,
    expireTime: BigInt(Math.ceil(Date.now() / 1000) + 100),
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
  const deploymentId = "chain-97-v2";
  const { rewardVault } = await hre.ignition.deploy(RewardVaultModule, {
    deploymentId,
    parameters,
  });
  const { mockToken } = await hre.ignition.deploy(MockTokenModule, {
    deploymentId,
  });
  const [deployer] = await hre.ethers.getSigners();
  const { chainId } = await hre.ethers.provider.getNetwork();

  const SIGNER_ROLE = await rewardVault.SIGNER();
  if (!(await rewardVault.hasRole(SIGNER_ROLE, deployer.address))) {
    await (await rewardVault.grantRole(SIGNER_ROLE, deployer.address)).wait();
  }
  await deposit(mockToken, deployer, chainId, rewardVault);
  await claim(mockToken, deployer, chainId, rewardVault);
  await withdraw(mockToken, deployer, chainId, rewardVault);
}

main();
