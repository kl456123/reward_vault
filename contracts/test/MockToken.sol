// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockToken is ERC20 {
    constructor(uint256 initTotalSupply) ERC20("MockToken", "MT") {
        _mint(msg.sender, initTotalSupply);
    }
}
