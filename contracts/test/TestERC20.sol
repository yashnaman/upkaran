// SPDX-License-Identifier: MIT
pragma solidity ^0.6.12;

import '@openzeppelin/contracts/token/ERC20/ERC20.sol';

contract TestERC20 is ERC20('TestERC20', 'TestERC20') {
    constructor() public {
        _mint(msg.sender, 1);
    }
}
