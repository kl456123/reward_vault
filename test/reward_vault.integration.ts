import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { generateSignature } from "../src/utils";
import { ActionType } from "../src/types";
import { expect } from "chai";
import { ethers } from "hardhat";
import { fixture } from "./helper/fixture";
import { NATIVE_TOKEN_ADDR } from "../src/constants";
import { getTxCostInETH } from "../src/utils";

describe("reward vault integration test", function () {
  it("erc20 token test", async () => {
    const {
      rewardVault,
      signer,
      mockToken,
      owner,
      chainId,
      user,
      projectOwner,
    } = await loadFixture(fixture);

    {
      // project owner deposit to reward vault
      const depositData = {
        depositId: ethers.toBigInt(ethers.randomBytes(32)),
        projectId: 0n,
        token: await mockToken.getAddress(),
        amount: ethers.parseUnits("100", 18),
        expireTime: BigInt(Math.ceil(Date.now() / 1000) + 10),
      };

      const depositSignature = await generateSignature(
        ActionType.Deposit,
        depositData,
        signer,
        await rewardVault.getAddress(),
        chainId
      );

      const balanceBefore = await mockToken.balanceOf(projectOwner);
      const vaultBalanceBefore = await mockToken.balanceOf(rewardVault);
      await rewardVault
        .connect(projectOwner)
        .deposit({ ...depositData, signature: depositSignature });

      const balanceAfter = await mockToken.balanceOf(projectOwner);
      const vaultBalanceAfter = await mockToken.balanceOf(rewardVault);
      expect(balanceBefore - balanceAfter).to.eq(depositData.amount);
      expect(vaultBalanceAfter - vaultBalanceBefore).to.eq(depositData.amount);
    }

    // claim by user
    {
      const claimData = {
        claimId: ethers.toBigInt(ethers.randomBytes(32)),
        projectId: 0n,
        token: await mockToken.getAddress(),
        amount: ethers.parseUnits("20", 18),
        recipient: user.address,
        expireTime: BigInt(Math.ceil(Date.now() / 1000) + 10),
      };

      const claimSignature = await generateSignature(
        ActionType.Claim,
        claimData,
        signer,
        await rewardVault.getAddress(),
        chainId
      );
      // balance before
      const userBalanceBefore = await mockToken.balanceOf(user);
      const vaultBalanceBefore = await mockToken.balanceOf(rewardVault);
      await rewardVault
        .connect(user)
        .claim({ ...claimData, signature: claimSignature });
      // await expect(
      // rewardVault
      // .connect(user)
      // .claim({ ...claimData, signature: claimSignature })
      // ).to.revertedWith("SIGNATURE_USED_ALREADY");

      // balance after
      const userBalanceAfter = await mockToken.balanceOf(user);
      const vaultBalanceAfter = await mockToken.balanceOf(rewardVault);
      expect(userBalanceAfter - userBalanceBefore).to.eq(claimData.amount);

      expect(vaultBalanceBefore - vaultBalanceAfter).to.eq(claimData.amount);
    }

    // withdraw remaining tokens by project owner
    {
      const withdrawalData = {
        withdrawId: ethers.toBigInt(ethers.randomBytes(32)),
        projectId: 0n,
        token: await mockToken.getAddress(),
        amount: ethers.parseUnits("40", 18),
        recipient: projectOwner.address,
        expireTime: BigInt(Math.ceil(Date.now() / 1000) + 10),
      };

      const withdrawalSignature = await generateSignature(
        ActionType.Withdraw,
        withdrawalData,
        signer,
        await rewardVault.getAddress(),
        chainId
      );
      // balance before
      const userBalanceBefore = await mockToken.balanceOf(projectOwner);
      const vaultBalanceBefore = await mockToken.balanceOf(rewardVault);
      await rewardVault
        .connect(projectOwner)
        .withdraw({ ...withdrawalData, signature: withdrawalSignature });

      // await expect(
      // rewardVault
      // .connect(projectOwner)
      // .withdraw({ ...withdrawalData, signature: withdrawalSignature })
      // ).to.revertedWith("SIGNATURE_USED_ALREADY");

      // balance after
      const userBalanceAfter = await mockToken.balanceOf(projectOwner);
      const vaultBalanceAfter = await mockToken.balanceOf(rewardVault);
      expect(userBalanceAfter - userBalanceBefore).to.eq(withdrawalData.amount);

      expect(vaultBalanceBefore - vaultBalanceAfter).to.eq(
        withdrawalData.amount
      );
    }
  });

  it("native token test", async () => {
    const { rewardVault, signer, owner, chainId, user, projectOwner } =
      await loadFixture(fixture);

    const nativeTokenAddr = NATIVE_TOKEN_ADDR;

    {
      // project owner deposit to reward vault
      const depositData = {
        depositId: ethers.toBigInt(ethers.randomBytes(32)),
        projectId: 0n,
        token: nativeTokenAddr,
        amount: ethers.parseUnits("100", 18),
        expireTime: BigInt(Math.ceil(Date.now() / 1000) + 10),
      };

      const depositSignature = await generateSignature(
        ActionType.Deposit,
        depositData,
        signer,
        await rewardVault.getAddress(),
        chainId
      );

      const balanceBefore = await ethers.provider.getBalance(projectOwner);
      const vaultBalanceBefore = await ethers.provider.getBalance(rewardVault);
      const tx = await rewardVault
        .connect(projectOwner)
        .deposit(
          { ...depositData, signature: depositSignature },
          { value: depositData.amount }
        );
      const txRecipt = (await tx.wait())!;
      const gasCostInETH = getTxCostInETH(txRecipt);

      const balanceAfter = await ethers.provider.getBalance(projectOwner);
      const vaultBalanceAfter = await ethers.provider.getBalance(rewardVault);
      expect(balanceBefore - balanceAfter).to.eq(
        depositData.amount + gasCostInETH
      );
      expect(vaultBalanceAfter - vaultBalanceBefore).to.eq(depositData.amount);
    }

    // claim by user
    {
      const claimData = {
        claimId: ethers.toBigInt(ethers.randomBytes(32)),
        projectId: 0n,
        token: nativeTokenAddr,
        amount: ethers.parseUnits("20", 18),
        recipient: user.address,
        expireTime: BigInt(Math.ceil(Date.now() / 1000) + 10),
      };

      const claimSignature = await generateSignature(
        ActionType.Claim,
        claimData,
        signer,
        await rewardVault.getAddress(),
        chainId
      );
      // balance before
      const userBalanceBefore = await ethers.provider.getBalance(user);
      const vaultBalanceBefore = await ethers.provider.getBalance(rewardVault);
      const tx = await rewardVault
        .connect(user)
        .claim({ ...claimData, signature: claimSignature });
      const txRecipt = (await tx.wait())!;

      // balance after
      const userBalanceAfter = await ethers.provider.getBalance(user);
      const vaultBalanceAfter = await ethers.provider.getBalance(rewardVault);
      expect(userBalanceAfter - userBalanceBefore).to.eq(
        claimData.amount - getTxCostInETH(txRecipt)
      );

      expect(vaultBalanceBefore - vaultBalanceAfter).to.eq(claimData.amount);
    }

    // withdraw remaining tokens by project owner
    {
      const withdrawalData = {
        withdrawId: ethers.toBigInt(ethers.randomBytes(32)),
        projectId: 0n,
        token: nativeTokenAddr,
        amount: ethers.parseUnits("40", 18),
        recipient: projectOwner.address,
        expireTime: BigInt(Math.ceil(Date.now() / 1000) + 10),
      };

      const withdrawalSignature = await generateSignature(
        ActionType.Withdraw,
        withdrawalData,
        signer,
        await rewardVault.getAddress(),
        chainId
      );
      // balance before
      const userBalanceBefore = await ethers.provider.getBalance(projectOwner);
      const vaultBalanceBefore = await ethers.provider.getBalance(rewardVault);
      const tx = await rewardVault
        .connect(projectOwner)
        .withdraw({ ...withdrawalData, signature: withdrawalSignature });
      const txRecipt = (await tx.wait())!;

      // balance after
      const userBalanceAfter = await ethers.provider.getBalance(projectOwner);
      const vaultBalanceAfter = await ethers.provider.getBalance(rewardVault);
      expect(userBalanceAfter - userBalanceBefore).to.eq(
        withdrawalData.amount - getTxCostInETH(txRecipt)
      );

      expect(vaultBalanceBefore - vaultBalanceAfter).to.eq(
        withdrawalData.amount
      );
    }
  });
});
