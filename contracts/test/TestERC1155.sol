// SPDX-License-Identifier: MIT
pragma solidity ^0.6.12;

import '@openzeppelin/contracts/token/ERC1155/ERC1155.sol';

contract TestERC1155 is ERC1155('') {
    constructor() public {
        uint256[] memory idsAndAmounts = new uint256[](2);
        idsAndAmounts[0] = 1;
        idsAndAmounts[1] = 2;
        _mintBatch(msg.sender, idsAndAmounts, idsAndAmounts, '');
    }
}
