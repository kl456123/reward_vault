// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract RewardVaultStorage {
    // projectId => token balance
    // Deprecated: dont need balanace sheet onchain
    mapping(uint256 => mapping(address token => uint256))
        internal _allProjectBalances;
    // hash => isRequestIdUsed
    mapping(uint256 => bool) internal isRequestIdUsed;
}
