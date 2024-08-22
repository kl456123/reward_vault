import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export const RewardVaultModule = buildModule("RewardVault", (m) => {
  const proxyAdminOwner = m.getAccount(0);

  const rewardVaultImpl = m.contract("RewardVault");
  const initData = m.encodeFunctionCall(rewardVaultImpl, "initialize");
  const proxy = m.contract("TransparentUpgradeableProxy", [
    rewardVaultImpl,
    proxyAdminOwner,
    initData,
  ]);
  const proxyAdminAddress = m.readEventArgument(
    proxy,
    "AdminChanged",
    "newAdmin"
  );
  const proxyAdmin = m.contractAt("ProxyAdmin", proxyAdminAddress);
  const rewardVault = m.contractAt("RewardVault", proxy, {
    id: "RewardVaultProxy",
  });
  return { rewardVault, proxyAdmin, proxy };
});

export default buildModule("GrantRole", (m) => {
  const { rewardVault, proxyAdmin, proxy } = m.useModule(RewardVaultModule);
  const SIGNER_ROLE = m.staticCall(rewardVault, "SIGNER");
  const signer = m.getParameter("signer");

  // grant role to signer
  m.call(rewardVault, "grantRole", [SIGNER_ROLE, signer]);
  return { rewardVault, proxyAdmin, proxy };
});
