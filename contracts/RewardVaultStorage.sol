// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract RewardVaultStorage {
    // projectId => token balance
    mapping(uint256 => mapping(address token => uint256))
        internal allProjectBalances;

    // hash => isUsed
    mapping(bytes32 => bool) internal usedSignatures;
}
