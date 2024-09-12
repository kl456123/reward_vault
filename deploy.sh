#!/bin/bash

NETWORK=bsc
 # add --deployment-id `chain-${NETWORK}`
yarn hardhat ignition deploy ./ignition/modules/RewardVault.ts --network ${NETWORK}


DEPLOYMENT_ID=chain-56
yarn hardhat ignition verify ${DEPLOYMENT_ID} --network ${NETWORK} --include-unrelated-contracts
