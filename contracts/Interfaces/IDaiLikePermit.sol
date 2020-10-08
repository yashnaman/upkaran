// SPDX-License-Identifier: MIT
pragma solidity 0.6.12;

interface IDaiLikePermit {
    function nonces(address) external returns (uint256);

    function permit(
        address holder,
        address spender,
        uint256 nonce,
        uint256 expiry,
        bool allowed,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external;
}
