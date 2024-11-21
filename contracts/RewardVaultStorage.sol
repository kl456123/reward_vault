// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract RewardVaultStorage {
    // hash => isRequestIdUsed
    mapping(uint256 => bool) internal isRequestIdUsed;
}
