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

- RewardVault: 0x08a15B45C10CaA762ebd2fAe95768F0d93424CE9
- TransparentUpgradeableProxy: 0x317Cd61fa24e2E4068b4C47Bd58D5fC9f4E7A12b
- ProxyAdmin: 0xf316b9bC1b8eE04688369AA065C9136797c358ed
- initOwner: 0xbD11861D13caFa8Ad6e143DA7034f8A907CD47a8

all contracts with same addresses are deployed on these chains including

- op
- arb
- bsc
- eth
- base
- polygon

note that contract deployed on these chain have different addresses

- opbnb
  - RewardVault: 0x373234Db5440588109C9F274a8cf41e1CF08b957
  - TransparentUpgradeableProxy: 0x487b9e8031055d291d51c5c83a4d0f030d47199f
  - ProxyAdmin: 0x246674577511aD7de5b229cbb6F5237FdD0e5a8d
  - initOwner: 0xbD11861D13caFa8Ad6e143DA7034f8A907CD47a8
