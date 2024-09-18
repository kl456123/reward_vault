#!/bin/bash

NETWORK=eth
yarn hardhat ignition deploy ./ignition/modules/upgrade_module.ts --network ${NETWORK} --strategy create2 --deployment-id ${NETWORK}


DEPLOYMENT_ID=${NETWORK}
yarn hardhat ignition verify ${DEPLOYMENT_ID} --include-unrelated-contracts
