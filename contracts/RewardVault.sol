// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
import {RewardVaultStorage} from "./RewardVaultStorage.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {EIP712} from "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {IRewardVault} from "./interfaces/IRewardVault.sol";
import {LibToken} from "./libraries/LibToken.sol";

contract RewardVault is
    RewardVaultStorage,
    Ownable,
    AccessControl,
    ReentrancyGuard,
    IRewardVault,
    Pausable,
    EIP712
{
    using ECDSA for bytes32;

    bytes32 public constant SIGNER = keccak256("SIGNER");

    // type hash
    bytes32 internal constant DEPOSIT_TYPEHASH =
        keccak256(
            "DepositData(uint256 depositId,uint256 projectId,address token,uint256 amount,uint256 expireTime)"
        );
    bytes32 internal constant WITHDRAWAL_TYPEHASH =
        keccak256(
            "WithdrawalData(uint256 withdrawId,uint256 projectId,address token,uint256 amount,address recipient,uint256 expireTime)"
        );
    bytes32 internal constant CLAIM_TYPEHASH =
        keccak256(
            "ClaimData(uint256 claimId,uint256 projectId,address token,uint256 amount,address recipient,uint256 expireTime)"
        );

    constructor() Ownable(msg.sender) EIP712("binance reward vault", "0.1.0") {
        _grantRole(DEFAULT_ADMIN_ROLE, owner());
    }

    /////// called by project owner
    function deposit(
        DepositParam calldata depositParam
    ) external payable nonReentrant whenNotPaused {
        require(block.timestamp < depositParam.expireTime, "SIGNATURE EXPIRY");
        // verify signature
        bytes32 digest = _hashTypedDataV4(
            keccak256(
                abi.encode(
                    DEPOSIT_TYPEHASH,
                    depositParam.depositId,
                    depositParam.projectId,
                    depositParam.token,
                    depositParam.amount,
                    depositParam.expireTime
                )
            )
        );

        require(!usedSignatures[digest], "SIGNATURE_USED_ALREADY");
        require(
            hasRole(SIGNER, digest.recover(depositParam.signature)),
            "INVALID_SIGNER"
        );
        // prevent from replay attack
        usedSignatures[digest] = true;

        uint256 balanceBefore = LibToken.getBalanceOf(depositParam.token);
        LibToken.deposit(depositParam.token, depositParam.amount);
        // actual used token amount due to the transfer
        uint256 actualAmount = LibToken.isNativeToken(depositParam.token)
            ? msg.value
            : LibToken.getBalanceOf(depositParam.token) - balanceBefore;

        allProjectBalances[depositParam.projectId][
            depositParam.token
        ] += actualAmount;

        emit TokenDeposited(
            depositParam.depositId,
            depositParam.projectId,
            depositParam.token,
            depositParam.amount,
            depositParam.expireTime
        );
    }

    // withdraw unclaimed reward tokens
    function withdraw(
        WithdrawalParam calldata withdrawalParam
    ) external nonReentrant whenNotPaused {
        require(
            block.timestamp < withdrawalParam.expireTime,
            "SIGNATURE EXPIRY"
        );
        uint256 currentBalance = allProjectBalances[withdrawalParam.projectId][
            withdrawalParam.token
        ];
        require(
            currentBalance >= withdrawalParam.amount,
            "amount exceed balance"
        );

        // verify signature
        bytes32 digest = _hashTypedDataV4(
            keccak256(
                abi.encode(
                    WITHDRAWAL_TYPEHASH,
                    withdrawalParam.withdrawId,
                    withdrawalParam.projectId,
                    withdrawalParam.token,
                    withdrawalParam.amount,
                    withdrawalParam.recipient,
                    withdrawalParam.expireTime
                )
            )
        );

        require(!usedSignatures[digest], "SIGNATURE_USED_ALREADY");
        require(
            hasRole(SIGNER, digest.recover(withdrawalParam.signature)),
            "INVALID_SIGNER"
        );
        // prevent from replay attack
        usedSignatures[digest] = true;

        // withdraw tokens to recipient
        uint256 balanceBefore = LibToken.getBalanceOf(withdrawalParam.token);
        LibToken.transferToken(
            withdrawalParam.recipient,
            withdrawalParam.token,
            withdrawalParam.amount
        );

        // actual used token amount due to the transfer
        uint256 actualAmount = balanceBefore -
            LibToken.getBalanceOf(withdrawalParam.token);

        // update balance sheet
        require(currentBalance >= actualAmount, "SLASH_TOO_MUCH");
        allProjectBalances[withdrawalParam.projectId][withdrawalParam.token] =
            currentBalance -
            actualAmount;

        emit TokenWithdrawed(
            withdrawalParam.withdrawId,
            withdrawalParam.projectId,
            withdrawalParam.token,
            withdrawalParam.amount,
            withdrawalParam.recipient,
            withdrawalParam.expireTime
        );
    }

    /////////////// claim reward tokens by user
    function claim(
        ClaimParam calldata claimParam
    ) external nonReentrant whenNotPaused {
        require(block.timestamp < claimParam.expireTime, "SIGNATURE EXPIRY");
        uint256 currentBalance = allProjectBalances[claimParam.projectId][
            claimParam.token
        ];
        // validate param and its signature
        require(currentBalance >= claimParam.amount, "amount exceed balance");

        bytes32 digest = _hashTypedDataV4(
            keccak256(
                abi.encode(
                    CLAIM_TYPEHASH,
                    claimParam.claimId,
                    claimParam.projectId,
                    claimParam.token,
                    claimParam.amount,
                    claimParam.recipient,
                    claimParam.expireTime
                )
            )
        );

        require(!usedSignatures[digest], "SIGNATURE_USED_ALREADY");
        require(
            hasRole(SIGNER, digest.recover(claimParam.signature)),
            "INVALID_SIGNER"
        );
        // prevent from replay attack
        usedSignatures[digest] = true;

        uint256 balanceBefore = LibToken.getBalanceOf(claimParam.token);
        LibToken.transferToken(msg.sender, claimParam.token, claimParam.amount);

        // actual used token amount due to the transfer
        uint256 actualAmount = balanceBefore -
            LibToken.getBalanceOf(claimParam.token);

        // update balance sheet
        require(currentBalance >= actualAmount, "SLASH_TOO_MUCH");
        allProjectBalances[claimParam.projectId][claimParam.token] =
            currentBalance -
            actualAmount;

        emit RewardsClaimed(
            claimParam.claimId,
            claimParam.projectId,
            claimParam.token,
            claimParam.amount,
            claimParam.recipient,
            claimParam.expireTime
        );
    }

    ////////////////// admin ///////////////////////
    function withdrawExcessTokens(
        address token,
        uint256 amount
    ) external onlyOwner {}

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    //////////// view functions

    function isUsedSignature(bytes32 hash) external view returns (bool) {
        return usedSignatures[hash];
    }

    function getTokenBalanceByProjectId(
        uint256 projectId,
        address token
    ) external view returns (uint256) {
        return allProjectBalances[projectId][token];
    }
}
