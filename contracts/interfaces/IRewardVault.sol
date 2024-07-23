// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IRewardVault {
    event TokenDeposited(
        uint256 indexed depositId,
        uint256 indexed projectId,
        address token,
        uint256 amount,
        uint256 expireTime
    );

    event TokenWithdrawed(
        uint256 indexed withdrawId,
        uint256 indexed projectId,
        address token,
        uint256 amount,
        address recipient,
        uint256 expireTime
    );

    event RewardsClaimed(
        uint256 indexed claimId,
        uint256 indexed projectId,
        address token,
        uint256 amount,
        address recipient,
        uint256 expireTime
    );

    struct DepositParam {
        uint256 depositId;
        uint256 projectId;
        address token;
        uint256 amount;
        uint256 expireTime;
        bytes signature;
    }

    struct WithdrawalParam {
        uint256 withdrawId;
        uint256 projectId;
        address token;
        uint256 amount;
        address recipient;
        uint256 expireTime;
        bytes signature;
    }

    struct ClaimParam {
        uint256 claimId;
        uint256 projectId;
        address token;
        uint256 amount;
        address recipient;
        uint256 expireTime;
        bytes signature;
    }

    function deposit(DepositParam calldata depositParam) external payable;

    function withdraw(WithdrawalParam calldata withdrawalParam) external;

    function claim(ClaimParam calldata param) external;
}
