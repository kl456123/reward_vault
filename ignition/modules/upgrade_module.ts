import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import RewardVaultModule from './reward_vault'

export default buildModule("UpgradeModule", (m) => {
  const proxyAdmin = m.contractAt('ProxyAdmin', '0xf316b9bC1b8eE04688369AA065C9136797c358ed')
  const proxy = m.contractAt('TransparentUpgradeableProxy', '0x317Cd61fa24e2E4068b4C47Bd58D5fC9f4E7A12b');

  const proxyAdminOwner = m.getAccount(0);

  const rewardVaultImpl = m.contract("RewardVault", []);

  m.call(proxyAdmin, "upgradeAndCall", [proxy, rewardVaultImpl, "0x"], {
    from: proxyAdminOwner,
  });

  return { proxyAdmin, proxy };
});
