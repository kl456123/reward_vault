import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

import RewardVaultModule from "./reward_vault";

export default buildModule("GrantRole", (m) => {
  const { rewardVault, proxyAdmin, proxy } = m.useModule(RewardVaultModule);
  const SIGNER_ROLE = m.staticCall(rewardVault, "SIGNER");
  const signer = m.getParameter("signer");
  const guardian = m.getParameter("guardian");
  const GUARDIAN_ROLE = m.staticCall(rewardVault, "GUARDIAN");

  // grant role to signer
  m.call(rewardVault, "grantRole", [SIGNER_ROLE, signer], { id: "add_signer" });
  m.call(rewardVault, "grantRole", [GUARDIAN_ROLE, guardian], {
    id: "add_guardian",
  });
  return { rewardVault, proxyAdmin, proxy };
});
