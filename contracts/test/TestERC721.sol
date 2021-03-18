// SPDX-License-Identifier: MIT
pragma solidity ^0.6.12;

import '@openzeppelin/contracts/token/ERC721/ERC721.sol';

contract TestERC721 is ERC721('TestNFT', 'TestNFT') {
    constructor() public {
        _safeMint(msg.sender, 1);
    }
}
