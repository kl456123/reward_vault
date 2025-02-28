// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
import {RewardVaultStorage} from "./RewardVaultStorage.sol";
import {AccessControlUpgradeable} from "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {EIP712Upgradeable} from "@openzeppelin/contracts-upgradeable/utils/cryptography/EIP712Upgradeable.sol";
import {PausableUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import {ContextUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/ContextUpgradeable.sol";
import {ReentrancyGuardUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {IRewardVault} from "./interfaces/IRewardVault.sol";
import {LibToken} from "./libraries/LibToken.sol";

contract RewardVault is
    IRewardVault,
    RewardVaultStorage,
    ReentrancyGuardUpgradeable,
    AccessControlUpgradeable,
    OwnableUpgradeable,
    PausableUpgradeable,
    EIP712Upgradeable
{
    using ECDSA for bytes32;

    bytes32 public constant SIGNER = keccak256("SIGNER");
    bytes32 public constant GUARDIAN = keccak256("GUARDIAN");

    // type hash
    bytes32 internal constant DEPOSIT_TYPEHASH =
        keccak256(
            "DepositData(uint256 depositId,uint256 projectId,address token,uint256 amount,uint256 expireTime)"
        );
    bytes32 internal constant WITHDRAWAL_TYPEHASH =
        keccak256(
            "WithdrawalData(uint256 withdrawId,uint256 projectId,address token,uint256 amount,address recipient,uint256 expireTime)"
        );
    bytes32 internal constant WITHDRAWALV2_TYPEHASH =
        keccak256(
            "WithdrawalData(uint256 withdrawId,uint256 accountId,uint8 actionType,address token,uint256 amount,address recipient,uint256 expireTime)"
        );
    bytes32 internal constant CLAIM_TYPEHASH =
        keccak256(
            "ClaimData(uint256 claimId,uint256 projectId,address token,uint256 amount,address recipient,uint256 expireTime)"
        );

    function initialize(address initialOwner) external initializer {
        __Ownable_init(initialOwner);
        __Pausable_init();
        __ReentrancyGuard_init();
        __AccessControl_init();
        __EIP712_init("binance reward vault", "0.1.0");
        _grantRole(DEFAULT_ADMIN_ROLE, owner());
    }

    /////// called by project owner
    function deposit(
        DepositParam calldata depositParam
    ) external payable nonReentrant whenNotPaused {
        require(block.timestamp < depositParam.expireTime, "SIGNATURE_EXPIRY");
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

        require(
            !isRequestIdUsed[depositParam.depositId],
            "SIGNATURE_USED_ALREADY"
        );
        require(
            hasRole(SIGNER, digest.recover(depositParam.signature)),
            "INVALID_SIGNER"
        );
        // prevent from replay attack
        isRequestIdUsed[depositParam.depositId] = true;

        uint256 balanceBefore = LibToken.getBalanceOf(depositParam.token);
        if (LibToken.isNativeToken(depositParam.token)) {
            balanceBefore -= msg.value;
        }

        LibToken.deposit(depositParam.token, depositParam.amount);

        // return excess native tokens
        if (
            LibToken.isNativeToken(depositParam.token) &&
            msg.value > depositParam.amount
        ) {
            LibToken.transferToken(
                msg.sender,
                LibToken.NATIVE_TOKEN,
                msg.value - depositParam.amount
            );
        }

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
            "SIGNATURE_EXPIRY"
        );
        uint256 currentBalance = LibToken.getBalanceOf(withdrawalParam.token);
        require(
            currentBalance >= withdrawalParam.amount,
            "AMOUNT_EXCEED_BALANCE"
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

        require(
            !isRequestIdUsed[withdrawalParam.withdrawId],
            "SIGNATURE_USED_ALREADY"
        );
        require(
            hasRole(SIGNER, digest.recover(withdrawalParam.signature)),
            "INVALID_SIGNER"
        );
        // prevent from replay attack
        isRequestIdUsed[withdrawalParam.withdrawId] = true;

        // withdraw tokens to recipient
        LibToken.transferToken(
            withdrawalParam.recipient,
            withdrawalParam.token,
            withdrawalParam.amount
        );

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
        uint256 currentBalance = LibToken.getBalanceOf(claimParam.token);
        // validate param and its signature
        require(currentBalance >= claimParam.amount, "AMOUNT_EXCEED_BALANCE");

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

        require(!isRequestIdUsed[claimParam.claimId], "SIGNATURE_USED_ALREADY");
        require(
            hasRole(SIGNER, digest.recover(claimParam.signature)),
            "INVALID_SIGNER"
        );
        // prevent from replay attack
        isRequestIdUsed[claimParam.claimId] = true;

        LibToken.transferToken(
            claimParam.recipient,
            claimParam.token,
            claimParam.amount
        );

        emit RewardsClaimed(
            claimParam.claimId,
            claimParam.projectId,
            claimParam.token,
            claimParam.amount,
            claimParam.recipient,
            claimParam.expireTime
        );
    }

    function withdrawV2(
        WithdrawalParamV2 calldata withdrawalParam
    ) external nonReentrant whenNotPaused {
        require(
            block.timestamp < withdrawalParam.expireTime,
            "SIGNATURE_EXPIRY"
        );
        uint256 currentBalance = LibToken.getBalanceOf(withdrawalParam.token);
        require(
            currentBalance >= withdrawalParam.amount,
            "AMOUNT_EXCEED_BALANCE"
        );

        // verify signature
        bytes32 digest = _hashTypedDataV4(
            keccak256(
                abi.encode(
                    WITHDRAWALV2_TYPEHASH,
                    withdrawalParam.withdrawId,
                    withdrawalParam.accountId,
                    withdrawalParam.actionType,
                    withdrawalParam.token,
                    withdrawalParam.amount,
                    withdrawalParam.recipient,
                    withdrawalParam.expireTime
                )
            )
        );

        require(
            !isRequestIdUsed[withdrawalParam.withdrawId],
            "SIGNATURE_USED_ALREADY"
        );
        require(
            hasRole(SIGNER, digest.recover(withdrawalParam.signature)),
            "INVALID_SIGNER"
        );
        // prevent from replay attack
        isRequestIdUsed[withdrawalParam.withdrawId] = true;

        // withdraw tokens to recipient
        LibToken.transferToken(
            withdrawalParam.recipient,
            withdrawalParam.token,
            withdrawalParam.amount
        );

        emit TokenWithdrawedV2(
            withdrawalParam.withdrawId,
            withdrawalParam.accountId,
            withdrawalParam.actionType,
            withdrawalParam.token,
            withdrawalParam.amount,
            withdrawalParam.recipient,
            withdrawalParam.expireTime
        );
    }

    ////////////////// admin ///////////////////////
    function withdrawExcessTokens(
        address token,
        uint256 amount,
        address recipient
    ) external onlyOwner {
        // TODO: check amount
        LibToken.transferToken(recipient, token, amount);
        require(recipient != address(0), "ZERO_RECIPIENT");
        emit TokenWithdrawedByAdmin(owner(), recipient, token, amount);
    }

    function pause() external onlyRole(GUARDIAN) {
        _pause();
    }

    function unpause() external onlyRole(GUARDIAN) {
        _unpause();
    }

    //////////// view functions

    function getIsRequestIdUsed(
        uint256 requestId
    ) external view returns (bool) {
        return isRequestIdUsed[requestId];
    }
}
