import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { generateSignature } from "../src/utils";
import { ActionType } from "../src/types";
import DeployAndGrantRole from "../ignition/modules/RewardVault";
import { RewardVault } from "../typechain-types";
import { expect } from "chai";
import { ethers } from "hardhat";
import hre from "hardhat";

describe("RewardVault", function () {
  async function fixture() {
    const [owner, signer, projectOwner, user] = await hre.ethers.getSigners();
    const { rewardVault } = await hre.ignition.deploy(DeployAndGrantRole, {
      parameters: {
        GrantRole: {
          signer: signer.address,
        },
      },
    });
    const mockToken = await (
      await hre.ethers.getContractFactory("MockToken")
    ).deploy(ethers.parseUnits("1000000", 18));
    await mockToken.waitForDeployment();
    const { chainId } = await ethers.provider.getNetwork();

    // fund project owner
    await mockToken.transfer(projectOwner, ethers.parseUnits("1000", 18));

    return {
      rewardVault,
      owner,
      signer,
      mockToken,
      chainId,
      user,
      projectOwner,
    };
  }

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
    // check signer permission
    const SIGNER_ROLE = await rewardVault.SIGNER();
    expect(await rewardVault.hasRole(SIGNER_ROLE, signer.address)).to.be.true;

    await mockToken
      .connect(projectOwner)
      .approve(rewardVault, ethers.MaxUint256);

    {
      // project owner deposit to reward vault
      const depositData = {
        depositId: 0n,
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
      const projectBalanceBefore = await rewardVault.getTokenBalanceByProjectId(
        depositData.projectId,
        mockToken
      );
      await rewardVault
        .connect(projectOwner)
        .deposit({ ...depositData, signature: depositSignature });
      await expect(
        rewardVault
          .connect(projectOwner)
          .deposit({ ...depositData, signature: depositSignature })
      ).to.revertedWith("SIGNATURE_USED_ALREADY");

      const balanceAfter = await mockToken.balanceOf(projectOwner);
      const vaultBalanceAfter = await mockToken.balanceOf(rewardVault);
      const projectBalanceAfter = await rewardVault.getTokenBalanceByProjectId(
        depositData.projectId,
        mockToken
      );
      expect(balanceBefore - balanceAfter).to.eq(depositData.amount);
      expect(vaultBalanceAfter - vaultBalanceBefore).to.eq(depositData.amount);
      expect(projectBalanceAfter - projectBalanceBefore).to.eq(
        depositData.amount
      );
    }

    // claim by user
    {
      const claimData = {
        claimId: 0n,
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
      const projectBalanceBefore = await rewardVault.getTokenBalanceByProjectId(
        claimData.projectId,
        mockToken
      );
      await rewardVault
        .connect(user)
        .claim({ ...claimData, signature: claimSignature });
      await expect(
        rewardVault
          .connect(user)
          .claim({ ...claimData, signature: claimSignature })
      ).to.revertedWith("SIGNATURE_USED_ALREADY");

      // balance after
      const userBalanceAfter = await mockToken.balanceOf(user);
      const vaultBalanceAfter = await mockToken.balanceOf(rewardVault);
      const projectBalanceAfter = await rewardVault.getTokenBalanceByProjectId(
        claimData.projectId,
        mockToken
      );
      expect(userBalanceAfter - userBalanceBefore).to.eq(claimData.amount);

      expect(vaultBalanceBefore - vaultBalanceAfter).to.eq(claimData.amount);
      expect(projectBalanceBefore - projectBalanceAfter).to.eq(
        claimData.amount
      );
    }

    // withdraw remaining tokens by project owner
    {
      const withdrawalData = {
        withdrawId: 0n,
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
      const projectBalanceBefore = await rewardVault.getTokenBalanceByProjectId(
        withdrawalData.projectId,
        mockToken
      );
      await rewardVault
        .connect(projectOwner)
        .withdraw({ ...withdrawalData, signature: withdrawalSignature });

      await expect(
        rewardVault
          .connect(projectOwner)
          .withdraw({ ...withdrawalData, signature: withdrawalSignature })
      ).to.revertedWith("SIGNATURE_USED_ALREADY");

      // balance after
      const userBalanceAfter = await mockToken.balanceOf(projectOwner);
      const vaultBalanceAfter = await mockToken.balanceOf(rewardVault);
      const projectBalanceAfter = await rewardVault.getTokenBalanceByProjectId(
        withdrawalData.projectId,
        mockToken
      );
      expect(userBalanceAfter - userBalanceBefore).to.eq(withdrawalData.amount);

      expect(vaultBalanceBefore - vaultBalanceAfter).to.eq(
        withdrawalData.amount
      );
      expect(projectBalanceBefore - projectBalanceAfter).to.eq(
        withdrawalData.amount
      );
    }
  });

  it.only("native token test", async () => {
    const { rewardVault, signer, owner, chainId, user, projectOwner } =
      await loadFixture(fixture);

    const nativeTokenAddr = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";

    {
      // project owner deposit to reward vault
      const depositData = {
        depositId: 0n,
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
      const projectBalanceBefore = await rewardVault.getTokenBalanceByProjectId(
        depositData.projectId,
        nativeTokenAddr
      );
      const tx = await rewardVault
        .connect(projectOwner)
        .deposit(
          { ...depositData, signature: depositSignature },
          { value: depositData.amount }
        );
      const txRecipient = await tx.wait();

      const balanceAfter = await ethers.provider.getBalance(projectOwner);
      const vaultBalanceAfter = await ethers.provider.getBalance(rewardVault);
      const projectBalanceAfter = await rewardVault.getTokenBalanceByProjectId(
        depositData.projectId,
        nativeTokenAddr
      );
      expect(balanceBefore - balanceAfter).to.eq(
        depositData.amount + txRecipient.gasUsed * BigInt(txRecipient.gasPrice)
      );
      expect(vaultBalanceAfter - vaultBalanceBefore).to.eq(depositData.amount);
      expect(projectBalanceAfter - projectBalanceBefore).to.eq(
        depositData.amount
      );

      await expect(
        rewardVault
          .connect(projectOwner)
          .deposit(
            { ...depositData, signature: depositSignature },
            { value: depositData.amount }
          )
      ).to.revertedWith("SIGNATURE_USED_ALREADY");
    }

    // claim by user
    {
      const claimData = {
        claimId: 0n,
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
      const projectBalanceBefore = await rewardVault.getTokenBalanceByProjectId(
        claimData.projectId,
        nativeTokenAddr
      );
      const tx = await rewardVault
        .connect(user)
        .claim({ ...claimData, signature: claimSignature });
      const txRecipient = await tx.wait();

      // balance after
      const userBalanceAfter = await ethers.provider.getBalance(user);
      const vaultBalanceAfter = await ethers.provider.getBalance(rewardVault);
      const projectBalanceAfter = await rewardVault.getTokenBalanceByProjectId(
        claimData.projectId,
        nativeTokenAddr
      );
      expect(userBalanceAfter - userBalanceBefore).to.eq(
        claimData.amount - txRecipient.gasUsed * BigInt(txRecipient.gasPrice)
      );

      expect(vaultBalanceBefore - vaultBalanceAfter).to.eq(claimData.amount);
      expect(projectBalanceBefore - projectBalanceAfter).to.eq(
        claimData.amount
      );

      await expect(
        rewardVault
          .connect(user)
          .claim({ ...claimData, signature: claimSignature })
      ).to.revertedWith("SIGNATURE_USED_ALREADY");
    }

    // withdraw remaining tokens by project owner
    {
      const withdrawalData = {
        withdrawId: 0n,
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
      const projectBalanceBefore = await rewardVault.getTokenBalanceByProjectId(
        withdrawalData.projectId,
        nativeTokenAddr
      );
      const tx = await rewardVault
        .connect(projectOwner)
        .withdraw({ ...withdrawalData, signature: withdrawalSignature });
      const txRecipient = await tx.wait();

      // balance after
      const userBalanceAfter = await ethers.provider.getBalance(projectOwner);
      const vaultBalanceAfter = await ethers.provider.getBalance(rewardVault);
      const projectBalanceAfter = await rewardVault.getTokenBalanceByProjectId(
        withdrawalData.projectId,
        nativeTokenAddr
      );
      expect(userBalanceAfter - userBalanceBefore).to.eq(
        withdrawalData.amount -
          txRecipient.gasUsed * BigInt(txRecipient.gasPrice)
      );

      expect(vaultBalanceBefore - vaultBalanceAfter).to.eq(
        withdrawalData.amount
      );
      expect(projectBalanceBefore - projectBalanceAfter).to.eq(
        withdrawalData.amount
      );

      await expect(
        rewardVault
          .connect(projectOwner)
          .withdraw({ ...withdrawalData, signature: withdrawalSignature })
      ).to.revertedWith("SIGNATURE_USED_ALREADY");
    }
  });
});
