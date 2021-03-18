// SPDX-License-Identifier: MIT
pragma solidity ^0.6.12;

import '@openzeppelin/contracts/token/ERC777/ERC777.sol';

contract TestERC777 is ERC777('Test777', 'Test777', new address[](0)) {
    constructor() public {
        _mint(msg.sender, 1, '', '');
    }
}
