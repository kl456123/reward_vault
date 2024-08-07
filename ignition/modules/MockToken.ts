import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { ethers } from "ethers";
import { RewardVaultModule } from "./RewardVault";

const MockTokenModule = buildModule("MockToken", (m) => {
  const mockToken = m.contract("MockToken", [ethers.parseUnits("1000000", 18)]);

  // approve tokens to vault
  const { rewardVault } = m.useModule(RewardVaultModule);
  m.call(mockToken, "approve", [rewardVault, ethers.MaxUint256]);

  return { mockToken };
});

export default MockTokenModule;
