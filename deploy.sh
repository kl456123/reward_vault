#!/bin/bash

NETWORK=bitlayer
DEPLOYMENT_ID=${NETWORK}_qa
# deploy and grant roles including guardian and signer
yarn hardhat ignition deploy ./ignition/modules/grant_role.ts --network ${NETWORK} --parameters ./ignition/parameters.json --deployment-id ${DEPLOYMENT_ID}

# upgrade to new version
yarn hardhat ignition deploy ./ignition/modules/upgrade_module.ts --network ${NETWORK} --strategy create2 --deployment-id ${NETWORK}

yarn hardhat ignition verify ${DEPLOYMENT_ID} --include-unrelated-contracts
