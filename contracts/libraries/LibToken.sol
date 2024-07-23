// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

library LibToken {
    using SafeERC20 for IERC20;

    address internal constant NATIVE_TOKEN =
        0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;
    function isNativeToken(address token) internal pure returns (bool) {
        return token == NATIVE_TOKEN;
    }

    function deposit(address tokenAddress, uint256 amount) internal {
        require(amount > 0, "ZERO_AMOUNT");
        if (isNativeToken(tokenAddress)) {
            require(msg.value >= amount, "INSUFFIENT_ETH_AMOUNT");
        } else {
            IERC20(tokenAddress).safeTransferFrom(
                msg.sender,
                address(this),
                amount
            );
        }
    }

    function transferToken(address to, address token, uint256 amount) internal {
        if (amount > 0) {
            if (isNativeToken(token)) {
                (bool success, ) = payable(to).call{value: amount}("");
                require(success, "NATIVE_TOKEN_TRANSFER_FAILED");
            } else {
                IERC20(token).safeTransfer(to, amount);
            }
        }
    }

    function getBalanceOf(address token) internal view returns (uint256) {
        return getBalanceOf(token, address(this));
    }

    function getBalanceOf(
        address token,
        address who
    ) internal view returns (uint256) {
        return
            isNativeToken(token) ? who.balance : IERC20(token).balanceOf(who);
    }
}
