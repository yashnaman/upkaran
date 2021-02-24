// SPDX-License-Identifier: MIT
pragma solidity ^0.6.12;

pragma experimental ABIEncoderV2;

import './Interfaces/IDaiLikePermit.sol';
import './Interfaces/IEIP2585LikePermit.sol';
import '@opengsn/gsn/contracts/BaseRelayRecipient.sol';

//A generuc contract that gets permission from user and executes stuff
//Why? because a permit given to any other multicall type contract can be front run
//After permit we can do any batch transaction we want
contract Upkaran is BaseRelayRecipient {
    struct Call {
        address to;
        bytes data;
        uint256 value;
    }

    constructor(address forwarder) public {
        trustedForwarder = forwarder;
    }

    function versionRecipient() external view override returns (string memory) {
        return '2.0.0';
    }

    function batch(Call[] memory calls) public payable {
        // external with ABIEncoderV2 Struct is not supported in solidity < 0.6.4
        require(_msgSender() == address(this), 'NOT_ALLOWED');
        for (uint256 i = 0; i < calls.length; i++) {
            _call(calls[i].to, calls[i].value, calls[i].data);
        }
    }

    function _call(
        address to,
        uint256 value,
        bytes memory data
    ) internal {
        // require that data != transferFrom function signature
        (bool success, ) = to.call{value: value}(data);
        // (bool success, ) = to.call.value(value)(data);
        if (!success) {
            assembly {
                let returnDataSize := returndatasize()
                returndatacopy(0, 0, returnDataSize)
                revert(0, returnDataSize)
            }
        }
    }

    function daiLikePermitAndCall(
        Call memory call,
        address tokenAddress,
        uint256 expiry,
        uint8 v1,
        bytes32 r1,
        bytes32 s1,
        uint8 v2,
        bytes32 r2,
        bytes32 s2
    ) public {
        uint256 nonce = IDaiLikePermit(tokenAddress).nonces(_msgSender());
        //give permit
        IDaiLikePermit(tokenAddress).permit(
            _msgSender(),
            address(this),
            nonce++,
            expiry,
            true,
            v1,
            r1,
            s1
        );

        _call(call.to, call.value, call.data);
        // //take back the permit
        IDaiLikePermit(tokenAddress).permit(
            _msgSender(),
            address(this),
            nonce,
            expiry,
            false,
            v2,
            r2,
            s2
        );
    }

    function eip2585LikePermitAndCall(
        Call memory call,
        address tokenAddress,
        uint256 value,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) public {
        IEIP2585LikePermit(tokenAddress).permit(
            _msgSender(),
            address(this),
            value,
            deadline,
            v,
            r,
            s
        );
        _call(call.to, call.value, call.data);
    }
}
