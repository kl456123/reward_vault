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
```


## Test
run test
```bash
yarn hardhat test
```
