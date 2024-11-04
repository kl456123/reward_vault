# Reward Vault

## Demo

deploy and execute basic operations

```shell
# deploy reward vault
yarn hardhat ignition deploy ./ignition/modules/RewardVault.ts --parameters ./ignition/parameters.json

# deploy mock token
yarn hardhat ignition deploy ./ignition/modules/MockToken.ts

# execute deposit, claim and withdraw txs
yarn hardhat run scripts/demo.ts

# verify code
yarn hardhat ignition verify ${DEPLOYMENT_ID}
```

## Test

run test

```bash
yarn hardhat test
```

## Deployment

all contracts with same addresses are deployed on these chains including

- op
- arb
- bsc
- eth
- base
- polygon

contracts/EOA

(the ownership of all contracts is transfered to security and finance team)

- RewardVault: 0x7870F32cB5B8DfEa244AfE2E9aD0c0fef6cDa6Cb
- TransparentUpgradeableProxy: 0x317Cd61fa24e2E4068b4C47Bd58D5fC9f4E7A12b
- ProxyAdmin: 0xf316b9bC1b8eE04688369AA065C9136797c358ed
- initOwner: 0xbD11861D13caFa8Ad6e143DA7034f8A907CD47a8
- signer: 0x7fcbd9d429932a11884cb5ce9c61055b369f56f7
- proxy owner: 0x44259777e66b1Ac57F19acfaAc1379B019c9bE99
- reward vault owner: 0x3B1Ea58f0126e4D5731E1D37F425D7f892867507

note that some contracts/EOA deployed on following chains have different addresses

- opbnb

  - RewardVault: 0x1dB6033ae53F8C801Ff0Dd0666A05AF150828532
  - TransparentUpgradeableProxy: 0x487b9e8031055d291d51c5c83a4d0f030d47199f
  - ProxyAdmin: 0x246674577511aD7de5b229cbb6F5237FdD0e5a8d
  - initOwner: 0xbD11861D13caFa8Ad6e143DA7034f8A907CD47a8
  - signer: 0x7fcbd9d429932a11884cb5ce9c61055b369f56f7
  - proxy owner: 0x44259777e66b1Ac57F19acfaAc1379B019c9bE99
  - reward vault owner: 0x3B1Ea58f0126e4D5731E1D37F425D7f892867507

- sei

  - RewardVault: 0x373234Db5440588109C9F274a8cf41e1CF08b957
  - TransparentUpgradeableProxy: 0x487B9E8031055d291d51C5C83a4d0F030D47199f
  - ProxyAdmin: 0x246674577511aD7de5b229cbb6F5237FdD0e5a8d
  - initOwner: 0xbD11861D13caFa8Ad6e143DA7034f8A907CD47a8
  - signer: 0x7fcbd9d429932a11884cb5ce9c61055b369f56f7

- bsc_test
  - RewardVault: 0x7870F32cB5B8DfEa244AfE2E9aD0c0fef6cDa6Cb
  - TransparentUpgradeableProxy: 0x15a40246c9dCdF80D5ae58c791719D68a8C5576E
  - ProxyAdmin: 0x41798f63d1cAae9Ce65AB492acd619451AB21E77
  - initOwner: 0xbD11861D13caFa8Ad6e143DA7034f8A907CD47a8
  - signer: 0x7fcbd9d429932a11884cb5ce9c61055b369f56f7
  - guardian: 0xbD11861D13caFa8Ad6e143DA7034f8A907CD47a8
- bera
  - RewardVault: 0x373234Db5440588109C9F274a8cf41e1CF08b957
  - TransparentUpgradeableProxy: 0x487B9E8031055d291d51C5C83a4d0F030D47199f
  - ProxyAdmin: 0x246674577511aD7de5b229cbb6F5237FdD0e5a8d
  - initOwner: 0xbD11861D13caFa8Ad6e143DA7034f8A907CD47a8
  - signer: 0x7fcbd9d429932a11884cb5ce9c61055b369f56f7
  - guardian: 0xbD11861D13caFa8Ad6e143DA7034f8A907CD47a8
