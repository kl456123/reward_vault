import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { generateSignature } from "../src/utils";
import { ActionType } from "../src/types";
import DeployAndGrantRole from "../ignition/modules/reward_vault";
import MockTokenModule from "../ignition/modules/mock_token";
import { expect } from "chai";
import { ethers } from "hardhat";
import hre from "hardhat";
import { fixture, fixtureAfterDeposit } from "./helper/fixture";
import {
  generateMockData,
  generateWithdrawalMockData,
  generateClaimMockData,
} from "./helper/mock_data";
import { NATIVE_TOKEN_ADDR } from "../src/constants";
import { getTxCostInETH } from "../src/utils";

describe("reward vault spec test", () => {
  describe("deposit test", () => {
    it("project owner success to deposit erc20 tokens", async () => {
      const { rewardVault, signer, mockToken, chainId, projectOwner } =
        await loadFixture(fixture);
      const { depositData: depositParam, depositSignature } =
        await generateMockData(
          await mockToken.getAddress(),
          await rewardVault.getAddress(),
          chainId,
          signer
        );
      const balanceBefore = await mockToken.balanceOf(projectOwner);
      const vaultBalanceBefore = await mockToken.balanceOf(rewardVault);
      await expect(
        rewardVault
          .connect(projectOwner)
          .deposit({ ...depositParam, signature: depositSignature })
      )
        .to.emit(rewardVault, "TokenDeposited")
        .withArgs(
          depositParam.depositId,
          depositParam.projectId,
          depositParam.token,
          depositParam.amount,
          depositParam.expireTime
        );

      const balanceAfter = await mockToken.balanceOf(projectOwner);
      const vaultBalanceAfter = await mockToken.balanceOf(rewardVault);
      expect(balanceBefore - balanceAfter).to.eq(depositParam.amount);
      expect(vaultBalanceAfter - vaultBalanceBefore).to.eq(depositParam.amount);
    });

    it("project owner success to deposit native tokens", async () => {
      const { rewardVault, signer, chainId, projectOwner } = await loadFixture(
        fixture
      );
      const { depositData: depositParam, depositSignature } =
        await generateMockData(
          NATIVE_TOKEN_ADDR,
          await rewardVault.getAddress(),
          chainId,
          signer
        );

      const balanceBefore = await ethers.provider.getBalance(projectOwner);
      const vaultBalanceBefore = await ethers.provider.getBalance(rewardVault);
      const txPromise = rewardVault
        .connect(projectOwner)
        .deposit(
          { ...depositParam, signature: depositSignature },
          { value: depositParam.amount }
        );
      await expect(txPromise)
        .to.emit(rewardVault, "TokenDeposited")
        .withArgs(
          depositParam.depositId,
          depositParam.projectId,
          depositParam.token,
          depositParam.amount,
          depositParam.expireTime
        );
      const txRecipt = (await (await txPromise).wait())!;
      const gasCostInETH = getTxCostInETH(txRecipt);

      const balanceAfter = await ethers.provider.getBalance(projectOwner);
      const vaultBalanceAfter = await ethers.provider.getBalance(rewardVault);
      expect(balanceBefore - balanceAfter).to.eq(
        depositParam.amount + gasCostInETH
      );
      expect(vaultBalanceAfter - vaultBalanceBefore).to.eq(depositParam.amount);
    });

    it("signature expiry", async () => {
      const { rewardVault, signer, mockToken, chainId, projectOwner } =
        await loadFixture(fixture);
      const { depositData, depositSignature } = await generateMockData(
        await mockToken.getAddress(),
        await rewardVault.getAddress(),
        chainId,
        signer
      );
      // expiry signature
      depositData.expireTime = BigInt(Math.ceil(Date.now() / 1000) - 100);

      await expect(
        rewardVault
          .connect(projectOwner)
          .deposit({ ...depositData, signature: depositSignature })
      ).to.revertedWith("SIGNATURE_EXPIRY");
    });

    it("deposit eth too little", async () => {
      const { rewardVault, signer, chainId, projectOwner } = await loadFixture(
        fixture
      );
      const { depositData, depositSignature } = await generateMockData(
        NATIVE_TOKEN_ADDR,
        await rewardVault.getAddress(),
        chainId,
        signer
      );

      const balanceBefore = await ethers.provider.getBalance(projectOwner);
      const vaultBalanceBefore = await ethers.provider.getBalance(rewardVault);
      await expect(
        rewardVault
          .connect(projectOwner)
          .deposit(
            { ...depositData, signature: depositSignature },
            { value: depositData.amount - 1n }
          )
      ).to.revertedWith("INSUFFIENT_ETH_AMOUNT");
    });

    it("return excess native tokens when deposit", async () => {
      const { rewardVault, signer, chainId, projectOwner } = await loadFixture(
        fixture
      );
      const { depositData, depositSignature } = await generateMockData(
        NATIVE_TOKEN_ADDR,
        await rewardVault.getAddress(),
        chainId,
        signer
      );
      const balanceBefore = await ethers.provider.getBalance(projectOwner);
      const vaultBalanceBefore = await ethers.provider.getBalance(rewardVault);
      const tx = await rewardVault
        .connect(projectOwner)
        .deposit(
          { ...depositData, signature: depositSignature },
          { value: depositData.amount + 1n }
        );
      const txRecipt = (await tx.wait())!;
      const gasCostInETH = getTxCostInETH(txRecipt);
      const balanceAfter = await ethers.provider.getBalance(projectOwner);

      const vaultBalanceAfter = await ethers.provider.getBalance(rewardVault);
      // return 1 wei to project owner
      expect(balanceBefore - balanceAfter).to.eq(
        depositData.amount + gasCostInETH
      );
      expect(vaultBalanceAfter - vaultBalanceBefore).to.eq(depositData.amount);
    });

    it("revert when same signature is used again", async () => {
      const { rewardVault, signer, mockToken, chainId, projectOwner } =
        await loadFixture(fixture);
      const { depositData, depositSignature } = await generateMockData(
        await mockToken.getAddress(),
        await rewardVault.getAddress(),
        chainId,
        signer
      );
      await rewardVault
        .connect(projectOwner)
        .deposit({ ...depositData, signature: depositSignature });

      await expect(
        rewardVault
          .connect(projectOwner)
          .deposit({ ...depositData, signature: depositSignature })
      ).to.revertedWith("SIGNATURE_USED_ALREADY");
    });

    it("revert when invalid signature used", async () => {
      const { rewardVault, mockToken, chainId, projectOwner } =
        await loadFixture(fixture);
      const fakeSigner = hre.ethers.Wallet.createRandom();
      const { depositData, depositSignature } = await generateMockData(
        await mockToken.getAddress(),
        await rewardVault.getAddress(),
        chainId,
        fakeSigner
      );
      await expect(
        rewardVault
          .connect(projectOwner)
          .deposit({ ...depositData, signature: depositSignature })
      ).to.revertedWith("INVALID_SIGNER");
    });
  });

  describe("withdraw test", () => {
    it("project owner success to withdraw native tokens from reward vault", async () => {
      const { projectOwner, mockToken, rewardVault, chainId, signer } =
        await loadFixture(fixtureAfterDeposit);
      const recipient = ethers.Wallet.createRandom().address;
      const { withdrawalData, withdrawalSignature } =
        await generateWithdrawalMockData(
          recipient,
          NATIVE_TOKEN_ADDR,
          await rewardVault.getAddress(),
          chainId,
          signer
        );
      // balance before
      const balanceBefore = await ethers.provider.getBalance(recipient);
      const vaultBalanceBefore = await ethers.provider.getBalance(rewardVault);
      const txPromise = rewardVault
        .connect(projectOwner)
        .withdraw({ ...withdrawalData, signature: withdrawalSignature });
      await expect(txPromise)
        .to.emit(rewardVault, "TokenWithdrawed")
        .withArgs(
          withdrawalData.withdrawId,
          withdrawalData.projectId,
          withdrawalData.token,
          withdrawalData.amount,
          withdrawalData.recipient,
          withdrawalData.expireTime
        );

      // balance after
      const balanceAfter = await ethers.provider.getBalance(recipient);
      const vaultBalanceAfter = await ethers.provider.getBalance(rewardVault);
      expect(balanceAfter - balanceBefore).to.eq(withdrawalData.amount);
      expect(vaultBalanceBefore - vaultBalanceAfter).to.eq(
        withdrawalData.amount
      );
    });
    it("project owner success to withdraw erc20 tokens from reward vault", async () => {
      const { projectOwner, mockToken, rewardVault, chainId, signer } =
        await loadFixture(fixtureAfterDeposit);
      const recipient = ethers.Wallet.createRandom().address;
      const { withdrawalData, withdrawalSignature } =
        await generateWithdrawalMockData(
          recipient,
          await mockToken.getAddress(),
          await rewardVault.getAddress(),
          chainId,
          signer
        );
      // balance before
      const balanceBefore = await mockToken.balanceOf(recipient);
      const vaultBalanceBefore = await mockToken.balanceOf(rewardVault);
      await expect(
        rewardVault
          .connect(projectOwner)
          .withdraw({ ...withdrawalData, signature: withdrawalSignature })
      )
        .to.emit(rewardVault, "TokenWithdrawed")
        .withArgs(
          withdrawalData.withdrawId,
          withdrawalData.projectId,
          withdrawalData.token,
          withdrawalData.amount,
          withdrawalData.recipient,
          withdrawalData.expireTime
        );

      // balance after
      const balanceAfter = await mockToken.balanceOf(recipient);
      const vaultBalanceAfter = await mockToken.balanceOf(rewardVault);
      expect(balanceAfter - balanceBefore).to.eq(withdrawalData.amount);
      expect(vaultBalanceBefore - vaultBalanceAfter).to.eq(
        withdrawalData.amount
      );
    });

    it("revert when no enough tokens in reward vault", async () => {
      const {
        depositedMockTokenAmount,
        depositedETHAmount,
        projectOwner,
        mockToken,
        rewardVault,
        chainId,
        signer,
      } = await loadFixture(fixtureAfterDeposit);
      const recipient = ethers.Wallet.createRandom().address;
      {
        const { withdrawalData, withdrawalSignature } =
          await generateWithdrawalMockData(
            recipient,
            await mockToken.getAddress(),
            await rewardVault.getAddress(),
            chainId,
            signer
          );

        withdrawalData.amount = depositedMockTokenAmount + 1n;
        await expect(
          rewardVault
            .connect(projectOwner)
            .withdraw({ ...withdrawalData, signature: withdrawalSignature })
        ).to.revertedWith("AMOUNT_EXCEED_BALANCE");
      }
      {
        const { withdrawalData, withdrawalSignature } =
          await generateWithdrawalMockData(
            recipient,
            NATIVE_TOKEN_ADDR,
            await rewardVault.getAddress(),
            chainId,
            signer
          );

        withdrawalData.amount = depositedETHAmount + 1n;
        await expect(
          rewardVault
            .connect(projectOwner)
            .withdraw({ ...withdrawalData, signature: withdrawalSignature })
        ).to.revertedWith("AMOUNT_EXCEED_BALANCE");
      }
    });

    it("revert when signature expiry", async () => {
      const { projectOwner, mockToken, rewardVault, chainId, signer } =
        await loadFixture(fixtureAfterDeposit);
      const recipient = ethers.Wallet.createRandom().address;
      {
        const { withdrawalData, withdrawalSignature } =
          await generateWithdrawalMockData(
            recipient,
            await mockToken.getAddress(),
            await rewardVault.getAddress(),
            chainId,
            signer
          );

        withdrawalData.expireTime = BigInt(Math.ceil(Date.now() / 1000) - 100);
        await expect(
          rewardVault
            .connect(projectOwner)
            .withdraw({ ...withdrawalData, signature: withdrawalSignature })
        ).to.revertedWith("SIGNATURE_EXPIRY");
      }
    });

    it("revert when same signature is used again", async () => {
      const { projectOwner, mockToken, rewardVault, chainId, signer } =
        await loadFixture(fixtureAfterDeposit);
      const recipient = ethers.Wallet.createRandom().address;
      const { withdrawalData, withdrawalSignature } =
        await generateWithdrawalMockData(
          recipient,
          await mockToken.getAddress(),
          await rewardVault.getAddress(),
          chainId,
          signer
        );

      await rewardVault
        .connect(projectOwner)
        .withdraw({ ...withdrawalData, signature: withdrawalSignature });
      await expect(
        rewardVault
          .connect(projectOwner)
          .withdraw({ ...withdrawalData, signature: withdrawalSignature })
      ).to.revertedWith("SIGNATURE_USED_ALREADY");
    });
  });

  describe("claim test", () => {
    it("success to claim erc20 tokens by user", async () => {
      const { projectOwner, mockToken, rewardVault, user, chainId, signer } =
        await loadFixture(fixtureAfterDeposit);
      const recipient = ethers.Wallet.createRandom().address;
      const { claimData, claimSignature } = await generateClaimMockData(
        recipient,
        await mockToken.getAddress(),
        await rewardVault.getAddress(),
        chainId,
        signer
      );
      // balance before
      const userBalanceBefore = await mockToken.balanceOf(recipient);
      const vaultBalanceBefore = await mockToken.balanceOf(rewardVault);
      await expect(
        rewardVault
          .connect(user)
          .claim({ ...claimData, signature: claimSignature })
      )
        .to.emit(rewardVault, "RewardsClaimed")
        .withArgs(
          claimData.claimId,
          claimData.projectId,
          claimData.token,
          claimData.amount,
          claimData.recipient,
          claimData.expireTime
        );

      // balance after
      const userBalanceAfter = await mockToken.balanceOf(recipient);
      const vaultBalanceAfter = await mockToken.balanceOf(rewardVault);
      expect(userBalanceAfter - userBalanceBefore).to.eq(claimData.amount);

      expect(vaultBalanceBefore - vaultBalanceAfter).to.eq(claimData.amount);
    });
  });

  describe("admin operations test", () => {
    it("permission managment test", async () => {
      const { rewardVault, owner } = await loadFixture(fixture);
      const newSigner = hre.ethers.Wallet.createRandom();
      // check signer permission
      const SIGNER_ROLE = await rewardVault.SIGNER();
      expect(await rewardVault.hasRole(SIGNER_ROLE, newSigner)).to.be.false;
      // grant role and validate
      await rewardVault.connect(owner).grantRole(SIGNER_ROLE, newSigner);
      expect(await rewardVault.hasRole(SIGNER_ROLE, newSigner)).to.be.true;
      // revoke
      await rewardVault.revokeRole(SIGNER_ROLE, newSigner);
      expect(await rewardVault.hasRole(SIGNER_ROLE, newSigner)).to.be.false;
    });

    it("pause test", async () => {
      const {
        rewardVault,
        signer,
        mockToken,
        chainId,
        projectOwner,
        user,
        guardian,
      } = await loadFixture(fixture);
      const { depositData: depositParam, depositSignature } =
        await generateMockData(
          await mockToken.getAddress(),
          await rewardVault.getAddress(),
          chainId,
          signer
        );
      await expect(rewardVault.connect(user).pause())
        .to.revertedWithCustomError(
          rewardVault,
          "AccessControlUnauthorizedAccount"
        )
        .withArgs(user.address, await rewardVault.GUARDIAN());
      await rewardVault.connect(guardian).pause();
      await expect(
        rewardVault
          .connect(projectOwner)
          .deposit({ ...depositParam, signature: depositSignature })
      ).to.revertedWithCustomError(rewardVault, "EnforcedPause");
      await rewardVault.connect(guardian).unpause();
      await expect(
        rewardVault
          .connect(projectOwner)
          .deposit({ ...depositParam, signature: depositSignature })
      ).not.to.reverted;
    });

    it("upgrade test", async () => {
      const { rewardVault, proxy, proxyAdmin, owner, user } = await loadFixture(
        fixture
      );

      const { mockToken: newImpl } = await hre.ignition.deploy(
        MockTokenModule,
        {}
      );
      await expect(
        proxyAdmin.connect(user).upgradeAndCall(proxy, newImpl, "0x")
      )
        .to.revertedWithCustomError(proxyAdmin, "OwnableUnauthorizedAccount")
        .withArgs(user.address);
      await proxyAdmin.upgradeAndCall(proxy, newImpl, "0x");
      // all old methods are deprecated after upgrade
      await expect(rewardVault.eip712Domain()).to.reverted;

      const mockToken = await hre.ethers.getContractAt("MockToken", proxy);
      // only token api is allowed now
      await expect(mockToken.balanceOf(owner)).not.to.reverted;
    });

    it("withdraw excess tokens by admin", async () => {
      const {
        depositedMockTokenAmount,
        mockToken,
        rewardVault,
        owner,
        user,
        signer,
      } = await loadFixture(fixtureAfterDeposit);

      const amount = 1n;
      const recipient = owner;
      const balanceBefore = await mockToken.balanceOf(recipient);
      await rewardVault
        .connect(owner)
        .withdrawExcessTokens(mockToken, amount, recipient);
      const balanceAfter = await mockToken.balanceOf(recipient);
      expect(balanceAfter - balanceBefore).to.eq(amount);

      // cannot withdraw by other
      await expect(
        rewardVault
          .connect(user)
          .withdrawExcessTokens(mockToken, amount, recipient)
      )
        .to.revertedWithCustomError(rewardVault, "OwnableUnauthorizedAccount")
        .withArgs(user.address);

      // cannot withdraw too mch tokens
      await expect(
        rewardVault
          .connect(owner)
          .withdrawExcessTokens(
            mockToken,
            depositedMockTokenAmount + 1n,
            recipient
          )
      ).to.be.reverted;
    });
  });
});
