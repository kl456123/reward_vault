import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import DeployAndGrantRole from "../../ignition/modules/grant_role";
import { RewardVault__factory } from "../../typechain-types";
import hre from "hardhat";
import { generateMockData } from "./mock_data";
import { NATIVE_TOKEN_ADDR } from "../../src/constants";

export async function fixture() {
  const [owner, signer, guardian, projectOwner, user] =
    await hre.ethers.getSigners();
  const { proxy, proxyAdmin } = await hre.ignition.deploy(DeployAndGrantRole, {
    parameters: {
      GrantRole: {
        signer: signer.address,
        guardian: guardian.address,
      },
    },
  });
  const rewardVault = await hre.ethers.getContractAt("RewardVault", proxy);

  const mockToken = await (
    await hre.ethers.getContractFactory("MockToken")
  ).deploy(hre.ethers.parseUnits("1000000", 18));
  await mockToken.waitForDeployment();
  const { chainId } = await hre.ethers.provider.getNetwork();

  // fund project owner and approve
  await mockToken.transfer(projectOwner, hre.ethers.parseUnits("1000", 18));
  await mockToken
    .connect(projectOwner)
    .approve(rewardVault, hre.ethers.MaxUint256);

  return {
    rewardVault,
    owner,
    signer,
    guardian,
    mockToken,
    chainId,
    user,
    projectOwner,
    proxy,
    proxyAdmin: await hre.ethers.getContractAt("ProxyAdmin", proxyAdmin),
  };
}

export async function fixtureAfterDeposit() {
  const loadedFixture = await fixture();
  const { rewardVault, signer, mockToken, chainId, projectOwner } =
    loadedFixture;

  let depositedETHAmount, depositedMockTokenAmount;
  {
    const { depositData, depositSignature } = await generateMockData(
      await mockToken.getAddress(),
      await rewardVault.getAddress(),
      chainId,
      signer
    );
    depositedMockTokenAmount = depositData.amount;

    await rewardVault
      .connect(projectOwner)
      .deposit({ ...depositData, signature: depositSignature });
  }

  {
    const { depositData, depositSignature } = await generateMockData(
      NATIVE_TOKEN_ADDR,
      await rewardVault.getAddress(),
      chainId,
      signer
    );
    await rewardVault
      .connect(projectOwner)
      .deposit(
        { ...depositData, signature: depositSignature },
        { value: depositData.amount }
      );
    depositedETHAmount = depositData.amount;
  }
  return {
    ...loadedFixture,
    depositedETHAmount,
    depositedMockTokenAmount,
  };
}
