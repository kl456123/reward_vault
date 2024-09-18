import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("RewardVault", (m) => {
  const deployer = m.getAccount(0);

  const rewardVaultImpl = m.contract("RewardVault");
  const initData = m.encodeFunctionCall(rewardVaultImpl, "initialize", [
    deployer,
  ]);
  const proxy = m.contract("TransparentUpgradeableProxy", [
    rewardVaultImpl,
    deployer,
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
