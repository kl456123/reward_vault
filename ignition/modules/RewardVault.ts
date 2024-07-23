import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export const RewardVaultModule = buildModule("RewardVault", (m) => {
  const rewardVault = m.contract("RewardVault");
  return { rewardVault };
});

export default buildModule("GrantRole", (m) => {
  const { rewardVault } = m.useModule(RewardVaultModule);
  const SIGNER_ROLE = m.staticCall(rewardVault, "SIGNER");
  const signer = m.getParameter("signer");

  // grant role to signer
  m.call(rewardVault, "grantRole", [SIGNER_ROLE, signer]);
  return { rewardVault };
});
