import { ethers, Signer } from "ethers";
import { generateSignature } from "../../src/utils";
import { ActionType } from "../../src/types";

export async function generateMockData(
  tokenAddr: string,
  rewardVaultAddr: string,
  chainId: bigint,
  signer: Signer
) {
  const depositData = {
    depositId: ethers.toBigInt(ethers.randomBytes(32)),
    projectId: 0n,
    token: tokenAddr,
    amount: ethers.parseUnits("100", 18),
    expireTime: BigInt(Math.ceil(Date.now() / 1000) + 10000),
  };
  const depositSignature = await generateSignature(
    ActionType.Deposit,
    depositData,
    signer,
    rewardVaultAddr,
    chainId
  );

  return { depositData, depositSignature };
}

export async function generateWithdrawalMockData(
  recipient: string,
  tokenAddr: string,
  rewardVaultAddr: string,
  chainId: bigint,
  signer: Signer
) {
  const withdrawalData = {
    withdrawId: ethers.toBigInt(ethers.randomBytes(32)),
    projectId: 0n,
    token: tokenAddr,
    amount: ethers.parseUnits("40", 18),
    recipient,
    expireTime: BigInt(Math.ceil(Date.now() / 1000) + 10000),
  };

  const withdrawalSignature = await generateSignature(
    ActionType.Withdraw,
    withdrawalData,
    signer,
    rewardVaultAddr,
    chainId
  );

  return { withdrawalData, withdrawalSignature };
}

export async function generateWithdrawalV2MockData(
  recipient: string,
  tokenAddr: string,
  rewardVaultAddr: string,
  chainId: bigint,
  signer: Signer
) {
  const withdrawalData = {
    withdrawId: ethers.toBigInt(ethers.randomBytes(32)),
    accountId: 0n,
    actionType: ActionType.WithdrawV2,
    token: tokenAddr,
    amount: ethers.parseUnits("40", 18),
    recipient,
    expireTime: BigInt(Math.ceil(Date.now() / 1000) + 10000),
  };

  const withdrawalSignature = await generateSignature(
    ActionType.WithdrawV2,
    withdrawalData,
    signer,
    rewardVaultAddr,
    chainId
  );

  return { withdrawalData, withdrawalSignature };
}

export async function generateClaimMockData(
  recipient: string,
  tokenAddr: string,
  rewardVaultAddr: string,
  chainId: bigint,
  signer: Signer
) {
  const claimData = {
    claimId: ethers.toBigInt(ethers.randomBytes(32)),
    projectId: 0n,
    token: tokenAddr,
    amount: ethers.parseUnits("20", 18),
    recipient,
    expireTime: BigInt(Math.ceil(Date.now() / 1000) + 1000),
  };

  const claimSignature = await generateSignature(
    ActionType.Claim,
    claimData,
    signer,
    rewardVaultAddr,
    chainId
  );

  return { claimData, claimSignature };
}
